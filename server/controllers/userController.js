const User = require('../models/User');
const Media = require('../models/Media');
const { createThumbnail } = require('../utils/thumbnail');
const QRCode = require('qrcode');
const { getQrBase } = require('../utils/qr');
const { recordScan } = require('../utils/scan');
const { checkBonusQuestCompletion } = require('../utils/bonusQuest');

// Ensure a player has a QR code for their profile URL
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
    if (user) {
      await ensureQrCode(user);
    }
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
    // Persist any notification preference changes
    if (req.body.notificationPrefs) {
      let prefs = req.body.notificationPrefs;
      // When sent via multipart/form-data, the object may be a JSON string
      if (typeof prefs === 'string') {
        try {
          prefs = JSON.parse(prefs);
        } catch (e) {
          console.error('Invalid notificationPrefs JSON');
          prefs = null;
        }
      }
      if (prefs) {
        const keys = [
          'scans',
          'leaderboard',
          'wallPosts',
          'teamWallPosts',
          'photoInteractions',
          'sideQuestCompleted'
        ];
        // Use MongoDB dot notation to update individual fields
        keys.forEach(key => {
          if (typeof prefs[key] === 'boolean') {
            updates[`notificationPrefs.${key}`] = prefs[key];
          }
        });
      }
    }
    if (req.files && req.files.selfie) {
      const avatarPath = '/uploads/' + req.files.selfie[0].filename;
      updates.photoUrl = avatarPath;
      const thumb = await createThumbnail(avatarPath);
      await Media.create({
        url: avatarPath,
        thumbnailUrl: thumb,
        uploadedBy: req.user._id,
        // Indicate the uploader's model so the gallery can populate correctly
        uploadedByModel: 'User',
        team: req.user.team,
        type: 'profile',
        tag: 'selfie'
      });
    }
    const updatedUser = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true
    }).select('-password');
    if (updatedUser) {
      await ensureQrCode(updatedUser);
    }
    res.json(updatedUser);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Error updating profile' });
  }
};

// List all players. Accepts optional ?team=<teamId> to filter by team
exports.getAllPlayers = async (req, res) => {
  try {
    const query = {};
    // When a team id is provided, limit the search to that team
    if (req.query.team) {
      query.team = req.query.team;
    }
    const players = await User.find(query).populate('team', 'name');
    await Promise.all(players.map((p) => ensureQrCode(p)));
    res.json(players);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching players' });
  }
};

// Public list of players with their teams. Password fields are omitted
exports.getPlayersPublic = async (req, res) => {
  try {
    const players = await User.find()
      .select('-password')
      .populate('team', 'name');
    await Promise.all(players.map((p) => ensureQrCode(p)));
    res.json(players);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching players' });
  }
};

// Fetch a single player by ID for the profile page
exports.getPlayerById = async (req, res) => {
  try {
    const player = await User.findById(req.params.id)
      .select('-password')
      .populate('team', 'name');
    if (!player) return res.status(404).json({ message: 'Player not found' });
    await ensureQrCode(player);
    // Record that this player's QR was scanned and check bonus quests
    await recordScan('player', player._id, req.user, 'NEW', player.name);
    await checkBonusQuestCompletion(player._id, req.user);
    res.json(player);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching player' });
  }
};

// Create a new player attached to a team
exports.createPlayer = async (req, res) => {
  try {
    // Ensure a team id was provided
    if (!req.body.team) {
      return res.status(400).json({ message: 'Team is required' });
    }

    // Split name into first and last for convenience
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
    const player = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true
    });
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

