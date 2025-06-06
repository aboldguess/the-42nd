const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  getAllSideQuests,
  createSideQuest
} = require('../controllers/sideQuestController');

router.get('/', auth, getAllSideQuests);
router.post('/', auth, createSideQuest);

module.exports = router;
