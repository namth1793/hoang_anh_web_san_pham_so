const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes    = require('./routes/auth');
const productRoutes = require('./routes/products');
const contactRoutes = require('./routes/contact');
const { initDB } = require('./db/database');

const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(',').map(s => s.trim())
  : ['http://localhost:3000', 'http://127.0.0.1:3000'];
app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Khởi tạo database
initDB();

// Routes
app.use('/api/auth',    authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/contact',  contactRoutes);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'OK', service: 'Sản phẩm số API', version: '1.0.0' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server đang chạy tại http://localhost:${PORT}`);
});
