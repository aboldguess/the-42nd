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
  // Minutes players must wait before changing a previously submitted question
  // answer. This value is configurable by admins and used by both the client
  // and server when enforcing the cooldown period.
  questionAnswerCooldown: { type: Number, default: 5 }
});

module.exports = mongoose.model('Settings', settingsSchema);
