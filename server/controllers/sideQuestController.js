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

// Update an existing side quest
exports.updateSideQuest = async (req, res) => {
  try {
    const sq = await SideQuest.findByIdAndUpdate(req.params.id, req.body, {
      new: true
    });
    if (!sq) return res.status(404).json({ message: 'Side quest not found' });
    res.json(sq);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error updating side quest' });
  }
};

// Delete a side quest
exports.deleteSideQuest = async (req, res) => {
  try {
    const sq = await SideQuest.findByIdAndDelete(req.params.id);
    if (!sq) return res.status(404).json({ message: 'Side quest not found' });
    res.json({ message: 'Side quest deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error deleting side quest' });
  }
};

