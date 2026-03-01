/**
 * routes/payment.js
 *
 * Luồng VNPay QR:
 *  1. POST /api/payment/create  → tạo đơn hàng + sinh URL thanh toán VNPay → trả về qrUrl
 *  2. GET  /api/payment/webhook → VNPay IPN gọi sau khi thanh toán → verify chữ ký → gửi email admin
 *
 * Cấu hình yêu cầu trong .env:
 *   VNP_TMN_CODE, VNP_HASH_SECRET, VNP_URL, VNP_RETURN_URL,
 *   ADMIN_EMAIL, MAIL_USER, MAIL_PASS
 */

const express    = require('express');
const crypto     = require('crypto');
const nodemailer = require('nodemailer');
const { getDB }  = require('../db/database');

const router = express.Router();

/* ═══════════════════════════════════════════════════════════════
   HELPER FUNCTIONS
   ═══════════════════════════════════════════════════════════════ */

/**
 * Format ngày giờ theo chuẩn VNPay: yyyyMMddHHmmss (múi giờ GMT+7)
 */
function formatVNPayDate(date = new Date()) {
  // Dịch sang GMT+7 rồi lấy chuỗi ISO (phần giờ sẽ là giờ VN)
  const gmt7 = new Date(date.getTime() + 7 * 60 * 60 * 1000);
  return gmt7.toISOString().replace(/[^0-9]/g, '').slice(0, 14);
}

/**
 * Xây chuỗi ký tên: sắp xếp key A→Z, ghép key=value, KHÔNG URL-encode
 * (đúng theo tài liệu VNPay)
 */
function buildSignData(params) {
  return Object.keys(params)
    .sort()
    .filter((k) => params[k] !== '' && params[k] != null)
    .map((k) => `${k}=${params[k]}`)
    .join('&');
}

/**
 * Tạo chữ ký HMAC-SHA512
 */
function createSignature(data, secretKey) {
  return crypto
    .createHmac('sha512', secretKey)
    .update(Buffer.from(data, 'utf-8'))
    .digest('hex');
}

/**
 * Sinh mã đơn hàng duy nhất: DH + 8 chữ số cuối timestamp + 4 ký tự random
 */
function generateOrderRef() {
  const ts   = Date.now().toString().slice(-8);
  const rand = Math.random().toString(36).slice(-4).toUpperCase();
  return `DH${ts}${rand}`;
}

/**
 * Lấy IP thật của client (hỗ trợ proxy / nginx)
 */
function getClientIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  let ip = (forwarded ? forwarded.split(',')[0] : req.socket?.remoteAddress) || '127.0.0.1';
  if (ip === '::1') ip = '127.0.0.1';
  return ip.trim();
}

/* ═══════════════════════════════════════════════════════════════
   POST /api/payment/create
   Body: { amount, customerName, customerEmail, customerPhone, note, items[] }
   Response: { qrUrl, orderRef }
   ═══════════════════════════════════════════════════════════════ */
router.post('/create', (req, res) => {
  const { amount, customerName, customerEmail, customerPhone, note, items } = req.body;

  // ── Validate đầu vào ─────────────────────────────────────────
  if (!amount || !customerName || !customerEmail) {
    return res.status(400).json({ message: 'Thiếu thông tin bắt buộc: amount, customerName, customerEmail' });
  }

  const vnpUrl    = process.env.VNP_URL        || 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html';
  const tmnCode   = process.env.VNP_TMN_CODE;
  const secretKey = process.env.VNP_HASH_SECRET;
  const returnUrl = process.env.VNP_RETURN_URL  || 'http://localhost:3000/checkout';

  if (!tmnCode || !secretKey) {
    return res.status(500).json({ message: 'Server chưa cấu hình VNPay (VNP_TMN_CODE, VNP_HASH_SECRET)' });
  }

  // ── Tạo mã đơn hàng & lưu DB ─────────────────────────────────
  const orderRef = generateOrderRef();
  try {
    const db = getDB();
    db.prepare(`
      INSERT INTO orders
        (order_ref, customer_name, customer_email, customer_phone, note, items, amount, payment_method, payment_status)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'vnpay_qr', 'pending')
    `).run(
      orderRef,
      customerName,
      customerEmail,
      customerPhone || '',
      note || '',
      JSON.stringify(items || []),
      Number(amount),
    );
  } catch (err) {
    console.error('Lỗi lưu đơn hàng:', err.message);
    return res.status(500).json({ message: 'Lỗi hệ thống khi tạo đơn hàng' });
  }

  // ── Xây tham số VNPay ─────────────────────────────────────────
  const now = new Date();

  const vnpParams = {
    vnp_Version:    '2.1.0',
    vnp_Command:    'pay',
    vnp_TmnCode:    tmnCode,
    // VNPay yêu cầu số tiền * 100 (đơn vị: đồng → x100)
    vnp_Amount:     (Math.round(Number(amount)) * 100).toString(),
    vnp_CreateDate: formatVNPayDate(now),
    vnp_CurrCode:   'VND',
    vnp_IpAddr:     getClientIp(req),
    vnp_Locale:     'vn',
    vnp_OrderInfo:  `Thanh toan don hang ${orderRef}`,
    vnp_OrderType:  'other',
    vnp_ReturnUrl:  returnUrl,
    vnp_TxnRef:     orderRef,
    // Hết hạn sau 15 phút
    vnp_ExpireDate: formatVNPayDate(new Date(now.getTime() + 15 * 60 * 1000)),
    // VNPAYQR: bắt buộc để hiện QR thay vì chọn ngân hàng
    vnp_BankCode:   'VNPAYQR',
  };

  // ── Ký HMAC-SHA512 (không URL-encode khi ký) ─────────────────
  const signData   = buildSignData(vnpParams);
  const secureHash = createSignature(signData, secretKey);

  // ── Xây URL thanh toán (URL-encode khi đưa lên URL) ──────────
  const urlParams = new URLSearchParams({ ...vnpParams, vnp_SecureHash: secureHash });
  const paymentUrl = `${vnpUrl}?${urlParams.toString()}`;

  return res.json({ qrUrl: paymentUrl, orderRef });
});

/* ═══════════════════════════════════════════════════════════════
   GET /api/payment/webhook
   VNPay gọi endpoint này sau khi thanh toán (IPN – Instant Payment Notification)
   Response phải là JSON { RspCode, Message } — VNPay đọc để biết merchant đã nhận
   ═══════════════════════════════════════════════════════════════ */
router.get('/webhook', async (req, res) => {
  const vnpParams    = { ...req.query };
  const receivedHash = vnpParams['vnp_SecureHash'];

  // ── Xoá trường hash trước khi verify ─────────────────────────
  delete vnpParams['vnp_SecureHash'];
  delete vnpParams['vnp_SecureHashType'];

  // ── Verify chữ ký ─────────────────────────────────────────────
  const secretKey    = process.env.VNP_HASH_SECRET;
  const signData     = buildSignData(vnpParams);
  const expectedHash = createSignature(signData, secretKey);

  if (receivedHash !== expectedHash) {
    return res.json({ RspCode: '97', Message: 'Invalid Signature' });
  }

  const orderRef = vnpParams['vnp_TxnRef'];
  const rspCode  = vnpParams['vnp_ResponseCode'];
  // VNPay gửi số tiền x100, chia lại để lưu thực tế
  const amount   = parseInt(vnpParams['vnp_Amount'], 10) / 100;

  // ── Tìm đơn hàng trong DB ─────────────────────────────────────
  const db    = getDB();
  const order = db.prepare('SELECT * FROM orders WHERE order_ref = ?').get(orderRef);

  if (!order) {
    return res.json({ RspCode: '01', Message: 'Order not found' });
  }
  if (order.payment_status === 'paid') {
    // Đã xử lý rồi → báo VNPay biết (tránh VNPay gọi lại)
    return res.json({ RspCode: '02', Message: 'Order already confirmed' });
  }

  // ── Xử lý kết quả thanh toán ─────────────────────────────────
  if (rspCode === '00') {
    // ✅ Thanh toán thành công
    const paidAt = new Date().toISOString();

    db.prepare(`
      UPDATE orders
      SET payment_status = 'paid',
          vnp_transaction_no = ?,
          paid_at = ?
      WHERE order_ref = ?
    `).run(vnpParams['vnp_TransactionNo'] || '', paidAt, orderRef);

    // Gửi email thông báo admin — bất đồng bộ, KHÔNG block response
    sendPaymentEmail({
      orderRef,
      amount,
      customerName:  order.customer_name,
      customerEmail: order.customer_email,
      paidAt,
    }).catch((err) => console.error('Lỗi gửi email thanh toán:', err.message));

  } else {
    // ❌ Thanh toán thất bại / bị huỷ
    db.prepare(`UPDATE orders SET payment_status = 'failed' WHERE order_ref = ?`).run(orderRef);
    console.log(`Đơn hàng ${orderRef} thanh toán thất bại (VNPay code: ${rspCode})`);
  }

  // VNPay yêu cầu luôn phản hồi 00 để biết merchant đã nhận IPN
  return res.json({ RspCode: '00', Message: 'Confirm Success' });
});

/* ═══════════════════════════════════════════════════════════════
   GỬI EMAIL THÔNG BÁO ADMIN
   Chỉ gọi sau khi webhook xác nhận thanh toán thành công (rspCode === "00")
   ═══════════════════════════════════════════════════════════════ */
async function sendPaymentEmail({ orderRef, amount, customerName, customerEmail, paidAt }) {
  const adminEmail = process.env.ADMIN_EMAIL;
  const mailUser   = process.env.MAIL_USER;
  const mailPass   = process.env.MAIL_PASS;

  const payTime = new Date(paidAt).toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });

  // Preview mode khi chưa cấu hình SMTP
  if (!mailUser || mailUser === 'youremail@gmail.com' || !mailPass) {
    console.log('\n--- [PAYMENT EMAIL – PREVIEW MODE] ---');
    console.log(`To:         ${adminEmail}`);
    console.log(`Đơn hàng:   ${orderRef}`);
    console.log(`Số tiền:    ${Number(amount).toLocaleString('vi-VN')}đ`);
    console.log(`Khách hàng: ${customerName} <${customerEmail}>`);
    console.log(`Thời gian:  ${payTime}`);
    console.log('--------------------------------------\n');
    return;
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: mailUser, pass: mailPass },
  });

  const html = `
  <div style="font-family:sans-serif;max-width:580px;margin:auto;border:1px solid #e5e7eb;border-radius:10px;overflow:hidden">
    <div style="background:#014DA8;padding:24px 28px">
      <h2 style="margin:0;color:white;font-size:1.15rem">Đơn hàng đã thanh toán thành công</h2>
      <p style="margin:6px 0 0;color:#93C5FD;font-size:0.85rem">MANAGE WORK – Thông báo tự động</p>
    </div>

    <div style="padding:28px">
      <table style="width:100%;border-collapse:collapse;font-size:0.95rem">
        <tr style="border-bottom:1px solid #f3f4f6">
          <td style="padding:10px 0;color:#6b7280;width:160px">Mã đơn hàng</td>
          <td style="padding:10px 0;font-weight:700;color:#111827">${orderRef}</td>
        </tr>
        <tr style="border-bottom:1px solid #f3f4f6">
          <td style="padding:10px 0;color:#6b7280">Số tiền</td>
          <td style="padding:10px 0;font-weight:700;color:#059669">${Number(amount).toLocaleString('vi-VN')}đ</td>
        </tr>
        <tr style="border-bottom:1px solid #f3f4f6">
          <td style="padding:10px 0;color:#6b7280">Khách hàng</td>
          <td style="padding:10px 0">${customerName}</td>
        </tr>
        <tr style="border-bottom:1px solid #f3f4f6">
          <td style="padding:10px 0;color:#6b7280">Email KH</td>
          <td style="padding:10px 0">${customerEmail}</td>
        </tr>
        <tr style="border-bottom:1px solid #f3f4f6">
          <td style="padding:10px 0;color:#6b7280">Phương thức</td>
          <td style="padding:10px 0">VNPay QR</td>
        </tr>
        <tr>
          <td style="padding:10px 0;color:#6b7280">Thời gian TT</td>
          <td style="padding:10px 0">${payTime}</td>
        </tr>
      </table>
    </div>

    <div style="background:#f9fafb;padding:14px 28px;font-size:0.78rem;color:#9ca3af;text-align:center">
      Email tự động từ hệ thống MANAGE WORK &middot; Không trả lời email này
    </div>
  </div>`;

  await transporter.sendMail({
    from:    `"MANAGE WORK" <${mailUser}>`,
    to:      adminEmail,
    subject: `[Đơn hàng] ${orderRef} – Thanh toán thành công`,
    html,
  });

  console.log(`Email thông báo đã gửi tới ${adminEmail}`);
}

module.exports = router;
