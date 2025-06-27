// Mongoose model representing a question document
const Question = require('../models/Question');
// Used to store uploaded images
const Media = require('../models/Media');
const QRCode = require('qrcode');
const Settings = require('../models/Settings');
const Team = require('../models/Team');
const mongoose = require('mongoose');
const { recordScan } = require('../utils/scan');

// Retrieve the base URL used for QR codes
async function getQrBase() {
  const settings = await Settings.findOne();
  return settings?.qrBaseUrl || process.env.QR_BASE_URL || 'http://localhost:3000';
}

// Ensure a question has a QR code stored
async function ensureQrCode(question) {
  const base = await getQrBase();
  const url = `${base.replace(/\/$/, '')}/question/${question._id}`;
  if (!question.qrCodeData || question.qrBaseUrl !== base) {
    question.qrCodeData = await QRCode.toDataURL(url);
    question.qrBaseUrl = base;
    await question.save();
  }
}

// List all questions for the admin panel
exports.getAllQuestions = async (req, res) => {
  try {
    const questions = await Question.find().sort({ createdAt: 1 });
    await Promise.all(questions.map((q) => ensureQrCode(q)));
    res.json(questions);
  } catch (err) {
    console.error('Error fetching questions:', err);
    res.status(500).json({ message: 'Error fetching questions' });
  }
};

// Create a new question with optional image upload
exports.createQuestion = async (req, res) => {
  const { title, text, options, correctAnswer, notes } = req.body; // form fields
  let imageUrl = '';
  // If an image was uploaded include it in the record and log it to Media
  if (req.file) {
    imageUrl = '/uploads/' + req.file.filename;
    await Media.create({
      url: imageUrl,
      uploadedBy: req.admin.id,
      // Flag this document so the populate step knows to look in the Admin collection
      uploadedByModel: 'Admin',
      type: 'question',
      tag: 'question_image'
    });
  }
  try {
    // Convert the comma separated list of answers into an array
    const q = new Question({
      title,
      text,
      imageUrl,
      options: options ? options.split(',').map((o) => o.trim()) : [],
      correctAnswer,
      notes
    });
    await q.save();
    await ensureQrCode(q);
    res.status(201).json(q);
  } catch (err) {
    console.error('Error creating question:', err);
    res.status(500).json({ message: 'Error creating question' });
  }
};

// Update an existing question by ID
exports.updateQuestion = async (req, res) => {
  try {
    const updates = { ...req.body };
    if (typeof updates.options === 'string') {
      updates.options = updates.options.split(',').map((o) => o.trim());
    }
    const q = await Question.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!q) return res.status(404).json({ message: 'Question not found' });
    await ensureQrCode(q);
    res.json(q);
  } catch (err) {
    console.error('Error updating question:', err);
    res.status(500).json({ message: 'Error updating question' });
  }
};

// Remove a question from the database
exports.deleteQuestion = async (req, res) => {
  try {
    const q = await Question.findByIdAndDelete(req.params.id);
    if (!q) return res.status(404).json({ message: 'Question not found' });
    res.json({ message: 'Question deleted' });
  } catch (err) {
    console.error('Error deleting question:', err);
    res.status(500).json({ message: 'Error deleting question' });
  }
};

// Fetch a single question for players/scans
exports.getQuestion = async (req, res) => {
  const { id } = req.params;

  // Validate the provided ObjectId to avoid Mongo errors
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ message: 'Question not found' });
  }

  try {
    const question = await Question.findById(id);
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }
    // Keep QR code data in sync with current settings/base URL
    await ensureQrCode(question);
    // Record that this question was scanned if player is logged in
    await recordScan('question', question._id, req.user, 'NEW');
    res.json(question);
  } catch (err) {
    console.error('Error fetching question:', err);
    res.status(500).json({ message: 'Error fetching question' });
  }
};

// Retrieve the current team's stored answer for this question. The response
// includes how much time remains before the answer can be changed again.
exports.getTeamAnswer = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ message: 'Question not found' });
  }
  try {
    const team = await Team.findById(req.user.team);
    if (!team) return res.status(404).json({ message: 'Team not found' });

    const settings = await Settings.findOne();
    const cooldown = settings?.questionAnswerCooldown || 0;

    const entry = team.questionAnswers.find((a) =>
      a.question.toString() === id
    );
    let remaining = 0;
    if (entry && entry.chosenAt) {
      const diff = Date.now() - entry.chosenAt.getTime();
      remaining = Math.max(0, cooldown * 60000 - diff);
    }
    res.json({
      answer: entry ? entry.answer : null,
      chosenAt: entry ? entry.chosenAt : null,
      cooldownRemaining: remaining
    });
  } catch (err) {
    console.error('Error fetching team answer:', err);
    res.status(500).json({ message: 'Error fetching team answer' });
  }
};

// Store or update the team's answer for a question. If the team has answered
// within the configured cooldown period this will return a 400 response
// containing the remaining lockout time.
exports.submitTeamAnswer = async (req, res) => {
  const { id } = req.params;
  const { answer } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ message: 'Question not found' });
  }

  try {
    const team = await Team.findById(req.user.team);
    if (!team) return res.status(404).json({ message: 'Team not found' });

    const settings = await Settings.findOne();
    const cooldown = settings?.questionAnswerCooldown || 0;

    let entry = team.questionAnswers.find((a) =>
      a.question.toString() === id
    );
    const now = Date.now();

    if (entry) {
      const diff = now - entry.chosenAt.getTime();
      if (diff < cooldown * 60000) {
        const remaining = cooldown * 60000 - diff;
        return res.status(400).json({
          message: 'Cooldown active',
          cooldownRemaining: remaining
        });
      }
      entry.answer = answer;
      entry.chosenAt = new Date(now);
    } else {
      entry = { question: id, answer, chosenAt: new Date(now) };
      team.questionAnswers.push(entry);
    }

    await team.save();
    res.json({ message: 'Answer recorded' });
  } catch (err) {
    console.error('Error submitting team answer:', err);
    res.status(500).json({ message: 'Error submitting answer' });
  }
};
