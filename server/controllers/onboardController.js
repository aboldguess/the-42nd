// server/controllers/onboardController.js

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Team = require('../models/Team');
const User = require('../models/User');

// 1) GET /api/onboard/teams
//    Return an array of { _id, name } for each existing team.
exports.getTeamsList = async (req, res) => {
  try {
    const teams = await Team.find().select('name');
    return res.json(teams);
  } catch (err) {
    console.error('Error fetching teams list:', err);
    return res.status(500).json({ message: 'Error fetching teams' });
  }
};

// 2) POST /api/onboard
//    Expects multipart/form-data with fields:
//      - firstName     (string)
//      - lastName      (string)
//      - isNewTeam     ("true" or "false")
//      - teamName      (string)
//      - teamPassword  (string)
//      - selfie        (file upload, maxCount:1)
//      - teamPhoto     (file upload, maxCount:1) [only if isNewTeam === "true"]
exports.onboard = async (req, res) => {
  try {
    // The client now provides first and last names separately. Older
    // implementations sent a single `name` string.
    const { firstName, lastName, teamName, teamPassword, isNewTeam } = req.body;

    // Basic validation
    if (!firstName || !lastName || !teamName || !teamPassword) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    let team;

    // (A) Creating a new team?
    if (isNewTeam === 'true') {
      // 1) Ensure the team name is not already taken
      const existingTeam = await Team.findOne({ name: teamName });
      if (existingTeam) {
        return res.status(400).json({ message: 'Team name already taken' });
      }

      // 2) Hash the submitted team password
      const hashed = await bcrypt.hash(teamPassword, 10);

      // 3) Save the uploaded team photo file (if present)
      let teamPhotoUrl = '';
      if (req.files && req.files.teamPhoto && req.files.teamPhoto.length > 0) {
        teamPhotoUrl = '/uploads/' + req.files.teamPhoto[0].filename;
      }

      // 4) Create the Team document
      team = await Team.create({
        name: teamName,
        password: hashed,
        photoUrl: teamPhotoUrl,
        members: []  // we’ll push the creator below
      });
    }
    // (B) Joining an existing team?
    else {
      team = await Team.findOne({ name: teamName });
      if (!team) {
        return res.status(400).json({ message: 'Team not found' });
      }
      // Compare submitted password to stored hash
      const match = await bcrypt.compare(teamPassword, team.password);
      if (!match) {
        return res.status(400).json({ message: 'Incorrect team password' });
      }
    }

    // 2a) Save the user’s selfie (if provided)
    let selfieUrl = '';
    if (req.files && req.files.selfie && req.files.selfie.length > 0) {
      selfieUrl = '/uploads/' + req.files.selfie[0].filename;
    }

    // 2b) Combine provided names into a single `name` field for backwards
    // compatibility with older parts of the codebase which expect `user.name`.
    const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();

    // 2c) Create the User document, linking to this team
    const user = await User.create({
      name: fullName,
      firstName,
      lastName,
      photoUrl: selfieUrl,
      team: team._id,
      isAdmin: isNewTeam === 'true'  // mark as admin if they created the team
    });

    // 2d) If we just created a new team, put this user in team.members
    if (isNewTeam === 'true') {
      team.members.push({ name: user.name, avatarUrl: selfieUrl });
      await team.save();
    }

    // 3) Issue a JWT that the client will store in localStorage
    const payload = { id: user._id };
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: '7d'
    });

    // 4) Return token + minimal user info
    return res.status(201).json({
      token,
      user: {
        name: user.name,
        team: team._id,
        isAdmin: user.isAdmin
      }
    });
  } catch (err) {
    console.error('Onboard error:', err);
    return res.status(500).json({ message: 'Server error during onboarding' });
  }
};
