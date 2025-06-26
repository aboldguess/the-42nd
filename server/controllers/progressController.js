const Team = require('../models/Team');
const Scan = require('../models/Scan');
const Clue = require('../models/Clue');
const Question = require('../models/Question');
const SideQuest = require('../models/SideQuest');
const User = require('../models/User');
const Media = require('../models/Media');
const Settings = require('../models/Settings');

// Build a detailed scoreboard summarizing each team's progress.
exports.getScoreboard = async (req, res) => {
  try {
    // Pull weighting factors from the global settings document. Defaults
    // ensure a sensible score even if the settings have not been configured.
    const s = await Settings.findOne();
    const wCorrect = s?.scoreWeightCorrectAnswer || 1;
    const wCompleted = s?.scoreWeightSideQuestCompleted || 1;
    const wCreated = s?.scoreWeightSideQuestCreated || 1;

    // Fetch all teams so we can compile aggregate stats for each one.
    const teams = await Team.find().populate('sideQuestProgress.sideQuest', 'title');

    const board = [];

    for (const t of teams) {
      // Total number of questions scanned by this team
      const questionsFound = (
        await Scan.distinct('itemId', { team: t._id, itemType: 'question' })
      ).length;

      // Distinct side quests scanned
      const sidequestsFound = (
        await Scan.distinct('itemId', { team: t._id, itemType: 'sidequest' })
      ).length;

      const correctAnswers = t.completedClues ? t.completedClues.length : 0;
      const sidequestsCompleted = t.sideQuestProgress ? t.sideQuestProgress.length : 0;

      // IDs of all players on this team for lookup convenience
      const members = await User.find({ team: t._id }).select('_id');
      const memberIds = members.map((m) => m._id);

      // Count of quests created by team members
      const sidequestsCreated = await SideQuest.countDocuments({
        createdBy: { $in: memberIds },
        createdByType: 'User'
      });

      // Count of photos/videos uploaded by the team
      const photosUploaded = await Media.countDocuments({ team: t._id });

      const score =
        wCorrect * correctAnswers +
        wCompleted * sidequestsCompleted +
        wCreated * sidequestsCreated;

      board.push({
        teamId: t._id,
        name: t.name,
        photoUrl: t.photoUrl,
        questionsFound,
        correctAnswers,
        sidequestsFound,
        sidequestsCompleted,
        sidequestsCreated,
        photosUploaded,
        score
      });
    }

    // Highest score first
    board.sort((a, b) => b.score - a.score);

    res.json(board);
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

