import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

export default function LoginModal() {
  const { loginModalOpen, closeLoginModal, login } = useAuth();
  const [form, setForm]     = useState({ username: '', password: '' });
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Reset form khi mở modal
  useEffect(() => {
    if (loginModalOpen) {
      setForm({ username: '', password: '' });
      setError('');
    }
  }, [loginModalOpen]);

  // Đóng khi nhấn Escape
  useEffect(() => {
    const fn = (e) => { if (e.key === 'Escape') closeLoginModal(); };
    if (loginModalOpen) document.addEventListener('keydown', fn);
    return () => document.removeEventListener('keydown', fn);
  }, [loginModalOpen, closeLoginModal]);

  if (!loginModalOpen) return null;

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.username.trim() || !form.password) {
      setError('Vui lòng nhập đầy đủ thông tin đăng nhập.');
      return;
    }
    setLoading(true);
    try {
      const res = await api.post('/auth/login', form);
      login(res.data.token, res.data.user);
      closeLoginModal();
      navigate('/admin');
    } catch (err) {
      setError(err.response?.data?.message || 'Đăng nhập thất bại. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={closeLoginModal} style={{ zIndex: 10000 }}>
      <div
        className="login-modal-card"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Đăng nhập Admin"
      >
        {/* Nút đóng */}
        <button className="login-modal__close" onClick={closeLoginModal} aria-label="Đóng">×</button>

        <h2 className="login-title" style={{ color: 'var(--dark-2)' }}>Đăng nhập Admin</h2>
        <p className="login-subtitle" style={{ color: 'var(--text-muted)' }}>Chỉ dành cho quản trị viên được cấp quyền</p>

        {error && (
          <div className="login-error">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            {error}
          </div>
        )}

        <form className="login-form" onSubmit={handleSubmit}>
          <div>
            <label className="login-modal__label" htmlFor="modal-username">
              Tên đăng nhập hoặc Email
            </label>
            <input
              id="modal-username"
              name="username"
              type="text"
              className="login-modal__input"
              placeholder="admin"
              value={form.username}
              onChange={handleChange}
              autoComplete="username"
              autoFocus
            />
          </div>
          <div>
            <label className="login-modal__label" htmlFor="modal-password">
              Mật khẩu
            </label>
            <input
              id="modal-password"
              name="password"
              type="password"
              className="login-modal__input"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            className="btn btn--primary btn--block"
            disabled={loading}
            style={{ marginTop: 4 }}
          >
            {loading ? (
              <>
                <span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} />
                Đang đăng nhập...
              </>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                  <polyline points="10,17 15,12 10,7" />
                  <line x1="15" y1="12" x2="3" y2="12" />
                </svg>
                Đăng nhập
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
