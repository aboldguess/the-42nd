const express = require('express');
const router = express.Router();
const { getSideQuest } = require('../controllers/sideQuestController');
const optionalAuth = require('../middleware/optionalAuth');

// Public endpoint to fetch a single side quest by ID
router.get('/sidequests/:id', optionalAuth, getSideQuest);

module.exports = router;
