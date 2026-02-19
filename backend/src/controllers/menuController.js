const fs = require('fs');
const path = require('path');

// File path for persistent storage
const menuFile = path.join(__dirname, '../../data/menu.json');

// Ensure data directory exists
function ensureDataDir() {
  const dataDir = path.dirname(menuFile);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
}

// Load menu items from file or return empty array
function loadMenuItems() {
  try {
    ensureDataDir();
    if (fs.existsSync(menuFile)) {
      const data = fs.readFileSync(menuFile, 'utf8');
      const parsed = JSON.parse(data);
      console.log('Loaded menu items from file:', parsed.length, 'items');
      return Array.isArray(parsed) ? parsed : [];
    }
  } catch (error) {
    console.error('Error loading menu items from file:', error);
  }
  return [];
}

// Save menu items to file
function saveMenuItems(items) {
  try {
    ensureDataDir();
    fs.writeFileSync(menuFile, JSON.stringify(items, null, 2), 'utf8');
    console.log('Menu items saved to file:', items.length, 'items');
  } catch (error) {
    console.error('Error saving menu items to file:', error);
  }
}

// Load menu items at startup
let menuItems = loadMenuItems();

// Get all menu items
exports.getAllMenuItems = async (req, res) => {
  try {
    const availableItems = menuItems.filter(item => item.available);
    res.json(availableItems);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get menu by category
exports.getMenuByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const filtered = menuItems.filter(item => item.category === category && item.available);
    res.json(filtered);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single menu item
exports.getMenuById = async (req, res) => {
  try {
    const menuItem = menuItems.find(item => item._id === req.params.id);
    if (!menuItem) return res.status(404).json({ message: 'Menu item not found' });
    res.json(menuItem);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create menu item (admin)
exports.createMenuItem = async (req, res) => {
  try {
    const menuItem = {
      _id: Date.now().toString(),
      ...req.body,
      available: req.body.available !== undefined ? req.body.available : true
    };
    menuItems.push(menuItem);
    saveMenuItems(menuItems); // Save to file
    console.log('Menu item created:', menuItem);
    res.status(201).json(menuItem);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update menu item (admin)
exports.updateMenuItem = async (req, res) => {
  try {
    const index = menuItems.findIndex(item => item._id === req.params.id);
    if (index === -1) {
      console.error(`Menu item not found: ${req.params.id}`);
      return res.status(404).json({ message: 'Menu item not found' });
    }
    
    console.log(`Updating item ${req.params.id} with:`, req.body);
    menuItems[index] = { ...menuItems[index], ...req.body };
    saveMenuItems(menuItems); // Save to file
    console.log(`Item updated:`, menuItems[index]);
    
    res.json(menuItems[index]);
  } catch (error) {
    console.error('Error updating menu item:', error);
    res.status(400).json({ message: error.message });
  }
};

// Delete menu item (admin)
exports.deleteMenuItem = async (req, res) => {
  try {
    const index = menuItems.findIndex(item => item._id === req.params.id);
    if (index === -1) {
      console.error(`Menu item not found for delete: ${req.params.id}`);
      return res.status(404).json({ message: 'Menu item not found' });
    }
    
    console.log(`Deleting item: ${req.params.id}`);
    const deleted = menuItems.splice(index, 1);
    saveMenuItems(menuItems); // Save to file
    console.log(`Item deleted:`, deleted[0]);
    
    res.json({ message: 'Menu item deleted', item: deleted[0] });
  } catch (error) {
    console.error('Error deleting menu item:', error);
    res.status(500).json({ message: error.message });
  }
};
