// server/models/Game.js

const mongoose = require('mongoose');

const gameSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },      // e.g. "the42nd" or "halloweenhunt"
    title: { type: String, default: '' },                       // display title
    description: { type: String, default: '' },                 // optional blurb
    baseUrl: { type: String, default: '' },                     // e.g. "https://partyhost.com"
    colourScheme: {
      primary: { type: String, default: '#2196F3' },            // default blue
      secondary: { type: String, default: '#FFC107' }           // default amber
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Game', gameSchema);
