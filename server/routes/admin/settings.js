// server/routes/admin/settings.js
const express = require('express');
const router = express.Router();
const adminAuth = require('../../middleware/adminAuth');
const { getSettings, updateSettings } = require('../../controllers/settingsController');

// Protect all settings routes with admin JWT
router.use(adminAuth);

router.get('/', getSettings);
router.put('/', updateSettings);

module.exports = router;
