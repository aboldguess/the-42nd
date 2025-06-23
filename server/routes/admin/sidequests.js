// server/routes/admin/sidequests.js
const express = require('express');
const router = express.Router();
const adminAuth = require('../../middleware/adminAuth');
const {
  getAllSideQuests,
  createSideQuest,
  updateSideQuest,
  deleteSideQuest
} = require('../../controllers/sideQuestController');

router.use(adminAuth);

router.get('/', getAllSideQuests);
router.post('/', createSideQuest);
router.put('/:id', updateSideQuest);
router.delete('/:id', deleteSideQuest);

module.exports = router;

