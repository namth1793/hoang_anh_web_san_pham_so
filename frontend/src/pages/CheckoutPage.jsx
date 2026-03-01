import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import api from '../utils/api';

const fmt = (n) => new Intl.NumberFormat('vi-VN').format(n) + 'đ';

/* ── Step indicator ──────────────────────────────────────────── */
function StepIndicator({ step }) {
  const steps = ['Xác nhận đơn hàng', 'Thanh toán QR'];
  return (
    <div className="checkout-steps">
      {steps.map((label, i) => (
        <div key={label} className={`checkout-step${step === i + 1 ? ' checkout-step--active' : step > i + 1 ? ' checkout-step--done' : ''}`}>
          <div className="checkout-step__dot">{step > i + 1 ? '✓' : i + 1}</div>
          <span className="checkout-step__label">{label}</span>
          {i < steps.length - 1 && <div className="checkout-step__line" />}
        </div>
      ))}
    </div>
  );
}

/* ── Step 1: Confirm order ───────────────────────────────────── */
function StepConfirm({ onNext }) {
  const { items, totalPrice, updateQty, removeItem } = useCart();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', phone: '', note: '' });
  const [errors, setErrors] = useState({});

  const set = (f) => (e) => {
    setForm((prev) => ({ ...prev, [f]: e.target.value }));
    setErrors((prev) => ({ ...prev, [f]: '' }));
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim())  e.name  = 'Vui lòng nhập họ tên.';
    if (!form.email.trim()) e.email = 'Vui lòng nhập email.';
    if (!form.phone.trim()) e.phone = 'Vui lòng nhập số điện thoại.';
    return e;
  };

  const handleNext = () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    onNext(form);
  };

  if (items.length === 0) return (
    <div className="empty-state" style={{ padding: '60px 0' }}>
      <div className="empty-state__icon">🛒</div>
      <div className="empty-state__text">Giỏ hàng của bạn đang trống.</div>
      <Link to="/san-pham" className="btn btn--primary" style={{ marginTop: 16 }}>Xem sản phẩm</Link>
    </div>
  );

  return (
    <div className="checkout-layout">
      {/* Left: Cart items */}
      <div className="checkout-items">
        <h2 className="checkout-section-title">🛒 Sản phẩm đã chọn</h2>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {items.map((item) => (
            <li key={item.id} className="checkout-item">
              <div className="checkout-item__img">
                {item.image_url
                  ? <img src={item.image_url} alt={item.name} onError={(e) => { e.target.style.display = 'none'; }} />
                  : <span>📦</span>}
              </div>
              <div className="checkout-item__info">
                <p className="checkout-item__name">{item.name}</p>
                <p className="checkout-item__unit">{fmt(item.price)} / sản phẩm</p>
                <div className="cart-item__qty" style={{ marginTop: 6 }}>
                  <button className="cart-item__qty-btn" onClick={() => updateQty(item.id, -1)}>−</button>
                  <span className="cart-item__qty-num">{item.quantity}</span>
                  <button className="cart-item__qty-btn" onClick={() => updateQty(item.id, 1)}>+</button>
                </div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <p style={{ fontWeight: 700, color: 'var(--primary)', margin: '0 0 6px' }}>{fmt(item.price * item.quantity)}</p>
                <button
                  style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.8rem' }}
                  onClick={() => removeItem(item.id)}
                >
                  Xóa
                </button>
              </div>
            </li>
          ))}
        </ul>

        {/* Order total */}
        <div className="checkout-subtotal">
          <span>Tổng thanh toán</span>
          <span className="checkout-subtotal__price">{fmt(totalPrice)}</span>
        </div>
      </div>

      {/* Right: Customer form */}
      <div className="checkout-form-col">
        <h2 className="checkout-section-title">👤 Thông tin nhận hàng</h2>

        <div className="form-group">
          <label className="form-label">Họ và tên <span style={{ color: '#ef4444' }}>*</span></label>
          <input className={`form-input${errors.name ? ' form-input--error' : ''}`} placeholder="Nguyễn Văn A" value={form.name} onChange={set('name')} />
          {errors.name && <span className="form-error">{errors.name}</span>}
        </div>

        <div className="form-group">
          <label className="form-label">Email <span style={{ color: '#ef4444' }}>*</span></label>
          <input className={`form-input${errors.email ? ' form-input--error' : ''}`} type="email" placeholder="example@gmail.com" value={form.email} onChange={set('email')} />
          {errors.email && <span className="form-error">{errors.email}</span>}
        </div>

        <div className="form-group">
          <label className="form-label">Số điện thoại <span style={{ color: '#ef4444' }}>*</span></label>
          <input className={`form-input${errors.phone ? ' form-input--error' : ''}`} type="tel" placeholder="0909 xxx xxx" value={form.phone} onChange={set('phone')} />
          {errors.phone && <span className="form-error">{errors.phone}</span>}
        </div>

        <div className="form-group">
          <label className="form-label">Ghi chú</label>
          <textarea className="form-input" rows={3} placeholder="Ghi chú thêm cho đơn hàng..." value={form.note} onChange={set('note')} style={{ resize: 'vertical' }} />
        </div>

        <button className="btn btn--primary btn--block btn--lg" style={{ marginTop: 8 }} onClick={handleNext}>
          Tiếp tục thanh toán →
        </button>
        <button className="btn btn--ghost btn--block btn--sm" style={{ marginTop: 8 }} onClick={() => navigate('/')}>
          ← Tiếp tục mua sắm
        </button>
      </div>
    </div>
  );
}

/* ── Step 2: QR Payment ──────────────────────────────────────── */
function StepPayment({ customerInfo, onBack }) {
  const { items, totalPrice, clear } = useCart();
  const [qrData, setQrData]   = useState(null);  // { qrUrl, orderRef }
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const [paid, setPaid]       = useState(false);

  // Gọi API tạo đơn hàng + lấy URL thanh toán VNPay ngay khi vào bước này
  useEffect(() => {
    let cancelled = false;

    const createOrder = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await api.post('/payment/create', {
          amount:        totalPrice,
          customerName:  customerInfo.name,
          customerEmail: customerInfo.email,
          customerPhone: customerInfo.phone,
          note:          customerInfo.note || '',
          items: items.map((item) => ({
            id:       item.id,
            name:     item.name,
            price:    item.price,
            quantity: item.quantity,
          })),
        });
        if (!cancelled) setQrData(res.data); // { qrUrl, orderRef }
      } catch (err) {
        if (!cancelled)
          setError(err.response?.data?.message || 'Không thể tạo mã QR. Vui lòng thử lại.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    createOrder();
    return () => { cancelled = true; };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleConfirmPaid = () => {
    setPaid(true);
    clear();
  };

  if (paid) return (
    <div className="checkout-success">
      <div className="checkout-success__icon">🎉</div>
      <h2>Đặt hàng thành công!</h2>
      <p>Cảm ơn <strong>{customerInfo.name}</strong> đã mua hàng.</p>
      <p>Chúng tôi sẽ gửi link tải về email <strong>{customerInfo.email}</strong> sau khi xác nhận thanh toán.</p>
      <div className="checkout-success__info">
        <span>Mã đơn hàng: <strong>{qrData?.orderRef}</strong></span>
      </div>
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
        <Link to="/" className="btn btn--primary">Về trang chủ</Link>
        <Link to="/san-pham" className="btn btn--ghost">Mua thêm</Link>
      </div>
    </div>
  );

  return (
    <div className="qr-layout">
      {/* Left: QR + thông tin thanh toán */}
      <div className="qr-box">
        <h2 className="checkout-section-title" style={{ textAlign: 'center' }}>Quét mã QR để thanh toán</h2>

        {/* Loading */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '48px 0' }}>
            <div className="spinner" style={{ margin: '0 auto 16px' }} />
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Đang tạo mã QR thanh toán...</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '16px', marginBottom: 16, color: '#dc2626', fontSize: '0.9rem' }}>
            {error}
            <button
              className="btn btn--ghost btn--sm"
              style={{ marginTop: 10, display: 'block' }}
              onClick={() => { setError(''); setLoading(true); setQrData(null); }}
            >
              Thử lại
            </button>
          </div>
        )}

        {/* QR Code — render VNPay URL thành ảnh QR qua public API */}
        {qrData && (
          <>
            <div className="qr-img-wrap">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(qrData.qrUrl)}&size=280x280&ecc=M`}
                alt="QR thanh toán VNPay"
                className="qr-img"
              />
              <p style={{ margin: '10px 0 0', fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                Quét bằng app ngân hàng hoặc ví VNPay
              </p>
            </div>

            {/* Thông tin giao dịch */}
            <div className="qr-bank-info">
              {[
                { label: 'Mã đơn hàng', value: qrData.orderRef },
                { label: 'Số tiền',     value: fmt(totalPrice), highlight: true },
                { label: 'Cổng thanh toán', value: 'VNPay QR' },
              ].map((row) => (
                <div key={row.label} className="qr-bank-row">
                  <span className="qr-bank-row__label">{row.label}</span>
                  <span className={`qr-bank-row__value${row.highlight ? ' qr-bank-row__value--hl' : ''}`}>
                    {row.value}
                  </span>
                </div>
              ))}
            </div>

            {/* Hướng dẫn */}
            <div className="qr-steps">
              {[
                'Mở app ngân hàng hoặc ví VNPay',
                'Chọn "Quét mã QR"',
                'Quét mã QR trên màn hình',
                'Kiểm tra số tiền và xác nhận thanh toán',
                'Nhấn "Tôi đã thanh toán" bên dưới',
              ].map((s, i) => (
                <div key={i} className="qr-step">
                  <span className="qr-step__num">{i + 1}</span>
                  <span>{s}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Right: Order summary */}
      <div className="qr-summary">
        <h2 className="checkout-section-title">Tóm tắt đơn hàng</h2>

        {qrData && (
          <div style={{ marginBottom: 16 }}>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0 0 4px' }}>Mã đơn hàng</p>
            <p style={{ fontWeight: 700, color: 'var(--primary)', margin: 0 }}>{qrData.orderRef}</p>
          </div>
        )}

        <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {items.map((item) => (
            <li key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: 'var(--text)' }}>
              <span style={{ flex: 1, marginRight: 8 }}>{item.name} <span style={{ color: 'var(--text-muted)' }}>×{item.quantity}</span></span>
              <span style={{ fontWeight: 600, flexShrink: 0 }}>{fmt(item.price * item.quantity)}</span>
            </li>
          ))}
        </ul>

        <div className="checkout-subtotal" style={{ marginBottom: 24 }}>
          <span>Tổng thanh toán</span>
          <span className="checkout-subtotal__price">{fmt(totalPrice)}</span>
        </div>

        <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, padding: '12px 16px', marginBottom: 20, fontSize: '0.85rem', color: '#15803d' }}>
          Sau khi VNPay xác nhận, hệ thống tự động gửi thông báo đến email <strong>{customerInfo.email}</strong>
        </div>

        <button
          className="btn btn--success btn--block btn--lg"
          onClick={handleConfirmPaid}
          disabled={loading || !qrData}
        >
          Tôi đã thanh toán
        </button>
        <button className="btn btn--ghost btn--block btn--sm" style={{ marginTop: 8 }} onClick={onBack}>
          ← Quay lại
        </button>
      </div>
    </div>
  );
}

/* ── Main CheckoutPage ───────────────────────────────────────── */
export default function CheckoutPage() {
  const [step, setStep] = useState(1);
  const [customerInfo, setCustomerInfo] = useState(null);

  const handleNext = (info) => {
    setCustomerInfo(info);
    setStep(2);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      <div className="container" style={{ padding: '32px 24px' }}>
        <StepIndicator step={step} />

        <div style={{ marginTop: 32 }}>
          {step === 1 && <StepConfirm onNext={handleNext} />}
          {step === 2 && <StepPayment customerInfo={customerInfo} onBack={() => setStep(1)} />}
        </div>
      </div>
    </div>
  );
}
