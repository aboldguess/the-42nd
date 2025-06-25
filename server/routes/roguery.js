const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { getAllMedia, addReaction } = require('../controllers/rogueController');

router.get('/', getAllMedia);

// Allow authenticated players to react to an image/video
router.post('/:id/react', auth, addReaction);

module.exports = router;
