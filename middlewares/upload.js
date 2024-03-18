// middleware.js
const multer = require('multer');
const path = require('path');
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname,'uploads/produit') )// Specify the destination directory for uploaded files
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname) // Use the original file name for storing
  }
})

const upload = multer({ storage });

module.exports = {
  upload
};