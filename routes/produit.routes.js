const express = require("express");
const router = express.Router();
const ProduitController = require("../controllers/produit.controller.js");
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs'); 
router.use(cors());

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads/produit')); 
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname); 
  }
});

const upload = multer({ storage });

// Authentication middleware function
const authenticateUser = (req, res, next) => {

  const accessToken = req.headers.authorization;

  if (!accessToken) {
    return res.status(401).json({ message: 'Unauthorized: Access token is required' });
  }
  next();
};
// Apply authentication middleware to protected routes
router.get("/", ProduitController.getAllProduits);
router.get("/:id", ProduitController.getProduitById);
router.post('/create',authenticateUser, upload.array('images'), ProduitController.createProduit);
router.put("/update",authenticateUser,upload.array('images'), ProduitController.updateProduit);
router.delete("/delete/:id",authenticateUser, ProduitController.deleteProduit);

module.exports = router;
