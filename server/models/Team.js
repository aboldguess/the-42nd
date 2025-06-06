const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    members: [
      {
        name: { type: String, required: true },
        avatarUrl: { type: String, default: '' }
      }
    ],
    currentClue: { type: Number, default: 1 },
    startTime: { type: Date, default: Date.now },
    completedClues: { type: [Number], default: [] },
    sideQuestProgress: [
      {
        sideQuest: { type: mongoose.Schema.Types.ObjectId, ref: 'SideQuest' },
        completedAt: { type: Date }
      }
    ],
    colourScheme: {
      primary: { type: String, default: '#2196F3' },
      secondary: { type: String, default: '#FFC107' }
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Team', teamSchema);
