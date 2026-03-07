const router    = require('express').Router();
const multer    = require('multer');
const { Readable } = require('stream');
const cloudinary = require('cloudinary').v2;
const auth      = require('../middleware/authMiddleware');

// Cấu hình Cloudinary từ .env
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Lưu file vào RAM (buffer), không ghi ra đĩa
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB / file
  fileFilter: (_req, file, cb) => {
    if (/^image\/(jpeg|png|webp|gif)$/.test(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Chỉ chấp nhận file ảnh (jpg, png, webp, gif)'));
    }
  },
});

// Upload 1 file buffer lên Cloudinary, trả về URL
function uploadToCloudinary(buffer) {
  return new Promise((resolve, reject) => {
    const folder = process.env.CLOUDINARY_FOLDER || 'san-pham-so';
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'image' },
      (err, result) => (err ? reject(err) : resolve(result.secure_url))
    );
    Readable.from(buffer).pipe(stream);
  });
}

// POST /api/upload/images  (admin only) — tối đa 20 file
router.post('/images', auth, upload.array('images', 20), async (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ message: 'Không có file nào được tải lên.' });
  }

  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    return res.status(500).json({ message: 'Server chưa cấu hình Cloudinary. Thêm CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET vào .env' });
  }

  try {
    const urls = await Promise.all(
      req.files.map((f) => uploadToCloudinary(f.buffer))
    );
    res.json({ urls });
  } catch (err) {
    console.error('[Cloudinary] Upload lỗi:', err.message);
    res.status(500).json({ message: 'Upload ảnh thất bại: ' + err.message });
  }
});

module.exports = router;
