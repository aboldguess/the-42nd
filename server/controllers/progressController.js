const Team = require('../models/Team');

// Build a simple scoreboard summarizing each team's progress.
exports.getScoreboard = async (req, res) => {
  try {
    // Fetch all teams with their side quest progress populated for counts
    const teams = await Team.find().populate('sideQuestProgress.sideQuest', 'title');

    // Map to a summary object for easier consumption by the client
    const board = teams.map(t => ({
      teamId: t._id,
      name: t.name,
      completedClues: t.completedClues.length,
      completedSideQuests: t.sideQuestProgress.length,
      score: t.completedClues.length + t.sideQuestProgress.length
    }))
    // Highest score first
    .sort((a, b) => b.score - a.score);

    res.json(board);
  } catch (err) {
    console.error('Error building scoreboard:', err);
    res.status(500).json({ message: 'Error building scoreboard' });
  }
};

