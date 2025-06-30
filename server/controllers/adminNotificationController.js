// server/controllers/adminNotificationController.js
// Controller used by admins to broadcast system notifications to all players
const User = require('../models/User');
const { createNotification } = require('../utils/notifications');

/**
 * Broadcast a system notification to every registered player.
 * The request body must include a `message` string.
 */
exports.broadcastNotification = async (req, res) => {
  const { message } = req.body;
  if (!message) {
    return res.status(400).json({ message: 'Message is required' });
  }

  try {
    // Fetch only the user IDs so we can create notifications efficiently
    const users = await User.find().select('_id');

    // Create a system notification for each user in parallel
    await Promise.all(
      users.map((u) => createNotification({ user: u._id, message }))
    );

    return res.json({ message: 'Notification sent to all players' });
  } catch (err) {
    console.error('Error broadcasting notification:', err);
    return res.status(500).json({ message: 'Error broadcasting notification' });
  }
};
