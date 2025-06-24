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
//      - firstName          (string)
//      - lastName           (string)
//      - isNewTeam          ("true" or "false")
//      - teamName           (string)
//      - creatorFirstName   (string)
//      - selfie             (file upload, maxCount:1)
//      - teamPhoto          (file upload, maxCount:1) [only if isNewTeam === "true"]
exports.onboard = async (req, res) => {
  try {
    // The client now provides first and last names separately. Older
    // implementations sent a single `name` string.
    const { firstName, lastName, teamName, creatorFirstName, isNewTeam } = req.body;

    // Basic validation
    if (!firstName || !lastName || !teamName) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    if (isNewTeam !== 'true' && !creatorFirstName) {
      return res.status(400).json({ message: 'Missing team creator name' });
    }

    let team;

    // (A) Creating a new team?
    if (isNewTeam === 'true') {
      // 1) Ensure the team name is not already taken
      const existingTeam = await Team.findOne({ name: teamName });
      if (existingTeam) {
        return res.status(400).json({ message: 'Team name already taken' });
      }
      // 2) Save the uploaded team photo file (if present)
      let teamPhotoUrl = '';
      if (req.files && req.files.teamPhoto && req.files.teamPhoto.length > 0) {
        teamPhotoUrl = '/uploads/' + req.files.teamPhoto[0].filename;
      }

      // 3) Create the Team document and store the creator's first name in lowercase
      team = await Team.create({
        name: teamName,
        creatorFirstName: firstName.trim().toLowerCase(),
        photoUrl: teamPhotoUrl,
        members: []  // we'll push the creator below
      });
    }
    // (B) Joining an existing team?
    else {
      team = await Team.findOne({ name: teamName });
      if (!team) {
        return res.status(400).json({ message: 'Team not found' });
      }
      // Validate creator's first name matches (case-insensitive)
      if (team.creatorFirstName.toLowerCase() !== creatorFirstName.trim().toLowerCase()) {
        return res.status(400).json({ message: 'Incorrect team creator name' });
      }
    }

    // 2a) Save the user’s selfie (if provided)
    let selfieUrl = '';
    if (req.files && req.files.selfie && req.files.selfie.length > 0) {
      selfieUrl = '/uploads/' + req.files.selfie[0].filename;
    }

    // 2b) Create the User document, linking to this team. Username is first
    // name + first letter of the last name. We hash the last name and store it
    // as the player's password so it is never revealed elsewhere.
    const username = `${firstName.trim()}${lastName.trim()[0]}`.toLowerCase();
    const hashedPw = await bcrypt.hash(lastName, 10);
    const fullName = firstName.trim();

    // 2c) Create the User document
    const user = await User.create({
      name: fullName,
      firstName,
      username,
      password: hashedPw,
      photoUrl: selfieUrl,
      team: team._id,
      isAdmin: isNewTeam === 'true'  // mark as admin if they created the team
    });

    // 2d) Add the user to the team's members list
    team.members.push({ name: user.name, avatarUrl: selfieUrl });
    await team.save();

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
