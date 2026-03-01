import { Link } from 'react-router-dom';
import logoImg from '../asset/logo.png';

export default function Footer() {
  return (
    <footer className="footer" id="footer">
      <div className="container">
        <div className="footer__grid">
          <div>
            <div className="footer__brand-name">
              <img src={logoImg} alt="MANAGE WORK" style={{ height: '80px', width: 'auto', objectFit: 'contain' }} />
            </div>
            <p className="footer__brand-desc">
              Kho sản phẩm số hàng đầu Việt Nam. Khóa học, template, ebook và hơn thế nữa – tải về tức thì sau khi thanh toán.
            </p>
          </div>

          <div>
            <div className="footer__col-title">Danh mục</div>
            <ul className="footer__links">
              {['Khóa học','Template','Ebook','Đồ họa','Biểu mẫu'].map((c) => (
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
            </ul>
          </div>

          <div>
            <div className="footer__col-title">Liên hệ</div>
            <ul className="footer__links">
              <li><a href="#">📧 admin@sanphamso.vn</a></li>
              <li><a href="#">💬 Zalo: 0909 xxx xxx</a></li>
              <li><a href="#">Facebook Page</a></li>
            </ul>
          </div>
        </div>

        <div className="footer__bottom">
          <span>© 2024 MANAGE WORK. Bảo lưu mọi quyền.</span>
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
