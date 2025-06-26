const Media = require('../models/Media');
const Settings = require('../models/Settings');

// Controller functions for the rogues gallery.  Players can browse uploaded
// media and react to each item with an emoji.

exports.getAllMedia = async (req, res) => {
  try {
    // URL of the placeholder image if configured in settings
    const placeholder = (await Settings.findOne())?.placeholderUrl;

    const allMedia = await Media.find()
      // Populate uploader regardless of whether it's a User or Admin. We
      // request both possible name fields so the client can display whichever
      // one exists.
      .populate('uploadedBy', 'name username photoUrl')
      .populate('team', 'name')
      .populate('sideQuest', 'title')
      // Include the names of players who reacted so the UI can list them
      .populate('reactions.user', 'name')
      // Newest uploads first
      .sort({ createdAt: -1 });

    // Respect hidden flags when returning media to the public gallery
    const sanitized = [];
    for (const m of allMedia) {
      if (m.hidden) {
        // Replace hidden profile photos with a placeholder if provided
        if (placeholder && m.type === 'profile') {
          sanitized.push({ ...m.toObject(), url: placeholder });
        }
        // Non-profile media marked hidden are omitted entirely
        continue;
      }
      // Visible media are returned unchanged
      sanitized.push(m);
    }

    res.json(sanitized);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching rogues gallery' });
  }
};

// Handle a player reacting to a media item with an emoji. The same emoji will
// remove a previous reaction, while a different emoji updates the existing
// reaction.
exports.addReaction = async (req, res) => {
  const { id } = req.params;
  const { emoji } = req.body;

  // Emoji selection is required
  if (!emoji) {
    return res.status(400).json({ message: 'Emoji required' });
  }

  try {
    const media = await Media.findById(id);
    if (!media) return res.status(404).json({ message: 'Media not found' });

    // Check if this user has already reacted
    const existing = media.reactions.find(
      // Compare ObjectIds as strings to find a prior reaction from this user
      (r) => r.user.toString() === req.user._id.toString()
    );

    if (existing) {
      // Same emoji again removes the reaction
      if (existing.emoji === emoji) {
        media.reactions = media.reactions.filter(
          (r) => r.user.toString() !== req.user._id.toString()
        );
      } else {
        // Otherwise update to the new emoji
        existing.emoji = emoji;
      }
    } else {
      // Add a new reaction entry
      media.reactions.push({ user: req.user._id, emoji });
    }

    // Persist the new reaction state and load player names for the response
    await media.save();
    await media.populate('reactions.user', 'name');

    res.json(media);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error updating reaction' });
  }
};

// Retrieve the complete gallery for administrators without filtering out
// hidden items. Useful for moderation and management pages.
exports.getAllMediaAdmin = async (req, res) => {
  try {
    const allMedia = await Media.find()
      .populate('uploadedBy', 'name username photoUrl')
      .populate('team', 'name')
      .populate('sideQuest', 'title')
      .populate('reactions.user', 'name')
      .sort({ createdAt: -1 });
    res.json(allMedia);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching gallery' });
  }
};

// Allow admins to toggle whether a media item is visible in the public gallery
exports.updateMediaVisibility = async (req, res) => {
  try {
    const media = await Media.findByIdAndUpdate(
      req.params.id,
      { hidden: req.body.hidden },
      { new: true }
    );
    if (!media) return res.status(404).json({ message: 'Media not found' });
    res.json(media);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error updating media' });
  }
};
