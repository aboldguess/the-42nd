// server/routes/admin/scoreboard.js
const express = require('express');
const router = express.Router();
const adminAuth = require('../../middleware/adminAuth');
const { getScoreboard } = require('../../controllers/progressController');

router.use(adminAuth);
router.get('/', getScoreboard);

module.exports = router;

