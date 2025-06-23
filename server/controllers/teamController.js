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

// ----------- Admin CRUD handlers for teams -----------

const bcrypt = require('bcryptjs');

// List all teams for the admin panel
exports.getAllTeams = async (req, res) => {
  try {
    // Exclude password hashes before sending to client
    const teams = await Team.find().select('-password');
    res.json(teams);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching teams' });
  }
};

// Create a new team (optionally with a photo)
exports.createTeam = async (req, res) => {
  try {
    const { name, password } = req.body;
    if (!name || !password) {
      return res.status(400).json({ message: 'Name and password required' });
    }
    const hashed = await bcrypt.hash(password, 10);
    let photoUrl = '';
    if (req.files && req.files.teamPhoto && req.files.teamPhoto[0]) {
      photoUrl = '/uploads/' + req.files.teamPhoto[0].filename;
      await Media.create({
        url: photoUrl,
        uploadedBy: req.admin.id,
        type: 'team',
        tag: 'team_photo'
      });
    }
    const team = await Team.create({ name, password: hashed, photoUrl });
    res.status(201).json(team);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error creating team' });
  }
};

// Update an existing team document
exports.updateTeam = async (req, res) => {
  try {
    const updates = {};
    if (req.body.name) updates.name = req.body.name;
    if (req.body.password) {
      updates.password = await bcrypt.hash(req.body.password, 10);
    }
    if (req.files && req.files.teamPhoto && req.files.teamPhoto[0]) {
      updates.photoUrl = '/uploads/' + req.files.teamPhoto[0].filename;
      await Media.create({
        url: updates.photoUrl,
        uploadedBy: req.admin.id,
        type: 'team',
        tag: 'team_photo'
      });
    }
    const team = await Team.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!team) return res.status(404).json({ message: 'Team not found' });
    res.json(team);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error updating team' });
  }
};

// Delete a team entirely
exports.deleteTeam = async (req, res) => {
  try {
    const team = await Team.findByIdAndDelete(req.params.id);
    if (!team) return res.status(404).json({ message: 'Team not found' });
    res.json({ message: 'Team deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error deleting team' });
  }
};

