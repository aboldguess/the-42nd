const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { getAllMedia, addReaction } = require('../controllers/rogueController');

// Routes for browsing the rogues gallery and reacting to items

// List all uploaded media items
router.get('/', getAllMedia);

// React to a specific image or video (requires authentication)
router.post('/:id/react', auth, addReaction);

module.exports = router;
