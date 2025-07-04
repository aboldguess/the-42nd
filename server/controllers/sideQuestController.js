const SideQuest = require('../models/SideQuest');
const Media = require('../models/Media');
const { createThumbnail } = require('../utils/thumbnail');
const QRCode = require('qrcode');
const Team = require('../models/Team');
const { getQrBase } = require('../utils/qr');
const mongoose = require('mongoose');
const { recordScan } = require('../utils/scan');
const { createNotification } = require('../utils/notifications');
const User = require('../models/User');
const fs = require('fs');
const path = require('path');

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
    const sideQuests = await SideQuest.find({ active: true })
      // Sort newest to oldest so recent quests appear first
      .sort({ createdAt: -1 });
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
      const thumb = await createThumbnail(imageUrl);
      await Media.create({
        url: imageUrl,
        thumbnailUrl: thumb,
        uploadedBy: req.user?._id || req.admin?.id,
        // Dynamically indicate which model the uploader came from
        uploadedByModel: req.user ? 'User' : 'Admin',
        type: 'sideQuest',
        tag: 'sidequest_image'
      });
    }

    // Record who created the quest so it can be displayed later
    const creatorId = req.user ? req.user._id : req.admin?.id;
    const creatorType = req.user ? 'User' : 'Admin';
    const setBy = req.user ? req.user.name : 'Admin';
    const teamId = req.user ? req.user.team : null;

    const newSQ = new SideQuest({
      ...req.body,
      imageUrl,
      createdBy: creatorId,
      createdByType: creatorType,
      setBy,
      team: teamId
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
      const thumb = await createThumbnail(imageUrl);
      await Media.create({
        url: imageUrl,
        thumbnailUrl: thumb,
        uploadedBy: req.user?._id || req.admin?.id,
        uploadedByModel: req.user ? 'User' : 'Admin',
        type: 'sideQuest',
        tag: 'sidequest_image'
      });
    }

    let sq = await SideQuest.findById(req.params.id);
    if (!sq) return res.status(404).json({ message: 'Side quest not found' });
    if (
      req.user &&
      sq.createdByType === 'User' &&
      !sq.createdBy.equals(req.user._id)
    ) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    sq = await SideQuest.findByIdAndUpdate(req.params.id, updates, { new: true });
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
    const sq = await SideQuest.findById(req.params.id);
    if (!sq) return res.status(404).json({ message: 'Side quest not found' });
    if (
      req.user &&
      sq.createdByType === 'User' &&
      !sq.createdBy.equals(req.user._id)
    ) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    // Mongoose v7 removed the `remove()` helper on documents.
    // Use `deleteOne()` instead to properly delete the record.
    await sq.deleteOne();
    res.json({ message: 'Side quest deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error deleting side quest' });
  }
};

// Retrieve a side quest by ID for public display
exports.getSideQuest = async (req, res) => {
  const { id } = req.params;

  // Validate ObjectId first to avoid casting errors
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ message: 'Side quest not found' });
  }

  try {
    const sq = await SideQuest.findById(id);
    if (!sq) {
      return res.status(404).json({ message: 'Side quest not found' });
    }
    // Ensure QR codes remain current for scans
    await ensureQrCode(sq);
    // Record that this side quest QR was scanned
    await recordScan('sidequest', sq._id, req.user, 'NEW', sq.title);
    let targetName = '';
    if (sq.questType === 'bonus' && sq.targetId) {
      const Model =
        sq.targetType === 'clue'
          ? require('../models/Clue')
          : sq.targetType === 'question'
          ? require('../models/Question')
          : require('../models/User');
      const target = await Model.findById(sq.targetId);
      if (target) targetName = target.title || target.name;
    }
    const team = await Team.findById(req.user.team).populate(
      'sideQuestProgress.scannedBy',
      'name'
    );
    let completedAt = null;
    let completedBy = null;
    if (team) {
      const entry = team.sideQuestProgress.find(
        (p) => p.sideQuest.toString() === id
      );
      if (entry) {
        completedAt = entry.completedAt;
        completedBy = entry.scannedBy ? entry.scannedBy.name : null;
      }
    }
    res.json({ ...sq.toObject(), targetName, completedAt, completedBy });
  } catch (err) {
    console.error('Error fetching side quest:', err);
    res.status(500).json({ message: 'Error fetching side quest' });
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

    // If the quest requires a passcode or trivia answer validate it now
    if (sq.questType === 'passcode') {
      const pass = (req.body.passcode || '').trim().toLowerCase();
      if (!pass || pass !== sq.passcode?.trim().toLowerCase()) {
        return res.status(400).json({ message: 'Incorrect passcode' });
      }
    }

    if (sq.questType === 'trivia') {
      const ans = (req.body.answer || '').trim().toLowerCase();
      if (!ans) {
        return res.status(400).json({ message: 'Answer required' });
      }
      const correct = sq.correctOption?.trim().toLowerCase();
      if (ans !== correct) {
        return res.status(400).json({ message: 'Incorrect answer' });
      }
    }

    let mediaUrl = '';
    // Store uploaded photo/video if present
    if (
      req.files &&
      req.files.sideQuestMedia &&
      req.files.sideQuestMedia[0]
    ) {
      mediaUrl = '/uploads/' + req.files.sideQuestMedia[0].filename;
      const mediaThumb = await createThumbnail(mediaUrl);
      await Media.create({
        url: mediaUrl,
        thumbnailUrl: mediaThumb,
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

    // Record completion to update scan status
    await recordScan('sidequest', sq._id, req.user, 'SOLVED!', sq.title);

    // Notify the quest creator's team when another team completes it
    if (sq.createdByType === 'User') {
      const creator = await User.findById(sq.createdBy);
      if (creator && creator.team && !creator.team.equals(team._id)) {
        // Look up all members of the creator's team
        const creatorTeam = await Team.findById(creator.team);
        if (creatorTeam) {
          const members = await User.find({ team: creatorTeam._id });
          // Send a notification to each member who opted in
          for (const m of members) {
            if (m.notificationPrefs?.sideQuestCompleted) {
              await createNotification({
                user: m._id,
                actor: team,
                message: `${team.name} completed your side quest "${sq.title}".`,
                // Link to the side quest details for quick reference
                link: `/sidequest/${sq._id}`
              });
            }
          }
        }
      }
    }

    res.json({ message: 'Side quest completed', mediaUrl });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error submitting side quest' });
  }
};

// Return all media submissions for a given side quest
exports.getSideQuestSubmissions = async (req, res) => {
  try {
    const media = await Media.find({
      sideQuest: req.params.id,
      hidden: false
    })
      .populate('uploadedBy', 'name username')
      .populate('team', 'name')
      .sort({ createdAt: -1 });
    res.json(media);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching submissions' });
  }
};

// Retrieve the current team's submission for a side quest
exports.getMySideQuestSubmission = async (req, res) => {
  try {
    const media = await Media.findOne({
      sideQuest: req.params.id,
      team: req.user.team
    });
    if (!media) return res.status(404).json({ message: 'Submission not found' });
    res.json(media);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching submission' });
  }
};

// Update the current team's submission for a side quest
exports.updateMySideQuestSubmission = async (req, res) => {
  try {
    const media = await Media.findOne({
      sideQuest: req.params.id,
      team: req.user.team
    });
    if (!media) return res.status(404).json({ message: 'Submission not found' });

    if (req.files && req.files.sideQuestMedia && req.files.sideQuestMedia[0]) {
      const file = req.files.sideQuestMedia[0];

      // Remove previous file from disk when stored in uploads
      if (media.url && media.url.startsWith('/uploads/')) {
        const filePath = path.join(__dirname, '..', media.url);
        if (fs.existsSync(filePath)) {
          try {
            fs.unlinkSync(filePath);
          } catch (err) {
            console.error('Error deleting old media file:', err);
          }
        }
      }

      media.url = '/uploads/' + file.filename;
    }

    await media.save();
    res.json(media);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error updating submission' });
  }
};

