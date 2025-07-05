// server/server.js

const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
const connectDB = require('./config/db');

const app = express();
connectDB();

// ————— Seed the default Admin from env (if not present) —————
const Admin = require('./models/Admin');
const bcrypt = require('bcryptjs');
const Settings = require('./models/Settings');

(async function seedAdmin() {
  try {
    const username = process.env.ADMIN_USERNAME?.toLowerCase();
    const password = process.env.ADMIN_PASSWORD?.toLowerCase();
    if (username && password) {
      // Store admin credentials in lowercase to keep them case-insensitive
      const exists = await Admin.findOne({ username });
      if (!exists) {
        const hash = await bcrypt.hash(password, 10);
        await Admin.create({ username, password: hash });
        console.log(`Seeded default admin: ${username}`);
      }
    }
  } catch (err) {
    console.error('Error seeding admin user:', err);
  }
})();

// Seed default settings document if none exists
(async function seedSettings() {
  try {
    const count = await Settings.countDocuments();
    if (count === 0) {
      await Settings.create({
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
        theme: { primary: '#007AFF', secondary: '#5856D6' },
        placeholderUrl: '',
        scorePerCorrect: 10,
        scorePerSideQuest: 5,
        scorePerCreatedQuest: 20,
        helpText:
          '<h2>Help & Quick Start</h2><p>Treasure Hunt is a team based scavenger hunt. Sign up with your first and last name and either create a new team or join an existing one.</p><h3>Quick Start</h3><ol><li>Sign up or log in from the home page.</li><li>Create a team or join one using another player\'s last name.</li><li>Check your Dashboard to see your current clue.</li><li>Scan QR codes around the venue to reveal questions.</li><li>Submit answers and move on to the next clue!</li></ol><h3>Features</h3><ul><li><strong>Dashboard</strong> – overview of your team and progress.</li><li><strong>Questions & Clues</strong> – solve riddles to advance.</li><li><strong>Sidequests</strong> – optional tasks for extra points.</li><li><strong>Players & Teams</strong> – browse all participants.</li><li><strong>Scoreboard</strong> – see who\'s leading the hunt.</li><li><strong>Kudos</strong> – vote for players in fun categories.</li><li><strong>Rogues Gallery</strong> – view and react to uploaded photos from sidequest submissions.</li><li><strong>Progress</strong> – track which questions, clues and sidequests you\'ve completed.</li><li><strong>Profile</strong> – manage your selfie, team colours and other personal details.</li></ul><p>The site works great as a Progressive Web App. Add it to your home screen to play offline and receive notifications when new clues appear.</p>'
      });
      console.log('Seeded default settings');
    }
  } catch (err) {
    console.error('Error seeding settings:', err);
  }
})();

app.use(cors());
app.use(express.json());

// Serve uploaded files from /uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Main API routes for clues. All requests assume a single game instance.
app.use('/api', require('./routes/clues'));
// Onboarding and authentication routes for players
app.use('/api/onboard', require('./routes/onboard'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/teams', require('./routes/teams'));
app.use('/api/sidequests', require('./routes/sidequests'));
app.use('/api/roguery', require('./routes/roguery'));
// Players can react to rogues gallery items with emojis
app.use('/api/reactions', require('./routes/reactions'));
// Notifications for players and teams
app.use('/api/notifications', require('./routes/notifications'));
// Comment walls for player and team profiles
app.use('/api/wall', require('./routes/wall'));
app.use('/api', require('./routes/question'));
app.use('/api', require('./routes/sidequest'));
// Player progress routes
app.use('/api/progress', require('./routes/progress'));

// Public settings route
app.use('/api/settings', require('./routes/settings'));

// Public scoreboard route
app.use('/api/scoreboard', require('./routes/scoreboard'));
// Kudos voting and categories
app.use('/api/kudos', require('./routes/kudos'));

// ——— NEW ADMIN AUTH ROUTE ———
app.use('/api/admin/auth', require('./routes/adminAuth'));

// ——— ALL ADMIN‐PROTECTED ROUTES ———
app.use('/api/admin', require('./routes/admin'));
app.use('/api/admin/clues',  require('./routes/admin/clues'));
app.use('/api/admin/sidequests',  require('./routes/admin/sidequests'));
// CRUD endpoints for question management
app.use('/api/admin/questions',  require('./routes/admin/questions'));
app.use('/api/admin/players',  require('./routes/admin/players'));
app.use('/api/admin/teams',  require('./routes/admin/teams'));
app.use('/api/admin/scoreboard', require('./routes/admin/scoreboard'));
app.use('/api/admin/settings', require('./routes/admin/settings'));
app.use('/api/admin/kudos', require('./routes/admin/kudos'));
// Broadcast system notifications to all players
app.use('/api/admin/notifications', require('./routes/admin/notifications'));
// Route allowing admins to download all uploaded media as a zip
app.use('/api/admin/media', require('./routes/admin/media'));
// Admin gallery management
app.use('/api/admin/gallery', require('./routes/admin/gallery'));

// ---------------- Serve the React client in production -----------------
// When NODE_ENV=production the server will also host the compiled React
// assets so the entire app can be deployed from a single Express instance.
if (process.env.NODE_ENV === 'production') {
  // Serve static files generated by `npm run build`
  app.use(express.static(path.join(__dirname, '../client/build')));

  // For any other request, send back React's index.html file so that
  // client-side routing can handle the path.
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build/index.html'));
  });
}

const PORT = process.env.PORT || 5000;

// Export the Express app so integration tests can mount it without starting
// an actual HTTP server. When this file is executed directly we start
// listening on the configured port.
if (require.main === module) {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = app;
