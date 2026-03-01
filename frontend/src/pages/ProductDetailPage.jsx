import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useCart } from '../context/CartContext';

const fmt = (n) => new Intl.NumberFormat('vi-VN').format(n) + 'đ';

const CATEGORY_META = {
  'Khoa hoc':  { emoji: '🎓', label: 'Khóa học' },
  'Khóa học':  { emoji: '🎓', label: 'Khóa học' },
  Template:    { emoji: '🎨', label: 'Template' },
  Ebook:       { emoji: '📚', label: 'Ebook' },
  'Do hoa':    { emoji: '🖼️', label: 'Đồ họa' },
  'Đồ họa':   { emoji: '🖼️', label: 'Đồ họa' },
  'Bieu mau':  { emoji: '📊', label: 'Biểu mẫu' },
  'Biểu mẫu': { emoji: '📊', label: 'Biểu mẫu' },
};
const getCatMeta = (cat) => CATEGORY_META[cat] || { emoji: '📦', label: cat || 'Khác' };

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem, openCart } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    setLoading(true);
    api.get(`/products/${id}`)
      .then((r) => setProduct(r.data))
      .catch((err) => {
        if (err.response?.status === 404) setNotFound(true);
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="loading-fullscreen"><div className="spinner" /></div>
  );

  if (notFound || !product) return (
    <div style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
      <div style={{ fontSize: '3rem' }}>😕</div>
      <h2 style={{ color: 'var(--dark-2)' }}>Không tìm thấy sản phẩm</h2>
      <Link to="/" className="btn btn--primary">← Về trang chủ</Link>
    </div>
  );

  const discount = product.original_price > product.price
    ? Math.round((1 - product.price / product.original_price) * 100)
    : null;
  const catMeta = getCatMeta(product.category);

  const handleAddToCart = () => {
    addItem(product);
    setAdded(true);
    openCart();
    setTimeout(() => setAdded(false), 2000);
  };

  const handleBuyNow = () => {
    addItem(product);
    navigate('/checkout');
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      {/* Breadcrumb */}
      <div style={{ background: 'white', borderBottom: '1px solid var(--border)', padding: '14px 0' }}>
        <div className="container" style={{ display: 'flex', gap: 8, fontSize: '0.88rem', color: 'var(--text-muted)', alignItems: 'center' }}>
          <Link to="/" style={{ color: 'var(--primary)', textDecoration: 'none' }}>Trang chủ</Link>
          <span>›</span>
          <span style={{ color: 'var(--text)', maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{product.name}</span>
        </div>
      </div>

      <div className="container" style={{ padding: '40px 24px' }}>
        <div className="product-detail-grid">
          {/* Left: Image */}
          <div className="product-detail__img-col">
            <div className="product-detail__img-wrap">
              {product.image_url ? (
                <img src={product.image_url} alt={product.name} className="product-detail__img"
                  onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                />
              ) : null}
              <div className="product-detail__img-ph" style={{ display: product.image_url ? 'none' : 'flex' }}>📦</div>
              {discount && <span className="prod-card__badge-sale" style={{ fontSize: '1rem', padding: '6px 14px' }}>-{discount}%</span>}
            </div>
          </div>

          {/* Right: Info */}
          <div className="product-detail__info-col">
            {/* Category + file type chips */}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
              <span className="prod-card__cat" style={{ background: '#eef2ff', color: 'var(--primary)', padding: '4px 12px', borderRadius: '9999px', fontSize: '0.85rem', fontWeight: 600 }}>
                {catMeta.emoji} {catMeta.label}
              </span>
              {product.file_type && (
                <span className="prod-card__filetype">{product.file_type}</span>
              )}
              {product.is_featured === 1 && (
                <span style={{ background: '#fff7ed', color: '#ea580c', padding: '4px 12px', borderRadius: '9999px', fontSize: '0.8rem', fontWeight: 600 }}>🔥 Bán chạy</span>
              )}
            </div>

            <h1 style={{ fontSize: 'clamp(1.3rem,3vw,1.8rem)', fontWeight: 800, color: 'var(--dark-2)', lineHeight: 1.3, marginBottom: 16 }}>
              {product.name}
            </h1>

            {/* Pricing */}
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 24 }}>
              <span style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary)' }}>{fmt(product.price)}</span>
              {product.original_price > product.price && (
                <>
                  <span style={{ fontSize: '1.1rem', color: 'var(--text-muted)', textDecoration: 'line-through' }}>{fmt(product.original_price)}</span>
                  <span style={{ background: '#fef2f2', color: '#dc2626', padding: '2px 10px', borderRadius: '9999px', fontSize: '0.85rem', fontWeight: 700 }}>
                    Tiết kiệm {discount}%
                  </span>
                </>
              )}
            </div>

            {/* Description */}
            <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '20px 24px', marginBottom: 28 }}>
              <h3 style={{ margin: '0 0 10px', fontSize: '1rem', color: 'var(--dark-2)', fontWeight: 700 }}>Mô tả sản phẩm</h3>
              <p style={{ margin: 0, color: 'var(--text)', lineHeight: 1.8 }}>{product.description || 'Chưa có mô tả chi tiết.'}</p>
            </div>

            {/* Highlights */}
            <div className="product-highlights-grid">
              {[
                { icon: '⚡', text: 'Nhận hàng tức thì' },
                { icon: '♾️', text: 'Dùng mãi mãi' },
                { icon: '🛡️', text: 'Hoàn tiền 7 ngày' },
                { icon: '💬', text: 'Hỗ trợ tiếng Việt' },
              ].map((h) => (
                <div key={h.text} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'white', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 14px', fontSize: '0.88rem', color: 'var(--text)' }}>
                  <span>{h.icon}</span> {h.text}
                </div>
              ))}
            </div>

            {/* Action buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <button className="btn btn--primary btn--lg btn--block" onClick={handleBuyNow}>
                🛒 Mua ngay – {fmt(product.price)}
              </button>
              <button
                className={`btn btn--lg btn--block${added ? ' btn--success' : ' btn--outline'}`}
                onClick={handleAddToCart}
              >
                {added ? '✅ Đã thêm vào giỏ' : '+ Thêm vào giỏ hàng'}
              </button>
            </div>

            <p style={{ marginTop: 16, fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center' }}>
              🔒 Thanh toán bảo mật · Hoàn tiền nếu không hài lòng
            </p>
          </div>
        </div>

        {/* Back link */}
        <div style={{ marginTop: 40, textAlign: 'center' }}>
          <Link to="/" className="btn btn--ghost">
            ← Về trang chủ
          </Link>
        </div>
      </div>
    </div>
  );
}
