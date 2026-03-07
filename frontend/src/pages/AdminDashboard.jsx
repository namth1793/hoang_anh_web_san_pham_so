import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

/* ── Helpers ────────────────────────────────────────────────── */
const formatPrice = (price) =>
  new Intl.NumberFormat('vi-VN').format(price) + 'đ';

const formatDate = (str) => {
  if (!str) return '—';
  return new Date(str).toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });
};

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
    {
      id: 'orders',
      label: 'Đơn hàng',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
          <line x1="3" y1="6" x2="21" y2="6" />
          <path d="M16 10a4 4 0 0 1-8 0" />
        </svg>
      ),
    },
  ];

  return (
    <aside className="admin-sidebar">
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

  // Khởi tạo mảng ảnh từ sản phẩm đang sửa
  const initialImages = editProduct?.images
    ? (Array.isArray(editProduct.images) ? editProduct.images : (() => { try { return JSON.parse(editProduct.images); } catch { return []; } })())
    : (editProduct?.image_url ? [editProduct.image_url] : []);

  const [form, setForm] = useState({
    name:           editProduct?.name           || '',
    description:    editProduct?.description    || '',
    price:          editProduct?.price          ?? '',
    original_price: editProduct?.original_price ?? '',
    category:       editProduct?.category       || '',
    file_type:      editProduct?.file_type      || '',
    download_url:   editProduct?.download_url   || '',
    is_featured:    editProduct?.is_featured    === 1,
  });
  const [images, setImages]       = useState(initialImages);
  const [uploading, setUploading] = useState(false);
  const [uploadErr, setUploadErr] = useState('');
  const [loading, setLoading]     = useState(false);
  const [errors, setErrors]       = useState({});
  const fileInputRef              = useRef(null);

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
  };

  // Upload files lên Cloudinary qua backend
  const handleFilesSelect = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    // Reset input để có thể chọn lại cùng file
    e.target.value = '';

    setUploadErr('');
    setUploading(true);
    try {
      const formData = new FormData();
      files.forEach((f) => formData.append('images', f));
      const res = await api.post('/upload/images', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setImages((prev) => [...prev, ...res.data.urls]);
    } catch (err) {
      setUploadErr(err.response?.data?.message || 'Upload ảnh thất bại. Vui lòng thử lại.');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (idx) => {
    setImages((prev) => prev.filter((_, i) => i !== idx));
  };

  const moveFirst = (idx) => {
    setImages((prev) => {
      const next = [...prev];
      const [item] = next.splice(idx, 1);
      next.unshift(item);
      return next;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setLoading(true);
    try {
      const payload = { ...form, images };
      if (isEdit) {
        await api.put(`/products/${editProduct.id}`, payload);
      } else {
        await api.post('/products', payload);
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
              <div style={{ background:'#fef2f2', border:'1px solid #fecaca', color:'#b91c1c', padding:'12px 14px', borderRadius:8, fontSize:'0.88rem', display:'flex', gap:8, alignItems:'center' }}>
                ⚠️ {errors.general}
              </div>
            )}

            {/* Name */}
            <div className="form-group">
              <label className="form-label" htmlFor="name">Tên sản phẩm <span>*</span></label>
              <input id="name" name="name" type="text" className="form-input"
                placeholder="Nhập tên sản phẩm..." value={form.name} onChange={handleChange} />
              {errors.name && <span style={{ fontSize:'0.8rem', color:'#ef4444' }}>{errors.name}</span>}
            </div>

            {/* Description */}
            <div className="form-group">
              <label className="form-label" htmlFor="description">
                Mô tả sản phẩm
                <span style={{ fontSize: '0.75rem', fontWeight: 400, color: '#94a3b8', marginLeft: 8 }}>
                  Hỗ trợ Markdown (## Tiêu đề, **in đậm**, - danh sách...)
                </span>
              </label>
              <textarea id="description" name="description" className="form-textarea"
                placeholder={'## Tính năng nổi bật\n\n- Tính năng 1\n- Tính năng 2\n\n## Nội dung bao gồm\n\nMô tả chi tiết sản phẩm...'}
                value={form.description}
                onChange={handleChange} rows={10}
                style={{ fontFamily: 'monospace', fontSize: '0.88rem' }} />
              <span className="form-hint">
                Markdown được render đầy đủ trên trang sản phẩm.{' '}
                <a href="https://www.markdownguide.org/cheat-sheet/" target="_blank" rel="noreferrer" style={{ color: 'var(--primary)' }}>Xem cú pháp →</a>
              </span>
            </div>

            {/* Price & Original Price */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="price">Giá bán (VNĐ) <span>*</span></label>
                <input id="price" name="price" type="number" min="0" step="1000"
                  className="form-input" placeholder="299000" value={form.price} onChange={handleChange} />
                {errors.price && <span style={{ fontSize:'0.8rem', color:'#ef4444' }}>{errors.price}</span>}
                {form.price !== '' && !errors.price && (
                  <span className="form-hint">Hiển thị: {formatPrice(Number(form.price) || 0)}</span>
                )}
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="original_price">Giá gốc (để hiện giảm giá)</label>
                <input id="original_price" name="original_price" type="number" min="0" step="1000"
                  className="form-input" placeholder="Để trống nếu không giảm giá"
                  value={form.original_price} onChange={handleChange} />
                <span className="form-hint">Điền cao hơn giá bán để hiện badge giảm giá</span>
              </div>
            </div>

            {/* Category & File Type */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="category">Danh mục</label>
                <select id="category" name="category" className="form-select"
                  value={form.category} onChange={handleChange}>
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
                <input id="file_type" name="file_type" type="text" className="form-input"
                  placeholder="PDF, PPTX, Video MP4, ZIP..." value={form.file_type} onChange={handleChange} />
                <span className="form-hint">Định dạng file khách hàng sẽ nhận được</span>
              </div>
            </div>

            {/* ── IMAGE UPLOAD ─────────────────────────────────── */}
            <div className="form-group">
              <label className="form-label">Hình ảnh sản phẩm</label>

              {/* Vùng kéo thả / chọn file */}
              <div
                style={{
                  border: '2px dashed #cbd5e1', borderRadius: 10, padding: '20px 16px',
                  textAlign: 'center', cursor: 'pointer', background: '#f8fafc',
                  transition: 'border-color .2s',
                }}
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const dt = e.dataTransfer;
                  if (dt.files.length) handleFilesSelect({ target: { files: dt.files, value: '' } });
                }}
              >
                {uploading ? (
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8, color:'#64748b' }}>
                    <span className="spinner" style={{ width:18, height:18, borderWidth:2 }} />
                    Đang upload lên Cloudinary...
                  </div>
                ) : (
                  <>
                    <div style={{ fontSize:'2rem', marginBottom:6 }}>🖼️</div>
                    <div style={{ fontWeight:600, color:'#374151', fontSize:'0.9rem' }}>
                      Kéo thả ảnh vào đây hoặc <span style={{ color:'var(--primary)', textDecoration:'underline' }}>chọn file</span>
                    </div>
                    <div style={{ fontSize:'0.78rem', color:'#94a3b8', marginTop:4 }}>
                      JPG, PNG, WEBP, GIF · Tối đa 5MB/ảnh · Không giới hạn số lượng
                    </div>
                  </>
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                multiple
                style={{ display:'none' }}
                onChange={handleFilesSelect}
              />

              {uploadErr && (
                <span style={{ fontSize:'0.8rem', color:'#ef4444' }}>⚠️ {uploadErr}</span>
              )}

              {/* Grid preview ảnh */}
              {images.length > 0 && (
                <div style={{ marginTop:12 }}>
                  <div style={{ fontSize:'0.8rem', color:'#64748b', marginBottom:8 }}>
                    {images.length} ảnh · Ảnh đầu tiên là ảnh bìa · Click ảnh để đặt làm bìa
                  </div>
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(100px, 1fr))', gap:8 }}>
                    {images.map((url, idx) => (
                      <div key={url + idx} style={{ position:'relative', borderRadius:8, overflow:'hidden', border: idx === 0 ? '2px solid var(--primary)' : '2px solid #e2e8f0', aspectRatio:'1' }}>
                        <img
                          src={url}
                          alt={`Ảnh ${idx + 1}`}
                          style={{ width:'100%', height:'100%', objectFit:'cover', cursor:'pointer' }}
                          onClick={() => moveFirst(idx)}
                        />
                        {idx === 0 && (
                          <div style={{ position:'absolute', top:4, left:4, background:'var(--primary)', color:'white', fontSize:'0.65rem', fontWeight:700, padding:'2px 6px', borderRadius:4 }}>
                            BÌA
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={() => removeImage(idx)}
                          style={{ position:'absolute', top:4, right:4, width:22, height:22, borderRadius:'50%', background:'rgba(0,0,0,0.55)', color:'white', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.75rem', fontWeight:700 }}
                          title="Xóa ảnh"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            {/* ── END IMAGE UPLOAD ─────────────────────────────── */}

            {/* Download URL */}
            <div className="form-group">
              <label className="form-label" htmlFor="download_url">Link tải file (Download URL)</label>
              <input id="download_url" name="download_url" type="url" className="form-input"
                placeholder="https://drive.google.com/... hoặc link tải trực tiếp"
                value={form.download_url} onChange={handleChange} />
              <span className="form-hint">Link khách hàng nhận được sau khi mua (Google Drive, Dropbox, v.v.)</span>
            </div>

            {/* Is Featured */}
            <div className="form-group">
              <label style={{ display:'flex', alignItems:'center', gap:10, cursor:'pointer' }}>
                <input type="checkbox" name="is_featured" checked={form.is_featured}
                  onChange={handleChange}
                  style={{ width:18, height:18, accentColor:'var(--primary)', cursor:'pointer' }} />
                <span className="form-label" style={{ margin:0 }}>
                  🔥 Đánh dấu là sản phẩm nổi bật (Hot)
                </span>
              </label>
              <span className="form-hint">Sản phẩm nổi bật sẽ được ưu tiên hiển thị và có badge Hot trên trang chủ.</span>
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn--ghost" onClick={onCancel} disabled={loading || uploading}>
              Hủy
            </button>
            <button type="submit" className="btn btn--primary" disabled={loading || uploading}>
              {loading ? (
                <>
                  <span className="spinner" style={{ width:16, height:16, borderWidth:2 }} />
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

/* ── Order List ──────────────────────────────────────────────── */
function OrderList() {
  const [orders, setOrders]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/payment/orders');
      setOrders(res.data);
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const paidCount    = orders.filter((o) => o.payment_status === 'paid').length;
  const totalRevenue = orders.filter((o) => o.payment_status === 'paid').reduce((s, o) => s + Number(o.amount), 0);

  return (
    <>
      <div className="admin-topbar">
        <div>
          <h1 className="admin-page-title">Đơn hàng</h1>
          <p className="admin-page-sub">{orders.length} đơn hàng · {paidCount} đã thanh toán · Doanh thu: {formatPrice(totalRevenue)}</p>
        </div>
        <button className="btn btn--ghost btn--sm" onClick={fetchOrders}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M23 4v6h-6" /><path d="M1 20v-6h6" />
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
          </svg>
          Tải lại
        </button>
      </div>

      <div className="admin-card">
        {loading ? (
          <div className="loading-inline"><div className="spinner" /></div>
        ) : orders.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state__icon">📋</div>
            <div className="empty-state__text">Chưa có đơn hàng nào.</div>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Mã đơn</th>
                  <th>Khách hàng</th>
                  <th>Số tiền</th>
                  <th>Trạng thái</th>
                  <th>Ngày tạo</th>
                  <th>Thanh toán lúc</th>
                  <th>Chi tiết</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o, i) => (
                  <>
                    <tr key={o.id}>
                      <td style={{ color: '#94a3b8', fontWeight: 500 }}>{i + 1}</td>
                      <td style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '0.85rem' }}>{o.order_ref}</td>
                      <td>
                        <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{o.customer_name}</div>
                        <div style={{ fontSize: '0.78rem', color: '#64748b' }}>{o.customer_email}</div>
                        {o.customer_phone && <div style={{ fontSize: '0.78rem', color: '#64748b' }}>{o.customer_phone}</div>}
                      </td>
                      <td style={{ fontWeight: 700, color: '#059669' }}>{formatPrice(o.amount)}</td>
                      <td>
                        {o.payment_status === 'paid' ? (
                          <span style={{ background: '#dcfce7', color: '#15803d', padding: '3px 10px', borderRadius: 9999, fontSize: '0.78rem', fontWeight: 600 }}>
                            ✅ Đã thanh toán
                          </span>
                        ) : (
                          <span style={{ background: '#fef9c3', color: '#854d0e', padding: '3px 10px', borderRadius: 9999, fontSize: '0.78rem', fontWeight: 600 }}>
                            ⏳ Chờ thanh toán
                          </span>
                        )}
                      </td>
                      <td style={{ fontSize: '0.82rem', color: '#64748b' }}>{formatDate(o.created_at)}</td>
                      <td style={{ fontSize: '0.82rem', color: '#64748b' }}>{formatDate(o.paid_at)}</td>
                      <td>
                        <button
                          className="btn btn--ghost btn--sm"
                          onClick={() => setExpanded(expanded === o.id ? null : o.id)}
                        >
                          {expanded === o.id ? 'Ẩn' : 'Xem'}
                        </button>
                      </td>
                    </tr>
                    {expanded === o.id && (
                      <tr key={`${o.id}-detail`}>
                        <td colSpan={8} style={{ background: '#f8fafc', padding: '12px 20px' }}>
                          {o.note && <p style={{ margin: '0 0 8px', fontSize: '0.85rem', color: '#64748b' }}>Ghi chú: {o.note}</p>}
                          {o.items && o.items.length > 0 ? (
                            <table style={{ width: '100%', fontSize: '0.85rem', borderCollapse: 'collapse' }}>
                              <thead>
                                <tr style={{ color: '#94a3b8' }}>
                                  <th style={{ textAlign: 'left', padding: '4px 8px' }}>Sản phẩm</th>
                                  <th style={{ textAlign: 'center', padding: '4px 8px' }}>Số lượng</th>
                                  <th style={{ textAlign: 'right', padding: '4px 8px' }}>Thành tiền</th>
                                </tr>
                              </thead>
                              <tbody>
                                {o.items.map((item, idx) => (
                                  <tr key={idx} style={{ borderTop: '1px solid #e2e8f0' }}>
                                    <td style={{ padding: '6px 8px' }}>{item.name}</td>
                                    <td style={{ padding: '6px 8px', textAlign: 'center' }}>{item.quantity}</td>
                                    <td style={{ padding: '6px 8px', textAlign: 'right', fontWeight: 600 }}>{formatPrice(item.price * item.quantity)}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          ) : (
                            <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8' }}>Không có thông tin sản phẩm.</p>
                          )}
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        )}
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

  const sidebarView = view === 'add' ? 'add' : view === 'orders' ? 'orders' : 'list';

  return (
    <div className="admin-layout">
      <AdminSidebar
        view={sidebarView}
        setView={(v) => {
          if (v === 'add') handleAddNew();
          else if (v === 'orders') { setView('orders'); setEditProduct(null); }
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

        {view === 'orders' && <OrderList />}
      </main>
    </div>
  );
}
