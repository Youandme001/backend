const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/category.controller');
const auth = require('../middlewares/auth');

router.post('/create',auth.authenticateAdmin, categoryController.createCategory);
router.get('/', categoryController.getAllCategories);
router.get('/:id',auth.authenticateAdmin, categoryController.getCategoryById);
router.put('/:id',auth.authenticateAdmin, categoryController.updateCategory);
router.delete('/:id',auth.authenticateAdmin, categoryController.deleteCategory);

module.exports = router;
