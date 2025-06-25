const mongoose = require('mongoose');

// Records when a player scans a QR code for a clue, question or side quest.
const scanSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    team: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true },
    itemType: {
      type: String,
      enum: ['clue', 'question', 'sidequest'],
      required: true
    },
    itemId: { type: mongoose.Schema.Types.ObjectId, required: true },
    createdAt: { type: Date, default: Date.now }
  },
  { versionKey: false }
);

module.exports = mongoose.model('Scan', scanSchema);
