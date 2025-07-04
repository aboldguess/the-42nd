// server/controllers/onboardController.js

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Team = require('../models/Team');
const User = require('../models/User');
// Model used to record all uploaded media files for the rogues gallery
const Media = require('../models/Media');
const { createThumbnail } = require('../utils/thumbnail');

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
//      - leaderLastName   (string) required when joining a team
//      - teamName         (string) required when creating a team
//      - selfie           (file upload, maxCount:1)          **required**
//      - teamPhoto        (file upload, maxCount:1) [required when creating]
exports.onboard = async (req, res) => {
  try {
    // The client now provides first and last names separately. Older
    // implementations sent a single `name` string.
    const { firstName, lastName, isNewTeam, leaderLastName, teamName } = req.body;
    // Trim leader last name once so we can perform a case-insensitive exact match
    const trimmedLeaderLastName = leaderLastName ? leaderLastName.trim() : '';
    // Escape regex metacharacters so special characters in the last name
    // are treated literally when building a case-insensitive expression.
    const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    // Basic validation
    // Only the player's name is required. When joining a team we also need the
    // leader's last name so we know which team to add them to.
    // When joining an existing team the leader's last name must be supplied
    if (!firstName || !lastName || (isNewTeam !== 'true' && !trimmedLeaderLastName)) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // A profile picture is mandatory for all users
    if (!req.files || !req.files.selfie || req.files.selfie.length === 0) {
      return res.status(400).json({ message: 'Profile picture is required' });
    }

    let team;

    // (A) Creating a new team?
    if (isNewTeam === 'true') {
      // Validate required fields for a new team
      if (!teamName) {
        return res.status(400).json({ message: 'Team name is required' });
      }
      if (!req.files.teamPhoto || req.files.teamPhoto.length === 0) {
        return res.status(400).json({ message: 'Team photo is required' });
      }
      if (await Team.findOne({ name: teamName })) {
        return res.status(400).json({ message: 'Team name already taken' });
      }

      // Hash a placeholder password since login doesn't use it
      const hashed = await bcrypt.hash(Date.now().toString(), 10);

      // Save the uploaded team photo file
      const teamPhotoUrl = '/uploads/' + req.files.teamPhoto[0].filename;

      // Create the Team document with the provided unique name
      team = await Team.create({
        name: teamName,
        password: hashed,
        photoUrl: teamPhotoUrl,
        members: [] // creator added below
      });
    }
    // (B) Joining an existing team?
    else {
      // Look up the leader by last name and then retrieve their team.
      // The comparison uses a case-insensitive regular expression so players
      // can enter "Smith", "smith" or even "SMITH" and still match.
      // Escape metacharacters to avoid treating characters like * or ? as regex
      // operators. We then build a case-insensitive exact match.
      const leader = await User.findOne({
        lastName: new RegExp(`^${escapeRegex(trimmedLeaderLastName)}$`, 'i'),
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
      const thumb = await createThumbnail(selfieUrl);
      await Media.create({
        url: selfieUrl,
        thumbnailUrl: thumb,
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
        const teamThumb = await createThumbnail(team.photoUrl);
        await Media.create({
          url: team.photoUrl,
          thumbnailUrl: teamThumb,
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
    // Handle common validation failures to provide clearer feedback
    if (err.code === 11000) {
      return res.status(400).json({ message: 'Team name already taken' });
    }
    if (err.message && err.message.includes('secret')) {
      return res.status(500).json({ message: 'Server configuration error' });
    }
    return res.status(500).json({ message: 'Server error during onboarding' });
  }
};
