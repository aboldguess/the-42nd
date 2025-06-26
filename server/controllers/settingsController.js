// server/controllers/settingsController.js
// Controller for fetching and updating global game settings
const Settings = require('../models/Settings');
const User = require('../models/User');
const Team = require('../models/Team');
const Question = require('../models/Question');
const Clue = require('../models/Clue');
const SideQuest = require('../models/SideQuest');
const Media = require('../models/Media');
const fs = require('fs');
const path = require('path');

// Return the singleton settings document
exports.getSettings = async (req, res) => {
  try {
    const settings = await Settings.findOne();
    if (!settings) return res.status(404).json({ message: 'Settings not found' });
    res.json(settings);
  } catch (err) {
    console.error('Error fetching settings:', err);
    res.status(500).json({ message: 'Error fetching settings' });
  }
};

// Update the settings document (admin only)
exports.updateSettings = async (req, res) => {
  try {
    const updates = { ...req.body };

    // Convert numeric score weight fields from strings
    if (updates.scoreWeightCorrectAnswer !== undefined) {
      updates.scoreWeightCorrectAnswer = Number(updates.scoreWeightCorrectAnswer);
    }
    if (updates.scoreWeightSideQuestCompleted !== undefined) {
      updates.scoreWeightSideQuestCompleted = Number(updates.scoreWeightSideQuestCompleted);
    }
    if (updates.scoreWeightSideQuestCreated !== undefined) {
      updates.scoreWeightSideQuestCreated = Number(updates.scoreWeightSideQuestCreated);
    }

    // If theme is provided as a JSON string, parse it
    if (typeof updates.theme === 'string') {
      try {
        updates.theme = JSON.parse(updates.theme);
      } catch (e) {
        console.error('Invalid theme JSON');
        delete updates.theme;
      }
    }

    // Attach uploaded files if present
    if (req.files && req.files.logo && req.files.logo[0]) {
      updates.logoUrl = '/uploads/' + req.files.logo[0].filename;
    }
    if (req.files && req.files.favicon && req.files.favicon[0]) {
      updates.faviconUrl = '/uploads/' + req.files.favicon[0].filename;
    }
    // Save uploaded placeholder image if provided
    if (req.files && req.files.placeholder && req.files.placeholder[0]) {
      updates.placeholderUrl = '/uploads/' + req.files.placeholder[0].filename;
    }

    // upsert: create document if none exists
    const settings = await Settings.findOneAndUpdate({}, updates, {
      new: true,
      upsert: true
    });

    res.json(settings);
  } catch (err) {
    console.error('Error updating settings:', err);
    res.status(500).json({ message: 'Error updating settings' });
  }
};

// Remove all data across collections and uploaded files. Requires the request
// body to include { confirm: 'definitely' } as a safety measure.
exports.masterReset = async (req, res) => {
  // Simple confirmation check to prevent accidental resets
  if (req.body.confirm !== 'definitely') {
    return res.status(400).json({
      message: "Type 'definitely' to confirm master reset"
    });
  }

  try {
    // Delete documents from all major collections. Admins and settings are
    // preserved so login remains possible after the reset.
    await Promise.all([
      User.deleteMany({}),
      Team.deleteMany({}),
      Question.deleteMany({}),
      Clue.deleteMany({}),
      SideQuest.deleteMany({}),
      Media.deleteMany({})
    ]);

    // Remove any uploaded files stored on disk
    const uploadDir = path.join(__dirname, '../uploads');
    if (fs.existsSync(uploadDir)) {
      fs.rmSync(uploadDir, { recursive: true, force: true });
      fs.mkdirSync(uploadDir); // create fresh empty directory
    }

    return res.json({ message: 'All game data has been cleared' });
  } catch (err) {
    console.error('Master reset error:', err);
    return res.status(500).json({ message: 'Error performing master reset' });
  }
};
