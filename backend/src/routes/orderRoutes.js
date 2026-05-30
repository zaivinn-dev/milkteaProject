const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { authenticate, requireAdmin, requireKitchenAccess } = require('../middleware/authMiddleware');

router.get('/', authenticate, requireKitchenAccess, orderController.getAllOrders);
router.get('/status/:status', authenticate, requireKitchenAccess, orderController.getOrdersByStatus);
router.get('/:id', authenticate, requireKitchenAccess, orderController.getOrderById);
router.post('/', orderController.createOrder);
router.put('/:id/status', authenticate, requireKitchenAccess, orderController.updateOrderStatus);
router.delete('/:id', authenticate, requireAdmin, orderController.deleteOrder);

module.exports = router;
