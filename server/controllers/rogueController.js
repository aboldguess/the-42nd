const Media = require('../models/Media');
const Settings = require('../models/Settings');

exports.getAllMedia = async (req, res) => {
  try {
    // URL of the placeholder image, if one has been configured in the settings
    const placeholder = (await Settings.findOne())?.placeholderUrl;

    // Load *all* media. Visibility rules are applied below so that hidden
    // profile photos can be replaced with the placeholder rather than being
    // filtered out entirely.
    const allMedia = await Media.find()
      .populate('uploadedBy', 'name username photoUrl')
      .populate('team', 'name')
      .populate('sideQuest', 'title')
      .sort({ createdAt: -1 });

    // Build the final list respecting hidden flags:
    //   - Non-profile media marked as hidden should not be returned
    //   - Hidden profile photos are returned with the placeholder image
    //   - All other media is returned as-is
    const sanitized = [];
    for (const m of allMedia) {
      if (m.hidden) {
        // Replace hidden profile photos with the placeholder if available.
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
