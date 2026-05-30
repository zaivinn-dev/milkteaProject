const bcrypt = require('bcryptjs');
const { signToken } = require('../../middleware/authMiddleware');
const adminRepository = require('../../db/adminRepository');

const hashPassword = (password) => bcrypt.hashSync(password, 10);

const ensureDefaultAdmin = async () => {
  const count = await adminRepository.count();
  if (count === 0) {
    await adminRepository.create('admin', hashPassword('admin123'));
    console.log('Created default admin user: admin / admin123');
  }
};

exports.ensureDefaultAdmin = ensureDefaultAdmin;

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    const admin = await adminRepository.findByUsername(username);
    if (!admin || !bcrypt.compareSync(password, admin.password)) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    const user = { username: admin.username, role: 'admin' };
    const token = signToken(user);

    res.json({
      message: 'Login successful',
      user,
      token
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllAdmins = async (req, res) => {
  try {
    const admins = await adminRepository.findAll();
    res.json(admins.map((a) => ({ username: a.username })));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createAdmin = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }
    if (await adminRepository.findByUsername(username)) {
      return res.status(400).json({ message: 'Admin username already exists' });
    }

    await adminRepository.create(username, hashPassword(password));

    res.status(201).json({
      message: 'Admin created successfully',
      user: { username }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateAdminPassword = async (req, res) => {
  try {
    const { username, oldPassword, newPassword } = req.body;

    if (!username || !oldPassword || !newPassword) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const admin = await adminRepository.findByUsername(username);
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }
    if (!bcrypt.compareSync(oldPassword, admin.password)) {
      return res.status(401).json({ message: 'Old password is incorrect' });
    }

    await adminRepository.updatePassword(username, hashPassword(newPassword));

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteAdmin = async (req, res) => {
  try {
    const { username } = req.params;

    if ((await adminRepository.count()) <= 1) {
      return res.status(400).json({ message: 'Cannot delete the last admin user' });
    }

    const deleted = await adminRepository.remove(username);
    if (!deleted) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    res.json({ message: 'Admin deleted successfully', user: { username } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
