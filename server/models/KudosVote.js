const mongoose = require('mongoose');

const kudosVoteSchema = new mongoose.Schema(
  {
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'KudosCategory', required: true },
    voter: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
  },
  { timestamps: true }
);

// Ensure a player can only vote once per category
kudosVoteSchema.index({ category: 1, voter: 1 }, { unique: true });

module.exports = mongoose.model('KudosVote', kudosVoteSchema);
