// server/routes/settings.js
const express = require('express');
const router = express.Router();
const { getSettings } = require('../controllers/settingsController');

// Public endpoint to retrieve global settings
router.get('/', getSettings);

module.exports = router;
