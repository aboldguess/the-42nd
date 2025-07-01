const Notification = require('../models/Notification');

/**
 * Return notifications relevant to the authenticated player.
 * By default this includes both personal and team notifications unless
 * the request sets `req.teamOnly` to true.
 */
exports.getNotifications = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 20;

    // Build an array of query conditions depending on whether the user
    // requested only team notifications or both personal and team ones.
    const conditions = [];
    if (req.teamOnly) {
      // Only notifications addressed to the player's team
      if (req.user.team) conditions.push({ team: req.user.team });
    } else {
      // Personal notifications always apply to the current player
      conditions.push({ user: req.user._id });
      // Include team notifications if the player belongs to a team
      if (req.user.team) conditions.push({ team: req.user.team });
    }

    const notifications = await Notification.find({ $or: conditions })
      .sort({ createdAt: -1 })
      .limit(limit)
      // Populate the actor so the client can display a name/photo
      .populate('actor', 'name photoUrl');

    res.json(notifications);
  } catch (err) {
    console.error('Error fetching notifications:', err);
    res.status(500).json({ message: 'Error fetching notifications' });
  }
};

/**
 * Mark a notification as read if it belongs to the requesting user/team.
 */
exports.markRead = async (req, res) => {
  try {
    const note = await Notification.findById(req.params.id);
    if (!note) return res.status(404).json({ message: 'Notification not found' });

    // Ensure the player is allowed to update this notification
    const ownsNote =
      (note.user && note.user.equals(req.user._id)) ||
      (note.team && req.user.team && note.team.equals(req.user.team));
    if (!ownsNote) {
      return res.status(403).json({ message: 'Not authorized to modify' });
    }

    note.read = true;
    await note.save();
    res.json({ message: 'Notification marked as read' });
  } catch (err) {
    console.error('Error updating notification:', err);
    res.status(500).json({ message: 'Error updating notification' });
  }
};

/**
 * Mark a notification as viewed the first time it is shown to the player.
 */
exports.markViewed = async (req, res) => {
  try {
    const note = await Notification.findById(req.params.id);
    if (!note) return res.status(404).json({ message: 'Notification not found' });

    const ownsNote =
      (note.user && note.user.equals(req.user._id)) ||
      (note.team && req.user.team && note.team.equals(req.user.team));
    if (!ownsNote) {
      return res.status(403).json({ message: 'Not authorized to modify' });
    }

    note.viewed = true;
    await note.save();
    res.json({ message: 'Notification marked as viewed' });
  } catch (err) {
    console.error('Error updating notification:', err);
    res.status(500).json({ message: 'Error updating notification' });
  }
};
