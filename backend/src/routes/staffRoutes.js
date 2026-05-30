const express = require('express');
const router = express.Router();
const staffController = require('../controllers/staffController');
const { authenticate, requireAdmin } = require('../middleware/authMiddleware');

router.post('/login', staffController.login);

router.get('/users', authenticate, requireAdmin, staffController.getAllStaff);
router.post('/users', authenticate, requireAdmin, staffController.createStaff);
router.delete('/users/:username', authenticate, requireAdmin, staffController.deleteStaff);

module.exports = router;
