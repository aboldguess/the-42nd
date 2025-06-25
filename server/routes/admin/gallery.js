const express = require('express');
const router = express.Router();
const adminAuth = require('../../middleware/adminAuth');
const { getAllMediaAdmin, updateMediaVisibility } = require('../../controllers/rogueController');

router.use(adminAuth);

// GET /api/admin/gallery - list all media
router.get('/', getAllMediaAdmin);

// PUT /api/admin/gallery/:id - toggle hidden flag
router.put('/:id', updateMediaVisibility);

module.exports = router;
