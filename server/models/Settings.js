const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  gameName: { type: String, default: 'Treasure Hunt' },
  qrBaseUrl: { type: String, default: 'http://localhost:3000' },
  theme: {
    primary: { type: String, default: '#2196F3' },
    secondary: { type: String, default: '#FFC107' }
  },
  // Optional logo and favicon paths served from /uploads
  logoUrl: String,
  faviconUrl: String,
  // Placeholder image shown in the admin gallery instead of selfies/usies
  placeholderUrl: String,
  // Global font family applied to the UI
  fontFamily: { type: String, default: 'Arial, sans-serif' },
  // Multipliers used by the scoreboard calculation
  scorePerCorrect: { type: Number, default: 10 },
  scorePerSideQuest: { type: Number, default: 5 },
  scorePerCreatedQuest: { type: Number, default: 20 }
});

module.exports = mongoose.model('Settings', settingsSchema);
