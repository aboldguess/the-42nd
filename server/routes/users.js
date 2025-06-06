const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const { getMe, updateMe } = require('../controllers/userController');

router.get('/me', auth, getMe);
router.put('/me', auth, upload.fields([{ name: 'selfie', maxCount: 1 }]), updateMe);

module.exports = router;
