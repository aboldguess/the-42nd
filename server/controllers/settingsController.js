// server/controllers/settingsController.js
// Controller for fetching and updating global game settings
const Settings = require('../models/Settings');

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
