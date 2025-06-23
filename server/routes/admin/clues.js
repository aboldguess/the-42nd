// server/routes/admin/clues.js
const express = require('express');
const router = express.Router();
const adminAuth = require('../../middleware/adminAuth');
const upload = require('../../middleware/upload');
const {
  getAllClues,
  createClue,
  updateClue,
  deleteClue
} = require('../../controllers/clueController');

// All routes here require admin JWT
router.use(adminAuth);

router.get('/', getAllClues);          // list
router.post('/', upload.fields([{ name: 'questionImage', maxCount: 1 }]), createClue);          // create
router.put('/:clueId', upload.fields([{ name: 'questionImage', maxCount: 1 }]), updateClue);    // update
router.delete('/:clueId', deleteClue); // delete

module.exports = router;

