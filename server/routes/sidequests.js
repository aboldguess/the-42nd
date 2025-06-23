const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const {
  getAllSideQuests,
  createSideQuest
} = require('../controllers/sideQuestController');

router.get('/', auth, getAllSideQuests);
router.post('/', auth, upload.fields([{ name: 'image', maxCount: 1 }]), createSideQuest);

module.exports = router;
