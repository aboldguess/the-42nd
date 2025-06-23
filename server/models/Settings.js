const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  gameName: { type: String, default: 'Treasure Hunt' },
  qrBaseUrl: { type: String, default: 'http://localhost:3000' },
  theme: {
    primary: { type: String, default: '#2196F3' },
    secondary: { type: String, default: '#FFC107' }
  }
});

module.exports = mongoose.model('Settings', settingsSchema);
