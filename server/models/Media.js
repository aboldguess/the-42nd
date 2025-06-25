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
    // When true the media is hidden from the public rogues gallery
    hidden: { type: Boolean, default: false }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Media', mediaSchema);
