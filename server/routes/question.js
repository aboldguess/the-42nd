const express = require('express');
const router = express.Router();
const { getQuestion, submitTeamAnswer } = require('../controllers/questionController');
const auth = require('../middleware/auth');

// Player endpoint to fetch a single question by ID
// Requires authentication so scans are only recorded for logged in users
router.get('/questions/:id', auth, getQuestion);

// Record or update a team's answer for a question
router.post('/questions/:id/answer', auth, submitTeamAnswer);

module.exports = router;
