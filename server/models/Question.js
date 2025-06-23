const mongoose = require('mongoose');

// Basic schema describing a question used in the hunt
const questionSchema = new mongoose.Schema(
  {
    title: String,       // short label shown in admin UI
    text: String,        // the actual question text
    imageUrl: String,    // optional photo attached to the question
    options: [String],   // multiple-choice answers
    correctAnswer: String, // the correct option
    qrCodeData: String,  // base64 encoded QR code
    qrBaseUrl: String,   // base URL used when generating the QR
    notes: String        // admin notes, never sent to players
  },
  { timestamps: true }
);

module.exports = mongoose.model('Question', questionSchema);
