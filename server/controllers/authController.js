const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Team = require('../models/Team');

exports.register = async (req, res) => {
  // (We’re using onboard instead; can leave blank or return 404)
  return res.status(501).json({ message: 'Use /api/onboard instead' });
};

exports.login = async (req, res) => {
  // Extract submitted credentials
  const { firstName, lastName } = req.body;

  // Convert credentials to a consistent case so authentication is
  // case-insensitive. Names are stored as originally entered, so we
  // perform the comparison using RegExp with the 'i' flag.
  const first = firstName?.trim();
  const last = lastName?.trim();

  // 1) Basic validation of required fields
  // Only the player's name is needed to authenticate. This assumes names are
  // unique across all teams.
  if (!firstName || !lastName) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    // 2) Find the user by name using a case-insensitive match
    const user = await User.findOne({
      firstName: new RegExp('^' + first + '$', 'i'),
      lastName: new RegExp('^' + last + '$', 'i')
    });
    if (!user) {
      return res.status(400).json({ message: 'Player not found' });
    }

    // 3) Load the user's team for the response
    const team = await Team.findById(user.team);

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
