const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticate, requireAdmin } = require('../../middleware/authMiddleware');

router.post('/login', adminController.login);

router.get('/users', authenticate, requireAdmin, adminController.getAllAdmins);
router.post('/users', authenticate, requireAdmin, adminController.createAdmin);
router.put('/users/:username/password', authenticate, requireAdmin, adminController.updateAdminPassword);
router.delete('/users/:username', authenticate, requireAdmin, adminController.deleteAdmin);

module.exports = router;
