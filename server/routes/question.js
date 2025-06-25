const express = require('express');
const router = express.Router();
const { getQuestion } = require('../controllers/questionController');

// Public endpoint to fetch a single question by ID
router.get('/questions/:id', getQuestion);

module.exports = router;
