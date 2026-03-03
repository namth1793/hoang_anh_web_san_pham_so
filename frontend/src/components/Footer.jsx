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
              {['Quản lý bán hàng','Quản lý dự án','Khởi nghiệp tinh gọn','Quản lý tài chính'].map((c) => (
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
              <li><a href="tel:0878877798">📞 0878.877.798</a></li>
              <li><a href="mailto:Smanagework@gmail.com">📧 Smanagework@gmail.com</a></li>
              <li><a href="#">📍 Đường Quang Trung, Quận Gò Vấp, TP Hồ Chí Minh</a></li>
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
