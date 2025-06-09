// server/routes/admin/games.js

const express = require('express');
const router = express.Router();
const adminAuth = require('../../middleware/adminAuth');
const {
  getGames,
  getGame,
  createGame,
  updateGame,
  deleteGame
} = require('../../controllers/gameController');

// All these routes require a valid admin JWT
router.use(adminAuth);

// List all games
router.get('/', getGames);

// Get a single game by ID
router.get('/:id', getGame);

// Create a new game
router.post('/', createGame);

// Update an existing game
router.put('/:id', updateGame);

// Delete a game
router.delete('/:id', deleteGame);

module.exports = router;
