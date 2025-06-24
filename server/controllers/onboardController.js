// server/controllers/onboardController.js

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Team = require('../models/Team');
const User = require('../models/User');
// Model used to record all uploaded media files for the rogues gallery
const Media = require('../models/Media');

// 1) GET /api/onboard/teams
//    Return an array of { _id, name } for each existing team. This endpoint
//    is largely kept for backwards compatibility but is no longer used by the
//    simplified onboarding flow.
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
//      - firstName        (string)
//      - lastName         (string)
//      - isNewTeam        ("true" or "false")
//      - leaderFirstName  (string) required when joining a team
//      - selfie           (file upload, maxCount:1)
//      - teamPhoto        (file upload, maxCount:1) [only when creating a team]
exports.onboard = async (req, res) => {
  try {
    // The client now provides first and last names separately. Older
    // implementations sent a single `name` string.
    const { firstName, lastName, isNewTeam, leaderFirstName } = req.body;

    // Basic validation
    // Only the player's name is required. If joining an existing team the
    // leader's first name must also be provided so we know which team to add
    // them to.
    if (!firstName || !lastName || (isNewTeam !== 'true' && !leaderFirstName)) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    let team;

    // (A) Creating a new team?
    if (isNewTeam === 'true') {
      // 1) The simplified flow no longer asks for a team name or password.
      //    Generate a unique placeholder name and password internally.
      const generatedName = `team-${Date.now()}`;
      const hashed = await bcrypt.hash(generatedName, 10);

      // 2) Save the uploaded team photo file (if present)
      let teamPhotoUrl = '';
      if (req.files && req.files.teamPhoto && req.files.teamPhoto.length > 0) {
        teamPhotoUrl = '/uploads/' + req.files.teamPhoto[0].filename;
      }

      // 3) Create the Team document
      team = await Team.create({
        // Name/password are essentially hidden from the user so the schema
        // requirements are satisfied
        name: generatedName,
        password: hashed,
        photoUrl: teamPhotoUrl,
        members: []  // we’ll push the creator below
      });
    }
    // (B) Joining an existing team?
    else {
      // Look up the leader by first name and then retrieve their team
      const leader = await User.findOne({
        firstName: leaderFirstName,
        isAdmin: true
      });
      if (!leader) {
        return res.status(400).json({ message: 'Team not found' });
      }
      team = await Team.findOne({ leader: leader._id });
      if (!team) {
        return res.status(400).json({ message: 'Team not found' });
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

    // 2d) Record any uploaded media so it appears in the rogues gallery
    if (selfieUrl) {
      await Media.create({
        url: selfieUrl,
        uploadedBy: user._id,
        uploadedByModel: 'User',
        team: team._id,
        type: 'profile',
        tag: 'selfie'
      });
    }

    // 2e) If we just created a new team, add the creator as a member
    // and log the team photo if one was provided
    if (isNewTeam === 'true') {
      team.members.push({ name: user.name, avatarUrl: selfieUrl });
      // Record the creator as the team leader for future authorization
      team.leader = user._id;
      await team.save();

      if (team.photoUrl) {
        await Media.create({
          url: team.photoUrl,
          uploadedBy: user._id,
          uploadedByModel: 'User',
          team: team._id,
          type: 'profile',
          tag: 'team_photo'
        });
      }
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
