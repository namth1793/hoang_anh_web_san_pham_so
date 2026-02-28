const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getDB } = require('../db/database');

// POST /api/auth/login
router.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Vui lòng nhập tên đăng nhập và mật khẩu.' });
  }

  const db = getDB();
  const user = db
    .prepare('SELECT * FROM users WHERE username = ? OR email = ?')
    .get(username.trim(), username.trim());

  if (!user) {
    return res.status(401).json({ message: 'Thông tin đăng nhập không chính xác.' });
  }

  if (user.role !== 'admin') {
    return res.status(403).json({ message: 'Bạn không có quyền truy cập admin.' });
  }

  const isValid = bcrypt.compareSync(password, user.password);
  if (!isValid) {
    return res.status(401).json({ message: 'Thông tin đăng nhập không chính xác.' });
  }

  const token = jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    process.env.JWT_SECRET || 'SanPhamSo_JWT_SuperSecret_2024_XyZ_!@#',
    { expiresIn: '8h' }
  );

  res.json({
    message: 'Đăng nhập thành công',
    token,
    user: { id: user.id, username: user.username, email: user.email, role: user.role },
  });
});

module.exports = router;
