const Team = require('../models/Team');
const Media = require('../models/Media');

exports.getTeam = async (req, res) => {
  try {
    const team = await Team.findById(req.params.teamId);
    res.json(team);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching team' });
  }
};

exports.updateColourScheme = async (req, res) => {
  const { primary, secondary } = req.body;
  try {
    const team = await Team.findById(req.params.teamId);
    if (primary) team.colourScheme.primary = primary;
    if (secondary) team.colourScheme.secondary = secondary;
    await team.save();
    res.json(team.colourScheme);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error updating colour scheme' });
  }
};

exports.addMember = async (req, res) => {
  try {
    const team = await Team.findById(req.params.teamId);
    const member = { name: req.body.name, avatarUrl: '' };
    if (req.files && req.files.avatar) {
      member.avatarUrl = '/uploads/' + req.files.avatar[0].filename;
      await Media.create({
        url: member.avatarUrl,
        uploadedBy: req.user._id,
        uploadedByModel: 'User',
        team: team._id,
        type: 'profile',
        tag: 'avatar'
      });
    }
    team.members.push(member);
    await team.save();
    res.json(team.members);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error adding member' });
  }
};
