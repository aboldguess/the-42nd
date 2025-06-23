// Mongoose model representing a question document
const Question = require('../models/Question');
// Used to store uploaded images
const Media = require('../models/Media');
// Library for creating QR codes
const QRCode = require('qrcode');

// Base URL for QR code links (defaults to localhost)
const QR_BASE = process.env.QR_BASE_URL || 'http://localhost:3000';

// Helper to generate a QR code if one is missing
async function ensureQrCode(question) {
  if (!question.qrCodeData) {
    const url = `${QR_BASE}/question/${question._id}`;
    question.qrCodeData = await QRCode.toDataURL(url);
    await question.save();
  }
}

// List all questions for the admin panel
exports.getAllQuestions = async (req, res) => {
  try {
    const questions = await Question.find().sort({ createdAt: 1 });
    // ensure each question has an associated QR code
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
    await Media.create({ url: imageUrl, type: 'question', tag: 'question_image' });
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
    // allow updating options with comma separated list
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
