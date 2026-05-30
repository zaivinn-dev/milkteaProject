const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'bigbrew-dev-secret-change-in-production';

const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  try {
    const token = authHeader.slice(7);
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

const requireAdmin = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};

const requireKitchenAccess = (req, res, next) => {
  if (req.user?.role === 'admin' || req.user?.role === 'staff') {
    return next();
  }
  return res.status(403).json({ message: 'Kitchen or admin access required' });
};

const signToken = (user) => {
  return jwt.sign(
    { username: user.username, role: user.role },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
};

module.exports = {
  authenticate,
  requireAdmin,
  requireKitchenAccess,
  signToken,
  JWT_SECRET
};
