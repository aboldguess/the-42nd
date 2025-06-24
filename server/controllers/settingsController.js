// server/controllers/settingsController.js
// Controller for fetching and updating global game settings
const Settings = require('../models/Settings');
const Admin = require('../models/Admin');
const User = require('../models/User');
const Team = require('../models/Team');
const Question = require('../models/Question');
const Clue = require('../models/Clue');
const SideQuest = require('../models/SideQuest');
const Media = require('../models/Media');
const fs = require('fs').promises;

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
    const updates = req.body;
    // upsert: create if not exists
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


// Export the entire game database as a JSON file
exports.exportGame = async (req, res) => {
  try {
    // Fetch all documents from each collection and store
    // them in a single object to be stringified.
    const data = {
      settings: await Settings.find().lean(),
      admins: await Admin.find().lean(),
      users: await User.find().lean(),
      teams: await Team.find().lean(),
      questions: await Question.find().lean(),
      clues: await Clue.find().lean(),
      sideQuests: await SideQuest.find().lean(),
      media: await Media.find().lean()
    };

    // Send the JSON as a downloadable file
    const json = JSON.stringify(data, null, 2);
    res.setHeader('Content-Type', 'application/json');
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="game_export.json"'
    );
    res.send(json);
  } catch (err) {
    console.error('Error exporting game:', err);
    res.status(500).json({ message: 'Error exporting game' });
  }
};

// Import a game database from an uploaded JSON file
exports.importGame = async (req, res) => {
  try {
    // A file must be provided via multipart/form-data
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Read and parse the uploaded JSON file
    const contents = await fs.readFile(req.file.path, 'utf8');
    const data = JSON.parse(contents);

    // Wipe all collections so the import starts with a clean slate
    await Promise.all([
      Settings.deleteMany({}),
      Admin.deleteMany({}),
      User.deleteMany({}),
      Team.deleteMany({}),
      Question.deleteMany({}),
      Clue.deleteMany({}),
      SideQuest.deleteMany({}),
      Media.deleteMany({})
    ]);

    // Insert each collection if data is present
    if (data.settings?.length) await Settings.insertMany(data.settings);
    if (data.admins?.length) await Admin.insertMany(data.admins);
    if (data.users?.length) await User.insertMany(data.users);
    if (data.teams?.length) await Team.insertMany(data.teams);
    if (data.questions?.length) await Question.insertMany(data.questions);
    if (data.clues?.length) await Clue.insertMany(data.clues);
    if (data.sideQuests?.length) await SideQuest.insertMany(data.sideQuests);
    if (data.media?.length) await Media.insertMany(data.media);

    // Delete the temporary upload and confirm success
    await fs.unlink(req.file.path);
    res.json({ message: 'Game imported successfully' });
  } catch (err) {
    console.error('Error importing game:', err);
    res.status(500).json({ message: 'Error importing game' });
  }
};
