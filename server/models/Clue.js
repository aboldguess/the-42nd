const mongoose = require('mongoose');

const clueSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    text: { type: String, required: true },
    imageUrl: { type: String, default: '' },
    options: { type: [String], default: [] },
    correctAnswer: { type: String, required: true },
    qrCodeData: { type: String, default: '' },
    infoPage: { type: Boolean, default: false }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Clue', clueSchema);
