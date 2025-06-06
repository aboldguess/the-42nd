const Media = require('../models/Media');

exports.getAllMedia = async (req, res) => {
  try {
    const { teamId, sideQuestId, type } = req.query;
    const filter = {};
    if (teamId) filter.team = teamId;
    if (sideQuestId) filter.sideQuest = sideQuestId;
    if (type) filter.type = type;
    const allMedia = await Media.find(filter)
      .populate('uploadedBy', 'name avatarUrl')
      .populate('team', 'name')
      .populate('sideQuest', 'title')
      .sort({ createdAt: -1 });
    res.json(allMedia);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching rogues gallery' });
  }
};
