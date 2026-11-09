const multer = require('multer');

// eslint-disable-next-line no-unused-vars
module.exports = (err, req, res, next) => {
  if (err.status) return res.status(err.status).json({ message: err.message });
  if (err instanceof multer.MulterError) return res.status(400).json({ message: err.message });
  if (err.name === 'SequelizeUniqueConstraintError') {
    return res.status(409).json({ message: 'This value already exists' });
  }
  if (err.name === 'SequelizeValidationError') {
    return res.status(400).json({ message: err.errors.map((e) => e.message).join(', ') });
  }
  console.error(err);
  res.status(500).json({ message: 'Internal server error' });
};
