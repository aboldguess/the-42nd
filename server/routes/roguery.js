const express = require('express');
const router = express.Router();
const { getAllMedia } = require('../controllers/rogueController');

router.get('/', getAllMedia);

module.exports = router;
