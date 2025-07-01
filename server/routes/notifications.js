const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { getNotifications, markRead, markViewed } = require('../controllers/notificationController');

// All notification routes require player authentication
router.use(auth);

// GET /api/notifications?limit=n - personal + team notifications
router.get('/', getNotifications);

// GET /api/notifications/team?limit=n - team notifications only
router.get('/team', (req, res, next) => {
  req.teamOnly = true; // flag for controller to filter team notifications
  next();
}, getNotifications);

// PUT /api/notifications/:id/read - mark a notification as read
router.put('/:id/read', markRead);

// PUT /api/notifications/:id/viewed - mark a notification as viewed
router.put('/:id/viewed', markViewed);

module.exports = router;
