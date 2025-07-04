const mongoose = require('mongoose');
const sideQuestSchema = new mongoose.Schema(
  {
    title: String,
    description: String,
    instructions: String,
    // Optional body text shown with the quest
    text: String,
    // URL of an image illustrating the quest
    imageUrl: String,
    // Type of side quest determines how it is completed
    questType: {
      type: String,
      enum: ['bonus', 'meetup', 'photo', 'race', 'passcode', 'trivia'],
      default: 'photo'
    },
    qrCodeData: String,
    // Store the base URL used to generate qrCodeData so we know when to refresh
    qrBaseUrl: String,
    // Seconds for countdown timer if enabled
    timeLimitSeconds: Number,
    // Enable stopwatch tracking when true
    useStopwatch: { type: Boolean, default: false },
    requiredMediaType: {
      type: String,
      enum: ['photo', 'video'],
      default: 'photo'
    },
    // Reference to the creator (user or admin ID)
    createdBy: mongoose.Schema.Types.ObjectId,
    createdByType: { type: String, enum: ['User', 'Admin'] },
    // Store the display name of the creator for quick reference
    setBy: String,
    // Reference to the creator's team when a player sets the quest
    team: { type: mongoose.Schema.Types.ObjectId, ref: 'Team' },
    active: { type: Boolean, default: true },
    // ID of the QR target when questType is 'bonus'
    targetId: mongoose.Schema.Types.ObjectId,
    // Item type of the QR target so we know which collection it belongs to
    targetType: {
      type: String,
      enum: ['clue', 'question', 'player']
    },
    // Secret word for 'passcode' quests
    passcode: String,
    // Trivia details for 'trivia' quests
    question: String,
    options: [String],
    correctOption: String,
    // Number of photos required for 'race' quests
    photoCount: { type: Number, default: 1 }
  },
  { timestamps: true }
);

module.exports = mongoose.model('SideQuest', sideQuestSchema);
