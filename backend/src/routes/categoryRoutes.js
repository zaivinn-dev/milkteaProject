const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');

// Get all categories
router.get('/', categoryController.getAllCategories);

// Update category (must be before the generic POST /)
router.post('/update', categoryController.updateCategory);

// Create new category
router.post('/', categoryController.createCategory);

// Delete category
router.delete('/:name', categoryController.deleteCategory);

module.exports = router;
