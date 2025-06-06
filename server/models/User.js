// server/models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    photoUrl: { type: String, default: '' },            // e.g. "/uploads/uuid.jpg"
    team: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true },
    isAdmin: { type: Boolean, default: false }          // true if this user created the team
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
