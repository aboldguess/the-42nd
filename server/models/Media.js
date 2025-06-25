const mongoose = require('mongoose');

// Media documents may be uploaded by either a regular user or an admin.  Using
// a dynamic reference via `refPath` allows us to populate the appropriate
// collection when querying.
const mediaSchema = new mongoose.Schema(
  {
    url: String,
    // Reference to the uploader along with the model name so Mongoose knows
    // which collection to populate from.
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'uploadedByModel'
    },
    uploadedByModel: {
      type: String,
      enum: ['User', 'Admin'],
      default: 'User'
    },
    team: { type: mongoose.Schema.Types.ObjectId, ref: 'Team' },
    sideQuest: { type: mongoose.Schema.Types.ObjectId, ref: 'SideQuest' },
    type: {
      type: String,
      enum: ['profile', 'question', 'sideQuest', 'other'],
      default: 'other'
    },
    tag: String,
    // Track which users reacted with which emoji. Each entry stores the
    // reacting player's ObjectId and the emoji string they selected.
    reactions: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        emoji: String
      }
    ]
  },
  { timestamps: true }
);

module.exports = mongoose.model('Media', mediaSchema);
