const { sendToPrinter } = require('../utils/printerService');
const fs = require('fs');
const path = require('path');

// File path for persisting orders
const orderFile = path.join(__dirname, '../../data/orders.json');

// Ensure data directory exists
const ensureDataDir = () => {
  const dataDir = path.join(__dirname, '../../data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
};

// Load orders from file
const loadOrders = () => {
  ensureDataDir();
  if (fs.existsSync(orderFile)) {
    const data = fs.readFileSync(orderFile, 'utf8');
    return JSON.parse(data);
  }
  return [];
};

// Save orders to file
const saveOrders = (ordersData) => {
  ensureDataDir();
  fs.writeFileSync(orderFile, JSON.stringify(ordersData, null, 2), 'utf8');
};

// In-memory order storage - load from file on startup
let orders = loadOrders();

// Generate order number
const generateOrderNumber = () => {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `ORD-${timestamp}${random}`;
};

// Create new order
exports.createOrder = async (req, res) => {
  try {
    const { items, customerName, customerPhone, notes } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'Items are required' });
    }

    // Calculate total amount
    const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    const order = {
      _id: Date.now().toString(),
      orderNumber: generateOrderNumber(),
      items,
      totalAmount,
      customerName: customerName || 'Walk-in Customer',
      customerPhone: customerPhone || '',
      notes: notes || '',
      status: 'pending',
      printedToPrinter: false,
      createdAt: new Date(),
      completedAt: null
    };

    orders.push(order);
    saveOrders(orders); // Save to file
    res.status(201).json(order);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get all orders
exports.getAllOrders = async (req, res) => {
  try {
    const sortedOrders = [...orders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json(sortedOrders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get order by ID
exports.getOrderById = async (req, res) => {
  try {
    const order = orders.find(o => o._id === req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get orders by status
exports.getOrdersByStatus = async (req, res) => {
  try {
    const { status } = req.params;
    const filteredOrders = orders.filter(o => o.status === status);
    const sortedOrders = filteredOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json(sortedOrders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update order status
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = orders.find(o => o._id === req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    
    order.status = status;
    if (status === 'completed') {
      order.completedAt = new Date();
    }
    
    saveOrders(orders); // Save to file
    res.json(order);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Send order to thermal printer
exports.sendOrderToPrinter = async (req, res) => {
  try {
    const order = orders.find(o => o._id === req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    const printerResult = await sendToPrinter(order);
    
    if (printerResult.success) {
      order.printedToPrinter = true;
      saveOrders(orders); // Save to file
      res.json({ message: 'Order sent to printer', order });
    } else {
      res.status(500).json({ message: 'Failed to send to printer', error: printerResult.error });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete order
exports.deleteOrder = async (req, res) => {
  try {
    const index = orders.findIndex(o => o._id === req.params.id);
    if (index === -1) return res.status(404).json({ message: 'Order not found' });
    
    const deleted = orders.splice(index, 1);
    saveOrders(orders); // Save to file
    res.json({ message: 'Order deleted', order: deleted[0] });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
