const express = require("express");
const router = express.Router();
const UserController = require('../controllers/user.controller');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const authenticateUser = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Unauthorized: Access token is required' });
    }
    const accessToken = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(accessToken, process.env.JWT_SECRET);
      if (!decoded.user) {
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
  
router.post("/login",UserController.loginUser);
router.get("/", UserController.getAllUsers);
router.get("/:id", UserController.getUserById);
router.post('/create', UserController.createUser);
router.put("/update/:id",authenticateUser,UserController.updateUser);
router.delete("/delete/:id", UserController.deleteUser);

module.exports = router;
