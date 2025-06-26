const express = require('express');
const router = express.Router();
const { getQuestion } = require('../controllers/questionController');
const optionalAuth = require('../middleware/optionalAuth');

// Public endpoint to fetch a single question by ID
router.get('/questions/:id', optionalAuth, getQuestion);

module.exports = router;
