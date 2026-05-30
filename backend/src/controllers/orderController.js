const menuRepository = require('../db/menuRepository');
const orderRepository = require('../db/orderRepository');
const { VALID_STATUSES, validateAndBuildOrderItems } = require('../utils/orderValidation');

const generateOrderNumber = () => {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `ORD-${timestamp}${random}`;
};

exports.createOrder = async (req, res) => {
  try {
    const { items, customerName, customerPhone, notes } = req.body;
    const menuItems = await menuRepository.findAll(true);
    const validatedItems = validateAndBuildOrderItems(items, menuItems);
    const totalAmount = validatedItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    const order = await orderRepository.create({
      _id: Date.now().toString(),
      orderNumber: generateOrderNumber(),
      items: validatedItems,
      totalAmount,
      customerName: customerName?.trim() || 'Walk-in Customer',
      customerPhone: customerPhone?.trim() || '',
      notes: notes?.trim() || '',
      status: 'pending',
      createdAt: new Date(),
      completedAt: null
    });

    res.status(201).json(order);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getAllOrders = async (req, res) => {
  try {
    const orders = await orderRepository.findAll();
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getOrderById = async (req, res) => {
  try {
    const order = await orderRepository.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getOrdersByStatus = async (req, res) => {
  try {
    const { status } = req.params;
    if (!VALID_STATUSES.includes(status)) {
      return res.status(400).json({ message: 'Invalid order status' });
    }
    const orders = await orderRepository.findByStatus(status);
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!VALID_STATUSES.includes(status)) {
      return res.status(400).json({
        message: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}`
      });
    }

    const order = await orderRepository.updateStatus(req.params.id, status);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    res.json(order);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteOrder = async (req, res) => {
  try {
    const deleted = await orderRepository.remove(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Order not found' });
    res.json({ message: 'Order deleted', order: deleted });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
