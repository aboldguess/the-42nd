const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    avatarUrl: { type: String, default: '' },
    team: { type: mongoose.Schema.Types.ObjectId, ref: 'Team' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
