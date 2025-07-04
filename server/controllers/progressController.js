const Team = require('../models/Team');
const Scan = require('../models/Scan');
const Clue = require('../models/Clue');
const Question = require('../models/Question');
const SideQuest = require('../models/SideQuest');
const User = require('../models/User');
const Settings = require('../models/Settings');
const { createNotification } = require('../utils/notifications');

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
        // Count how many trivia questions the team answered correctly
        const answerIds = t.questionAnswers.map((qa) => qa.question);
        const questions = await Question.find({
          _id: { $in: answerIds }
        }).select('correctAnswer');
        const questionMap = new Map();
        questions.forEach((q) => {
          questionMap.set(q._id.toString(), q.correctAnswer);
        });
        const correctAnswers = t.questionAnswers.filter((qa) => {
          const correct = questionMap.get(qa.question.toString());
          return (
            correct &&
            qa.answer.trim().toLowerCase() === correct.trim().toLowerCase()
          );
        }).length;

        // Completed side quests stored directly on the team
        const sideQuestsCompleted = t.sideQuestProgress
          ? t.sideQuestProgress.length
          : 0;

        // Distinct scanned question and side quest IDs for this team
        const [scannedQuestionIds, sqScanIds] = await Promise.all([
          Scan.distinct('itemId', { team: t._id, itemType: 'question' }),
          Scan.distinct('itemId', { team: t._id, itemType: 'sidequest' })
        ]);

        // Side quests created by any member of the team
        const users = await User.find({ team: t._id }).select('_id notificationPrefs');
        const createdCount = await SideQuest.countDocuments({
          createdBy: { $in: users.map((u) => u._id) },
          createdByType: 'User'
        });

        const score =
          x * correctAnswers + y * sideQuestsCompleted + z * createdCount;

        return {
          // Keep the full team doc for rank updates and notifications
          team: t,
          users,
          // Data returned to the client
          entry: {
            teamId: t._id,
            name: t.name,
            photoUrl: t.photoUrl,
            questionsFound: scannedQuestionIds.length,
            correctAnswers,
            sideQuestsFound: sqScanIds.length,
            sideQuestsCompleted,
            sideQuestsCreated: createdCount,
            score
          }
        };
      })
    );

    // Order by score descending
    const sorted = board.sort((a, b) => b.entry.score - a.entry.score);

    // Compare each team's rank to their last stored rank and notify on changes
    for (let i = 0; i < sorted.length; i++) {
      const rank = i + 1;
      const { team, users } = sorted[i];
      if (team.lastRank !== rank) {
        // Send a notification to all members who opted in
        for (const u of users) {
          if (u.notificationPrefs?.leaderboard) {
            await createNotification({
              user: u._id,
              actor: team,
              message: `Your team is now ranked #${rank} on the leaderboard!`,
              // Link players directly to the scoreboard
              link: '/scoreboard'
            });
          }
        }
        team.lastRank = rank;
        await team.save();
      }
    }

    // Return only the scoreboard entries to the client
    res.json(sorted.map((b) => b.entry));
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
  if (!['clue', 'question', 'sidequest', 'player'].includes(type)) {
    return res.status(400).json({ message: 'Invalid item type' });
  }

  const Model =
    type === 'clue'
      ? Clue
      : type === 'question'
      ? Question
      : type === 'player'
      ? User
      : SideQuest;

  try {
    // Build the base query for the requested item type
    let query = Model.find();
    if (type === 'sidequest') {
      // Side quests should be ordered newest first
      query = query.sort({ createdAt: -1 }).populate('team', 'name');
    } else {
      // Other items keep the original ascending order
      query = query.sort({ createdAt: 1 });
      if (type === 'player') {
        // Players also show their team name
        query = query.populate('team', 'name');
      }
    }
    const [items, team] = await Promise.all([
      query,
      Team.findById(req.user.team).populate(
        'sideQuestProgress.scannedBy',
        'name'
      )
    ]);

    const data = await Promise.all(
      items.map(async (item) => {
        const scans = await Scan.find({ itemId: item._id, itemType: type })
          .populate('user', 'name')
          .populate('team', 'name')
          .sort({ createdAt: 1 });

        // Filter events to only those from the player's team.
        // Some scan records may lack a populated team, so check for it first.
        const teamEvents = scans.filter(
          (s) => s.team && s.team._id.toString() === req.user.team.toString()
        );

        // First scan by the team indicates who found it. Guard against missing user.
        const scannedBy =
          teamEvents.length && teamEvents[0].user ? teamEvents[0].user.name : null;

        // Determine progress state for the current player's team
        let status;
        if (type === 'sidequest') {
          if (!teamEvents.length) {
            status = 'NEW';
          } else if (teamEvents.some((e) => e.status === 'SOLVED!')) {
            status = 'DONE!';
          } else {
            status = 'INCOMPLETE';
          }
        } else {
          status = teamEvents.length ? teamEvents[teamEvents.length - 1].status : 'NOT FOUND';
        }

        const lastEvent = scans[scans.length - 1];
        // Last scan may not have a populated user if the user was removed.
        const lastScannedBy =
          lastEvent && lastEvent.user ? lastEvent.user.name : null;
        // Count unique players who scanned, ignoring any scans missing a user.
        const totalScans = new Set(
          scans.filter((s) => s.user).map((s) => s.user._id.toString())
        ).size;

        const title = item.title || item.name;
        // Check team completion details for side quests
        let completedAt = null;
        let completedBy = null;
        if (type === 'sidequest' && team) {
          const entry = team.sideQuestProgress.find(
            (p) => p.sideQuest.toString() === item._id.toString()
          );
          if (entry) {
            completedAt = entry.completedAt;
            completedBy = entry.scannedBy ? entry.scannedBy.name : null;
          }
        }
        return {
          _id: item._id,
          title,
          scannedBy,
          status,
          lastScannedBy,
          totalScans,
          // Display creator info when available
          setBy: item.setBy || '',
          teamName: item.team ? item.team.name : '',
          teamId: item.team ? item.team._id : '',
          // Used by the client to know when to link to the item page
          scanned: !!scannedBy,
          completedAt,
          completedBy
        };
      })
    );

    res.json(data);
  } catch (err) {
    console.error('Error fetching scan stats:', err);
    res.status(500).json({ message: 'Error fetching scan stats' });
  }
};

