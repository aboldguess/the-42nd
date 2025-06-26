const Scan = require('../models/Scan');

/**
 * Helper to record a scan event when a player views or answers an item.
 * @param {string} type - 'clue', 'question' or 'sidequest'
 * @param {string|ObjectId} itemId - identifier of the scanned item
 * @param {object} user - the Mongoose user document
 * @param {string} status - progress status at the time of the scan
 */
async function recordScan(type, itemId, user, status = 'NEW') {
  if (!user) return; // only record when we know the player
  try {
    await Scan.create({
      itemType: type,
      itemId,
      user: user._id,
      team: user.team,
      status
    });
  } catch (err) {
    console.error('Error recording scan:', err);
  }
}

module.exports = { recordScan };
