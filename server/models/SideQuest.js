const mongoose = require('mongoose');
const sideQuestSchema = new mongoose.Schema({
  title: String,
  description: String,
  instructions: String,
  qrCodeData: String,
  timeLimitSeconds: Number,
  requiredMediaType: { type: String, enum: ['photo', 'video'], default: 'photo' },
  active: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('SideQuest', sideQuestSchema);
