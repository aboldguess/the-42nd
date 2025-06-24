// server/routes/admin/settings.js
const express = require('express');
const router = express.Router();
const adminAuth = require('../../middleware/adminAuth');
const {
  getSettings,
  updateSettings,
  exportGame,
  importGame
} = require('../../controllers/settingsController');
const upload = require('../../middleware/upload');

// Protect all settings routes with admin JWT
router.use(adminAuth);

router.get('/export', exportGame);
router.post('/import', upload.single('file'), importGame);

router.get('/', getSettings);
router.put('/', updateSettings);

module.exports = router;
