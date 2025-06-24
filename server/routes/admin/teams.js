// server/routes/admin/teams.js
const express = require('express');
const router = express.Router();
const adminAuth = require('../../middleware/adminAuth');
const { getAllTeams, createTeam, updateTeam, deleteTeam } = require('../../controllers/teamController');

// All team admin routes require an admin token
router.use(adminAuth);

router.get('/', getAllTeams);
router.post('/', createTeam);
router.put('/:id', updateTeam);
router.delete('/:id', deleteTeam);

module.exports = router;
