const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const { getMe, updateMe, getUserPublic } = require('../controllers/userController');

router.get('/me', auth, getMe);
router.put('/me', auth, upload.fields([{ name: 'selfie', maxCount: 1 }]), updateMe);
// Public endpoint to fetch a user's profile by ID
// Anyone can view a player's public profile by ID
router.get('/:id', getUserPublic);

module.exports = router;
