const mongoose = require('mongoose');

const sideQuestSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    instructions: { type: String, default: '' },
    qrCodeData: { type: String, default: '' },
    timeLimitSeconds: { type: Number, default: 0 },
    requiredMediaType: { type: String, enum: ['photo', 'video'], default: 'photo' },
    active: { type: Boolean, default: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model('SideQuest', sideQuestSchema);
