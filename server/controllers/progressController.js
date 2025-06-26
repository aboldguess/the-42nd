const Team = require('../models/Team');
const Scan = require('../models/Scan');
const Clue = require('../models/Clue');
const Question = require('../models/Question');
const SideQuest = require('../models/SideQuest');
const User = require('../models/User');

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

/**
 * Return scan progress information for the requested item type.
 * Used by player tables listing clues/questions/side quests.
 */
exports.getItemScanStats = async (req, res) => {
  const { type } = req.params;
  if (!['clue', 'question', 'sidequest'].includes(type)) {
    return res.status(400).json({ message: 'Invalid item type' });
  }

  const Model = type === 'clue' ? Clue : type === 'question' ? Question : SideQuest;

  try {
    const items = await Model.find().sort({ createdAt: 1 });

    const data = await Promise.all(
      items.map(async (item) => {
        const scans = await Scan.find({ itemId: item._id, itemType: type })
          .populate('user', 'name')
          .populate('team', 'name')
          .sort({ createdAt: 1 });

        // Events from the player's own team
        const teamEvents = scans.filter(
          (s) => s.team._id.toString() === req.user.team.toString()
        );

        const scannedBy = teamEvents.length ? teamEvents[0].user.name : null;
        const status = teamEvents.length ? teamEvents[teamEvents.length - 1].status : 'NOT FOUND';

        const lastEvent = scans[scans.length - 1];
        const lastScannedBy = lastEvent ? lastEvent.user.name : null;
        const totalScans = new Set(scans.map((s) => s.user._id.toString())).size;

        return {
          _id: item._id,
          title: item.title,
          scannedBy,
          status,
          lastScannedBy,
          totalScans,
          // Used by the client to know when to link to the item page
          scanned: !!scannedBy
        };
      })
    );

    res.json(data);
  } catch (err) {
    console.error('Error fetching scan stats:', err);
    res.status(500).json({ message: 'Error fetching scan stats' });
  }
};

