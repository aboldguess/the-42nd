// server/controllers/clueController.js

const Clue = require('../models/Clue');
const Team = require('../models/Team');
const Media = require('../models/Media');
const mongoose = require('mongoose');
const QRCode = require('qrcode');

// Base URL for generating QR codes. Defaults to localhost if not provided.
const QR_BASE = process.env.QR_BASE_URL || 'http://localhost:3000';

// Ensure the given clue document has a QR code stored.
async function ensureQrCode(clue) {
  if (!clue.qrCodeData) {
    const url = `${QR_BASE}/clue/${clue._id}`;
    clue.qrCodeData = await QRCode.toDataURL(url);
    await clue.save();
  }
}

exports.getClue = async (req, res) => {
  const { clueId } = req.params;

  // If clueId is not a valid ObjectId, return 404 immediately.
  if (!mongoose.Types.ObjectId.isValid(clueId)) {
    return res.status(404).json({ message: 'Clue not found' });
  }

  try {
    const clue = await Clue.findById(clueId);
    if (!clue) {
      return res.status(404).json({ message: 'Clue not found' });
    }
    await ensureQrCode(clue);
    res.json(clue);
  } catch (err) {
    console.error('Error fetching clue:', err);
    res.status(500).json({ message: 'Error fetching clue' });
  }
};

exports.getAllClues = async (req, res) => {
  try {
    const clues = await Clue.find().sort({ createdAt: 1 });
    // Ensure every clue has an associated QR code
    await Promise.all(clues.map((c) => ensureQrCode(c)));
    res.json(clues);
  } catch (err) {
    console.error('Error fetching all clues:', err);
    res.status(500).json({ message: 'Error fetching all clues' });
  }
};

exports.createClue = async (req, res) => {
  const { title, text, options, correctAnswer, infoPage } = req.body;
  let imageUrl = '';
  // If an image was uploaded via multipart form, record it
  if (req.files && req.files.questionImage && req.files.questionImage[0]) {
    imageUrl = '/uploads/' + req.files.questionImage[0].filename;
    await Media.create({
      url: imageUrl,
      uploadedBy: req.user._id,
      type: 'question',
      tag: 'clue_image'
    });
  }
  try {
    const newClue = new Clue({
      title,
      text,
      imageUrl,
      options: options ? options.split(',').map((o) => o.trim()) : [],
      correctAnswer,
      infoPage: infoPage === 'true'
    });
    await newClue.save();
    // Generate and store QR code linking to this clue
    await ensureQrCode(newClue);
    res.status(201).json(newClue);
  } catch (err) {
    console.error('Error creating clue:', err);
    res.status(500).json({ message: 'Error creating clue' });
  }
};

exports.submitAnswer = async (req, res) => {
  const { clueId } = req.params;
  const { answer } = req.body;

  // Same ID check as above
  if (!mongoose.Types.ObjectId.isValid(clueId)) {
    return res.status(404).json({ message: 'Clue not found' });
  }

  try {
    const clue = await Clue.findById(clueId);
    if (!clue) {
      return res.status(404).json({ message: 'Clue not found' });
    }
    const team = await Team.findById(req.user.team);
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    // If this is an infoPage, automatically mark it completed
    let correct;
    if (clue.infoPage) {
      correct = true;
    } else {
      correct = clue.correctAnswer.trim().toLowerCase() === answer.trim().toLowerCase();
    }

    if (correct) {
      team.completedClues.push(clue._id);
      team.currentClue = team.currentClue + 1;
      await team.save();
      return res.json({ correct: true, nextClue: team.currentClue });
    } else {
      return res.json({ correct: false });
    }
  } catch (err) {
    console.error('Error submitting answer:', err);
    res.status(500).json({ message: 'Error submitting answer' });
  }
};

// Update an existing clue by ID
exports.updateClue = async (req, res) => {
  try {
    const updates = { ...req.body };
    if (req.files && req.files.questionImage && req.files.questionImage[0]) {
      const imageUrl = '/uploads/' + req.files.questionImage[0].filename;
      updates.imageUrl = imageUrl;
      await Media.create({
        url: imageUrl,
        uploadedBy: req.user._id,
        type: 'question',
        tag: 'clue_image'
      });
    }
    const clue = await Clue.findByIdAndUpdate(req.params.clueId, updates, {
      new: true
    });
    if (!clue) return res.status(404).json({ message: 'Clue not found' });
    await ensureQrCode(clue);
    res.json(clue);
  } catch (err) {
    console.error('Error updating clue:', err);
    res.status(500).json({ message: 'Error updating clue' });
  }
};

// Delete a clue by ID
exports.deleteClue = async (req, res) => {
  try {
    const clue = await Clue.findByIdAndDelete(req.params.clueId);
    if (!clue) return res.status(404).json({ message: 'Clue not found' });
    res.json({ message: 'Clue deleted' });
  } catch (err) {
    console.error('Error deleting clue:', err);
    res.status(500).json({ message: 'Error deleting clue' });
  }
};

