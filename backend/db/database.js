const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'sanphamso.db');
let db;

function getDB() {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
  }
  return db;
}

function initDB() {
  const database = getDB();

  database.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'admin',
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT DEFAULT '',
      image_url TEXT DEFAULT '',
      price REAL NOT NULL DEFAULT 0,
      original_price REAL DEFAULT 0,
      category TEXT DEFAULT '',
      file_type TEXT DEFAULT '',
      download_url TEXT DEFAULT '',
      is_featured INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_ref TEXT UNIQUE NOT NULL,
      customer_name TEXT NOT NULL,
      customer_email TEXT NOT NULL,
      customer_phone TEXT DEFAULT '',
      note TEXT DEFAULT '',
      items TEXT DEFAULT '[]',
      amount REAL NOT NULL,
      payment_method TEXT DEFAULT 'vnpay_qr',
      payment_status TEXT DEFAULT 'pending',
      vnp_transaction_no TEXT DEFAULT '',
      paid_at TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );
  `);

  /* Migration: them cot moi neu DB cu chua co */
  const cols = database.prepare('PRAGMA table_info(products)').all().map((c) => c.name);
  if (!cols.includes('original_price'))
    database.exec('ALTER TABLE products ADD COLUMN original_price REAL DEFAULT 0');
  if (!cols.includes('file_type'))
    database.exec("ALTER TABLE products ADD COLUMN file_type TEXT DEFAULT ''");
  if (!cols.includes('download_url'))
    database.exec("ALTER TABLE products ADD COLUMN download_url TEXT DEFAULT ''");
  if (!cols.includes('is_featured'))
    database.exec('ALTER TABLE products ADD COLUMN is_featured INTEGER DEFAULT 0');

  const adminExists = database.prepare('SELECT id FROM users WHERE username = ?').get('admin');
  if (!adminExists) {
    const hash = bcrypt.hashSync('admin123', 10);
    database.prepare(
      'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)'
    ).run('admin', 'admin@sanphamso.vn', hash, 'admin');
    console.log('Admin mac dinh da duoc tao (username: admin | password: admin123)');
  }

  const count = database.prepare('SELECT COUNT(*) as c FROM products').get();
  if (count.c === 0) {
    const samples = [
      { name: 'Khoa hoc Canva tu A-Z 2024', description: 'Tron bo 60 video bai giang tu co ban den nang cao. Thiet ke poster, banner, thumbnail chuyen nghiep chi voi Canva mien phi.', image_url: 'https://placehold.co/400x300/FF6B6B/FFFFFF?text=Canva+Course', price: 199000, original_price: 399000, category: 'Khoa hoc', file_type: 'Video MP4', download_url: '', is_featured: 1 },
      { name: '100 Template PowerPoint Premium', description: 'Bo 100 slide PowerPoint dep cho bao cao doanh nghiep, pitch deck, thuyet trinh. De chinh sua, tuong thich Office 2016+.', image_url: 'https://placehold.co/400x300/4F46E5/FFFFFF?text=PPT+Templates', price: 149000, original_price: 299000, category: 'Template', file_type: 'PPTX', download_url: '', is_featured: 1 },
      { name: 'Ebook Kinh doanh Online Tu A-Z', description: '200 trang huong dan xay dung kinh doanh online tu con so 0: chon san pham, tim nguon hang, ban tren mang xa hoi.', image_url: 'https://placehold.co/400x300/059669/FFFFFF?text=Ebook+KD', price: 99000, original_price: 199000, category: 'Ebook', file_type: 'PDF', download_url: '', is_featured: 1 },
      { name: 'Bo 500 Preset Lightroom Phong canh Viet Nam', description: '500 preset mau tinh chinh cho phong canh & chan dung Viet Nam. Ap dung 1 click, ho tro Lightroom Mobile & Desktop.', image_url: 'https://placehold.co/400x300/7C3AED/FFFFFF?text=Lightroom+Preset', price: 79000, original_price: 150000, category: 'Do hoa', file_type: 'DNG / XMP', download_url: '', is_featured: 0 },
      { name: 'Excel Quan ly Kho hang Pro', description: 'File Excel quan ly nhap-xuat kho, ton kho, canh bao het hang, bao cao thang tu dong. Dung ngay khong can cai phan mem.', image_url: 'https://placehold.co/400x300/0891B2/FFFFFF?text=Excel+Kho', price: 129000, original_price: 249000, category: 'Bieu mau', file_type: 'XLSX', download_url: '', is_featured: 1 },
      { name: 'Bo Template Hop dong Doanh nghiep', description: '30 mau hop dong kinh te pho bien: dich vu, mua ban, cong tac, thue muon. Soan boi luat su, dinh dang Word de chinh sua.', image_url: 'https://placehold.co/400x300/DC2626/FFFFFF?text=Template+HD', price: 159000, original_price: 0, category: 'Template', file_type: 'DOCX', download_url: '', is_featured: 0 },
      { name: 'Khoa hoc Facebook Ads 2024', description: 'He thong quang cao Facebook tu A-Z: thiet lap chien dich, toi uu ngan sach, remarketing. Cap nhat thuat toan moi nhat.', image_url: 'https://placehold.co/400x300/1877F2/FFFFFF?text=FB+Ads', price: 299000, original_price: 599000, category: 'Khoa hoc', file_type: 'Video MP4', download_url: '', is_featured: 1 },
      { name: '1000+ Vector Icon Viet Nam', description: 'Bo icon vector chu de Viet Nam, am thuc, phong tuc, dia danh. File AI, EPS, PNG day du. Bao gom giay phep thuong mai.', image_url: 'https://placehold.co/400x300/F59E0B/FFFFFF?text=Vector+Icons', price: 89000, original_price: 180000, category: 'Do hoa', file_type: 'AI / EPS / PNG', download_url: '', is_featured: 0 },
    ];

    const insert = database.prepare(
      'INSERT INTO products (name, description, image_url, price, original_price, category, file_type, download_url, is_featured) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
    );
    for (const s of samples) {
      insert.run(s.name, s.description, s.image_url, s.price, s.original_price, s.category, s.file_type, s.download_url, s.is_featured);
    }
    console.log('Du lieu san pham so mau da duoc tao');
  }

  console.log('Database san sang');
}

module.exports = { getDB, initDB };
