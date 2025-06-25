const express = require('express');
const router = express.Router();
const adminAuth = require('../middleware/adminAuth');
const { getItemSummary } = require('../controllers/scanController');

// Only admins can query scan summaries
router.get('/:type/:id/summary', adminAuth, getItemSummary);

module.exports = router;
