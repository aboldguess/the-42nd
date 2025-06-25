const Media = require('../models/Media');
const Settings = require('../models/Settings');

exports.getAllMedia = async (req, res) => {
  try {
    const placeholder = (await Settings.findOne())?.placeholderUrl;
    const allMedia = await Media.find({ hidden: { $ne: true } })
      .populate('uploadedBy', 'name username photoUrl')
      .populate('team', 'name')
      .populate('sideQuest', 'title')
      .sort({ createdAt: -1 });
    const sanitized = allMedia.map((m) => {
      if (placeholder && m.type === 'profile') {
        return { ...m.toObject(), url: placeholder };
      }
      return m;
    });
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
