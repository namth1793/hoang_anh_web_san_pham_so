/**
 * routes/payment.js
 *
 * Luồng SePay (chuyển khoản ngân hàng tự động):
 *  1. POST /api/payment/create  → tạo đơn hàng + sinh VietQR URL → trả về qrUrl + bankInfo
 *  2. POST /api/payment/webhook → SePay IPN gọi khi nhận tiền → verify → gửi email admin
 *
 * Cấu hình yêu cầu trong .env:
 *   BANK_CODE, BANK_ACCOUNT_NO, BANK_ACCOUNT_NAME,
 *   SEPAY_API_TOKEN, ADMIN_EMAIL, MAIL_USER, MAIL_PASS
 */

const express    = require('express');
const nodemailer = require('nodemailer');
const { getDB }  = require('../db/database');

const router = express.Router();

/* ═══════════════════════════════════════════════════════════════
   HELPER FUNCTIONS
   ═══════════════════════════════════════════════════════════════ */

/**
 * Sinh mã đơn hàng duy nhất: DH + 8 chữ số cuối timestamp + 4 ký tự random
 */
function generateOrderRef() {
  const ts   = Date.now().toString().slice(-8);
  const rand = Math.random().toString(36).slice(-4).toUpperCase();
  return `DH${ts}${rand}`;
}

/* ═══════════════════════════════════════════════════════════════
   POST /api/payment/create
   Body: { amount, customerName, customerEmail, customerPhone, note, items[] }
   Response: { orderRef, qrUrl, bankInfo }
   ═══════════════════════════════════════════════════════════════ */
router.post('/create', (req, res) => {
  const { amount, customerName, customerEmail, customerPhone, note, items } = req.body;

  // ── Validate đầu vào ─────────────────────────────────────────
  if (!amount || !customerName || !customerEmail) {
    return res.status(400).json({ message: 'Thiếu thông tin bắt buộc: amount, customerName, customerEmail' });
  }

  const bankCode    = (process.env.BANK_CODE         || '').trim();
  const accountNo   = (process.env.BANK_ACCOUNT_NO   || '').trim();
  const accountName = (process.env.BANK_ACCOUNT_NAME || '').trim();

  if (!bankCode || !accountNo) {
    return res.status(500).json({ message: 'Server chưa cấu hình thông tin ngân hàng (BANK_CODE, BANK_ACCOUNT_NO)' });
  }

  // ── Tạo mã đơn hàng & nội dung chuyển khoản ─────────────────
  const orderRef        = generateOrderRef();
  const transferContent = `MW ${orderRef}`;   // Nội dung CK khách phải nhập

  // ── Lưu đơn hàng vào DB ──────────────────────────────────────
  try {
    const db = getDB();
    db.prepare(`
      INSERT INTO orders
        (order_ref, customer_name, customer_email, customer_phone, note, items, amount, payment_method, payment_status)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'bank_transfer', 'pending')
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

  // ── Sinh VietQR URL (hiển thị trực tiếp dưới dạng ảnh) ──────
  const qrUrl =
    `https://img.vietqr.io/image/${bankCode}-${accountNo}-compact.png` +
    `?amount=${Math.round(Number(amount))}` +
    `&addInfo=${encodeURIComponent(transferContent)}` +
    `&accountName=${encodeURIComponent(accountName)}`;

  console.log('[SePay] Đơn hàng tạo:', orderRef, '| Nội dung CK:', transferContent);

  return res.json({
    orderRef,
    qrUrl,          // URL ảnh VietQR — dùng trực tiếp làm <img src>
    bankInfo: {
      bankCode,
      accountNo,
      accountName,
      amount:  Math.round(Number(amount)),
      content: transferContent,
    },
  });
});

/* ═══════════════════════════════════════════════════════════════
   POST /api/payment/webhook
   SePay gọi endpoint này sau khi phát hiện tiền vào tài khoản
   Header: Authorization: Apikey <SEPAY_API_TOKEN>
   Body: { id, gateway, content, transferAmount, transferType, accountNumber, ... }
   ═══════════════════════════════════════════════════════════════ */
router.post('/webhook', async (req, res) => {
  // ── Xác thực API token từ SePay ──────────────────────────────
  const authHeader = (req.headers['authorization'] || '').trim();
  const sePayToken = (process.env.SEPAY_API_TOKEN  || '').trim();

  if (sePayToken && authHeader !== `Apikey ${sePayToken}`) {
    console.warn('[SePay] Webhook: unauthorized, header =', authHeader);
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  const { content, transferAmount, transferType } = req.body;
  console.log('[SePay] Webhook nhận:', { content, transferAmount, transferType });

  // ── Chỉ xử lý giao dịch tiền vào ────────────────────────────
  if (transferType !== 'in') {
    return res.json({ success: true, message: 'Ignored: not incoming transfer' });
  }

  // ── Tìm mã đơn hàng trong nội dung chuyển khoản ─────────────
  // Định dạng: DH + 8 chữ số + 4 ký tự (ví dụ: DH99371942Z6EL)
  const match = (content || '').match(/DH[A-Z0-9]{12}/i);
  if (!match) {
    console.log('[SePay] Không tìm thấy mã đơn hàng trong nội dung:', content);
    return res.json({ success: false, message: 'Order ref not found in content' });
  }

  const orderRef = match[0].toUpperCase();
  const db       = getDB();
  const order    = db.prepare('SELECT * FROM orders WHERE order_ref = ?').get(orderRef);

  if (!order) {
    return res.json({ success: false, message: 'Order not found' });
  }
  if (order.payment_status === 'paid') {
    return res.json({ success: true, message: 'Already confirmed' });
  }
  if (Number(transferAmount) < Number(order.amount)) {
    console.warn(`[SePay] Số tiền không khớp: nhận ${transferAmount}đ, cần ${order.amount}đ`);
    return res.json({ success: false, message: 'Amount mismatch' });
  }

  // ── Cập nhật trạng thái đơn hàng ─────────────────────────────
  const paidAt = new Date().toISOString();
  db.prepare(`
    UPDATE orders SET payment_status = 'paid', paid_at = ?
    WHERE order_ref = ?
  `).run(paidAt, orderRef);

  console.log(`[SePay] Đơn hàng ${orderRef} thanh toán thành công: ${transferAmount}đ`);

  // ── Gửi email thông báo admin ─────────────────────────────────
  sendPaymentEmail({
    orderRef,
    amount:        transferAmount,
    customerName:  order.customer_name,
    customerEmail: order.customer_email,
    paidAt,
  }).catch((err) => console.error('Lỗi gửi email:', err.message));

  return res.json({ success: true, message: 'Payment confirmed' });
});

/* ═══════════════════════════════════════════════════════════════
   GỬI EMAIL THÔNG BÁO ADMIN
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
          <td style="padding:10px 0">Chuyển khoản ngân hàng (SePay)</td>
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
