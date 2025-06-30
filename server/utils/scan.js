const Scan = require('../models/Scan');
const User = require('../models/User');
const { createNotification } = require('./notifications');

/**
 * Helper to record a scan event when a player views or answers an item.
 * @param {string} type - 'clue', 'question' or 'sidequest'
 * @param {string|ObjectId} itemId - identifier of the scanned item
 * @param {object} user - the Mongoose user document
 * @param {string} status - progress status at the time of the scan
 * @param {string} [itemTitle] - optional title of the scanned item for notifications
 */
async function recordScan(type, itemId, user, status = 'NEW', itemTitle = '') {
  if (!user) return; // only record when we know the player
  try {
    await Scan.create({
      itemType: type,
      itemId,
      user: user._id,
      team: user.team,
      status
    });

    // Notify the rest of the player's team about the scan
    const teammates = await User.find({
      team: user.team,
      _id: { $ne: user._id }
    }).select('notificationPrefs');

    const titlePart = itemTitle ? ` "${itemTitle}"` : '';
    const message = `${user.name} scanned ${type}${titlePart}.`;
    // Determine a link to the scanned item so teammates can jump to it
    let link = '';
    if (type === 'clue') link = `/clue/${itemId}`;
    if (type === 'question') link = `/question/${itemId}`;
    if (type === 'sidequest') link = `/sidequest/${itemId}`;

    for (const mate of teammates) {
      if (mate.notificationPrefs?.scans) {
        await createNotification({
          user: mate._id,
          actor: user,
          message,
          link
        });
      }
    }
  } catch (err) {
    console.error('Error recording scan:', err);
  }
}

module.exports = { recordScan };
