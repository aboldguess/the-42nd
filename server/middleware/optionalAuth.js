const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Decode the JWT if present but do not block unauthenticated requests
module.exports = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    try {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
    } catch (err) {
      // Ignore errors and continue without setting req.user
    }
  }
  next();
};
