const Notification = require('../models/Notification');

/**
 * Insert a new notification into the database.
 * Only one of `user` or `team` should be specified.
 *
 * @param {Object} options
 * @param {mongoose.ObjectId} [options.user]  - Player recipient ID
 * @param {mongoose.ObjectId} [options.team]  - Team recipient ID
 * @param {Object} options.actor              - Mongoose User or Team document
 * @param {string} options.message            - Message text
 * @param {string} [options.link]             - Optional link for more info
 */
async function createNotification({ user, team, actor, message, link = '' }) {
  try {
    // Determine which model the actor document belongs to so Mongoose can
    // populate references correctly when retrieving notifications later.
    const actorModel = actor?.constructor?.modelName;
    if (!actorModel || (actorModel !== 'User' && actorModel !== 'Team')) {
      throw new Error('Actor must be a User or Team document');
    }

    return await Notification.create({
      user,
      team,
      actor: actor._id,
      actorModel,
      message,
      link
    });
  } catch (err) {
    console.error('Error creating notification:', err);
    return null;
  }
}

module.exports = { createNotification };
