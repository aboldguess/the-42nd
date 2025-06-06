const User = require('../models/User');
const Media = require('../models/Media');

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password').populate('team');
    res.json(user);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Error fetching user' });
  }
};

exports.updateMe = async (req, res) => {
  try {
    const updates = {};
    if (req.body.name) updates.name = req.body.name;
    if (req.files && req.files.selfie) {
      const avatarPath = '/uploads/' + req.files.selfie[0].filename;
      updates.photoUrl = avatarPath;
      await Media.create({
        url: avatarPath,
        uploadedBy: req.user._id,
        team: req.user.team,
        type: 'profile',
        tag: 'selfie'
      });
    }
    const updatedUser = await User.findByIdAndUpdate(req.user._id, updates, { new: true }).select('-password');
    res.json(updatedUser);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Error updating profile' });
  }
};
