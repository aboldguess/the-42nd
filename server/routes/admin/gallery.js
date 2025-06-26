const express = require('express');
const router = express.Router();
const adminAuth = require('../../middleware/adminAuth');
const {
  getAllMediaAdmin,
  updateMediaVisibility
} = require('../../controllers/rogueController');

// All routes in this file require admin authentication
router.use(adminAuth);

// GET /api/admin/gallery - list all media items including hidden ones
router.get('/', getAllMediaAdmin);

// PUT /api/admin/gallery/:id - toggle hidden flag for a media item
router.put('/:id', updateMediaVisibility);

module.exports = router;
