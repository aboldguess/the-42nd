// server/models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    firstName: { type: String, default: '' },
    lastName: { type: String, default: '' },
    // URL to the player's selfie. Mandatory for new users
    photoUrl: { type: String, required: true },
    // Every player must be assigned to exactly one team
    team: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true },
    isAdmin: { type: Boolean, default: false }          // true if this user created the team
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
