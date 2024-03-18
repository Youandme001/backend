const express = require("express");
const router = express.Router();
const UserController = require('../controllers/user.controller');
const cors = require('cors');

router.post("/login",UserController.loginUser);
router.get("/", UserController.getAllUsers);
router.get("/:id", UserController.getUserById);
router.post('/create', UserController.createUser);
router.put("/update/:id",UserController.updateUser);
router.delete("/delete/:id", UserController.deleteUser);

module.exports = router;
