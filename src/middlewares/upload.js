const crypto = require('crypto');
const path = require('path');
const multer = require('multer');
const HttpError = require('../utils/httpError');

const UPLOAD_DIR = path.join(__dirname, '../../uploads/produit');

const storage = multer.diskStorage({
  destination: UPLOAD_DIR,
  // Random name: two uploads called "photo.jpg" no longer overwrite each other
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
    cb(null, `${Date.now()}-${crypto.randomBytes(6).toString('hex')}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024, files: 6 },
  fileFilter: (_req, file, cb) => {
    if (/^image\/(jpeg|png|webp|gif)$/.test(file.mimetype)) return cb(null, true);
    cb(new HttpError(400, 'Only JPEG, PNG, WEBP or GIF images are allowed'));
  },
});

module.exports = { upload, UPLOAD_DIR };
