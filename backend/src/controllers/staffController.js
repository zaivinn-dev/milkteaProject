const bcrypt = require('bcryptjs');
const { signToken } = require('../middleware/authMiddleware');
const staffRepository = require('../db/staffRepository');

const hashPassword = (password) => bcrypt.hashSync(password, 10);

const ensureDefaultStaff = async () => {
  const count = await staffRepository.count();
  if (count === 0) {
    await staffRepository.create('kitchen', hashPassword('kitchen123'), 'Kitchen Staff');
    console.log('Created default kitchen staff: kitchen / kitchen123');
  }
};

exports.ensureDefaultStaff = ensureDefaultStaff;

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    const staff = await staffRepository.findByUsername(username);
    if (!staff || !bcrypt.compareSync(password, staff.password)) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    const user = {
      username: staff.username,
      role: 'staff',
      displayName: staff.display_name
    };
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

exports.getAllStaff = async (req, res) => {
  try {
    const staff = await staffRepository.findAll();
    res.json(staff);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createStaff = async (req, res) => {
  try {
    const { username, password, displayName } = req.body;

    if (!username?.trim() || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }
    if (await staffRepository.findByUsername(username.trim())) {
      return res.status(400).json({ message: 'Staff username already exists' });
    }

    await staffRepository.create(
      username.trim(),
      hashPassword(password),
      displayName?.trim() || username.trim()
    );

    res.status(201).json({
      message: 'Kitchen staff account created',
      user: { username: username.trim(), displayName: displayName?.trim() || username.trim() }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteStaff = async (req, res) => {
  try {
    const { username } = req.params;

    if ((await staffRepository.count()) <= 1) {
      return res.status(400).json({ message: 'Cannot delete the last kitchen staff account' });
    }

    const deleted = await staffRepository.remove(username);
    if (!deleted) {
      return res.status(404).json({ message: 'Staff not found' });
    }

    res.json({ message: 'Staff deleted', user: { username } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
