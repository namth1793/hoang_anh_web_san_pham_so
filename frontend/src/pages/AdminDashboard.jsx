import { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

/* ── Helpers ────────────────────────────────────────────────── */
const formatPrice = (price) =>
  new Intl.NumberFormat('vi-VN').format(price) + 'đ';

/* ── Sidebar ────────────────────────────────────────────────── */
function AdminSidebar({ view, setView, onLogout, user }) {
  const navItems = [
    {
      id: 'list',
      label: 'Danh sách sản phẩm',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="8" y1="6" x2="21" y2="6" />
          <line x1="8" y1="12" x2="21" y2="12" />
          <line x1="8" y1="18" x2="21" y2="18" />
          <line x1="3" y1="6" x2="3.01" y2="6" strokeWidth="3" />
          <line x1="3" y1="12" x2="3.01" y2="12" strokeWidth="3" />
          <line x1="3" y1="18" x2="3.01" y2="18" strokeWidth="3" />
        </svg>
      ),
    },
    {
      id: 'add',
      label: 'Thêm sản phẩm mới',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="16" />
          <line x1="8" y1="12" x2="16" y2="12" />
        </svg>
      ),
    },
  ];

  return (
    <aside className="admin-sidebar">
      {/* Logo */}
      <div className="admin-sidebar__logo">
        <div
          style={{
            width: 32, height: 32,
            background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
            borderRadius: 8,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
            <rect x="3" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" />
            <rect x="14" y="14" width="7" height="7" rx="1" />
          </svg>
        </div>
        <div>
          <div className="admin-sidebar__logo-text">Sản phẩm số</div>
          <div className="admin-sidebar__logo-sub">Admin Portal</div>
        </div>
      </div>

      {/* User info */}
      <div className="admin-sidebar__user">
        <div className="admin-sidebar__avatar">
          {user?.username?.[0]?.toUpperCase() || 'A'}
        </div>
        <div>
          <div className="admin-sidebar__username">{user?.username || 'Admin'}</div>
          <div className="admin-sidebar__role">Quản trị viên</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="admin-sidebar__nav">
        <div className="admin-sidebar__section">Quản lý</div>
        {navItems.map((item) => (
          <button
            key={item.id}
            className={`admin-nav-item ${view === item.id ? 'admin-nav-item--active' : ''}`}
            onClick={() => setView(item.id)}
            style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none' }}
          >
            <span className="admin-nav-item__icon">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>

      {/* Footer actions */}
      <div className="admin-sidebar__footer" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <Link to="/" className="admin-nav-item" style={{ textDecoration: 'none' }}>
          <span className="admin-nav-item__icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9,22 9,12 15,12 15,22" />
            </svg>
          </span>
          Trang chủ
        </Link>
        <button
          className="admin-nav-item"
          onClick={onLogout}
          style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', color: '#fca5a5' }}
        >
          <span className="admin-nav-item__icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16,17 21,12 16,7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </span>
          Đăng xuất
        </button>
      </div>
    </aside>
  );
}

/* ── Delete Confirm Modal ────────────────────────────────────── */
function DeleteModal({ product, onCancel, onConfirm, loading }) {
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal__icon">🗑️</div>
        <h3 className="modal__title">Xóa sản phẩm?</h3>
        <p className="modal__desc">
          Bạn chắc chắn muốn xóa <strong>"{product.name}"</strong>?
          Hành động này không thể khôi phục.
        </p>
        <div className="modal__actions">
          <button className="btn btn--ghost" onClick={onCancel} disabled={loading}>
            Hủy
          </button>
          <button className="btn btn--danger" onClick={onConfirm} disabled={loading}>
            {loading ? 'Đang xóa...' : 'Xóa sản phẩm'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Product Table ───────────────────────────────────────────── */
function ProductList({ onEdit, onAddNew, refresh }) {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [notification, setNotification] = useState('');

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = search.trim() ? { search: search.trim() } : {};
      const res = await api.get('/products', { params });
      setProducts(res.data);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    const timer = setTimeout(fetchProducts, 300);
    return () => clearTimeout(timer);
  }, [fetchProducts, refresh]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await api.delete(`/products/${deleteTarget.id}`);
      setDeleteTarget(null);
      setNotification('Đã xóa sản phẩm thành công.');
      fetchProducts();
      setTimeout(() => setNotification(''), 3000);
    } catch (err) {
      alert(err.response?.data?.message || 'Xóa thất bại.');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <>
      {deleteTarget && (
        <DeleteModal
          product={deleteTarget}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
          loading={deleteLoading}
        />
      )}

      <div className="admin-topbar">
        <div>
          <h1 className="admin-page-title">Danh sách sản phẩm</h1>
          <p className="admin-page-sub">{products.length} sản phẩm trong hệ thống</p>
        </div>
        <button className="btn btn--primary" onClick={onAddNew}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Thêm sản phẩm
        </button>
      </div>

      {notification && (
        <div
          style={{
            background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#15803d',
            padding: '12px 16px', borderRadius: 8, marginBottom: 16,
            display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.9rem',
          }}
        >
          ✅ {notification}
        </div>
      )}

      <div className="admin-card">
        <div className="admin-card__header">
          <h2 className="admin-card__title">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ display: 'inline', marginRight: 8, verticalAlign: 'middle' }}>
              <path d="M20 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z" />
              <path d="M16 3H8a2 2 0 0 0-2 2v2h12V5a2 2 0 0 0-2-2z" />
            </svg>
            Tất cả sản phẩm
          </h2>
          <div className="admin-toolbar">
            <div className="table-search">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                placeholder="Tìm kiếm theo tên..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <button className="btn btn--ghost btn--sm" onClick={fetchProducts}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M23 4v6h-6" />
                <path d="M1 20v-6h6" />
                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
              </svg>
              Tải lại
            </button>
          </div>
        </div>

        {loading ? (
          <div className="loading-inline">
            <div className="spinner" />
          </div>
        ) : products.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state__icon">📦</div>
            <div className="empty-state__text">
              {search ? `Không tìm thấy sản phẩm với từ khóa "${search}"` : 'Chưa có sản phẩm nào. Hãy thêm sản phẩm đầu tiên!'}
            </div>
            {!search && (
              <button className="btn btn--primary" onClick={onAddNew} style={{ marginTop: 16 }}>
                + Thêm sản phẩm đầu tiên
              </button>
            )}
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Hình ảnh</th>
                  <th>Tên sản phẩm</th>
                  <th>Danh mục</th>
                  <th>Loại file</th>
                  <th>Giá bán</th>
                  <th>Nổi bật</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p, i) => (
                  <tr key={p.id}>
                    <td style={{ color: '#94a3b8', fontWeight: 500 }}>{i + 1}</td>
                    <td>
                      {p.image_url ? (
                        <img
                          src={p.image_url}
                          alt={p.name}
                          className="table-product-img"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div
                        className="table-img-placeholder"
                        style={{ display: p.image_url ? 'none' : 'flex' }}
                      >
                        📦
                      </div>
                    </td>
                    <td>
                      <div className="table-product-name">{p.name}</div>
                      <div className="table-product-desc">{p.description}</div>
                    </td>
                    <td>
                      {p.category ? (
                        <span className="badge badge--primary">{p.category}</span>
                      ) : (
                        <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>—</span>
                      )}
                    </td>
                    <td style={{ fontSize: '0.8rem', color: '#64748b' }}>
                      {p.file_type || '—'}
                    </td>
                    <td>
                      <div>
                        <span className="table-price">{formatPrice(p.price)}</span>
                        {p.original_price > p.price && (
                          <div style={{ fontSize: '0.75rem', color: '#94a3b8', textDecoration: 'line-through' }}>
                            {formatPrice(p.original_price)}
                          </div>
                        )}
                      </div>
                    </td>
                    <td style={{ textAlign: 'center', fontSize: '1rem' }}>
                      {p.is_featured === 1 ? '🔥' : '—'}
                    </td>
                    <td>
                      <div className="table-actions">
                        <button
                          className="btn btn--ghost btn--sm"
                          onClick={() => onEdit(p)}
                          title="Chỉnh sửa"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                          </svg>
                          Sửa
                        </button>
                        <button
                          className="btn btn--danger btn--sm"
                          onClick={() => setDeleteTarget(p)}
                          title="Xóa"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="3,6 5,6 21,6" />
                            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                            <path d="M10 11v6M14 11v6" />
                            <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                          </svg>
                          Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}

/* ── Product Form ────────────────────────────────────────────── */
function ProductForm({ editProduct, onDone, onCancel }) {
  const isEdit = !!editProduct;
  const [form, setForm] = useState({
    name:           editProduct?.name           || '',
    description:    editProduct?.description    || '',
    image_url:      editProduct?.image_url      || '',
    price:          editProduct?.price          ?? '',
    original_price: editProduct?.original_price ?? '',
    category:       editProduct?.category       || '',
    file_type:      editProduct?.file_type      || '',
    download_url:   editProduct?.download_url   || '',
    is_featured:    editProduct?.is_featured    === 1,
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [imgError, setImgError] = useState(false);

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Tên sản phẩm là bắt buộc.';
    if (form.price === '' || isNaN(parseFloat(form.price)) || parseFloat(form.price) < 0)
      errs.price = 'Giá sản phẩm phải là số không âm.';
    return errs;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
    if (name === 'image_url') setImgError(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setLoading(true);
    try {
      if (isEdit) {
        await api.put(`/products/${editProduct.id}`, form);
      } else {
        await api.post('/products', form);
      }
      onDone(isEdit ? 'Cập nhật sản phẩm thành công.' : 'Thêm sản phẩm thành công.');
    } catch (err) {
      setErrors({ general: err.response?.data?.message || 'Có lỗi xảy ra. Vui lòng thử lại.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="admin-topbar">
        <div>
          <h1 className="admin-page-title">
            {isEdit ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}
          </h1>
          <p className="admin-page-sub">
            {isEdit ? `Đang chỉnh sửa: ${editProduct.name}` : 'Điền thông tin để thêm sản phẩm mới'}
          </p>
        </div>
      </div>

      <div className="admin-card form-card">
        <div className="form-card__header">
          <h2 className="form-card__title">
            {isEdit ? '✏️ Thông tin sản phẩm' : '📦 Thông tin sản phẩm mới'}
          </h2>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-card__body">
            {errors.general && (
              <div
                style={{
                  background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c',
                  padding: '12px 14px', borderRadius: 8, fontSize: '0.88rem',
                  display: 'flex', gap: 8, alignItems: 'center',
                }}
              >
                ⚠️ {errors.general}
              </div>
            )}

            {/* Name */}
            <div className="form-group">
              <label className="form-label" htmlFor="name">
                Tên sản phẩm <span>*</span>
              </label>
              <input
                id="name"
                name="name"
                type="text"
                className="form-input"
                placeholder="Nhập tên sản phẩm..."
                value={form.name}
                onChange={handleChange}
              />
              {errors.name && <span style={{ fontSize: '0.8rem', color: '#ef4444' }}>{errors.name}</span>}
            </div>

            {/* Description */}
            <div className="form-group">
              <label className="form-label" htmlFor="description">Mô tả sản phẩm</label>
              <textarea
                id="description"
                name="description"
                className="form-textarea"
                placeholder="Mô tả ngắn gọn về sản phẩm..."
                value={form.description}
                onChange={handleChange}
                rows={3}
              />
            </div>

            {/* Price & Category */}
            {/* Price & Original Price */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="price">
                  Giá bán (VNĐ) <span>*</span>
                </label>
                <input
                  id="price"
                  name="price"
                  type="number"
                  min="0"
                  step="1000"
                  className="form-input"
                  placeholder="299000"
                  value={form.price}
                  onChange={handleChange}
                />
                {errors.price && <span style={{ fontSize: '0.8rem', color: '#ef4444' }}>{errors.price}</span>}
                {form.price !== '' && !errors.price && (
                  <span className="form-hint">Hiển thị: {formatPrice(Number(form.price) || 0)}</span>
                )}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="original_price">Giá gốc (để hiện giảm giá)</label>
                <input
                  id="original_price"
                  name="original_price"
                  type="number"
                  min="0"
                  step="1000"
                  className="form-input"
                  placeholder="Để trống nếu không giảm giá"
                  value={form.original_price}
                  onChange={handleChange}
                />
                <span className="form-hint">Điền cao hơn giá bán để hiện badge giảm giá</span>
              </div>
            </div>

            {/* Category & File Type */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="category">Danh mục</label>
                <select
                  id="category"
                  name="category"
                  className="form-select"
                  value={form.category}
                  onChange={handleChange}
                >
                  <option value="">-- Chọn danh mục --</option>
                  <option value="Khóa học">🎓 Khóa học</option>
                  <option value="Template">🎨 Template</option>
                  <option value="Ebook">📚 Ebook</option>
                  <option value="Đồ họa">🖼️ Đồ họa</option>
                  <option value="Biểu mẫu">📊 Biểu mẫu</option>
                  <option value="Phần mềm">💻 Phần mềm</option>
                  <option value="Khác">📦 Khác</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="file_type">Loại file</label>
                <input
                  id="file_type"
                  name="file_type"
                  type="text"
                  className="form-input"
                  placeholder="PDF, PPTX, Video MP4, ZIP..."
                  value={form.file_type}
                  onChange={handleChange}
                />
                <span className="form-hint">Định dạng file khách hàng sẽ nhận được</span>
              </div>
            </div>

            {/* Image URL */}
            <div className="form-group">
              <label className="form-label" htmlFor="image_url">URL hình ảnh</label>
              <input
                id="image_url"
                name="image_url"
                type="url"
                className="form-input"
                placeholder="https://example.com/image.jpg"
                value={form.image_url}
                onChange={handleChange}
              />
              <span className="form-hint">Nhập đường dẫn hình ảnh trực tiếp (jpg, png, webp...)</span>
              {form.image_url && !imgError && (
                <img src={form.image_url} alt="Preview" className="img-preview" onError={() => setImgError(true)} />
              )}
              {imgError && (
                <span style={{ fontSize: '0.8rem', color: '#ef4444' }}>⚠️ Không thể tải hình ảnh từ URL này.</span>
              )}
            </div>

            {/* Download URL */}
            <div className="form-group">
              <label className="form-label" htmlFor="download_url">Link tải file (Download URL)</label>
              <input
                id="download_url"
                name="download_url"
                type="url"
                className="form-input"
                placeholder="https://drive.google.com/... hoặc link tải trực tiếp"
                value={form.download_url}
                onChange={handleChange}
              />
              <span className="form-hint">Link khách hàng nhận được sau khi mua (Google Drive, Dropbox, v.v.)</span>
            </div>

            {/* Is Featured */}
            <div className="form-group">
              <label style={{ display:'flex', alignItems:'center', gap:10, cursor:'pointer' }}>
                <input
                  type="checkbox"
                  name="is_featured"
                  checked={form.is_featured}
                  onChange={handleChange}
                  style={{ width:18, height:18, accentColor:'var(--primary)', cursor:'pointer' }}
                />
                <span className="form-label" style={{ margin:0 }}>
                  🔥 Đánh dấu là sản phẩm nổi bật (Hot)
                </span>
              </label>
              <span className="form-hint">Sản phẩm nổi bật sẽ được ưu tiên hiển thị và có badge Hot trên trang chủ.</span>
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn--ghost" onClick={onCancel} disabled={loading}>
              Hủy
            </button>
            <button type="submit" className="btn btn--primary" disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
                  Đang lưu...
                </>
              ) : (
                <>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                    <polyline points="17,21 17,13 7,13 7,21" />
                    <polyline points="7,3 7,8 15,8" />
                  </svg>
                  {isEdit ? 'Lưu thay đổi' : 'Thêm sản phẩm'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

/* ── Admin Dashboard (main) ──────────────────────────────────── */
export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [view, setView] = useState('list'); // 'list' | 'add' | 'edit'
  const [editProduct, setEditProduct] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [notification, setNotification] = useState('');

  const handleLogout = () => {
    logout();
    navigate('/admin/login', { replace: true });
  };

  const handleEdit = (product) => {
    setEditProduct(product);
    setView('edit');
  };

  const handleAddNew = () => {
    setEditProduct(null);
    setView('add');
  };

  const handleFormDone = (message) => {
    setView('list');
    setEditProduct(null);
    setRefreshKey((k) => k + 1);
    setNotification(message);
    setTimeout(() => setNotification(''), 3000);
  };

  const handleFormCancel = () => {
    setView('list');
    setEditProduct(null);
  };

  const sidebarView = view === 'add' ? 'add' : 'list';

  return (
    <div className="admin-layout">
      <AdminSidebar
        view={sidebarView}
        setView={(v) => {
          if (v === 'add') handleAddNew();
          else { setView('list'); setEditProduct(null); }
        }}
        onLogout={handleLogout}
        user={user}
      />

      <main className="admin-main">
        {/* Global notification */}
        {notification && (
          <div
            style={{
              background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#15803d',
              padding: '12px 16px', borderRadius: 8, marginBottom: 20,
              display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.9rem',
            }}
          >
            ✅ {notification}
          </div>
        )}

        {view === 'list' && (
          <ProductList
            onEdit={handleEdit}
            onAddNew={handleAddNew}
            refresh={refreshKey}
          />
        )}

        {(view === 'add' || view === 'edit') && (
          <ProductForm
            editProduct={editProduct}
            onDone={handleFormDone}
            onCancel={handleFormCancel}
          />
        )}
      </main>
    </div>
  );
}
