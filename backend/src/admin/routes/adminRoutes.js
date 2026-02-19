const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

// Authentication
router.post('/login', adminController.login);

// Admin management (for admin to manage other admins)
router.get('/users', adminController.getAllAdmins);
router.post('/users', adminController.createAdmin);
router.put('/users/:username/password', adminController.updateAdminPassword);
router.delete('/users/:username', adminController.deleteAdmin);

module.exports = router;
