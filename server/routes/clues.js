const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  getClue,
  getAllClues,
  createClue,
  submitAnswer
} = require('../controllers/clueController');
const upload = require('../middleware/upload');

router.get('/', auth, getAllClues);
router.post('/', auth, upload.single('questionImage'), createClue);
router.get('/:clueId', auth, getClue);
router.post('/:clueId/answer', auth, submitAnswer);

module.exports = router;
