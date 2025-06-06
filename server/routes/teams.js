const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  getTeam,
  updateColourScheme,
  addMember,
  getSideQuestProgress,
  completeSideQuest
} = require('../controllers/teamController');
const upload = require('../middleware/upload');

router.get('/:teamId', auth, getTeam);
router.put('/:teamId/colour', auth, updateColourScheme);
router.post('/:teamId/members', auth, upload.single('avatar'), addMember);
router.get('/:teamId/sidequests', auth, getSideQuestProgress);
router.post('/:teamId/sidequests/:sqId/complete', auth, upload.single('sideQuestMedia'), completeSideQuest);

module.exports = router;
