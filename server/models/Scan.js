const mongoose = require('mongoose');

// Records each time a player scans a clue, question or side quest QR code
const scanSchema = new mongoose.Schema(
  {
    itemId: { type: mongoose.Schema.Types.ObjectId, required: true },
    itemType: {
      type: String,
      enum: ['clue', 'question', 'sidequest', 'player'],
      required: true
    },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    team: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true },
    // Player's progress status at the time of this scan
    status: {
      type: String,
      enum: ['NEW', 'INCORRECT', 'SOLVED!'],
      default: 'NEW'
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Scan', scanSchema);
