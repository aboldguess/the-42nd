const SideQuest = require('../models/SideQuest');
const Media = require('../models/Media');

// CRUD handlers for SideQuest objects. Supports optional image upload and
// records whether a user or admin created the quest.

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
    let imageUrl = '';
    // If an image was uploaded, store it and record in Media collection
    if (req.files && req.files.image && req.files.image[0]) {
      imageUrl = '/uploads/' + req.files.image[0].filename;
      await Media.create({
        url: imageUrl,
        uploadedBy: req.user?._id || req.admin?.id,
        type: 'sideQuest',
        tag: 'sidequest_image'
      });
    }

    const creatorId = req.user ? req.user._id : req.admin?.id;
    const creatorType = req.user ? 'User' : 'Admin';

    const newSQ = new SideQuest({
      ...req.body,
      imageUrl,
      createdBy: creatorId,
      createdByType: creatorType
    });

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
    let updates = { ...req.body };

    // Handle optional image upload
    if (req.files && req.files.image && req.files.image[0]) {
      const imageUrl = '/uploads/' + req.files.image[0].filename;
      updates.imageUrl = imageUrl;
      await Media.create({
        url: imageUrl,
        uploadedBy: req.user?._id || req.admin?.id,
        type: 'sideQuest',
        tag: 'sidequest_image'
      });
    }

    const sq = await SideQuest.findByIdAndUpdate(req.params.id, updates, {
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

