# Milk Tea Ordering System

A complete web-based ordering system for milk tea shops with order management and thermal printer integration for ESP32.

## Project Structure

### Backend (Node.js + Express)
```
backend/
├── server.js              # Main server entry point
├── package.json          # Dependencies
├── .env.example          # Environment variables template
├── src/
│   ├── controllers/      # Business logic
│   │   ├── menuController.js
│   │   └── orderController.js
│   ├── models/           # Database schemas
│   │   ├── Menu.js
│   │   └── Order.js
│   ├── routes/           # API endpoints
│   │   ├── menuRoutes.js
│   │   ├── orderRoutes.js
│   │   └── printerRoutes.js
│   └── utils/
│       └── printerService.js   # ESP32 thermal printer integration
```

### Frontend (React + Tailwind CSS)
```
frontend/
├── package.json           # Dependencies
├── webpack.config.js      # Webpack configuration
├── tailwind.config.js     # Tailwind CSS configuration
├── postcss.config.js      # PostCSS configuration
├── public/
│   └── index.html        # HTML entry point
└── src/
    ├── index.js          # React entry point
    ├── App.js            # Main app component
    ├── index.css         # Global styles
    ├── components/       # Reusable components
    │   ├── Navbar.js
    │   ├── MenuItem.js
    │   ├── OrderCustomizer.js
    │   └── OrderCart.js
    └── pages/            # Page components
        ├── OrderMenu.js         # Customer ordering page
        └── OrderPreparation.js  # Staff order management
```

## Features

### Customer Features (OrderMenu)
- 🛍️ Browse milk tea menu by category
- 🎨 Customize drinks (size, sugar level, ice level, add-ons)
- 📦 Add to cart and manage orders
- 💳 Checkout with customer information
- ✅ Order confirmation with order number

### Staff Features (OrderPreparation)
- 📊 Dashboard showing all orders
- 🔄 Filter by order status (pending, preparing, ready, completed)
- 🖶 Print receipts to thermal printer
- ⏱️ Auto-refresh order list
- 🎯 Update order status through workflow

### Backend Features
- 📱 RESTful API for menu and orders
- 🖨️ ESP32 thermal printer integration
- 💾 MongoDB/MySQL ready database design
- 🔐 Extensible for authentication

## Technology Stack

- **Backend**: Node.js + Express.js
- **Frontend**: React 18 + Tailwind CSS
- **Build**: Webpack
- **Styling**: Tailwind CSS
- **Hardware**: ESP32 Thermal Printer

## API Endpoints

### Menu Routes
- `GET /api/menu` - Get all menu items
- `GET /api/menu/category/:category` - Get by category
- `GET /api/menu/:id` - Get single item
- `POST /api/menu` - Create menu item (admin)
- `PUT /api/menu/:id` - Update menu item
- `DELETE /api/menu/:id` - Delete menu item

### Order Routes
- `GET /api/orders` - Get all orders
- `GET /api/orders/status/:status` - Get by status
- `GET /api/orders/:id` - Get single order
- `POST /api/orders` - Create new order
- `PUT /api/orders/:id/status` - Update order status
- `POST /api/orders/:id/print` - Send to thermal printer
- `DELETE /api/orders/:id` - Delete order

### Printer Routes
- `GET /api/printer/test` - Test ESP32 connection

## Installation

### Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your configuration
npm start
```

### Frontend Setup
```bash
cd frontend
npm install
npm start  # Runs on http://localhost:3000
```

## Environment Variables (.env)

```
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/milktea
ESP32_IP=192.168.1.100
ESP32_PORT=8080
```

## ESP32 Thermal Printer Setup

The system expects an ESP32 microcontroller running a web server that:
1. Listens on the configured IP and PORT
2. Has a `/print` POST endpoint that accepts JSON with `{ text: "receipt content" }`
3. Has a `/status` GET endpoint that returns connection status

Example ESP32 endpoint structure:
```
POST /print          - Prints the receipt text to thermal printer
GET /status          - Returns printer status information
```

## Order Status Workflow

```
pending → preparing → ready → completed
                   ↓
              cancelled (optional)
```

## Customization Options

### Drink Sizes
- Small (10% off base price)
- Medium (base price)
- Large (10% on base price)

### Sugar Levels
- 0%, 25%, 50%, 75%, 100%

### Ice Levels
- No Ice, Less Ice, Normal, More Ice

### Add-ons (₱10 each)
- Boba Pearls
- Pudding
- Aloe Vera
- Grass Jelly

## Color Scheme

- **Tea Brown**: #8B6F47
- **Tea Light**: #D4A574
- **Milk Cream**: #F0E6D2

## Future Enhancements

- User authentication & admin panel
- Payment integration (PayMaya, GCash)
- Order history & analytics
- Inventory management
- Real-time WebSocket updates
- Mobile app version
- Customer loyalty program
