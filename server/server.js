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
      await Settings.create({ fontFamily: 'Arial, sans-serif' });
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
app.use('/api', require('./routes/question'));
app.use('/api', require('./routes/sidequest'));

// Public settings route
app.use('/api/settings', require('./routes/settings'));

// Public scoreboard route
app.use('/api/scoreboard', require('./routes/scoreboard'));

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
// Route allowing admins to download all uploaded media as a zip
app.use('/api/admin/media', require('./routes/admin/media'));

// (If serving React in production, keep these lines. For local dev they can remain commented.)
// app.use(express.static(path.join(__dirname, '../client/build')));
// app.get('*', (req, res) => {
//   res.sendFile(path.join(__dirname, '../client/build/index.html'));
// });

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
