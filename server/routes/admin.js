// server/routes/admin.js

const express = require('express');
const router = express.Router();
const adminAuth = require('../middleware/adminAuth');

// All admin routes below require a valid admin JWT
router.use(adminAuth);

// Example “dashboard summary” endpoint
router.get('/summary', async (req, res) => {
  try {
    // You can add whatever summary data you like here
    return res.json({ message: 'Admin dashboard summary placeholder' });
  } catch (err) {
    console.error('Admin summary error:', err);
    return res.status(500).json({ message: 'Error fetching admin summary' });
  }
});

// (Later, you will add more routes here for creating/editing/deleting Games, Questions, Hints, SideQuests, etc.)

module.exports = router;
