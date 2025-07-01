const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  gameName: { type: String, default: 'Treasure Hunt' },
  qrBaseUrl: { type: String, default: 'http://localhost:3000' },
  theme: {
    primary: { type: String, default: '#007AFF' },
    secondary: { type: String, default: '#5856D6' }
  },
  // Optional logo and favicon paths served from /uploads
  logoUrl: String,
  faviconUrl: String,
  // Placeholder image shown in the admin gallery instead of selfies/usies
  placeholderUrl: String,
  // Global font family applied to the UI
  fontFamily: {
    type: String,
    default:
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
  },
  neumorphicShadows: { type: Boolean, default: true },
  roundedCorners: { type: Boolean, default: true },
  // Multipliers used by the scoreboard calculation
  scorePerCorrect: { type: Number, default: 10 },
  scorePerSideQuest: { type: Number, default: 5 },
  scorePerCreatedQuest: { type: Number, default: 20 },
  // Number of minutes teams must wait before changing a trivia answer
  questionAnswerCooldown: { type: Number, default: 0 },
  // Default instructions shown for each side quest type. Admins can
  // customise these strings from the new instructions settings screen.
  sideQuestInstructions: {
    bonus: {
      type: String,
      default: 'Scan the correct QR code to complete this bonus quest.'
    },
    meetup: {
      type: String,
      default: 'Meet at the specified location and snap a group photo.'
    },
    photo: {
      type: String,
      default: 'Upload a photo proving you completed the challenge.'
    },
    race: {
      type: String,
      default:
        'Race against the clock! Upload your proof before the timer expires.'
    },
    passcode: {
      type: String,
      default: 'Enter the secret passcode along with your photo.'
    },
    trivia: {
      type: String,
      default:
        'Answer the trivia question correctly then upload your photo evidence.'
    }
  }
});

module.exports = mongoose.model('Settings', settingsSchema);
