const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const {
  getAllSideQuests,
  createSideQuest,
  submitSideQuestProof,
  updateSideQuest,
  deleteSideQuest,
  getSideQuestSubmissions,
  getMySideQuestSubmission,
  updateMySideQuestSubmission
} = require('../controllers/sideQuestController');

// Authenticated player endpoint for all quests
router.get('/', auth, getAllSideQuests);
// Public listing of quests (no auth required)
router.get('/public', getAllSideQuests);
router.post('/', auth, upload.fields([{ name: 'image', maxCount: 1 }]), createSideQuest);
router.put('/:id', auth, upload.fields([{ name: 'image', maxCount: 1 }]), updateSideQuest);
router.delete('/:id', auth, deleteSideQuest);
// Handle quest completion with optional media upload
router.post(
  '/:id/submit',
  auth,
  upload.fields([{ name: 'sideQuestMedia', maxCount: 1 }]),
  submitSideQuestProof
);

// List submissions for a quest
router.get('/:id/submissions', auth, getSideQuestSubmissions);
// Retrieve the current team's submission
router.get('/:id/submission', auth, getMySideQuestSubmission);
// Replace the current team's submission
router.put(
  '/:id/submission',
  auth,
  upload.fields([{ name: 'sideQuestMedia', maxCount: 1 }]),
  updateMySideQuestSubmission
);

module.exports = router;
