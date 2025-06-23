const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const { getWall, createPost } = require('../controllers/wallController');

// Public endpoint to view a user's wall
router.get('/:id', getWall);

// Authenticated endpoint to post a message or photo
router.post('/:id', auth, upload.fields([{ name: 'media', maxCount: 1 }]), createPost);

module.exports = router;
