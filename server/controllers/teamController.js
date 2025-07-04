const Team = require('../models/Team');
const Media = require('../models/Media');
const { createThumbnail } = require('../utils/thumbnail');
const User = require('../models/User');
const Clue = require('../models/Clue');
const Question = require('../models/Question');
const SideQuest = require('../models/SideQuest');
const Scan = require('../models/Scan');
const bcrypt = require('bcryptjs');

exports.getTeam = async (req, res) => {
  try {
    const team = await Team.findById(req.params.teamId);
    res.json(team);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching team' });
  }
};

// Return only public fields for all teams so the client can build a roster
exports.getTeamsPublic = async (req, res) => {
  try {
    // Select safe fields only; _id is included by default
    const teams = await Team.find().select('name photoUrl members colourScheme');
    res.json(teams);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching teams' });
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
      const thumb = await createThumbnail(member.avatarUrl);
      await Media.create({
        url: member.avatarUrl,
        thumbnailUrl: thumb,
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

// ----- New CRUD handlers -----

// List all teams with their leaders' names for the admin panel
exports.getAllTeams = async (req, res) => {
  try {
    const teams = await Team.find().populate('leader', 'name');
    res.json(teams);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching teams' });
  }
};

// Create a new team. If invoked by a regular user, that user becomes the leader
exports.createTeam = async (req, res) => {
  try {
    const { name, password, photoUrl } = req.body;
    if (!name || !password) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    if (await Team.findOne({ name })) {
      return res.status(400).json({ message: 'Team name already taken' });
    }

    const hashed = await bcrypt.hash(password, 10);
    const team = await Team.create({
      name,
      password: hashed,
      photoUrl: photoUrl || '',
      leader: req.user?._id || req.body.leader,
      members: []
    });

    // If a user created the team, mark them as admin and add them as a member
    if (req.user) {
      req.user.team = team._id;
      req.user.isAdmin = true;
      await req.user.save();
      team.members.push({ name: req.user.name, avatarUrl: req.user.photoUrl });
      await team.save();
    }

    res.status(201).json(team);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error creating team' });
  }
};

// Update an existing team. Only global admins or the team leader may edit
exports.updateTeam = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    if (!team) return res.status(404).json({ message: 'Team not found' });

    // If a user is making the request, ensure they are this team's leader
    if (
      req.user &&
      (!team.leader || team.leader.toString() !== req.user._id.toString())
    ) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const updates = { ...req.body };
    if (updates.password) {
      updates.password = await bcrypt.hash(updates.password, 10);
    }

    Object.assign(team, updates);
    await team.save();
    res.json(team);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error updating team' });
  }
};

// Delete a team. Only admins or the team leader may perform this action
exports.deleteTeam = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    if (!team) return res.status(404).json({ message: 'Team not found' });

    if (
      req.user &&
      (!team.leader || team.leader.toString() !== req.user._id.toString())
    ) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Removing the team should also remove any players linked to it
    await User.deleteMany({ team: team._id });
    await Team.deleteOne({ _id: team._id });
    res.json({ message: 'Team deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error deleting team' });
  }
};

/**
 * Return the most recent scan event for the specified team.
 * Only members of the team may query this endpoint.
 */
exports.getLastScan = async (req, res) => {
  try {
    // Ensure the requesting player belongs to the team they are asking about
    if (!req.user.team || req.user.team.toString() !== req.params.teamId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Look up the newest Scan document for this team
    const scan = await Scan.findOne({ team: req.params.teamId })
      .sort({ createdAt: -1 })
      // Only fetch the user's name to minimise data transfer
      .populate('user', 'name');

    if (!scan) return res.json(null);

    // Determine the title of the scanned item depending on its type
    let title = '';
    // We'll also need the id of the scanned item so the client can link to it
    const itemId = scan.itemId.toString();
    if (scan.itemType === 'clue') {
      const clue = await Clue.findById(scan.itemId).select('title');
      title = clue ? clue.title : '';
    } else if (scan.itemType === 'question') {
      const q = await Question.findById(scan.itemId).select('title');
      title = q ? q.title : '';
    } else if (scan.itemType === 'sidequest') {
      const sq = await SideQuest.findById(scan.itemId).select('title');
      title = sq ? sq.title : '';
    } else if (scan.itemType === 'player') {
      const user = await User.findById(scan.itemId).select('name');
      title = user ? user.name : '';
    }

    // Return metadata about the last scan so the dashboard can link to it
    res.json({
      title,
      itemId,
      itemType: scan.itemType,
      scannedAt: scan.createdAt,
      scannedBy: scan.user ? { id: scan.user._id, name: scan.user.name } : null
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching last scan' });
  }
};
