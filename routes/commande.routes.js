const express = require("express");
const router = express.Router();
const CommandeController = require('../controllers/commande.controller')
const cors = require('cors');


router.get("/", CommandeController.getAllCommande);
router.get("/:id", CommandeController.getCommandeById);
router.post('/create', CommandeController.createCommande);
router.put("/update",CommandeController.updateCommande);
router.delete("/delete/:id", CommandeController.deleteCommande);

module.exports = router;
