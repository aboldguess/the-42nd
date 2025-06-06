const SideQuest = require('../models/SideQuest');

exports.getAllSideQuests = async (req, res) => {
  try {
    const sideQuests = await SideQuest.find({ active: true }).sort({ createdAt: 1 });
    res.json(sideQuests);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching side quests' });
  }
};

exports.createSideQuest = async (req, res) => {
  const { title, description, instructions, timeLimitSeconds, requiredMediaType, qrCodeData } = req.body;
  try {
    const newSQ = new SideQuest({
      title,
      description,
      instructions,
      timeLimitSeconds,
      requiredMediaType,
      qrCodeData
    });
    await newSQ.save();
    res.status(201).json(newSQ);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error creating side quest' });
  }
};

exports.updateSideQuest = async (req, res) => {
  try {
    const sq = await SideQuest.findById(req.params.sqId);
    if (!sq) return res.status(404).json({ message: 'Side quest not found' });
    const fields = ['title', 'description', 'instructions', 'timeLimitSeconds', 'requiredMediaType', 'qrCodeData', 'active'];
    fields.forEach((f) => {
      if (req.body[f] !== undefined) sq[f] = req.body[f];
    });
    await sq.save();
    res.json(sq);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error updating side quest' });
  }
};
