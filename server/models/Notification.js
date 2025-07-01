const mongoose = require('mongoose');

// Notifications can be targeted at either a single user or an entire team.
// Only one of `user` or `team` will be set for any given notification.
const notificationSchema = new mongoose.Schema(
  {
    // Individual player recipient
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    // Team recipient
    team: { type: mongoose.Schema.Types.ObjectId, ref: 'Team' },
    // Actor who triggered the notification. Mongoose uses `refPath` to determine
    // whether this ObjectId references a User or Team document.
    actor: {
      type: mongoose.Schema.Types.ObjectId,
      // For system notifications this will be undefined
      refPath: 'actorModel'
    },
    actorModel: {
      type: String,
      enum: ['User', 'Team', 'System'],
      // Default to "System" when no actor document is supplied
      default: 'System'
    },
    message: { type: String, required: true }, // text shown to the recipient
    link: { type: String, default: '' },       // optional URL for more details
    // Has the notification been shown to the player yet?
    viewed: { type: Boolean, default: false },
    read: { type: Boolean, default: false }    // whether the recipient has read it
  },
  { timestamps: true }
);

module.exports = mongoose.model('Notification', notificationSchema);
