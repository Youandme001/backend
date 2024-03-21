const express = require("express");
const router = express.Router();
const UserController = require('../controllers/user.controller');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const auth = require('../middlewares/auth');
  
router.post("/login",UserController.loginUser);
router.get("/", UserController.getAllUsers);
router.get("/:id", UserController.getUserById);
router.post('/create', UserController.createUser);
router.put("/update/:id",auth.authenticateUser,UserController.updateUser);
router.put("/updatePasssword/:id",auth.authenticateUser,UserController.updatePassword);
router.delete("/delete/:id", UserController.deleteUser);

module.exports = router;
