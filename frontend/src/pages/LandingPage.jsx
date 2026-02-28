import { Link } from 'react-router-dom';

/* ── Hero ─────────────────────────────────────────────────────── */
function HeroSection() {
  return (
    <section className="hero">
      <div className="hero__bg-orb hero__bg-orb--1"/>
      <div className="hero__bg-orb hero__bg-orb--2"/>
      <div className="hero__bg-orb hero__bg-orb--3"/>
      <div className="container">
        <div className="hero__grid">
          <div className="hero__text">
            <div className="hero__badge">
              <span className="hero__badge-dot"/>
              Kho sản phẩm số hàng đầu Việt Nam
            </div>
            <h1 className="hero__heading">
              Tải ngay <span className="gradient-text">sản phẩm số</span> chất lượng cao – giao hàng tức thì
            </h1>
            <p className="hero__desc">
              Khóa học, template, ebook, phần mềm, đồ họa và hàng trăm sản phẩm số khác.
              Mua một lần – dùng mãi mãi. Tải về ngay sau khi thanh toán.
            </p>
            <div className="hero__actions">
              <Link to="/lien-he"    className="btn btn--primary btn--lg">
                💬 Liên hệ tư vấn ngay
              </Link>
              <Link to="/gioi-thieu" className="btn btn--outline-white btn--lg">Tìm hiểu thêm</Link>
            </div>
            <div className="hero__stats">
              {[
                { num:'500+',    label:'Sản phẩm số' },
                { num:'10.000+', label:'Khách hàng' },
                { num:'100%',    label:'Tải ngay lập tức' },
              ].map(s => (
                <div key={s.label} className="hero__stat">
                  <div className="hero__stat-num">{s.num}</div>
                  <div className="hero__stat-label">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="hero__mockup">
            <div className="hero__float-card hero__float-card--1">
              <div className="float-icon float-icon--green">⚡</div>
              <div>
                <div style={{fontWeight:700,fontSize:'0.8rem'}}>Giao hàng tức thì</div>
                <div style={{fontSize:'0.7rem',color:'rgba(255,255,255,0.5)'}}>Tải về ngay sau thanh toán</div>
              </div>
            </div>
            <div className="mockup-window">
              <div className="mockup-titlebar">
                <span className="mockup-dot mockup-dot--red"/>
                <span className="mockup-dot mockup-dot--yellow"/>
                <span className="mockup-dot mockup-dot--green"/>
                <span className="mockup-url">sanphamso.vn/store</span>
              </div>
              <div className="mockup-body">
                <div className="mockup-app-header">
                  <span className="mockup-app-title">🛒 Sản phẩm số Store</span>
                  <span style={{fontSize:'0.7rem',color:'#6ee7b7',background:'rgba(16,185,129,0.12)',padding:'3px 8px',borderRadius:'20px'}}>500+ SP</span>
                </div>
                <div className="mockup-stats-row">
                  <div className="mockup-stat-card"><div className="mockup-stat-num">🎓</div><div className="mockup-stat-lbl">Khóa học</div></div>
                  <div className="mockup-stat-card mockup-stat-card--cyan"><div className="mockup-stat-num">🎨</div><div className="mockup-stat-lbl">Template</div></div>
                  <div className="mockup-stat-card mockup-stat-card--purple"><div className="mockup-stat-num">📚</div><div className="mockup-stat-lbl">Ebook</div></div>
                </div>
                <div className="mockup-table-header"><span>Sản phẩm</span><span>Giá</span><span>Loại</span></div>
                {[
                  { n:'Khóa học Canva A-Z', p:'199K', t:'Video' },
                  { n:'100 Template PPT',   p:'149K', t:'PPTX'  },
                  { n:'Ebook KD Online',    p:'99K',  t:'PDF'   },
                  { n:'Excel Kho hàng',     p:'129K', t:'XLSX'  },
                ].map(r => (
                  <div key={r.n} className="mockup-row">
                    <span>{r.n}</span>
                    <span style={{color:'#a5b4fc',fontWeight:600}}>{r.p}</span>
                    <span><span className="mockup-badge">{r.t}</span></span>
                  </div>
                ))}
              </div>
            </div>
            <div className="hero__float-card hero__float-card--2">
              <div className="float-icon float-icon--yellow">✅</div>
              <div>
                <div style={{fontWeight:700,fontSize:'0.8rem'}}>Vừa mua thành công</div>
                <div style={{fontSize:'0.7rem',color:'rgba(255,255,255,0.5)'}}>Khóa học Canva – 2 phút trước</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── Why Us ───────────────────────────────────────────────────── */
function WhyUsSection() {
  const items = [
    { icon:'⚡', color:'indigo', title:'Nhận hàng tức thì',       desc:'Ngay sau khi thanh toán thành công, link tải xuất hiện. Không cần chờ ship, không cần liên hệ người bán.' },
    { icon:'🔒', color:'purple', title:'Thanh toán an toàn',       desc:'Hỗ trợ MoMo, VNPay, chuyển khoản ngân hàng. Mã hóa SSL 256-bit bảo vệ mọi giao dịch của bạn.' },
    { icon:'♾️', color:'cyan',   title:'Dùng mãi mãi',             desc:'Mua một lần, tải về không giới hạn. Cập nhật phiên bản mới miễn phí cho sản phẩm được bảo hành.' },
    { icon:'🛡️', color:'green',  title:'Hoàn tiền 7 ngày',         desc:'Không hài lòng? Liên hệ trong vòng 7 ngày để được hoàn tiền 100%, không hỏi lý do.' },
    { icon:'💬', color:'orange', title:'Hỗ trợ tiếng Việt',        desc:'Đội ngũ hỗ trợ nhiệt tình, phản hồi trong 24 giờ qua Zalo, Facebook và email.' },
    { icon:'⭐', color:'rose',   title:'Chất lượng kiểm duyệt',    desc:'Mọi sản phẩm được đội ngũ kiểm duyệt kỹ trước khi đăng bán. Cam kết đúng mô tả 100%.' },
  ];
  return (
    <section className="section section--light" id="tai-sao">
      <div className="container">
        <div className="section__header">
          <span className="section__label">Tại sao chọn chúng tôi</span>
          <h2 className="section__title">Mua sắm sản phẩm số chưa bao giờ dễ thế</h2>
          <p className="section__subtitle">Chúng tôi cam kết mang lại trải nghiệm mua sắm tốt nhất cho khách hàng Việt Nam.</p>
        </div>
        <div className="features-grid">
          {items.map((i) => (
            <div key={i.title} className="feature-card">
              <div className={`feature-icon feature-icon--${i.color}`} style={{ fontSize:'1.5rem' }}>{i.icon}</div>
              <h3 className="feature-title">{i.title}</h3>
              <p className="feature-desc">{i.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── How To Buy ───────────────────────────────────────────────── */
function HowToBuySection() {
  return (
    <section className="section">
      <div className="container">
        <div className="section__header">
          <span className="section__label">Hướng dẫn mua hàng</span>
          <h2 className="section__title">Chỉ 3 bước để sở hữu sản phẩm số</h2>
        </div>
        <div className="steps">
          {[
            { num:'1', title:'Liên hệ tư vấn',  desc:'Liên hệ với chúng tôi qua form tư vấn, chúng tôi sẽ giới thiệu sản phẩm phù hợp với nhu cầu của bạn.' },
            { num:'2', title:'Thanh toán QR',    desc:'Quét mã QR để chuyển khoản ngân hàng. Bảo mật 100%, xác nhận tức thì.' },
            { num:'3', title:'Nhận hàng ngay',   desc:'Nhận link tải xuống tức thì qua email sau khi thanh toán được xác nhận.' },
          ].map((s) => (
            <div key={s.num} className="step">
              <div className="step__num">{s.num}</div>
              <h3 className="step__title">{s.title}</h3>
              <p className="step__desc">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Stats ────────────────────────────────────────────────────── */
function StatsSection() {
  return (
    <section className="section section--dark">
      <div className="container">
        <div className="section__header">
          <span className="section__label" style={{ background:'rgba(79,70,229,0.3)', color:'#a5b4fc' }}>
            Con số thực tế
          </span>
          <h2 className="section__title">Hàng nghìn khách hàng tin tưởng mỗi ngày</h2>
        </div>
        <div className="stats-grid">
          {[
            { num:'500+',     label:'Sản phẩm số chất lượng' },
            { num:'10.000+',  label:'Khách hàng hài lòng' },
            { num:'50.000+',  label:'Lượt tải thành công' },
            { num:'4.9★',    label:'Điểm đánh giá trung bình' },
          ].map((s) => (
            <div key={s.label} className="stat-card">
              <div className="stat-num">{s.num}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Testimonials ─────────────────────────────────────────────── */
function TestimonialsSection() {
  const reviews = [
    { name:'Nguyễn Minh Tuấn',  role:'Freelance Designer',  content:'Mua bộ template PowerPoint rất xứng đáng. Chất lượng tốt, đúng mô tả, tải về tức thì. Sẽ còn quay lại mua nhiều hơn.' },
    { name:'Trần Thị Lan Anh',  role:'Chủ tiệm online',     content:'Khóa học Facebook Ads rất thực tế, áp dụng được ngay. Sau 1 tháng học, chi phí quảng cáo giảm 40% mà doanh thu vẫn tăng.' },
    { name:'Lê Hoàng Phúc',     role:'Sinh viên Kinh tế',   content:'File Excel quản lý kho hàng cực kỳ tiện. Mình dùng cho cửa hàng tạp hóa của gia đình, tiết kiệm rất nhiều thời gian.' },
  ];
  return (
    <section className="section section--light">
      <div className="container">
        <div className="section__header">
          <span className="section__label">Phản hồi khách hàng</span>
          <h2 className="section__title">Khách hàng nói gì về chúng tôi</h2>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:24 }}>
          {reviews.map((r) => (
            <div key={r.name} style={{ background:'white', border:'1px solid var(--border)', borderRadius:'var(--radius)', padding:'28px' }}>
              <div style={{ color:'#f59e0b', fontSize:'1.1rem', marginBottom:14 }}>★★★★★</div>
              <p style={{ color:'var(--text)', lineHeight:1.7, marginBottom:20, fontStyle:'italic' }}>
                "{r.content}"
              </p>
              <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                <div style={{ width:40, height:40, borderRadius:'50%', background:'linear-gradient(135deg,#4f46e5,#7c3aed)', display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontWeight:700, flexShrink:0 }}>
                  {r.name[0]}
                </div>
                <div>
                  <div style={{ fontWeight:700, color:'var(--dark-2)', fontSize:'0.9rem' }}>{r.name}</div>
                  <div style={{ fontSize:'0.78rem', color:'var(--text-muted)' }}>{r.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── CTA ──────────────────────────────────────────────────────── */
function CtaSection() {
  return (
    <section className="cta-section">
      <div className="container">
        <h2 className="cta-title">Bắt đầu sở hữu sản phẩm số ngay hôm nay</h2>
        <p className="cta-desc">
          Hơn 500 sản phẩm số chất lượng cao đang chờ bạn. Giao hàng tức thì, dùng mãi mãi.
        </p>
        <div className="cta-actions">
          <Link to="/lien-he"    className="btn btn--primary btn--lg">💬 Liên hệ tư vấn</Link>
          <Link to="/gioi-thieu" className="btn btn--outline-white btn--lg">Tìm hiểu thêm</Link>
        </div>
        <p className="cta-note">Hoàn tiền 100% trong 7 ngày · Hỗ trợ tiếng Việt · Thanh toán an toàn</p>
      </div>
    </section>
  );
}

/* ── Export ───────────────────────────────────────────────────── */
export default function LandingPage() {
  return (
    <div style={{ marginTop: '-76px' }}>
      <HeroSection/>
      <WhyUsSection/>
      <HowToBuySection/>
      <StatsSection/>
      <TestimonialsSection/>
      <CtaSection/>
    </div>
  );
}
