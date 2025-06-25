const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { getQuestion } = require('../controllers/questionController');

// Player route to fetch a single trivia question
router.get('/:id', auth, getQuestion);

module.exports = router;
