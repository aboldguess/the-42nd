// server/controllers/adminAuthController.js

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

// (Optional) register endpoint, used only if you want to create admins dynamically
exports.registerAdmin = async (req, res) => {
  const { username, password } = req.body;
  try {
    if (await Admin.findOne({ username })) {
      return res.status(400).json({ message: 'Admin already exists' });
    }
    const hash = await bcrypt.hash(password, 10);
    await Admin.create({ username, password: hash });
    return res.status(201).json({ message: 'Admin registered' });
  } catch (err) {
    console.error('Admin register error:', err);
    return res.status(500).json({ message: 'Server error during Admin registration' });
  }
};

// login endpoint
exports.loginAdmin = async (req, res) => {
  const { username, password } = req.body;
  try {
    const admin = await Admin.findOne({ username });
    if (!admin) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    const match = await bcrypt.compare(password, admin.password);
    if (!match) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    const payload = { id: admin._id, isAdmin: true };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });
    return res.json({ token, admin: { username: admin.username, id: admin._id } });
  } catch (err) {
    console.error('Admin login error:', err);
    return res.status(500).json({ message: 'Server error during Admin login' });
  }
};
