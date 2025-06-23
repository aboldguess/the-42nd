// Mongoose model representing a question document
const Question = require('../models/Question');
// Used to store uploaded images
const Media = require('../models/Media');
const QRCode = require('qrcode');
const Settings = require('../models/Settings');

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
