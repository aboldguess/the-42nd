const express = require('express');
const router = express.Router();
const {
  getQuestion,
  getTeamAnswer,
  submitTeamAnswer
} = require('../controllers/questionController');
const auth = require('../middleware/auth');

// Player endpoint to fetch a single question by ID
// Requires authentication so scans are only recorded for logged in users
router.get('/questions/:id', auth, getQuestion);
router.get('/questions/:id/answer', auth, getTeamAnswer);
router.post('/questions/:id/answer', auth, submitTeamAnswer);

module.exports = router;
