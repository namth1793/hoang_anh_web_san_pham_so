import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="footer" id="footer">
      <div className="container">
        <div className="footer__grid">
          <div>
            <div className="footer__brand-name">
              <div style={{ width:32, height:32, background:'linear-gradient(135deg,#4f46e5,#7c3aed)', borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                  <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                  <path d="M2 17l10 5 10-5"/>
                  <path d="M2 12l10 5 10-5"/>
                </svg>
              </div>
              Sản phẩm số
            </div>
            <p className="footer__brand-desc">
              Kho sản phẩm số hàng đầu Việt Nam. Khóa học, template, ebook và hơn thế nữa – tải về tức thì sau khi thanh toán.
            </p>
          </div>

          <div>
            <div className="footer__col-title">Danh mục</div>
            <ul className="footer__links">
              {['🎓 Khóa học','🎨 Template','📚 Ebook','🖼️ Đồ họa','📊 Biểu mẫu'].map((c) => (
                <li key={c}><Link to="/san-pham">{c}</Link></li>
              ))}
            </ul>
          </div>

          <div>
            <div className="footer__col-title">Hỗ trợ</div>
            <ul className="footer__links">
              <li><a href="#">Hướng dẫn mua hàng</a></li>
              <li><a href="#">Chính sách hoàn tiền</a></li>
              <li><a href="#">Câu hỏi thường gặp</a></li>
              <li><a href="#">Liên hệ Zalo</a></li>
            </ul>
          </div>

          <div>
            <div className="footer__col-title">Liên hệ</div>
            <ul className="footer__links">
              <li><a href="#">📧 admin@sanphamso.vn</a></li>
              <li><a href="#">💬 Zalo: 0909 xxx xxx</a></li>
              <li><a href="#">Facebook Page</a></li>
              <li><Link to="/admin/login">🔐 Đăng nhập admin</Link></li>
            </ul>
            <Link to="/lien-he" className="btn btn--primary btn--sm" style={{ marginTop:16, display:'block', textAlign:'center' }}>
              💬 Gửi yêu cầu tư vấn
            </Link>
          </div>
        </div>

        <div className="footer__bottom">
          <span>© 2024 Sản phẩm số. Bảo lưu mọi quyền.</span>
          <div className="footer__bottom-links">
            <a href="#">Chính sách bảo mật</a>
            <a href="#">Điều khoản dịch vụ</a>
            <a href="#">Chính sách hoàn tiền</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
