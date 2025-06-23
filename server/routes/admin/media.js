// server/routes/admin/media.js
const express = require('express');
const router = express.Router();
const adminAuth = require('../../middleware/adminAuth');
const { downloadAllMedia } = require('../../controllers/mediaController');

// All routes here require admin authentication
router.use(adminAuth);

// GET /api/admin/media/download - stream a zip of all uploaded media
router.get('/download', downloadAllMedia);

module.exports = router;
