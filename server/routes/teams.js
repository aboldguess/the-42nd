const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');
const upload = require('../middleware/upload');
const {
  getTeam,
  updateColourScheme,
  addMember,
  createTeam,
  updateTeam,
  deleteTeam
} = require('../controllers/teamController');
const Team = require('../models/Team');

router.get('/:teamId', auth, getTeam);
// Only global admins may modify a team's colour scheme
router.put('/:teamId/colour', adminAuth, updateColourScheme);
router.post('/:teamId/members', auth, upload.fields([{ name: 'avatar', maxCount: 1 }]), addMember);

// Create a brand new team (authenticated user becomes leader)
router.post('/', auth, createTeam);
// Update or delete a team if the requester is its leader
router.put('/:teamId', auth, updateTeam);
router.delete('/:teamId', auth, deleteTeam);

// List all teams (names and IDs) for dropdown
router.get('/list/all', async (req, res) => {
  try {
    const teams = await Team.find().select('name');
    res.json(teams);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching team list' });
  }
});

module.exports = router;
