// server/routes/adminAuth.js

const express = require('express');
const router = express.Router();
const { registerAdmin, loginAdmin } = require('../controllers/adminAuthController');

// OPTIONAL: register new admin (you can disable this after seeding)
router.post('/register', registerAdmin);

// login with username/password
router.post('/login', loginAdmin);

module.exports = router;
