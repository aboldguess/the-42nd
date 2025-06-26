const express = require('express');
const router = express.Router();
const adminAuth = require('../../middleware/adminAuth');
const {
  getAllMediaAdmin,
  updateMediaVisibility,
  deleteMedia
} = require('../../controllers/rogueController');

router.use(adminAuth);

// GET /api/admin/gallery - list all media
router.get('/', getAllMediaAdmin);

// PUT /api/admin/gallery/:id - toggle hidden flag
router.put('/:id', updateMediaVisibility);
// DELETE /api/admin/gallery/:id - remove a media item entirely
router.delete('/:id', deleteMedia);

module.exports = router;
