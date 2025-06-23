// server/routes/clues.js

const express = require('express');
const router = express.Router();

const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
// Routes for managing and answering clues in the single game instance.
const {
  getClue,
  getAllClues,
  createClue,
  submitAnswer
} = require('../controllers/clueController');

/**
 * PLAYER ROUTES (single game):
 *
 * GET    /api/clues              → list all clues
 * POST   /api/clues              → create a new clue
 * GET    /api/clues/:clueId      → fetch a single clue
 * POST   /api/clues/:clueId/answer → submit an answer
 *
 * All routes require auth middleware.
 */

// List all clues for a game (if desired)
router.get('/clues', auth, getAllClues);

// Create a new clue for a game (with optional image upload)
router.post(
  '/clues',
  auth,
  upload.fields([{ name: 'questionImage', maxCount: 1 }]),
  createClue
);

// Fetch one clue by ID within a game
router.get('/clues/:clueId', auth, getClue);

// Submit an answer to a clue
router.post('/clues/:clueId/answer', auth, submitAnswer);

module.exports = router;
