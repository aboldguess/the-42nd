// server/routes/admin/sidequests.js
const express = require('express');
const router = express.Router();
const adminAuth = require('../../middleware/adminAuth');
const upload = require('../../middleware/upload');
const {
  getAllSideQuests,
  createSideQuest,
  updateSideQuest,
  deleteSideQuest
} = require('../../controllers/sideQuestController');

router.use(adminAuth);

router.get('/', getAllSideQuests);
router.post('/', upload.fields([{ name: 'image', maxCount: 1 }]), createSideQuest);
router.put('/:id', upload.fields([{ name: 'image', maxCount: 1 }]), updateSideQuest);
router.delete('/:id', deleteSideQuest);

module.exports = router;

