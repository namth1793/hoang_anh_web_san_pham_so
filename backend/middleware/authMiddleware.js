const jwt = require('jsonwebtoken');

module.exports = function authMiddleware(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Không có token. Vui lòng đăng nhập.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'SanPhamSo_JWT_SuperSecret_2024_XyZ_!@#');
    req.user = decoded;
    next();
  } catch {
    res.status(403).json({ message: 'Token không hợp lệ hoặc đã hết hạn.' });
  }
};
