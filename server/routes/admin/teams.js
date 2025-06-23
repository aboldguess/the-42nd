// server/routes/admin/teams.js
const express = require('express');
const router = express.Router();
const adminAuth = require('../../middleware/adminAuth');
const upload = require('../../middleware/upload');
const {
  getAllTeams,
  createTeam,
  updateTeam,
  deleteTeam
} = require('../../controllers/teamController');

// Protect all routes with admin JWT
router.use(adminAuth);

router.get('/', getAllTeams); // list
router.post('/', upload.fields([{ name: 'teamPhoto', maxCount: 1 }]), createTeam); // create
router.put('/:id', upload.fields([{ name: 'teamPhoto', maxCount: 1 }]), updateTeam); // update
router.delete('/:id', deleteTeam); // delete

module.exports = router;
