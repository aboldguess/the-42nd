const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { addReaction, getReactions } = require('../controllers/reactionController');

router.use(auth);

// POST /api/reactions - record the current player's emoji reaction
router.post('/', addReaction);

// GET /api/reactions/:mediaId - list reactions for a media item
router.get('/:mediaId', getReactions);

module.exports = router;
