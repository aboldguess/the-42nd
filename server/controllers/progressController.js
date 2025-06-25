const Team = require('../models/Team');

// Build a simple scoreboard summarizing each team's progress.
exports.getScoreboard = async (req, res) => {
  try {
    // Fetch all teams with their side quest progress populated for counts
    const teams = await Team.find().populate('sideQuestProgress.sideQuest', 'title');

    // Map to a summary object for easier consumption by the client
    const board = teams.map(t => {
      // completedClues holds ObjectIds, so length gives total solved clue count
      const clues = t.completedClues ? t.completedClues.length : 0;
      const quests = t.sideQuestProgress ? t.sideQuestProgress.length : 0;
      return {
        teamId: t._id,
        name: t.name,
        completedClues: clues,
        completedSideQuests: quests,
        score: clues + quests
      };
    });
    // Highest score first then return
    const sorted = board.sort((a, b) => b.score - a.score);

    res.json(sorted);
  } catch (err) {
    console.error('Error building scoreboard:', err);
    res.status(500).json({ message: 'Error building scoreboard' });
  }
};

