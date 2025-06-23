const User = require('../models/User');
const Media = require('../models/Media');

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password').populate('team');
    res.json(user);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Error fetching user' });
  }
};

exports.updateMe = async (req, res) => {
  try {
    const updates = {};
    if (req.body.name) updates.name = req.body.name;
    if (req.files && req.files.selfie) {
      const avatarPath = '/uploads/' + req.files.selfie[0].filename;
      updates.photoUrl = avatarPath;
      await Media.create({
        url: avatarPath,
        uploadedBy: req.user._id,
        team: req.user.team,
        type: 'profile',
        tag: 'selfie'
      });
    }
    const updatedUser = await User.findByIdAndUpdate(req.user._id, updates, { new: true }).select('-password');
    res.json(updatedUser);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Error updating profile' });
  }
};

// List all players (admin use)
exports.getAllPlayers = async (req, res) => {
  try {
    const players = await User.find().populate('team', 'name');
    res.json(players);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching players' });
  }
};

// Create a new player attached to a team
exports.createPlayer = async (req, res) => {
  try {
    const player = await User.create({
      name: req.body.name,
      team: req.body.team
    });
    res.status(201).json(player);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error creating player' });
  }
};

// Update a player's info
exports.updatePlayer = async (req, res) => {
  try {
    const player = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!player) return res.status(404).json({ message: 'Player not found' });
    res.json(player);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error updating player' });
  }
};

// Delete a player
exports.deletePlayer = async (req, res) => {
  try {
    const player = await User.findByIdAndDelete(req.params.id);
    if (!player) return res.status(404).json({ message: 'Player not found' });
    res.json({ message: 'Player deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error deleting player' });
  }
};

