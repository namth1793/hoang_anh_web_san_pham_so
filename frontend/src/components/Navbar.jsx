import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import logoImg from '../asset/logo.jpg';

export default function Navbar() {
  const [scrolled, setScrolled]   = useState(false);
  const [menuOpen, setMenuOpen]   = useState(false);
  const { totalItems, openCart }  = useCart();
  const location = useLocation();

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  // Close mobile menu on route change
  useEffect(() => { setMenuOpen(false); }, [location.pathname]);

  const close = () => setMenuOpen(false);

  return (
    <nav className={`navbar${scrolled ? ' navbar--scrolled' : ''}`}>
      <div className="container navbar__inner">
        {/* Logo */}
        <Link to="/" className="navbar__logo">
          <img src={logoImg} alt="MANAGE WORK" style={{ height: '44px', width: 'auto', objectFit: 'contain' }} />
        </Link>

        {/* Desktop + Mobile nav links */}
        <div className={`navbar__links${menuOpen ? ' open' : ''}`}>
          {menuOpen && (
            <button
              onClick={close}
              style={{ position:'absolute',top:24,right:24,background:'none',border:'none',color:'white',fontSize:'2rem',cursor:'pointer' }}
            >×</button>
          )}
          <Link to="/" onClick={close} className={location.pathname === '/' ? 'navbar__link--active' : ''}>
            Trang chủ
          </Link>
          <Link to="/san-pham" onClick={close} className={location.pathname === '/san-pham' ? 'navbar__link--active' : ''}>
            Sản phẩm
          </Link>
          <Link to="/gioi-thieu" onClick={close} className={location.pathname === '/gioi-thieu' ? 'navbar__link--active' : ''}>
            Giới thiệu
          </Link>
          <Link to="/lien-he" onClick={close} className={location.pathname === '/lien-he' ? 'navbar__link--active' : ''}>
            Liên hệ
          </Link>
          {menuOpen && (
            <Link to="/admin/login" className="btn btn--outline-white btn--sm" onClick={close}>
              Đăng nhập admin
            </Link>
          )}
        </div>

        {/* Right actions — desktop only */}
        <div className="navbar__actions">
          <Link to="/admin/login" className="btn btn--outline-white btn--sm">Đăng nhập admin</Link>
          <Link to="/lien-he"    className="btn btn--primary btn--sm">Liên hệ ngay</Link>
        </div>

        {/* Cart button — always visible */}
        <button className="navbar__cart-btn" onClick={openCart} aria-label="Giỏ hàng">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
          </svg>
          {totalItems > 0 && <span className="navbar__cart-badge">{totalItems}</span>}
        </button>

        <button className="navbar__hamburger" onClick={() => setMenuOpen(!menuOpen)}>
          <span/><span/><span/>
        </button>
      </div>
    </nav>
  );
}
