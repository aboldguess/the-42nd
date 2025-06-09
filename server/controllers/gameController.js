// server/controllers/gameController.js

const Game = require('../models/Game');

// GET /api/admin/games
exports.getGames = async (req, res) => {
  try {
    const games = await Game.find().sort({ createdAt: -1 });
    res.json(games);
  } catch (err) {
    console.error('Error fetching games:', err);
    res.status(500).json({ message: 'Error fetching games' });
  }
};

// GET /api/admin/games/:id
exports.getGame = async (req, res) => {
  try {
    const game = await Game.findById(req.params.id);
    if (!game) return res.status(404).json({ message: 'Game not found' });
    res.json(game);
  } catch (err) {
    console.error('Error fetching game:', err);
    res.status(500).json({ message: 'Error fetching game' });
  }
};

// POST /api/admin/games
exports.createGame = async (req, res) => {
  const { name, slug, title, description, baseUrl, colourScheme } = req.body;
  try {
    const exists = await Game.findOne({ slug });
    if (exists) return res.status(400).json({ message: 'Slug already in use' });

    const game = new Game({
      name,
      slug,
      title,
      description,
      baseUrl,
      colourScheme: {
        primary: colourScheme?.primary || undefined,
        secondary: colourScheme?.secondary || undefined
      }
    });
    await game.save();
    res.status(201).json(game);
  } catch (err) {
    console.error('Error creating game:', err);
    res.status(500).json({ message: 'Error creating game' });
  }
};

// PUT /api/admin/games/:id
exports.updateGame = async (req, res) => {
  const updates = { ...req.body };
  try {
    const game = await Game.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!game) return res.status(404).json({ message: 'Game not found' });
    res.json(game);
  } catch (err) {
    console.error('Error updating game:', err);
    res.status(500).json({ message: 'Error updating game' });
  }
};

// DELETE /api/admin/games/:id
exports.deleteGame = async (req, res) => {
  try {
    const game = await Game.findByIdAndDelete(req.params.id);
    if (!game) return res.status(404).json({ message: 'Game not found' });
    res.json({ message: 'Game deleted' });
  } catch (err) {
    console.error('Error deleting game:', err);
    res.status(500).json({ message: 'Error deleting game' });
  }
};
