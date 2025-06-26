const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const { getWall, postComment } = require('../controllers/wallController');

router.use(auth);

// List comments for a user or team
router.get('/:type/:id', getWall);

// Post a new comment with optional image
router.post('/:type/:id', upload.single('image'), postComment);

module.exports = router;
