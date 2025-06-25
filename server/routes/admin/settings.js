// server/routes/admin/settings.js
const express = require('express');
const router = express.Router();
const adminAuth = require('../../middleware/adminAuth');
const upload = require('../../middleware/upload');
const { getSettings, updateSettings, masterReset } = require('../../controllers/settingsController');

// Protect all settings routes with admin JWT
router.use(adminAuth);

router.get('/', getSettings);
router.put(
  '/',
  upload.fields([
    { name: 'logo', maxCount: 1 },
    { name: 'favicon', maxCount: 1 },
    { name: 'placeholder', maxCount: 1 }
  ]),
  updateSettings
);
// Danger zone: wipe all players, teams, questions, clues, side quests and media
router.post('/master-reset', masterReset);

module.exports = router;
