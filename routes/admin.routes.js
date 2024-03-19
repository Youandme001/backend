// routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const adminController = require('../controllers/admin.controller');
const auth = require('../middlewares/auth');

// Register admin
router.post(
  '/register',
  [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password must be at least 6 characters long').isLength({ min: 6 }),
  ],
  adminController.register
);

// Login admin
router.post('/login', adminController.login);

// Protected route (example)
router.get('/protected', auth, (req, res) => {
  res.json({ message: 'You have access to this protected route' });
});

module.exports = router;
