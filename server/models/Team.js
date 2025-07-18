// server/models/Team.js
const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    password: { type: String, required: true },          // bcrypt‐hashed
    // Public team image. Required when a team is created
    photoUrl: { type: String, required: true },
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
    // Track ObjectIds of solved clues so we can reference them directly
    completedClues: {
      type: [mongoose.Schema.Types.ObjectId],
      default: []
    },
    colourScheme: {
      primary: { type: String, default: '#007AFF' },
      secondary: { type: String, default: '#5856D6' }
    },
    // Log when a team completes each side quest. Defaults to an empty array so
    // new teams won't cause runtime errors when counting completed quests.
    sideQuestProgress: {
      type: [
        {
          sideQuest: { type: mongoose.Schema.Types.ObjectId, ref: 'SideQuest' },
          completedAt: Date,
          // Player who completed the side quest for the team
          scannedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
        }
      ],
      default: []
    },
    // Persist each team's selected answers for trivia questions so the choice
    // is shared across players and subject to cooldown restrictions.
    questionAnswers: {
      type: [
        {
          question: { type: mongoose.Schema.Types.ObjectId, ref: 'Question' },
          answer: String,
          updatedAt: Date
        }
      ],
      default: []
    },
    // Previous rank on the scoreboard used to detect changes between requests
    lastRank: { type: Number, default: 0 }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Team', teamSchema);
