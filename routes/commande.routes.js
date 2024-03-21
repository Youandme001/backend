const express = require("express");
const router = express.Router();
const CommandeController = require('../controllers/commande.controller')
const cors = require('cors');
const jwt = require('jsonwebtoken');
const auth = require('../middlewares/auth');


router.get("/",auth.authenticateAdmin, CommandeController.getAllCommande);
router.get("/:id",auth.authenticateAdmin, CommandeController.getCommandeById);
router.get("/userById/:id",auth.authenticateUser, CommandeController.getAllCommandsForUser);
router.post('/create',auth.authenticateUser, CommandeController.createCommande);
router.put("/update/:id",auth.authenticateAdmin,CommandeController.updateCommande);
router.delete("/delete/:id",auth.authenticateAdmin, CommandeController.deleteCommande);

module.exports = router;
