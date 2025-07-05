const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  gameName: { type: String, default: 'Treasure Hunt' },
  qrBaseUrl: { type: String, default: 'http://localhost:3000' },
  theme: {
    primary: { type: String, default: '#007AFF' },
    secondary: { type: String, default: '#5856D6' }
  },
  // Optional logo and favicon paths served from /uploads
  logoUrl: String,
  faviconUrl: String,
  // Placeholder image shown in the admin gallery instead of selfies/usies
  placeholderUrl: String,
  // Global font family applied to the UI
  fontFamily: {
    type: String,
    default:
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
  },
  neumorphicShadows: { type: Boolean, default: true },
  roundedCorners: { type: Boolean, default: true },
  // Multipliers used by the scoreboard calculation
  scorePerCorrect: { type: Number, default: 10 },
  scorePerSideQuest: { type: Number, default: 5 },
  scorePerCreatedQuest: { type: Number, default: 20 },
  // Number of minutes teams must wait before changing a trivia answer
  questionAnswerCooldown: { type: Number, default: 0 },
  // HTML string displayed on the /help page. Can be edited by admins
  helpText: {
    type: String,
    default: `<h2>Help & Quick Start</h2>
<p>Treasure Hunt is a team based scavenger hunt. Sign up with your first and last name and either create a new team or join an existing one.</p>
<h3>Quick Start</h3>
<ol>
<li>Sign up or log in from the home page.</li>
<li>Create a team or join one using another player's last name.</li>
<li>Check your Dashboard to see your current clue.</li>
<li>Scan QR codes around the venue to reveal questions.</li>
<li>Submit answers and move on to the next clue!</li>
</ol>
<h3>Features</h3>
<ul>
<li><strong>Dashboard</strong> – overview of your team and progress.</li>
<li><strong>Questions & Clues</strong> – solve riddles to advance.</li>
<li><strong>Sidequests</strong> – optional tasks for extra points.</li>
<li><strong>Players & Teams</strong> – browse all participants.</li>
<li><strong>Scoreboard</strong> – see who's leading the hunt.</li>
<li><strong>Kudos</strong> – vote for players in fun categories.</li>
<li><strong>Rogues Gallery</strong> – view and react to uploaded photos from sidequest submissions.</li>
<li><strong>Progress</strong> – track which questions, clues and sidequests you've completed.</li>
<li><strong>Profile</strong> – manage your selfie, team colours and other personal details.</li>
</ul>
<p>The site works great as a Progressive Web App. Add it to your home screen to play offline and receive notifications when new clues appear.</p>`
  },
  // Default instructions shown for each side quest type. Admins can
  // customise these strings from the new instructions settings screen.
  sideQuestInstructions: {
    bonus: {
      type: String,
      default: 'Scan the correct QR code to complete this bonus quest.'
    },
    meetup: {
      type: String,
      default: 'Meet at the specified location and snap a group photo.'
    },
    photo: {
      type: String,
      default: 'Upload a photo proving you completed the challenge.'
    },
    race: {
      type: String,
      default:
        'Race against the clock! Upload your proof before the timer expires.'
    },
    passcode: {
      type: String,
      default: 'Enter the secret passcode along with your photo.'
    },
    trivia: {
      type: String,
      default:
        'Answer the trivia question correctly then upload your photo evidence.'
    }
  },
  // Flags to hide specific quest types from player creation/edit screens.
  // When true, the type can only be created by admins via the dashboard.
  sideQuestAdminOnly: {
    bonus: { type: Boolean, default: false },
    meetup: { type: Boolean, default: false },
    photo: { type: Boolean, default: false },
    race: { type: Boolean, default: false },
    passcode: { type: Boolean, default: false },
    trivia: { type: Boolean, default: false }
  }
});

module.exports = mongoose.model('Settings', settingsSchema);
