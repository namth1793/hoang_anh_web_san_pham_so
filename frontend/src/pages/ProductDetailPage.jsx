import { useState, useEffect, useMemo } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { marked } from 'marked';
import api from '../utils/api';
import { useCart } from '../context/CartContext';

// Cấu hình marked: không thêm wrapper <p> với br thừa
marked.setOptions({ breaks: true, gfm: true });

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
  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    setLoading(true);
    api.get(`/products/${id}`)
      .then((r) => setProduct(r.data))
      .catch((err) => {
        if (err.response?.status === 404) setNotFound(true);
      })
      .finally(() => setLoading(false));
  }, [id]);

  // useMemo phải đứng trước mọi early return (Rules of Hooks)
  const descHtml = useMemo(() => {
    if (!product?.description) return '';
    return marked.parse(product.description);
  }, [product?.description]);

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

  // Danh sách ảnh: ưu tiên mảng images, fallback về image_url
  const imageList = (Array.isArray(product.images) && product.images.length > 0)
    ? product.images
    : (product.image_url ? [product.image_url] : []);

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
          {/* Left: Image Gallery */}
          <div className="product-detail__img-col">
            {/* Main image */}
            <div style={{ position: 'relative', background: '#f1f5f9', borderRadius: 12, overflow: 'hidden', aspectRatio: '4/3', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {imageList.length > 0 ? (
                <img
                  key={activeIdx}
                  src={imageList[activeIdx]}
                  alt={`${product.name} - ảnh ${activeIdx + 1}`}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              ) : (
                <div style={{ fontSize: '4rem', color: '#cbd5e1' }}>📦</div>
              )}

              {/* Discount badge */}
              {discount && (
                <span className="prod-card__badge-sale" style={{ fontSize: '1rem', padding: '6px 14px' }}>
                  -{discount}%
                </span>
              )}

              {/* Prev / Next arrows */}
              {imageList.length > 1 && (
                <>
                  <button
                    onClick={() => setActiveIdx((i) => (i - 1 + imageList.length) % imageList.length)}
                    style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.85)', border: '1px solid #e2e8f0', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', boxShadow: '0 1px 4px rgba(0,0,0,.15)', color: '#374151' }}
                    aria-label="Ảnh trước"
                  >
                    ‹
                  </button>
                  <button
                    onClick={() => setActiveIdx((i) => (i + 1) % imageList.length)}
                    style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.85)', border: '1px solid #e2e8f0', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', boxShadow: '0 1px 4px rgba(0,0,0,.15)', color: '#374151' }}
                    aria-label="Ảnh sau"
                  >
                    ›
                  </button>
                </>
              )}
            </div>

            {/* Thumbnails */}
            {imageList.length > 1 && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(72px, 1fr))', gap: 8, marginTop: 10 }}>
                {imageList.map((url, idx) => (
                  <div
                    key={url + idx}
                    onClick={() => setActiveIdx(idx)}
                    style={{ aspectRatio: '1', borderRadius: 8, overflow: 'hidden', cursor: 'pointer', border: idx === activeIdx ? '2px solid var(--primary)' : '2px solid #e2e8f0', opacity: idx === activeIdx ? 1 : 0.7, transition: 'all .15s' }}
                  >
                    <img src={url} alt={`thumb ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                ))}
              </div>
            )}

            {/* Image counter */}
            {imageList.length > 1 && (
              <div style={{ textAlign: 'center', marginTop: 6, fontSize: '0.78rem', color: '#94a3b8' }}>
                {activeIdx + 1} / {imageList.length}
              </div>
            )}
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

        {/* Mô tả full-width */}
        <div style={{ marginTop: 48, background: 'white', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ padding: '14px 28px', borderBottom: '1px solid var(--border)' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.08em', color: '#64748b', textTransform: 'uppercase' }}>Mô tả</span>
          </div>
          {descHtml ? (
            <div
              className="product-description-md"
              dangerouslySetInnerHTML={{ __html: descHtml }}
              style={{ padding: '28px 32px' }}
            />
          ) : (
            <p style={{ padding: '28px 32px', margin: 0, color: 'var(--text-muted)' }}>Chưa có mô tả chi tiết.</p>
          )}
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
