const Reaction = require('../models/Reaction');
const Media = require('../models/Media');
const User = require('../models/User');
const { createNotification } = require('../utils/notifications');

// Save or update the current player's reaction on a media item.
exports.addReaction = async (req, res) => {
  try {
    const { mediaId, emoji } = req.body;
    if (!mediaId || !emoji) {
      return res.status(400).json({ message: 'mediaId and emoji are required' });
    }

    let reaction = await Reaction.findOne({
      media: mediaId,
      user: req.user._id
    });

    if (reaction) {
      // Update the existing reaction with the new emoji
      reaction.emoji = emoji;
      await reaction.save();
    } else {
      // Create a new reaction if one doesn't exist yet
      reaction = await Reaction.create({ media: mediaId, user: req.user._id, emoji });
    }

    const populated = await reaction.populate('user', 'name');

    // Notify the uploader when someone reacts to their media item
    const media = await Media.findById(mediaId).populate('uploadedBy');
    if (
      media &&
      media.uploadedByModel === 'User' &&
      media.uploadedBy &&
      !media.uploadedBy._id.equals(req.user._id)
    ) {
      const uploader = media.uploadedBy;
      if (uploader.notificationPrefs?.photoInteractions) {
        await createNotification({
          user: uploader._id,
          actor: req.user,
          message: `${req.user.name} reacted to your photo.`
        });
      }
    }

    res.json(populated);
  } catch (err) {
    console.error('Error saving reaction:', err);
    res.status(500).json({ message: 'Error saving reaction' });
  }
};

// List all reactions for a given media item.
exports.getReactions = async (req, res) => {
  try {
    const reactions = await Reaction.find({ media: req.params.mediaId }).populate('user', 'name');
    res.json(reactions);
  } catch (err) {
    console.error('Error fetching reactions:', err);
    res.status(500).json({ message: 'Error fetching reactions' });
  }
};
