const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { testConnection } = require('./src/db/pool');
const { initSchema } = require('./src/db/initSchema');
const { ensureDefaultAdmin } = require('./src/admin/controllers/adminController');
const { ensureDefaultStaff } = require('./src/controllers/staffController');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Debug middleware - log all requests
app.use((req, res, next) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api/admin', require('./src/admin/routes/adminRoutes'));
app.use('/api/menu', require('./src/routes/menuRoutes'));
app.use('/api/orders', require('./src/routes/orderRoutes'));
app.use('/api/categories', require('./src/routes/categoryRoutes'));
app.use('/api/staff', require('./src/routes/staffRoutes'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK',
    message: 'Backend is running',
    timestamp: new Date()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('═══════════════════════════════════[ERROR]═══════════════════════════════════');
  console.error(`Time: ${new Date().toLocaleTimeString()}`);
  console.error(`Route: ${req.method} ${req.path}`);
  console.error(`Error Name: ${err.name}`);
  console.error(`Error Message: ${err.message}`);
  console.error(`Stack:`, err.stack);
  console.error('═══════════════════════════════════════════════════════════════════════════════\n');
  
  res.status(err.status || 500).json({ 
    success: false,
    message: 'Server error', 
    error: err.message,
    route: req.path
  });
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('═══════════════════════════════════[UNHANDLED REJECTION]═══════════════════════════════════');
  console.error('Promise:', promise);
  console.error('Reason:', reason);
  console.error('═══════════════════════════════════════════════════════════════════════════════\n');
});

async function start() {
  try {
    await testConnection();
    await initSchema();
    await ensureDefaultAdmin();
    await ensureDefaultStaff();
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT} (Supabase PostgreSQL)`);
    });
  } catch (err) {
    console.error('Failed to start server:', err.message);
    process.exit(1);
  }
}

start();
