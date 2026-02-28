const router = require('express').Router();
const nodemailer = require('nodemailer');

/* ── Tạo transporter (tái sử dụng, lazy-init) ─────────────── */
let transporter = null;

function getTransporter() {
  if (transporter) return transporter;

  // Nếu chưa cấu hình email, dùng Ethereal (fake SMTP) để test
  const user = process.env.MAIL_USER;
  const pass = process.env.MAIL_PASS;

  if (!user || user === 'youremail@gmail.com') {
    // Chế độ preview: in email ra console, không gửi thật
    return null;
  }

  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user, pass },
  });

  return transporter;
}

/* ── POST /api/contact ─────────────────────────────────────── */
router.post('/', async (req, res) => {
  const { name, phone, email, service, message } = req.body;

  // Validate
  if (!name || !name.trim()) {
    return res.status(400).json({ message: 'Vui lòng nhập họ tên.' });
  }
  if (!phone && !email) {
    return res.status(400).json({ message: 'Vui lòng nhập số điện thoại hoặc email để chúng tôi liên hệ lại.' });
  }

  const adminEmail  = process.env.ADMIN_EMAIL || process.env.MAIL_USER || 'admin@sanphamso.vn';
  const senderEmail = process.env.MAIL_USER   || 'noreply@sanphamso.vn';

  const serviceLabel = service || 'Chưa chọn';
  const timestamp    = new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });

  const htmlBody = `
    <div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto;background:#f8fafc;border-radius:12px;overflow:hidden;">
      <div style="background:linear-gradient(135deg,#4f46e5,#7c3aed);padding:28px 32px;">
        <h2 style="color:white;margin:0;font-size:1.3rem;">🛍️ Sản phẩm số – Yêu cầu tư vấn mới</h2>
        <p style="color:rgba(255,255,255,0.7);margin:8px 0 0;font-size:0.88rem;">${timestamp}</p>
      </div>
      <div style="padding:28px 32px;background:white;">
        <table style="width:100%;border-collapse:collapse;font-size:0.95rem;">
          <tr><td style="padding:10px 0;color:#64748b;width:160px;vertical-align:top;font-weight:600;">Họ và tên</td>
              <td style="padding:10px 0;color:#1e293b;font-weight:700;">${name}</td></tr>
          <tr style="border-top:1px solid #f1f5f9;">
              <td style="padding:10px 0;color:#64748b;font-weight:600;">Số điện thoại</td>
              <td style="padding:10px 0;color:#1e293b;">${phone || '—'}</td></tr>
          <tr style="border-top:1px solid #f1f5f9;">
              <td style="padding:10px 0;color:#64748b;font-weight:600;">Email</td>
              <td style="padding:10px 0;color:#1e293b;">${email || '—'}</td></tr>
          <tr style="border-top:1px solid #f1f5f9;">
              <td style="padding:10px 0;color:#64748b;font-weight:600;">Quan tâm đến</td>
              <td style="padding:10px 0;"><span style="background:#eef2ff;color:#4f46e5;padding:3px 12px;border-radius:20px;font-size:0.85rem;font-weight:600;">${serviceLabel}</span></td></tr>
          <tr style="border-top:1px solid #f1f5f9;">
              <td style="padding:10px 0;color:#64748b;font-weight:600;vertical-align:top;">Nội dung</td>
              <td style="padding:10px 0;color:#1e293b;line-height:1.6;">${message ? message.replace(/\n/g, '<br>') : '<em style="color:#94a3b8">Không có</em>'}</td></tr>
        </table>
      </div>
      <div style="padding:16px 32px;background:#f8fafc;border-top:1px solid #e2e8f0;text-align:center;font-size:0.8rem;color:#94a3b8;">
        Email này được gửi tự động từ form liên hệ tại sanphamso.vn
      </div>
    </div>
  `;

  const transport = getTransporter();

  if (!transport) {
    // Không có cấu hình email – in ra console để dev test
    console.log('\n📧 [CONTACT FORM – PREVIEW MODE]');
    console.log('To:', adminEmail);
    console.log('From:', name, `<${email || senderEmail}>`);
    console.log('Phone:', phone || '—');
    console.log('Service:', serviceLabel);
    console.log('Message:', message || '—');
    console.log('──────────────────────────────────\n');

    return res.json({
      success: true,
      message: 'Yêu cầu tư vấn đã được ghi nhận! Chúng tôi sẽ liên hệ bạn sớm nhất.',
      note: 'preview_mode',
    });
  }

  try {
    await transport.sendMail({
      from: `"Sản phẩm số" <${senderEmail}>`,
      to: adminEmail,
      replyTo: email || senderEmail,
      subject: `[Tư vấn] ${name} – ${serviceLabel}`,
      html: htmlBody,
    });

    res.json({
      success: true,
      message: 'Yêu cầu tư vấn đã được gửi thành công! Chúng tôi sẽ liên hệ bạn trong 24 giờ.',
    });
  } catch (err) {
    console.error('Lỗi gửi email:', err.message);
    res.status(500).json({
      message: 'Không thể gửi email lúc này. Vui lòng liên hệ trực tiếp qua Zalo hoặc Facebook.',
    });
  }
});

module.exports = router;
