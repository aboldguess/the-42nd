// Mongoose model representing a question document
const Question = require('../models/Question');
// Used to store uploaded images
const Media = require('../models/Media');

// List all questions for the admin panel
exports.getAllQuestions = async (req, res) => {
  try {
    const questions = await Question.find().sort({ createdAt: 1 });
    res.json(questions);
  } catch (err) {
    console.error('Error fetching questions:', err);
    res.status(500).json({ message: 'Error fetching questions' });
  }
};

// Create a new question with optional image upload
exports.createQuestion = async (req, res) => {
  const { title, text, options, notes } = req.body; // form fields
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
      notes
    });
    await q.save();
    res.status(201).json(q);
  } catch (err) {
    console.error('Error creating question:', err);
    res.status(500).json({ message: 'Error creating question' });
  }
};

// Update an existing question by ID
exports.updateQuestion = async (req, res) => {
  try {
    const q = await Question.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!q) return res.status(404).json({ message: 'Question not found' });
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
