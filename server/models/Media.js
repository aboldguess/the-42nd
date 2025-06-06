const mongoose = require('mongoose');
const mediaSchema = new mongoose.Schema({
  url: String,
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  team: { type: mongoose.Schema.Types.ObjectId, ref: 'Team' },
  sideQuest: { type: mongoose.Schema.Types.ObjectId, ref: 'SideQuest' },
  type: { type: String, enum: ['profile','question','sideQuest','other'], default: 'other' },
  tag: String
}, { timestamps: true });

module.exports = mongoose.model('Media', mediaSchema);
