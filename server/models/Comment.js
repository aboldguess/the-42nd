const mongoose = require('mongoose');

// Comments can be left on either a user or a team profile. We use a dynamic
// reference via `refPath` so Mongoose knows which collection to populate when
// retrieving the target document.
const commentSchema = new mongoose.Schema(
  {
    content: String, // text body of the comment
    imageUrl: String, // optional photo attachment path
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    target: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: 'targetModel'
    },
    targetModel: {
      type: String,
      required: true,
      enum: ['User', 'Team']
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Comment', commentSchema);
