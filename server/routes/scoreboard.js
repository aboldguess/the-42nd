// server/routes/scoreboard.js
const express = require('express');
const router = express.Router();
const { getScoreboard } = require('../controllers/progressController');

// Public/authorized scoreboard (no auth needed for simplicity)
router.get('/', getScoreboard);

module.exports = router;

