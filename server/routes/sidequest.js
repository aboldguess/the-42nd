const express = require('express');
const router = express.Router();
const { getSideQuest } = require('../controllers/sideQuestController');
const auth = require('../middleware/auth');

// Player endpoint to fetch a single side quest by ID
// Authentication required to prevent registering scans for anonymous users
router.get('/sidequests/:id', auth, getSideQuest);

module.exports = router;
