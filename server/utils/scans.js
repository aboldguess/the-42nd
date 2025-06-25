const Scan = require('../models/Scan');

/**
 * Record that a user has viewed/scanned a QR code for a given item.
 * The itemType should be one of 'clue', 'question' or 'sidequest'.
 * A scan is only recorded once per user/item combination.
 */
exports.recordScan = async (user, itemType, itemId) => {
  if (!user) return; // route may be public
  const existing = await Scan.findOne({
    user: user._id,
    itemType,
    itemId
  });
  if (!existing) {
    await Scan.create({ user: user._id, team: user.team, itemType, itemId });
  }
};
