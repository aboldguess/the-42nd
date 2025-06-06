const Media = require('../models/Media');

exports.getAllMedia = async (req, res) => {
  try {
    const allMedia = await Media.find()
      .populate('uploadedBy', 'name photoUrl')
      .populate('team', 'name')
      .populate('sideQuest', 'title')
      .sort({ createdAt: -1 });
    res.json(allMedia);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching rogues gallery' });
  }
};
