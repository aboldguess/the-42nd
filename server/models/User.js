// server/models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    // Display name for convenience (we only show the first name publicly)
    name: { type: String, required: true },
    // First name kept separately for easy reference
    firstName: { type: String, required: true },
    // Login username derived from first name + last initial
    username: { type: String, required: true, unique: true },
    // bcrypt hash of the player's last name which acts as their password
    password: { type: String, required: true },
    photoUrl: { type: String, default: '' },            // e.g. "/uploads/uuid.jpg"
    team: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true },
    isAdmin: { type: Boolean, default: false }          // true if this user created the team
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
