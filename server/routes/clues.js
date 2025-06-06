const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const {
  getClue,
  getAllClues,
  createClue,
  submitAnswer
} = require('../controllers/clueController');

router.get('/', auth, getAllClues);
router.post('/', auth, upload.fields([{ name: 'questionImage', maxCount: 1 }]), createClue);
router.get('/:clueId', auth, getClue);
router.post('/:clueId/answer', auth, submitAnswer);

module.exports = router;
