const SideQuest = require('../models/SideQuest');
const Team = require('../models/Team');
const User = require('../models/User');
const { recordScan } = require('./scan');
const { createNotification } = require('./notifications');

/**
 * When a player scans a clue/question/player QR code, check whether any
 * bonus side quests target that item. If so, mark the quest complete for
 * the player's team and notify the quest creator.
 */
async function checkBonusQuestCompletion(itemId, user) {
  try {
    if (!user) return;
    const quests = await SideQuest.find({
      questType: 'bonus',
      targetId: itemId,
      active: true
    });
    if (!quests.length) return;

    const team = await Team.findById(user.team);
    if (!team) return;

    for (const sq of quests) {
      const already = team.sideQuestProgress.some(p =>
        p.sideQuest.toString() === sq._id.toString()
      );
      if (already) continue;

      // Record completion in the team's progress log
      team.sideQuestProgress.push({
        sideQuest: sq._id,
        completedAt: new Date(),
        scannedBy: user._id
      });
      await team.save();

      // Record a SOLVED scan for progress stats
      await recordScan('sidequest', sq._id, user, 'SOLVED!', sq.title);

      // Notify the quest creator's team if different
      if (sq.createdByType === 'User') {
        const creator = await User.findById(sq.createdBy);
        if (creator && creator.team && !creator.team.equals(team._id)) {
          const creatorTeam = await Team.findById(creator.team);
          if (creatorTeam) {
            const members = await User.find({ team: creatorTeam._id });
            for (const m of members) {
              if (m.notificationPrefs?.sideQuestCompleted) {
                await createNotification({
                  user: m._id,
                  actor: team,
                  message: `${team.name} completed your side quest "${sq.title}".`,
                  link: `/sidequest/${sq._id}`
                });
              }
            }
          }
        }
      }
    }
  } catch (err) {
    console.error('Error checking bonus quest completion:', err);
  }
}

module.exports = { checkBonusQuestCompletion };
