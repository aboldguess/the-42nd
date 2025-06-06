const mongoose = require('mongoose');

const mediaSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    team: { type: mongoose.Schema.Types.ObjectId, ref: 'Team' },
    sideQuest: { type: mongoose.Schema.Types.ObjectId, ref: 'SideQuest', default: null },
    type: { type: String, enum: ['profile', 'question', 'sideQuest', 'other'], default: 'other' },
    tag: { type: String, default: '' },
    createdAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Media', mediaSchema);
