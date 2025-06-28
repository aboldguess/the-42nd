const Team = require('../models/Team');
const Scan = require('../models/Scan');
const Clue = require('../models/Clue');
const Question = require('../models/Question');
const SideQuest = require('../models/SideQuest');
const User = require('../models/User');
const Settings = require('../models/Settings');

// Build a simple scoreboard summarizing each team's progress.
exports.getScoreboard = async (req, res) => {
  try {
    // Load teams along with progress logs and global scoring settings
    const [teams, settings] = await Promise.all([
      Team.find().populate('sideQuestProgress.sideQuest', 'title'),
      Settings.findOne()
    ]);

    const x = settings?.scorePerCorrect || 1;
    const y = settings?.scorePerSideQuest || 1;
    const z = settings?.scorePerCreatedQuest || 1;

    const board = await Promise.all(
      teams.map(async (t) => {
        // Count solved clues stored directly on the team
        const correctAnswers = t.completedClues ? t.completedClues.length : 0;
        const sideQuestsCompleted = t.sideQuestProgress
          ? t.sideQuestProgress.length
          : 0;

        // Distinct scanned question and side quest IDs for this team
        const [questionIds, sqScanIds] = await Promise.all([
          Scan.distinct('itemId', { team: t._id, itemType: 'question' }),
          Scan.distinct('itemId', { team: t._id, itemType: 'sidequest' })
        ]);

        // Side quests created by any member of the team
        const users = await User.find({ team: t._id }).select('_id');
        const createdCount = await SideQuest.countDocuments({
          createdBy: { $in: users.map((u) => u._id) },
          createdByType: 'User'
        });

        const score =
          x * correctAnswers + y * sideQuestsCompleted + z * createdCount;

        return {
          teamId: t._id,
          name: t.name,
          photoUrl: t.photoUrl,
          questionsFound: questionIds.length,
          correctAnswers,
          sideQuestsFound: sqScanIds.length,
          sideQuestsCompleted,
          sideQuestsCreated: createdCount,
          score
        };
      })
    );

    // Order by score descending
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

