const mongoose = require('mongoose');

// Basic wall post referencing author and recipient users
const wallPostSchema = new mongoose.Schema(
  {
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    message: { type: String, default: '' },
    mediaUrl: { type: String, default: '' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('WallPost', wallPostSchema);
