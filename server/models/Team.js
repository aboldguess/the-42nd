// server/models/Team.js
const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    password: { type: String, required: true },          // bcrypt‐hashed
    photoUrl: { type: String, default: '' },             // e.g. "/uploads/uuid.jpg"
    // Reference to the User who originally created the team
    leader: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    members: [
      {
        name: { type: String, required: true },
        avatarUrl: { type: String, default: '' }         // e.g. the creator’s selfie URL
      }
    ],
    // You may keep any other fields you need (e.g. currentClue, colourScheme, etc.)
    currentClue: { type: Number, default: 1 },
    // Track the numeric IDs of all solved clues
    completedClues: {
      type: [Number],
      default: []
    },
    colourScheme: {
      primary: { type: String, default: '#2196F3' },
      secondary: { type: String, default: '#FFC107' }
    },
    // Log when a team completes each side quest. Defaults to an empty array so
    // new teams won't cause runtime errors when counting completed quests.
    sideQuestProgress: {
      type: [
        {
          sideQuest: { type: mongoose.Schema.Types.ObjectId, ref: 'SideQuest' },
          completedAt: Date
        }
      ],
      default: []
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Team', teamSchema);
