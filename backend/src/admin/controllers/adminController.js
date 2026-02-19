const fs = require('fs');
const path = require('path');

// File path for persisting admin users
const adminFile = path.join(__dirname, '../../../data/admins.json');

// Ensure data directory exists
const ensureDataDir = () => {
  const dataDir = path.join(__dirname, '../../../data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
};

// Load admin users from file
const loadAdmins = () => {
  ensureDataDir();
  if (fs.existsSync(adminFile)) {
    const data = fs.readFileSync(adminFile, 'utf8');
    return JSON.parse(data);
  }
  // Default admin user if no file exists
  const defaultAdmins = [
    { username: 'admin', password: 'admin123' }
  ];
  saveAdmins(defaultAdmins);
  return defaultAdmins;
};

// Save admin users to file
const saveAdmins = (adminsData) => {
  ensureDataDir();
  fs.writeFileSync(adminFile, JSON.stringify(adminsData, null, 2), 'utf8');
};

// In-memory admin storage - load from file on startup
let admins = loadAdmins();

// Admin login
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    const admin = admins.find(a => a.username === username && a.password === password);

    if (!admin) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    res.json({
      message: 'Login successful',
      user: {
        username: admin.username,
        role: 'admin'
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all admin users (for management)
exports.getAllAdmins = async (req, res) => {
  try {
    // Return without passwords for security
    const adminList = admins.map(a => ({ username: a.username }));
    res.json(adminList);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create new admin user
exports.createAdmin = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    // Check if admin already exists
    if (admins.find(a => a.username === username)) {
      return res.status(400).json({ message: 'Admin username already exists' });
    }

    const newAdmin = { username, password };
    admins.push(newAdmin);
    saveAdmins(admins);

    res.status(201).json({
      message: 'Admin created successfully',
      user: { username: newAdmin.username }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update admin password
exports.updateAdminPassword = async (req, res) => {
  try {
    const { username, oldPassword, newPassword } = req.body;

    if (!username || !oldPassword || !newPassword) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const admin = admins.find(a => a.username === username);

    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    if (admin.password !== oldPassword) {
      return res.status(401).json({ message: 'Old password is incorrect' });
    }

    admin.password = newPassword;
    saveAdmins(admins);

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete admin user
exports.deleteAdmin = async (req, res) => {
  try {
    const { username } = req.params;

    // Prevent deleting the last admin
    if (admins.length === 1) {
      return res.status(400).json({ message: 'Cannot delete the last admin user' });
    }

    const index = admins.findIndex(a => a.username === username);

    if (index === -1) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    const deleted = admins.splice(index, 1);
    saveAdmins(admins);

    res.json({ message: 'Admin deleted successfully', user: { username: deleted[0].username } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
