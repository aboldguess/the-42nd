const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const {
  getAllSideQuests,
  createSideQuest,
  submitSideQuestProof
} = require('../controllers/sideQuestController');

// Authenticated player endpoint for active quests
router.get('/', auth, getAllSideQuests);
// Public listing of quests (no auth required)
router.get('/public', getAllSideQuests);
router.post('/', auth, upload.fields([{ name: 'image', maxCount: 1 }]), createSideQuest);
// Handle quest completion with optional media upload
router.post(
  '/:id/submit',
  auth,
  upload.fields([{ name: 'sideQuestMedia', maxCount: 1 }]),
  submitSideQuestProof
);

module.exports = router;
