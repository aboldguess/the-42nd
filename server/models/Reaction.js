const mongoose = require('mongoose');

// Records a player's reaction emoji on a rogues gallery media item.
// A unique index on {media, user} ensures each player can react only once per item.
const reactionSchema = new mongoose.Schema(
  {
    media: { type: mongoose.Schema.Types.ObjectId, ref: 'Media', required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    emoji: { type: String, required: true }
  },
  { timestamps: true }
);

reactionSchema.index({ media: 1, user: 1 }, { unique: true });

module.exports = mongoose.model('Reaction', reactionSchema);
