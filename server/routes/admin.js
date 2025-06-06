const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Team = require('../models/Team');
const SideQuest = require('../models/SideQuest');

router.get('/summary', auth, async (req, res) => {
  try {
    const teams = await Team.find().select('name members currentClue');
    const sideQuests = await SideQuest.find();
    res.json({ teams, sideQuests });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching admin summary' });
  }
});

module.exports = router;
