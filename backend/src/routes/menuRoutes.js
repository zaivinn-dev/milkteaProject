const express = require('express');
const router = express.Router();
const menuController = require('../controllers/menuController');
const { authenticate, requireAdmin, requireKitchenAccess } = require('../middleware/authMiddleware');

const requireAllAccess = (req, res, next) => {
  if (req.query.all === 'true') {
    return authenticate(req, res, () => {
      if (req.user?.role === 'admin' || req.user?.role === 'staff') {
        return next();
      }
      return requireAdmin(req, res, next);
    });
  }
  next();
};

const canUpdateMenuItem = (req, res, next) => {
  const keys = Object.keys(req.body || {});
  const availabilityOnly = keys.length === 1 && typeof req.body.available === 'boolean';
  if (availabilityOnly) {
    return requireKitchenAccess(req, res, next);
  }
  return requireAdmin(req, res, next);
};

router.get('/', requireAllAccess, menuController.getAllMenuItems);
router.get('/category/:category', menuController.getMenuByCategory);
router.get('/:id', menuController.getMenuById);
router.post('/', authenticate, requireAdmin, menuController.createMenuItem);
router.put('/:id', authenticate, canUpdateMenuItem, menuController.updateMenuItem);
router.patch('/:id/availability', authenticate, requireKitchenAccess, menuController.setAvailability);
router.delete('/:id', authenticate, requireAdmin, menuController.deleteMenuItem);

module.exports = router;
