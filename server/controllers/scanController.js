const Scan = require('../models/Scan');
const Team = require('../models/Team');

/**
 * Build summary info for an item showing scan statistics and completion data.
 */
exports.getItemSummary = async (req, res) => {
  const { type, id } = req.params;
  try {
    // Fetch all scans for the given item sorted by time so the last entry is easy to grab
    const scans = await Scan.find({ itemType: type, itemId: id })
      .populate('user', 'name')
      .populate('team', 'name')
      .sort({ createdAt: 1 });

    const firstPerTeam = {};
    scans.forEach((s) => {
      if (!firstPerTeam[s.team._id]) {
        firstPerTeam[s.team._id] = {
          team: s.team.name,
          user: s.user.name,
          time: s.createdAt
        };
      }
    });

    const last = scans[scans.length - 1];
    const uniqueUsers = new Set(scans.map((s) => s.user._id.toString())).size;

    // Determine which teams have completed the item
    const solvedQuery =
      type === 'clue'
        ? { completedClues: id }
        : { 'sideQuestProgress.sideQuest': id };
    const solvedTeams = await Team.find(solvedQuery).select('name');
    const solved = solvedTeams.map((t) => t.name);

    res.json({
      firstPerTeam,
      lastScanner: last
        ? { user: last.user.name, team: last.team.name, time: last.createdAt }
        : null,
      totalUniqueScanners: uniqueUsers,
      solved
    });
  } catch (err) {
    console.error('Error building scan summary:', err);
    res.status(500).json({ message: 'Error building scan summary' });
  }
};
