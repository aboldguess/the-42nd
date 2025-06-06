const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { getMe, updateMe } = require('../controllers/userController');
const upload = require('../middleware/upload');

router.get('/me', auth, getMe);
router.put('/me', auth, upload.single('avatar'), updateMe);

module.exports = router;
