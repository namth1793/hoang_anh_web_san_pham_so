import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const fmt = (n) => new Intl.NumberFormat('vi-VN').format(n) + 'đ';

export default function CartSidebar() {
  const { items, totalItems, totalPrice, removeItem, updateQty, isOpen, closeCart } = useCart();
  const navigate = useNavigate();

  const goCheckout = () => {
    closeCart();
    navigate('/checkout');
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && <div className="cart-overlay" onClick={closeCart} />}

      {/* Drawer */}
      <div className={`cart-sidebar${isOpen ? ' cart-sidebar--open' : ''}`}>
        {/* Header */}
        <div className="cart-sidebar__header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
            </svg>
            <span>Giỏ hàng</span>
            {totalItems > 0 && (
              <span className="cart-sidebar__count">{totalItems}</span>
            )}
          </div>
          <button className="cart-sidebar__close" onClick={closeCart} aria-label="Đóng">×</button>
        </div>

        {/* Body */}
        <div className="cart-sidebar__body">
          {items.length === 0 ? (
            <div className="cart-empty">
              <div className="cart-empty__icon">🛒</div>
              <p className="cart-empty__text">Giỏ hàng của bạn đang trống</p>
              <button
                className="btn btn--primary btn--sm"
                onClick={() => { closeCart(); navigate('/san-pham'); }}
              >
                Xem sản phẩm
              </button>
            </div>
          ) : (
            <ul className="cart-items">
              {items.map((item) => (
                <li key={item.id} className="cart-item">
                  {/* Thumbnail */}
                  <div className="cart-item__img">
                    {item.image_url ? (
                      <img src={item.image_url} alt={item.name} onError={(e) => { e.target.style.display='none'; }} />
                    ) : (
                      <span>📦</span>
                    )}
                  </div>

                  {/* Info */}
                  <div className="cart-item__info">
                    <p className="cart-item__name">{item.name}</p>
                    <p className="cart-item__price">{fmt(item.price)}</p>
                    {/* Qty controls */}
                    <div className="cart-item__qty">
                      <button
                        className="cart-item__qty-btn"
                        onClick={() => updateQty(item.id, -1)}
                        aria-label="Giảm"
                      >−</button>
                      <span className="cart-item__qty-num">{item.quantity}</span>
                      <button
                        className="cart-item__qty-btn"
                        onClick={() => updateQty(item.id, 1)}
                        aria-label="Tăng"
                      >+</button>
                    </div>
                  </div>

                  {/* Subtotal + Remove */}
                  <div className="cart-item__right">
                    <span className="cart-item__subtotal">{fmt(item.price * item.quantity)}</span>
                    <button
                      className="cart-item__remove"
                      onClick={() => removeItem(item.id)}
                      aria-label="Xóa"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <polyline points="3 6 5 6 21 6"/>
                        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                        <path d="M10 11v6M14 11v6"/>
                        <path d="M9 6V4h6v2"/>
                      </svg>
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="cart-sidebar__footer">
            <div className="cart-sidebar__total">
              <span>Tổng cộng</span>
              <span className="cart-sidebar__total-price">{fmt(totalPrice)}</span>
            </div>
            <button className="btn btn--primary btn--block" onClick={goCheckout}>
              Thanh toán ngay →
            </button>
            <button
              className="btn btn--ghost btn--block btn--sm"
              style={{ marginTop: 8 }}
              onClick={() => { closeCart(); navigate('/san-pham'); }}
            >
              Tiếp tục mua sắm
            </button>
          </div>
        )}
      </div>
    </>
  );
}
