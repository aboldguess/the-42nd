const mongoose = require('mongoose');
const clueSchema = new mongoose.Schema({
  title: String,
  text: String,
  imageUrl: String,
  options: [String],
  correctAnswer: String,
  qrCodeData: String,
  infoPage: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Clue', clueSchema);
