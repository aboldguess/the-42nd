const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Team = require('../models/Team');

exports.register = async (req, res) => {
  // (We’re using onboard instead; can leave blank or return 404)
  return res.status(501).json({ message: 'Use /api/onboard instead' });
};

exports.login = async (req, res) => {
  return res.status(501).json({ message: 'Login disabled; use stored token' });
};
