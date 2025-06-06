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
  try {
    const newSQ = new SideQuest(req.body);
    await newSQ.save();
    res.status(201).json(newSQ);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error creating side quest' });
  }
};
