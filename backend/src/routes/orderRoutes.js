const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

router.get('/', orderController.getAllOrders);
router.get('/status/:status', orderController.getOrdersByStatus);
router.get('/:id', orderController.getOrderById);
router.post('/', orderController.createOrder);
router.put('/:id/status', orderController.updateOrderStatus);
router.post('/:id/print', orderController.sendOrderToPrinter);
router.delete('/:id', orderController.deleteOrder);

module.exports = router;
