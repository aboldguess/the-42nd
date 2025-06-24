// server/models/Team.js
const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    // Stored lowercase to allow case-insensitive checks when players join
    creatorFirstName: { type: String, required: true },
    photoUrl: { type: String, default: '' },             // e.g. "/uploads/uuid.jpg"
    members: [
      {
        name: { type: String, required: true },
        avatarUrl: { type: String, default: '' }         // e.g. the creator’s selfie URL
      }
    ],
    // You may keep any other fields you need (e.g. currentClue, colourScheme, etc.)
    currentClue: { type: Number, default: 1 },
    completedClues: [Number],
    colourScheme: {
      primary: { type: String, default: '#2196F3' },
      secondary: { type: String, default: '#FFC107' }
    },
    sideQuestProgress: [
      {
        sideQuest: { type: mongoose.Schema.Types.ObjectId, ref: 'SideQuest' },
        completedAt: Date
      }
    ]
  },
  { timestamps: true }
);

module.exports = mongoose.model('Team', teamSchema);
