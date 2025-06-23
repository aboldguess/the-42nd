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
    active: { type: Boolean, default: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model('SideQuest', sideQuestSchema);
