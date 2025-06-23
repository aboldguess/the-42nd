// server/models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    firstName: { type: String, default: '' },
    lastName: { type: String, default: '' },
    photoUrl: { type: String, default: '' },            // e.g. "/uploads/uuid.jpg"
    team: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true },
    isAdmin: { type: Boolean, default: false },         // true if this user created the team
    // Data URL for a QR code pointing to this player's public profile
    qrCodeData: { type: String, default: '' },
    // Tracks the base URL used when generating qrCodeData so we can
    // regenerate if it changes in settings
    qrBaseUrl: { type: String, default: '' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
