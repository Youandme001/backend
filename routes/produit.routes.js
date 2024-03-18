const express = require("express");
const router = express.Router();
const ProduitController = require("../controllers/produit.controller.js");
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs'); // Import the 'fs' module for file system operations
router.use(cors());

// Function to ensure that the destination directory exists
// const createUploadsDirectory = () => {
//   const directory = path.join(__dirname, '../uploads/produit'); 
//   if (!fs.existsSync(directory)) {
//     fs.mkdirSync(directory, { recursive: true }); 
//   }
// };

// createUploadsDirectory(); 
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads/produit')); 
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname); 
  }
});

const upload = multer({ storage });

router.get("/", ProduitController.getAllProduits);
router.get("/:id", ProduitController.getProduitById);
router.post('/create', upload.array('images'), ProduitController.createProduit);
router.put("/update",upload.array('images'), ProduitController.updateProduit);
router.delete("/delete/:id", ProduitController.deleteProduit);

module.exports = router;
