const express = require("express");
const router = express.Router();
const CommandeController = require('../controllers/commande.controller')
const cors = require('cors');
const authenticateUser = (req, res, next) => {

    const accessToken = req.headers.authorization;
  
    if (!accessToken) {
      return res.status(401).json({ message: 'Unauthorized: Access token is required' });
    }
    next();
  };
  // Apply authentication middleware to protected routes

router.get("/",authenticateUser, CommandeController.getAllCommande);
router.get("/:id",authenticateUser, CommandeController.getCommandeById);
router.post('/create',authenticateUser, CommandeController.createCommande);
router.put("/update/:id",authenticateUser,CommandeController.updateCommande);
router.delete("/delete/:id",authenticateUser, CommandeController.deleteCommande);

module.exports = router;
