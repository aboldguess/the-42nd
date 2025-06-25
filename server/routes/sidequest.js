const express = require('express');
const router = express.Router();
const { getSideQuest } = require('../controllers/sideQuestController');

// Public endpoint to fetch a single side quest by ID
router.get('/sidequests/:id', getSideQuest);

module.exports = router;
