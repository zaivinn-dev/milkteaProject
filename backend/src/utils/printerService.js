const axios = require('axios');

// Try to get ESP32 IP from environment, default to access point IP
const ESP32_IP = process.env.ESP32_IP || '192.168.4.1';
const ESP32_PORT = process.env.ESP32_PORT || 8080;

// Format order data for thermal printer
const formatOrderForPrinter = (order) => {
  // Return order object formatted for ESP32
  return {
    orderNumber: order.orderNumber,
    customerName: order.customerName || 'Walk-in',
    timestamp: new Date(order.createdAt).toLocaleTimeString(),
    items: order.items.map(item => ({
      name: item.name,
      quantity: item.quantity,
      size: item.size || 'Regular',
      sugar: item.sugarLevel || '100%',
      price: item.price || '0.00',
      addOns: item.addOns || []
    })),
    totalAmount: order.totalAmount.toFixed(2),
    status: 'PENDING'
  };
};

// Send receipt to ESP32 thermal printer
const sendToPrinter = async (order) => {
  try {
    const orderData = formatOrderForPrinter(order);
    
    console.log(`[PRINTER] Sending to ESP32 at http://${ESP32_IP}:${ESP32_PORT}/print-order`);
    console.log(`[PRINTER] Order: ${orderData.orderNumber}`);
    
    const response = await axios.post(
      `http://${ESP32_IP}:${ESP32_PORT}/print-order`,
      orderData,
      { timeout: 5000 }  // Reduced from 10000 to 5000 since ESP32 responds immediately
    );

    console.log('[PRINTER] Success:', response.data);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('[PRINTER] Error:', error.message);
    return { 
      success: false, 
      error: error.message,
      details: `Check if ESP32 is running at ${ESP32_IP}:${ESP32_PORT}`
    };
  }
};

// Test printer connection
const testPrinterConnection = async () => {
  try {
    console.log(`[PRINTER] Testing connection to http://${ESP32_IP}:${ESP32_PORT}/status`);
    const response = await axios.get(
      `http://${ESP32_IP}:${ESP32_PORT}/status`,
      { timeout: 5000 }
    );
    console.log('[PRINTER] Status check passed:', response.data);
    return { connected: true, status: response.data };
  } catch (error) {
    console.error('[PRINTER] Connection test failed:', error.message);
    return { 
      connected: false, 
      error: error.message,
      endpoint: `http://${ESP32_IP}:${ESP32_PORT}`
    };
  }
};

module.exports = {
  sendToPrinter,
  testPrinterConnection,
  formatOrderForPrinter
};
