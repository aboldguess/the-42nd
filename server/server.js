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
// Historically this server loaded `routes/cluesWithSlug`, which has since been
// renamed to `routes/clues`. We keep the old path for compatibility so that
// existing deployments or clones don't break if they still reference it.
// The file at `routes/cluesWithSlug` simply re-exports the modern router.
app.use('/api', require('./routes/cluesWithSlug'));
// Onboarding and authentication routes for players
app.use('/api/onboard', require('./routes/onboard'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/teams', require('./routes/teams'));
app.use('/api/clues', require('./routes/clues'));
app.use('/api/sidequests', require('./routes/sidequests'));
app.use('/api/roguery', require('./routes/roguery'));

// ——— NEW ADMIN AUTH ROUTE ———
app.use('/api/admin/auth', require('./routes/adminAuth'));

// ——— ALL ADMIN‐PROTECTED ROUTES ———
app.use('/api/admin', require('./routes/admin'));
app.use('/api/admin/games',  require('./routes/admin/games'));

// (If serving React in production, keep these lines. For local dev they can remain commented.)
// app.use(express.static(path.join(__dirname, '../client/build')));
// app.get('*', (req, res) => {
//   res.sendFile(path.join(__dirname, '../client/build/index.html'));
// });

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
