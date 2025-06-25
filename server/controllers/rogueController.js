const Media = require('../models/Media');

exports.getAllMedia = async (req, res) => {
  try {
    const allMedia = await Media.find()
      // Populate uploader regardless of whether it's a User or Admin.
      // We request both possible name fields so the client can display one.
      .populate('uploadedBy', 'name username photoUrl')
      .populate('team', 'name')
      .populate('sideQuest', 'title')
      // Include reacting players' names for display
      .populate('reactions.user', 'name')
      .sort({ createdAt: -1 });
    res.json(allMedia);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching rogues gallery' });
  }
};

// Handle a player reacting to a media item with an emoji
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

    await media.save();
    await media.populate('reactions.user', 'name');

    res.json(media);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error updating reaction' });
  }
};
