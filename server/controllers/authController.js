const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Team = require('../models/Team');

exports.register = async (req, res) => {
  // (We’re using onboard instead; can leave blank or return 404)
  return res.status(501).json({ message: 'Use /api/onboard instead' });
};

exports.login = async (req, res) => {
  // Extract submitted credentials. Last name acts as the player's password
  // and is compared against the stored hash below.
  const { firstName, lastName, teamName, creatorFirstName } = req.body;

  // 1) Basic validation of required fields
  if (!firstName || !lastName || !teamName || !creatorFirstName) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    // 2) Look up the team by name
    const team = await Team.findOne({ name: teamName });
    if (!team) {
      return res.status(400).json({ message: 'Team not found' });
    }

    // 3) Verify the provided creator name matches the one stored on the team
    if (team.creatorFirstName.toLowerCase() !== creatorFirstName.trim().toLowerCase()) {
      return res.status(400).json({ message: 'Incorrect team creator name' });
    }

    // 4) Find the user within this team using first and last name
    // Build the derived username and locate the corresponding player record
    const username = `${firstName.trim()}${lastName.trim()[0]}`.toLowerCase();
    const user = await User.findOne({ username, team: team._id });
    if (!user) {
      return res.status(400).json({ message: 'Player not found' });
    }

    // Last name is hashed when the user is created, so compare the provided
    // surname with the stored hash
    const pwMatch = await bcrypt.compare(lastName, user.password);
    if (!pwMatch) {
      return res.status(400).json({ message: 'Incorrect password' });
    }

    // 5) Issue a JWT containing the user id
    const payload = { id: user._id };
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: '7d'
    });

    // 6) Return token and minimal user info (same as onboarding response)
    return res.json({
      token,
      user: {
        name: user.name,
        team: team._id,
        isAdmin: user.isAdmin
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ message: 'Server error during login' });
  }
};
