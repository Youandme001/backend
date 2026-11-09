const express = require('express');
const { body } = require('express-validator');
const rateLimit = require('express-rate-limit');
const a = require('../middlewares/asyncHandler');
const validate = require('../middlewares/validate');
const { upload } = require('../middlewares/upload');
const { requireAdmin, requireUser, requireSelfOrAdmin } = require('../middlewares/auth');
const produit = require('../controllers/produit.controller');
const category = require('../controllers/category.controller');
const commande = require('../controllers/commande.controller');
const user = require('../controllers/user.controller');
const admin = require('../controllers/admin.controller');

const loginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 20, message: { message: 'Too many attempts, try again later' } });

const address = [
  body('firstName').trim().notEmpty().withMessage('First name is required'),
  body('lastName').trim().notEmpty().withMessage('Last name is required'),
  body('phone').trim().matches(/^[0-9+ ]{8,15}$/).withMessage('Phone number is invalid'),
  body('address').trim().notEmpty().withMessage('Address is required'),
  body('gouvernorat').trim().notEmpty().withMessage('Gouvernorat is required'),
  body('city').trim().notEmpty().withMessage('City is required'),
  body('postalCode').trim().matches(/^[0-9]{4}$/).withMessage('Postal code must have 4 digits'),
];
const credentials = [
  body('email').trim().isEmail().withMessage('Email is invalid'),
  body('password').isString().notEmpty().withMessage('Password is required'),
];
const newPassword = (field) => body(field).isLength({ min: 8 }).withMessage('Password must have at least 8 characters');
const produitFields = [
  body('name').optional().trim().notEmpty().withMessage('Name is required'),
  body('price').optional().isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('volume').optional().isInt({ min: 0 }).withMessage('Stock must be a positive integer'),
];

/* ---------- Produits ---------- */
const produits = express.Router();
produits.get('/', a(produit.getAll));
produits.get('/:id', a(produit.getById));
produits.post('/create', requireAdmin, upload.array('images', 6), body('name').trim().notEmpty().withMessage('Name is required'), body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'), validate, a(produit.create));
produits.put('/update', requireAdmin, upload.array('images', 6), produitFields, validate, a(produit.update));
produits.put('/update/:id', requireAdmin, upload.array('images', 6), produitFields, validate, a(produit.update));
produits.delete('/delete/:id', requireAdmin, a(produit.remove));

/* ---------- Catégories ---------- */
const categories = express.Router();
categories.get('/', a(category.getAll));
categories.get('/:id', a(category.getById));
categories.post('/create', requireAdmin, body('name').trim().notEmpty().withMessage('Name is required'), validate, a(category.create));
categories.put('/:id', requireAdmin, body('name').trim().notEmpty().withMessage('Name is required'), validate, a(category.update));
categories.delete('/:id', requireAdmin, a(category.remove));

/* ---------- Commandes ---------- */
const commandes = express.Router();
commandes.get('/', requireAdmin, a(commande.getAll));
commandes.get('/stats', requireAdmin, a(commande.getStats));
commandes.get('/userById/:id', requireSelfOrAdmin, a(commande.getForUser));
commandes.get('/:id', requireAdmin, a(commande.getById));
commandes.post('/create', requireUser({ allowGuest: true }), a(commande.create));
commandes.put('/update/:id', requireAdmin, a(commande.updateState));
commandes.delete('/delete/:id', requireAdmin, a(commande.remove));

/* ---------- Clients ---------- */
const users = express.Router();
users.post('/login', loginLimiter, credentials, validate, a(user.login));
users.post('/create', address, credentials, newPassword('password'), validate, a(user.register));
users.post('/create1', address, validate, a(user.createGuest));
users.get('/', requireAdmin, a(user.getAll));
users.get('/:id', requireSelfOrAdmin, a(user.getById));
users.put('/update/:id', requireSelfOrAdmin, a(user.update));
// "updatePasssword" (3 s) is the 2024 URL, kept for compatibility
users.put(['/updatePassword/:id', '/updatePasssword/:id'], requireSelfOrAdmin, newPassword('newPassword'), validate, a(user.updatePassword));
users.delete('/delete/:id', requireAdmin, a(user.remove));

/* ---------- Admin ---------- */
const admins = express.Router();
admins.post('/login', loginLimiter, credentials, validate, a(admin.login));
admins.get('/me', requireAdmin, a(admin.me));

const router = express.Router();
router.get('/health', (req, res) => res.json({ status: 'ok' }));
router.use('/produit', produits);
router.use('/categories', categories);
router.use('/commande', commandes);
router.use('/user', users);
router.use('/admin', admins);

module.exports = router;
