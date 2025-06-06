const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  getAllSideQuests,
  createSideQuest,
  updateSideQuest
} = require('../controllers/sideQuestController');

router.get('/', auth, getAllSideQuests);
router.post('/', auth, createSideQuest);
router.put('/:sqId', auth, updateSideQuest);

module.exports = router;
