const Media = require('../models/Media');

exports.getAllMedia = async (req, res) => {
  try {
    const allMedia = await Media.find()
      // Populate uploader regardless of whether it's a User or Admin.
      // We request both possible name fields so the client can display one.
      .populate('uploadedBy', 'name username photoUrl')
      .populate('team', 'name')
      .populate('sideQuest', 'title')
      .sort({ createdAt: -1 });
    res.json(allMedia);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching rogues gallery' });
  }
};
