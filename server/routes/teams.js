const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const { getTeam, updateColourScheme, addMember } = require('../controllers/teamController');
const Team = require('../models/Team');

router.get('/:teamId', auth, getTeam);
router.put('/:teamId/colour', auth, updateColourScheme);
router.post('/:teamId/members', auth, upload.fields([{ name: 'avatar', maxCount: 1 }]), addMember);

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
