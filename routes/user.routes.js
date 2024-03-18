const express = require("express");
const router = express.Router();
const UserController = require('../controllers/user.controller');
const cors = require('cors');


router.get("/", UserController.getAllUsers);
router.get("/:id", UserController.getUserById);
router.post('/create', UserController.createUser);
router.put("/update",UserController.updateUser);
router.delete("/delete/:id", UserController.deleteUser);

module.exports = router;
