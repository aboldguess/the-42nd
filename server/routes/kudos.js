const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { listCategories, castVote } = require('../controllers/kudosController');

// List categories and current leaders. Authentication optional.
router.get('/', authOptional, listCategories);

// Players cast or update a vote in a category
router.post('/:id/vote', auth, castVote);

// Middleware allowing optional auth (for listing when logged out)
async function authOptional(req, res, next) {
  const header = req.headers.authorization;
  if (header?.startsWith('Bearer ')) {
    try {
      const jwt = require('jsonwebtoken');
      const User = require('../models/User');
      const token = header.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
    } catch {
      // ignore errors and continue without user
    }
  }
  next();
}

module.exports = router;
