const mongoose = require('mongoose');

// Basic schema describing a question used in the hunt
const questionSchema = new mongoose.Schema(
  {
    title: String,       // short label shown in admin UI
    text: String,        // the actual question text
    imageUrl: String,    // optional photo attached to the question
    options: [String],   // multiple‑choice answers shown to players
    correctAnswer: String, // the correct option value
    qrCodeData: String,  // embedded data URL for the QR code
    notes: String        // admin notes, never sent to players
  },
  { timestamps: true }
);

module.exports = mongoose.model('Question', questionSchema);
