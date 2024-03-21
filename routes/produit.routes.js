const express = require("express");
const router = express.Router();
const ProduitController = require("../controllers/produit.controller.js");
const cors = require('cors');
router.use(cors());
const auth = require('../middlewares/auth');
const upload = require('../middlewares/upload');

router.get("/", ProduitController.getAllProduits);
router.get("/:id", ProduitController.getProduitById);
router.post('/create',auth.authenticateAdmin, upload.array('images'), ProduitController.createProduit);
router.put("/update",auth.authenticateAdmin,upload.array('images'), ProduitController.updateProduit);
router.delete("/delete/:id",auth.authenticateAdmin, ProduitController.deleteProduit);

module.exports = router;
