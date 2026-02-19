const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    unique: true,
    required: true
  },
  items: [
    {
      menuId: mongoose.Schema.Types.ObjectId,
      name: String,
      quantity: Number,
      size: {
        type: String,
        enum: ['small', 'medium', 'large'],
        default: 'medium'
      },
      sugarLevel: {
        type: String,
        enum: ['0%', '25%', '50%', '75%', '100%'],
        default: '100%'
      },
      addOns: [String],
      price: Number
    }
  ],
  totalAmount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'preparing', 'ready', 'completed', 'cancelled'],
    default: 'pending'
  },
  customerName: {
    type: String,
    trim: true
  },
  customerPhone: {
    type: String,
    trim: true
  },
  notes: {
    type: String,
    trim: true
  },
  printedToPrinter: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  completedAt: {
    type: Date,
    default: null
  }
});

module.exports = mongoose.model('Order', orderSchema);
