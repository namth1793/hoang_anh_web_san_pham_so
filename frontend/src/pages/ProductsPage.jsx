import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import api from '../utils/api';

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
  'Phan mem':  { emoji: '💻', label: 'Phần mềm' },
  'Phần mềm': { emoji: '💻', label: 'Phần mềm' },
};
const getCatMeta = (cat) => CATEGORY_META[cat] || { emoji: '📦', label: cat || 'Khác' };
// getCatMeta used in filter categories below
const CATEGORIES = [
  { key: null,        emoji: '🛍',  label: 'Tất cả' },
  { key: 'Khóa học', emoji: '🎓',  label: 'Khóa học' },
  { key: 'Template',  emoji: '🎨',  label: 'Template' },
  { key: 'Ebook',     emoji: '📚',  label: 'Ebook' },
  { key: 'Đồ họa',  emoji: '🖼️', label: 'Đồ họa' },
  { key: 'Biểu mẫu', emoji: '📊',  label: 'Biểu mẫu' },
];

function ProductCard({ product }) {
  const navigate = useNavigate();
  const { addItem, openCart } = useCart();

  const discount =
    product.original_price > product.price
      ? Math.round((1 - product.price / product.original_price) * 100)
      : null;
  // Mock rating/sold — replace with real API data later
  const soldCount   = product.sold_count   ?? ((product.id * 13 + 23) % 56 + 5);
  const reviewCount = product.review_count ?? Math.max(1, Math.floor(soldCount / 7));

  const handleAddToCart = (e) => {
    e.stopPropagation();
    addItem(product);
    openCart();
  };

  const handleBuyNow = (e) => {
    e.stopPropagation();
    addItem(product);
    navigate('/checkout');
  };

  return (
    <div className="prod-card">
      {/* Image */}
      <div
        className="prod-card__img-wrap"
        style={{ cursor: 'pointer' }}
        onClick={() => navigate(`/san-pham/${product.id}`)}
      >
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="prod-card__img"
            onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
          />
        ) : null}
        <div className="prod-card__img-ph" style={{ display: product.image_url ? 'none' : 'flex' }}>📦</div>
        {discount && <span className="prod-card__badge-sale">-{discount}%</span>}
        {product.is_featured === 1 && <span className="prod-card__badge-hot">🔥 Bán chạy</span>}
      </div>

      {/* Body */}
      <div className="prod-card__body">
        <h3
          className="prod-card__name"
          style={{ cursor: 'pointer' }}
          onClick={() => navigate(`/san-pham/${product.id}`)}
        >
          {product.name}
        </h3>
        <p className="prod-card__desc">{product.description}</p>

        {/* Rating + Sold */}
        <div className="prod-card__meta">
          <div className="prod-card__stars">
            ★★★★★ <span className="prod-card__review-count">({reviewCount})</span>
          </div>
          <span className="prod-card__sold">Đã bán {soldCount}</span>
        </div>

        {/* Price */}
        <div className="prod-card__pricing">
          <span className="prod-card__price">{fmt(product.price)}</span>
          {product.original_price > product.price && (
            <span className="prod-card__original">{fmt(product.original_price)}</span>
          )}
        </div>

        {/* Action buttons */}
        <div className="prod-card__actions">
          <Link to={`/san-pham/${product.id}`} className="prod-card__btn prod-card__btn--detail">
            Chi tiết
          </Link>
          <button className="prod-card__btn prod-card__btn--cart" onClick={handleAddToCart}>
            Thêm giỏ
          </button>
          <button className="prod-card__btn prod-card__btn--buy" onClick={handleBuyNow}>
            Mua ngay
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  const [products, setProducts]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [activecat, setActivecat] = useState(null);
  const [search, setSearch]       = useState('');
  const [query, setQuery]         = useState('');
  const [page, setPage]           = useState(1);
  const PER_PAGE = 12;

  useEffect(() => {
    setLoading(true);
    setPage(1);
    const params = {};
    if (query)     params.search   = query;
    if (activecat) params.category = activecat;
    api.get('/products', { params })
      .then((r) => setProducts(r.data))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [query, activecat]);

  const handleSearch = (e) => { e.preventDefault(); setQuery(search); };

  const totalPages = Math.ceil(products.length / PER_PAGE);
  const paged = products.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-light, #f8fafc)' }}>
      {/* Page Header */}
      <div style={{ background: '#014DA8', padding: '56px 0 40px', color: 'white' }}>
        <div className="container">
          <h1 style={{ margin: 0, fontSize: 'clamp(1.5rem,4vw,2rem)', fontWeight: 800, textAlign: 'center' }}>Tất cả sản phẩm số</h1>
          <p style={{ margin: '10px 0 0', opacity: 0.8, textAlign: 'center' }}>Tải về tức thì sau khi thanh toán. Dùng mãi mãi.</p>
        </div>
      </div>

      <div className="container" style={{ padding: '40px 24px' }}>
        {/* Search + Filter */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, marginBottom: 36 }}>
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: 10, maxWidth: 520 }}>
            <div className="table-search" style={{ flex: 1 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input
                type="text"
                placeholder="Tìm sản phẩm..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <button type="submit" className="btn btn--primary btn--sm">Tìm</button>
            {query && (
              <button type="button" className="btn btn--ghost btn--sm" onClick={() => { setSearch(''); setQuery(''); }}>
                Xóa
              </button>
            )}
          </form>

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {CATEGORIES.map((c) => (
              <button
                key={c.label}
                className={`btn btn--sm${activecat === c.key ? ' btn--primary' : ' btn--ghost'}`}
                style={{ borderRadius: '9999px' }}
                onClick={() => setActivecat(c.key)}
              >
                {c.emoji} {c.label}
              </button>
            ))}
          </div>
        </div>

        {/* Results info */}
        {!loading && products.length > 0 && (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: 20 }}>
            Hiển thị {paged.length} / {products.length} sản phẩm
            {query && ` cho "${query}"`}
            {activecat && ` trong "${activecat}"`}
          </p>
        )}

        {/* Grid */}
        {loading ? (
          <div className="loading-inline"><div className="spinner" /></div>
        ) : paged.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state__icon">🔍</div>
            <div className="empty-state__text">Không tìm thấy sản phẩm phù hợp.</div>
            <button className="btn btn--ghost btn--sm" style={{ marginTop: 12 }} onClick={() => { setSearch(''); setQuery(''); setActivecat(null); }}>
              Xem tất cả
            </button>
          </div>
        ) : (
          <div className="prod-grid">
            {paged.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 40 }}>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                className={`btn btn--sm${page === n ? ' btn--primary' : ' btn--ghost'}`}
                style={{ minWidth: 40 }}
                onClick={() => { setPage(n); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              >
                {n}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
