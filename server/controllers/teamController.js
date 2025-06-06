const Team = require('../models/Team');
const User = require('../models/User');
const Media = require('../models/Media');
const SideQuest = require('../models/SideQuest');

exports.getTeam = async (req, res) => {
  try {
    const team = await Team.findById(req.params.teamId);
    if (!team) return res.status(404).json({ message: 'Team not found' });
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
    if (!team) return res.status(404).json({ message: 'Team not found' });
    team.colourScheme.primary = primary || team.colourScheme.primary;
    team.colourScheme.secondary = secondary || team.colourScheme.secondary;
    await team.save();
    res.json(team.colourScheme);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error updating colour scheme' });
  }
};

exports.addMember = async (req, res) => {
  const { name } = req.body;
  let avatarUrl = '';
  if (req.file) {
    avatarUrl = '/uploads/' + req.file.filename;
    await Media.create({
      url: avatarUrl,
      uploadedBy: req.user._id,
      team: req.params.teamId,
      type: 'profile',
      tag: 'member_avatar'
    });
  }
  try {
    const team = await Team.findById(req.params.teamId);
    if (!team) return res.status(404).json({ message: 'Team not found' });
    team.members.push({ name, avatarUrl });
    await team.save();
    res.json(team.members);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error adding member' });
  }
};

exports.getSideQuestProgress = async (req, res) => {
  try {
    const team = await Team.findById(req.params.teamId).populate('sideQuestProgress.sideQuest');
    if (!team) return res.status(404).json({ message: 'Team not found' });
    res.json(team.sideQuestProgress);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching side quest progress' });
  }
};

exports.completeSideQuest = async (req, res) => {
  try {
    const team = await Team.findById(req.params.teamId);
    if (!team) return res.status(404).json({ message: 'Team not found' });
    const sideQuest = await SideQuest.findById(req.params.sqId);
    if (!sideQuest) return res.status(404).json({ message: 'Side quest not found' });

    let mediaUrl = '';
    if (req.file) {
      mediaUrl = '/uploads/' + req.file.filename;
      await Media.create({
        url: mediaUrl,
        uploadedBy: req.user._id,
        team: team._id,
        sideQuest: sideQuest._id,
        type: 'sideQuest',
        tag: ''
      });
    }

    const already = team.sideQuestProgress.find((p) => p.sideQuest.toString() == sideQuest._id.toString());
    if (!already) {
      team.sideQuestProgress.push({ sideQuest: sideQuest._id, completedAt: new Date() });
      await team.save();
    }

    res.json({ message: 'Side quest completed', mediaUrl });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error completing side quest' });
  }
};
