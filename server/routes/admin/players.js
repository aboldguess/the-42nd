// server/routes/admin/players.js
const express = require('express');
const router = express.Router();
const adminAuth = require('../../middleware/adminAuth');
const {
  getAllPlayers,
  createPlayer,
  updatePlayer,
  deletePlayer
} = require('../../controllers/userController');

router.use(adminAuth);

router.get('/', getAllPlayers);
router.post('/', createPlayer);
router.put('/:id', updatePlayer);
router.delete('/:id', deletePlayer);

module.exports = router;

