const SideQuest = require('../models/SideQuest');
const Media = require('../models/Media');
const QRCode = require('qrcode');
const Team = require('../models/Team');
const { getQrBase } = require('../utils/qr');

// Ensure a side quest has a QR code stored
// Ensure the QR code for a side quest reflects the current base URL
async function ensureQrCode(sq) {
  const base = await getQrBase();
  const url = `${base.replace(/\/$/, '')}/sidequest/${sq._id}`;
  if (!sq.qrCodeData || sq.qrBaseUrl !== base) {
    sq.qrCodeData = await QRCode.toDataURL(url);
    sq.qrBaseUrl = base;
    await sq.save();
  }
}

// CRUD handlers for SideQuest objects. Supports optional image upload and
// records whether a user or admin created the quest.

exports.getAllSideQuests = async (req, res) => {
  try {
    const sideQuests = await SideQuest.find({ active: true }).sort({ createdAt: 1 });
    await Promise.all(sideQuests.map((sq) => ensureQrCode(sq)));
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
        // Dynamically indicate which model the uploader came from
        uploadedByModel: req.user ? 'User' : 'Admin',
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
    await ensureQrCode(newSQ);
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
        uploadedByModel: req.user ? 'User' : 'Admin',
        type: 'sideQuest',
        tag: 'sidequest_image'
      });
    }

    const sq = await SideQuest.findByIdAndUpdate(req.params.id, updates, {
      new: true
    });
    if (!sq) return res.status(404).json({ message: 'Side quest not found' });
    await ensureQrCode(sq);
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

// Record completion of a side quest and save uploaded proof
exports.submitSideQuestProof = async (req, res) => {
  try {
    const { id } = req.params;
    const sq = await SideQuest.findById(id);
    if (!sq) return res.status(404).json({ message: 'Side quest not found' });

    const team = await Team.findById(req.user.team);
    if (!team) return res.status(404).json({ message: 'Team not found' });

    // Prevent double submissions
    const alreadyDone = team.sideQuestProgress.some((p) =>
      p.sideQuest.toString() === id
    );
    if (alreadyDone) {
      return res.status(400).json({ message: 'Quest already completed' });
    }

    let mediaUrl = '';
    // Store uploaded photo/video if present
    if (
      req.files &&
      req.files.sideQuestMedia &&
      req.files.sideQuestMedia[0]
    ) {
      mediaUrl = '/uploads/' + req.files.sideQuestMedia[0].filename;
      await Media.create({
        url: mediaUrl,
        uploadedBy: req.user._id,
        uploadedByModel: 'User',
        team: team._id,
        sideQuest: sq._id,
        type: 'sideQuest',
        tag: 'submission'
      });
    }

    // Update the team's progress log
    team.sideQuestProgress.push({
      sideQuest: sq._id,
      completedAt: new Date()
    });
    await team.save();

    res.json({ message: 'Side quest completed', mediaUrl });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error submitting side quest' });
  }
};

