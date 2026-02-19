const axios = require('axios');

const ESP32_IP = process.env.ESP32_IP || '192.168.1.100';
const ESP32_PORT = process.env.ESP32_PORT || 8080;

// Format order data for thermal printer
const formatOrderForPrinter = (order) => {
  const padding = (str, length) => {
    const spaces = Math.max(0, length - str.length);
    return str + ' '.repeat(spaces);
  };

  let receipt = '';
  receipt += '================================\n';
  receipt += '      MILK TEA ORDERING SYSTEM\n';
  receipt += '================================\n\n';
  
  receipt += `Order #: ${order.orderNumber}\n`;
  receipt += `Date: ${new Date(order.createdAt).toLocaleString()}\n`;
  
  if (order.customerName) {
    receipt += `Customer: ${order.customerName}\n`;
  }
  if (order.customerPhone) {
    receipt += `Phone: ${order.customerPhone}\n`;
  }
  
  receipt += '\n--------------------------------\n';
  receipt += 'ITEMS\n';
  receipt += '--------------------------------\n';
  
  order.items.forEach(item => {
    receipt += `${item.name}\n`;
    receipt += `  Size: ${item.size} | Sugar: ${item.sugarLevel} | Qty: ${item.quantity}\n`;
    if (item.addOns && item.addOns.length > 0) {
      receipt += `  Add-ons: ${item.addOns.join(', ')}\n`;
    }
    receipt += `  Price: ₱${(item.price * item.quantity).toFixed(2)}\n\n`;
  });
  
  receipt += '--------------------------------\n';
  receipt += `TOTAL: ₱${order.totalAmount.toFixed(2)}\n`;
  receipt += '--------------------------------\n\n';
  
  if (order.notes) {
    receipt += `Special Notes:\n${order.notes}\n\n`;
  }
  
  receipt += '================================\n';
  receipt += 'Thank you for your order!\n';
  receipt += '================================\n';
  
  return receipt;
};

// Send receipt to ESP32 thermal printer
const sendToPrinter = async (order) => {
  try {
    const receiptText = formatOrderForPrinter(order);
    
    const response = await axios.post(
      `http://${ESP32_IP}:${ESP32_PORT}/print`,
      { text: receiptText },
      { timeout: 5000 }
    );

    return { success: true, data: response.data };
  } catch (error) {
    console.error('Printer error:', error.message);
    return { 
      success: false, 
      error: error.message,
      details: 'Check if ESP32 is connected and running'
    };
  }
};

// Test printer connection
const testPrinterConnection = async () => {
  try {
    const response = await axios.get(
      `http://${ESP32_IP}:${ESP32_PORT}/status`,
      { timeout: 5000 }
    );
    return { connected: true, status: response.data };
  } catch (error) {
    return { 
      connected: false, 
      error: error.message 
    };
  }
};

module.exports = {
  sendToPrinter,
  testPrinterConnection,
  formatOrderForPrinter
};
