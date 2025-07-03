const mongoose = require('mongoose');

const kudosCategorySchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    leadingUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    leadingCount: { type: Number, default: 0 }
  },
  { timestamps: true }
);

module.exports = mongoose.model('KudosCategory', kudosCategorySchema);
