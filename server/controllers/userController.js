const User = require('../models/User');
const Media = require('../models/Media');
const QRCode = require('qrcode');
const Settings = require('../models/Settings');

// Retrieve the base URL for QR codes from settings or environment.
// This allows the QR destination to be changed without regenerating manually.
async function getQrBase() {
  const settings = await Settings.findOne();
  return settings?.qrBaseUrl || process.env.QR_BASE_URL || 'http://localhost:3000';
}

// Ensure the provided user document has an up-to-date QR code
// pointing to their public profile page
async function ensureQrCode(user) {
  const base = await getQrBase();
  const url = `${base.replace(/\/$/, '')}/player/${user._id}`;
  if (!user.qrCodeData || user.qrBaseUrl !== base) {
    user.qrCodeData = await QRCode.toDataURL(url);
    user.qrBaseUrl = base;
    await user.save();
  }
}

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('-password')
      .populate('team');
    // Make sure the user's QR code exists and is current
    await ensureQrCode(user);
    res.json(user);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Error fetching user' });
  }
};

exports.updateMe = async (req, res) => {
  try {
    const updates = {};
    if (req.body.name) {
      updates.name = req.body.name;
      const [firstName, ...rest] = req.body.name.trim().split(' ');
      updates.firstName = firstName;
      updates.lastName = rest.join(' ');
    }
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
    const updatedUser = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true
    }).select('-password');
    await ensureQrCode(updatedUser);
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
    // Make sure every player has a QR code stored
    await Promise.all(players.map((p) => ensureQrCode(p)));
    res.json(players);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching players' });
  }
};

// Create a new player attached to a team
exports.createPlayer = async (req, res) => {
  try {
    const [firstName, ...rest] = (req.body.name || '').trim().split(' ');
    const lastName = rest.join(' ');
    const player = await User.create({
      name: req.body.name,
      firstName,
      lastName,
      team: req.body.team
    });
    await ensureQrCode(player);
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
    await ensureQrCode(player);
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

// Retrieve public info for a player by ID. This is used when scanning
// another player's QR code.
exports.getUserPublic = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('team', 'name');
    if (!user) return res.status(404).json({ message: 'User not found' });
    await ensureQrCode(user);
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching user' });
  }
};

