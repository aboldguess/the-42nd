const User = require('../models/User');
const Media = require('../models/Media');
const path = require('path');

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password').populate('team');
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching user profile' });
  }
};

exports.updateMe = async (req, res) => {
  try {
    const updates = {};
    if (req.body.name) updates.name = req.body.name;
    if (req.file) {
      const avatarPath = '/uploads/' + req.file.filename;
      updates.avatarUrl = avatarPath;

      await Media.create({
        url: avatarPath,
        uploadedBy: req.user._id,
        team: req.user.team,
        type: 'profile',
        tag: 'avatar'
      });
    }

    const updatedUser = await User.findByIdAndUpdate(req.user._id, updates, { new: true }).select('-password');
    res.json(updatedUser);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error updating profile' });
  }
};
