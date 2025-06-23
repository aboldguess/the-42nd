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

(async function seedAdmin() {
  try {
    const username = process.env.ADMIN_USERNAME;
    const password = process.env.ADMIN_PASSWORD;
    if (username && password) {
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

app.use(cors());
app.use(express.json());

// Serve uploaded files from /uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Main API entry for handling clues
// Historically the router lived at `routes/cluesWithSlug` but was renamed to
// `routes/clues`. New installs include a compatibility stub so that requiring
// `cluesWithSlug` still works. However, older checkouts might lack that file,
// so we gracefully fall back to the modern path if the old module is missing.
let cluesRouter;
try {
  // Prefer the legacy path to support deployments expecting it
  cluesRouter = require('./routes/cluesWithSlug');
} catch (err) {
  // If the legacy file doesn't exist, use the current router
  cluesRouter = require('./routes/clues');
}
app.use('/api', cluesRouter);
// Onboarding and authentication routes for players
app.use('/api/onboard', require('./routes/onboard'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/teams', require('./routes/teams'));
app.use('/api/clues', require('./routes/clues'));
app.use('/api/sidequests', require('./routes/sidequests'));
app.use('/api/roguery', require('./routes/roguery'));

// Public scoreboard route
app.use('/api/scoreboard', require('./routes/scoreboard'));

// ——— NEW ADMIN AUTH ROUTE ———
app.use('/api/admin/auth', require('./routes/adminAuth'));

// ——— ALL ADMIN‐PROTECTED ROUTES ———
app.use('/api/admin', require('./routes/admin'));
app.use('/api/admin/games',  require('./routes/admin/games'));
app.use('/api/admin/clues',  require('./routes/admin/clues'));
app.use('/api/admin/sidequests',  require('./routes/admin/sidequests'));
// CRUD endpoints for question management
app.use('/api/admin/questions',  require('./routes/admin/questions'));
app.use('/api/admin/players',  require('./routes/admin/players'));
app.use('/api/admin/scoreboard', require('./routes/admin/scoreboard'));

// (If serving React in production, keep these lines. For local dev they can remain commented.)
// app.use(express.static(path.join(__dirname, '../client/build')));
// app.get('*', (req, res) => {
//   res.sendFile(path.join(__dirname, '../client/build/index.html'));
// });

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
