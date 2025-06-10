// server/middleware/gameBySlug.js
const Game = require('../models/Game');

module.exports = async (req, res, next) => {
  const { slug } = req.params;
  try {
    const game = await Game.findOne({ slug });
    if (!game) {
      return res.status(404).json({ message: 'Game not found' });
    }
    req.game = game;          // attach the Game doc for downstream use
    next();
  } catch (err) {
    console.error('gameBySlug error:', err);
    return res.status(500).json({ message: 'Server error looking up game' });
  }
};
