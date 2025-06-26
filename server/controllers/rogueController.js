const Media = require('../models/Media');
const Settings = require('../models/Settings');
const Reaction = require('../models/Reaction');
const fs = require('fs');
const path = require('path');

exports.getAllMedia = async (req, res) => {
  try {
    // Sorting option: newest|best|hottest (defaults to newest)
    const sort = req.query.sort || 'newest';

    // URL of the placeholder image, if one has been configured in the settings
    const placeholder = (await Settings.findOne())?.placeholderUrl;

    // Load all media irrespective of visibility. Hidden profile photos are
    // replaced with the placeholder while hidden non-profile media are skipped.
    const allMedia = await Media.find()
      .populate('uploadedBy', 'name username photoUrl')
      .populate('team', 'name')
      .populate('sideQuest', 'title');

    // Pre-compute reaction totals and recent (last 15 minutes) counts for all
    // media in one aggregation query.
    const ids = allMedia.map((m) => m._id);
    const fifteen = new Date(Date.now() - 15 * 60 * 1000);
    const reactionAgg = await Reaction.aggregate([
      { $match: { media: { $in: ids } } },
      {
        $group: {
          _id: '$media',
          total: { $sum: 1 },
          recent: {
            $sum: {
              $cond: [{ $gte: ['$createdAt', fifteen] }, 1, 0]
            }
          }
        }
      }
    ]);

    // Per-emoji counts for displaying reaction breakdowns
    const emojiAgg = await Reaction.aggregate([
      { $match: { media: { $in: ids } } },
      {
        $group: {
          _id: { media: '$media', emoji: '$emoji' },
          count: { $sum: 1 }
        }
      }
    ]);
    const countMap = {};
    for (const r of reactionAgg) {
      countMap[r._id.toString()] = {
        total: r.total,
        recent: r.recent,
        emojis: {}
      };
    }
    for (const e of emojiAgg) {
      const id = e._id.media.toString();
      if (!countMap[id]) countMap[id] = { total: 0, recent: 0, emojis: {} };
      countMap[id].emojis[e._id.emoji] = e.count;
    }

    // Build the final list respecting hidden flags and attach reaction counts
    const sanitized = [];
    for (const m of allMedia) {
      if (m.hidden) {
        if (placeholder && m.type === 'profile') {
          sanitized.push({
            ...m.toObject(),
            url: placeholder,
            totalReactions: countMap[m._id.toString()]?.total || 0,
            recentReactions: countMap[m._id.toString()]?.recent || 0,
            emojiCounts: countMap[m._id.toString()]?.emojis || {}
          });
        }
        continue; // skip hidden non-profile items entirely
      }

      const counts = countMap[m._id.toString()] || { total: 0, recent: 0, emojis: {} };
      sanitized.push({
        ...m.toObject(),
        totalReactions: counts.total,
        recentReactions: counts.recent,
        emojiCounts: counts.emojis
      });
    }

    // Apply sorting rules
    if (sort === 'best') {
      sanitized.sort(
        (a, b) => b.totalReactions - a.totalReactions
      );
    } else if (sort === 'hottest') {
      const anyRecent = sanitized.some((m) => m.recentReactions > 0);
      sanitized.sort((a, b) => {
        if (anyRecent) {
          if (b.recentReactions !== a.recentReactions) {
            return b.recentReactions - a.recentReactions;
          }
        }
        // fall back to best ranking
        return b.totalReactions - a.totalReactions;
      });
    } else {
      // newest first by creation time
      sanitized.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    res.json(sanitized);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching rogues gallery' });
  }
};

exports.getAllMediaAdmin = async (req, res) => {
  try {
    const allMedia = await Media.find()
      .populate('uploadedBy', 'name username photoUrl')
      .populate('team', 'name')
      .populate('sideQuest', 'title')
      .sort({ createdAt: -1 });
    res.json(allMedia);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching gallery' });
  }
};

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

// Remove a media item and any related reactions
exports.deleteMedia = async (req, res) => {
  try {
    const media = await Media.findById(req.params.id);
    if (!media) return res.status(404).json({ message: 'Media not found' });

    // Delete file from disk when the path points to the uploads folder
    if (media.url && media.url.startsWith('/uploads/')) {
      const filePath = path.join(__dirname, '..', media.url);
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
        } catch (err) {
          // Log but continue so the DB record is removed
          console.error('Error deleting media file:', err);
        }
      }
    }

    await Reaction.deleteMany({ media: media._id }); // clean up reactions
    await Media.deleteOne({ _id: media._id });
    res.json({ message: 'Media deleted' });
  } catch (err) {
    console.error('Error deleting media:', err);
    res.status(500).json({ message: 'Error deleting media' });
  }
};
