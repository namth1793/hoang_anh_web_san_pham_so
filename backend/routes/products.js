const router = require('express').Router();
const auth = require('../middleware/authMiddleware');
const { getDB } = require('../db/database');

const FIELDS = 'name, description, image_url, price, original_price, category, file_type, download_url, is_featured';

// GET /api/products  (public – ho tro ?search=keyword&category=xxx&featured=1)
router.get('/', (req, res) => {
  const { search, category, featured } = req.query;
  const db = getDB();
  let query = 'SELECT * FROM products WHERE 1=1';
  const params = [];

  if (search) {
    query += ' AND (name LIKE ? OR description LIKE ?)';
    params.push(`%${search}%`, `%${search}%`);
  }
  if (category) {
    query += ' AND category = ?';
    params.push(category);
  }
  if (featured === '1') {
    query += ' AND is_featured = 1';
  }
  query += ' ORDER BY created_at DESC';

  res.json(db.prepare(query).all(...params));
});

// GET /api/products/:id  (public)
router.get('/:id', (req, res) => {
  const product = getDB().prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
  if (!product) return res.status(404).json({ message: 'Khong tim thay san pham.' });
  res.json(product);
});

// POST /api/products  (admin only)
router.post('/', auth, (req, res) => {
  const { name, description, image_url, price, original_price, category, file_type, download_url, is_featured } = req.body;
  if (!name || price === undefined || price === '') {
    return res.status(400).json({ message: 'Ten va gia san pham la bat buoc.' });
  }
  const db = getDB();
  const result = db.prepare(
    `INSERT INTO products (${FIELDS}) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    name.trim(), description || '', image_url || '',
    parseFloat(price), parseFloat(original_price) || 0,
    category || '', file_type || '', download_url || '',
    is_featured ? 1 : 0
  );
  res.status(201).json(db.prepare('SELECT * FROM products WHERE id = ?').get(result.lastInsertRowid));
});

// PUT /api/products/:id  (admin only)
router.put('/:id', auth, (req, res) => {
  const db = getDB();
  const ex = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
  if (!ex) return res.status(404).json({ message: 'Khong tim thay san pham.' });

  const { name, description, image_url, price, original_price, category, file_type, download_url, is_featured } = req.body;
  db.prepare(
    `UPDATE products SET
       name=?, description=?, image_url=?, price=?, original_price=?,
       category=?, file_type=?, download_url=?, is_featured=?,
       updated_at=datetime('now')
     WHERE id=?`
  ).run(
    name ?? ex.name,
    description ?? ex.description,
    image_url ?? ex.image_url,
    price !== undefined && price !== '' ? parseFloat(price) : ex.price,
    original_price !== undefined && original_price !== '' ? parseFloat(original_price) : ex.original_price,
    category ?? ex.category,
    file_type ?? ex.file_type,
    download_url ?? ex.download_url,
    is_featured !== undefined ? (is_featured ? 1 : 0) : ex.is_featured,
    req.params.id
  );

  res.json(db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id));
});

// DELETE /api/products/:id  (admin only)
router.delete('/:id', auth, (req, res) => {
  const db = getDB();
  if (!db.prepare('SELECT id FROM products WHERE id = ?').get(req.params.id))
    return res.status(404).json({ message: 'Khong tim thay san pham.' });
  db.prepare('DELETE FROM products WHERE id = ?').run(req.params.id);
  res.json({ message: 'Da xoa san pham thanh cong.' });
});

module.exports = router;
