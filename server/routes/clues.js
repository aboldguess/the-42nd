// server/routes/clues.js

const express = require('express');
const router = express.Router();

const auth = require('../middleware/auth');
const gameBySlug = require('../middleware/gameBySlug');
const upload = require('../middleware/upload');
const {
  getClue,
  getAllClues,
  createClue,
  submitAnswer
} = require('../controllers/clueController');

/**
 * PLAYER ROUTES namespaced by game slug:
 *
 * GET    /api/:slug/clues              → list all clues for this game (optional)
 * POST   /api/:slug/clues              → create a new clue for this game
 * GET    /api/:slug/clues/:clueId      → fetch a single clue
 * POST   /api/:slug/clues/:clueId/answer → submit an answer
 *
 * All routes require auth and gameBySlug middleware.
 * Note: You may adjust GET /api/:slug/clues and POST /api/:slug/clues
 * depending on whether you want listing/creation here.
 */

// List all clues for a game (if desired)
router.get(
  '/:slug/clues',
  auth,
  gameBySlug,
  getAllClues
);

// Create a new clue for a game (with optional image upload)
router.post(
  '/:slug/clues',
  auth,
  gameBySlug,
  upload.fields([{ name: 'questionImage', maxCount: 1 }]),
  createClue
);

// Fetch one clue by ID within a game
router.get(
  '/:slug/clues/:clueId',
  auth,
  gameBySlug,
  getClue
);

// Submit an answer to a clue
router.post(
  '/:slug/clues/:clueId/answer',
  auth,
  gameBySlug,
  submitAnswer
);

module.exports = router;
