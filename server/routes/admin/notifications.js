// server/routes/admin/notifications.js
const express = require('express');
const router = express.Router();
const adminAuth = require('../../middleware/adminAuth');
const { broadcastNotification } = require('../../controllers/adminNotificationController');

// All routes require admin authentication
router.use(adminAuth);

// POST /api/admin/notifications/broadcast - send a system message to all players
router.post('/broadcast', broadcastNotification);

module.exports = router;
