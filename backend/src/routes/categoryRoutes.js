const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { authenticate, requireAdmin } = require('../middleware/authMiddleware');

router.get('/', categoryController.getAllCategories);
router.post('/update', authenticate, requireAdmin, categoryController.updateCategory);
router.post('/', authenticate, requireAdmin, categoryController.createCategory);
router.delete('/:name', authenticate, requireAdmin, categoryController.deleteCategory);

module.exports = router;
