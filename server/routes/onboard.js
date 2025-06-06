// server/routes/onboard.js

const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload'); // multer

const {
  getTeamsList,
  onboard
} = require('../controllers/onboardController');

// GET /api/onboard/teams
router.get('/teams', getTeamsList);

// POST /api/onboard
router.post(
  '/',
  upload.fields([
    { name: 'selfie', maxCount: 1 },
    { name: 'teamPhoto', maxCount: 1 }
  ]),
  onboard
);

module.exports = router;
