// server/routes/admin/settings.js
const express = require('express');
const router = express.Router();
const adminAuth = require('../../middleware/adminAuth');
const { getSettings, updateSettings, masterReset } = require('../../controllers/settingsController');

// Protect all settings routes with admin JWT
router.use(adminAuth);

router.get('/', getSettings);
router.put('/', updateSettings);
// Danger zone: wipe all players, teams, questions, clues, side quests and media
router.post('/master-reset', masterReset);

module.exports = router;
