const express = require('express');
const router = express.Router(); // router for /api/admin/questions
const adminAuth = require('../../middleware/adminAuth');
const upload = require('../../middleware/upload');
const {
  getAllQuestions,
  createQuestion,
  updateQuestion,
  deleteQuestion
} = require('../../controllers/questionController');

// All routes below require a valid admin JWT
router.use(adminAuth);

// List all questions
router.get('/', getAllQuestions);
// Create a new question (accepts optional image upload)
router.post('/', upload.single('image'), createQuestion);
// Update an existing question
router.put('/:id', updateQuestion);
// Delete a question
router.delete('/:id', deleteQuestion);

module.exports = router;
