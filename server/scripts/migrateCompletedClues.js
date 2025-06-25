const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Team = require('../models/Team');
const Clue = require('../models/Clue');

/**
 * Migration script to convert numeric completedClues values to ObjectIds.
 * It maps numbers to clues ordered by creation date (1-based).
 */
(async function migrate() {
  await connectDB();

  // Build a map of clue number -> ObjectId
  const clues = await Clue.find().sort({ createdAt: 1 });
  const map = new Map();
  clues.forEach((c, idx) => map.set(idx + 1, c._id));

  const teams = await Team.find();
  for (const team of teams) {
    let changed = false;
    team.completedClues = team.completedClues
      .map((entry) => {
        if (typeof entry === 'number') {
          const id = map.get(entry);
          if (id) {
            changed = true;
            return id;
          }
          return null; // drop invalid mapping
        }
        return entry;
      })
      .filter(Boolean);
    if (changed) {
      console.log(`Updating team ${team.name}`);
      await team.save();
    }
  }
  mongoose.disconnect();
})();
