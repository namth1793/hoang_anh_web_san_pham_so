import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';

const SERVICES = ['Khóa học', 'Template', 'Ebook', 'Đồ họa', 'Biểu mẫu', 'Khác'];

export default function ContactPage() {
  const [form, setForm]       = useState({ name: '', phone: '', email: '', service: '', message: '' });
  const [errors, setErrors]   = useState({});
  const [submitting, setSub]  = useState(false);
  const [success, setSuccess] = useState(false);

  const set = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
    setErrors((err) => ({ ...err, [field]: '' }));
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim())          e.name  = 'Vui lòng nhập họ tên.';
    if (!form.phone && !form.email) e.phone = 'Vui lòng nhập số điện thoại hoặc email.';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const e2 = validate();
    if (Object.keys(e2).length) { setErrors(e2); return; }
    setSub(true);
    try {
      await api.post('/contact', form);
      setSuccess(true);
    } catch (err) {
      setErrors({ submit: err.response?.data?.message || 'Gửi thất bại. Vui lòng thử lại.' });
    } finally {
      setSub(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      {/* Hero header */}
      <div style={{ background: '#014DA8', padding: '56px 0 48px', color: 'white' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <h1 style={{ margin: '0 0 12px', fontSize: 'clamp(1.6rem,4vw,2.2rem)', fontWeight: 800 }}>
            Liên hệ tư vấn
          </h1>
          <p style={{ margin: 0, opacity: 0.85, maxWidth: 480, marginInline: 'auto', lineHeight: 1.6 }}>
            Chúng tôi luôn sẵn sàng hỗ trợ bạn. Điền thông tin bên dưới và chúng tôi sẽ phản hồi trong vòng 24 giờ.
          </p>
        </div>
      </div>

      <div className="container" style={{ padding: '48px 24px', maxWidth: 1100 }}>
        <div className="contact-page-grid">
          {/* Left: contact info */}
          <div className="contact-page__info">
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--dark-2)', marginBottom: 24 }}>Thông tin liên hệ</h2>

            {[
              { icon: '📧', label: 'Email', value: 'admin@sanphamso.vn' },
              { icon: '💬', label: 'Zalo', value: '0909 xxx xxx' },
              { icon: '⏰', label: 'Giờ hỗ trợ', value: '8:00 – 22:00 (T2–CN)' },
            ].map((c) => (
              <div key={c.label} className="contact-info-item">
                <div className="contact-info-item__icon">{c.icon}</div>
                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{c.label}</div>
                  <div style={{ fontWeight: 600, color: 'var(--dark-2)', marginTop: 2 }}>{c.value}</div>
                </div>
              </div>
            ))}

            <div style={{ marginTop: 32, padding: '20px', background: '#eef2ff', borderRadius: 'var(--radius)', borderLeft: '4px solid var(--primary)' }}>
              <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--dark-2)', lineHeight: 1.6 }}>
                🎁 <strong>Cam kết của chúng tôi:</strong> Hoàn tiền 100% trong 7 ngày nếu bạn không hài lòng với sản phẩm đã mua.
              </p>
            </div>
          </div>

          {/* Right: form */}
          <div className="contact-page__form">
            {success ? (
              <div className="contact-success" style={{ padding: '48px 32px' }}>
                <div className="contact-success__icon">✅</div>
                <h3 style={{ fontSize: '1.3rem', margin: '16px 0 8px' }}>Gửi thành công!</h3>
                <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>Cảm ơn bạn đã liên hệ. Chúng tôi sẽ phản hồi sớm nhất có thể.</p>
                <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                  <button className="btn btn--primary" onClick={() => { setSuccess(false); setForm({ name: '', phone: '', email: '', service: '', message: '' }); }}>
                    Gửi yêu cầu khác
                  </button>
                  <Link to="/" className="btn btn--ghost">Về trang chủ</Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--dark-2)', margin: '0 0 4px' }}>Gửi yêu cầu tư vấn</h2>

                <div className="form-group">
                  <label className="form-label">Họ và tên <span style={{ color: '#ef4444' }}>*</span></label>
                  <input className={`form-input${errors.name ? ' form-input--error' : ''}`} type="text" placeholder="Nguyễn Văn A" value={form.name} onChange={set('name')} />
                  {errors.name && <span className="form-error">{errors.name}</span>}
                </div>

                <div className="contact-form-row">
                  <div className="form-group">
                    <label className="form-label">Số điện thoại</label>
                    <input className={`form-input${errors.phone ? ' form-input--error' : ''}`} type="tel" placeholder="0909 xxx xxx" value={form.phone} onChange={set('phone')} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email</label>
                    <input className="form-input" type="email" placeholder="example@gmail.com" value={form.email} onChange={set('email')} />
                  </div>
                </div>
                {errors.phone && <span className="form-error" style={{ marginTop: -12, display: 'block' }}>{errors.phone}</span>}

                <div className="form-group">
                  <label className="form-label">Quan tâm đến</label>
                  <select className="form-input" value={form.service} onChange={set('service')}>
                    <option value="">-- Chọn danh mục --</option>
                    {SERVICES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Nội dung</label>
                  <textarea className="form-input" rows={5} placeholder="Bạn cần tư vấn về sản phẩm nào? Câu hỏi cụ thể..." value={form.message} onChange={set('message')} style={{ resize: 'vertical', minHeight: 110 }} />
                </div>

                {errors.submit && (
                  <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 8, padding: '10px 14px', color: '#dc2626', fontSize: '0.88rem' }}>
                    {errors.submit}
                  </div>
                )}

                <button type="submit" className="btn btn--primary btn--lg" disabled={submitting}>
                  {submitting ? 'Đang gửi...' : '📨 Gửi yêu cầu tư vấn'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
