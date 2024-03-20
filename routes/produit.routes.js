const express = require("express");
const router = express.Router();
const ProduitController = require("../controllers/produit.controller.js");
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs'); 
router.use(cors());
const jwt = require('jsonwebtoken');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads/produit')); 
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname); 
  }
});

const upload = multer({ storage });
const authenticateUser = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized: Access token is required' });
  }
  const accessToken = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(accessToken, process.env.JWT_SECRET);
    if (!decoded.admin) {
      return res.status(200).json({ message: 'Unauthorized: Access token is required' });
    }
    req.isAdmin = true;
    next();
  } catch (error) {
    console.error('Error authenticating user:', error);
    if (error.name === 'TokenExpiredError') {
      return res.status(200).json({ message: 'Unauthorized: Access token is required' });
    }
    return res.status(403).json({ message: 'Forbidden: Invalid token' });
  }
};

// Authentication middleware function
// const authenticateUser = (req, res, next) => {

//   const accessToken = req.headers.authorization;

//   if (!accessToken) {
//     return res.status(401).json({ message: 'Unauthorized: Access token is required' });
//   }
//   next();
// };
// Apply authentication middleware to protected routes
router.get("/", ProduitController.getAllProduits);
router.get("/:id", ProduitController.getProduitById);
router.post('/create',authenticateUser, upload.array('images'), ProduitController.createProduit);
router.put("/update",authenticateUser,upload.array('images'), ProduitController.updateProduit);
router.delete("/delete/:id",authenticateUser, ProduitController.deleteProduit);

module.exports = router;
