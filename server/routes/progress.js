const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { getItemScanStats } = require('../controllers/progressController');

// Return scan progress for a given item type ('clue', 'question', 'sidequest')
router.get('/:type', auth, getItemScanStats);

module.exports = router;
