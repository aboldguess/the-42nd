// server/middleware/adminAuth.js

const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Check that the token has isAdmin === true
    if (!decoded.isAdmin) {
      return res.status(403).json({ message: 'Not authorized as admin' });
    }
    req.admin = { id: decoded.id };
    next();
  } catch (err) {
    console.error('Admin auth error:', err);
    return res.status(401).json({ message: 'Token invalid or expired' });
  }
};
