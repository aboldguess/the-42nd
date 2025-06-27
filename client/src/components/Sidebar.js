import React from 'react';
import { Link, useLocation } from 'react-router-dom';

// Sidebar navigation shown on the left. Links are displayed differently
// depending on whether the user is a regular player or an admin.

export default function Sidebar() {
  const location = useLocation();

  // Presence of tokens tells us what role the user has. Only
  // logged-in players can see the player menu, while admins see
  // the admin links below.
  const token = localStorage.getItem('token'); // player token
  const adminToken = localStorage.getItem('adminToken'); // admin token

  // Helper to render a menu link. The link is bold when the
  // current URL starts with the "to" path, making it clear
  // which section is currently viewed.
  const renderLink = (to, label) => (
    <Link
      to={to}
      style={{
        fontWeight: location.pathname.startsWith(to) ? 'bold' : 'normal',
        color: '#fff',
        display: 'block',
        marginBottom: '0.75rem',
        textDecoration: 'none'
      }}
    >
      {label}
    </Link>
  );

  return (
    // "mobile-hide" class hides this sidebar on small screens. Users
    // can toggle it with the hamburger menu in the navbar.
    <aside className="sidebar mobile-hide">
      {/* Always‑visible home */}
      {renderLink('/', 'Home')}

      {/* Player‑only links */}
      {token && (
        <>
          {/* Progress overview for the current team */}
          {renderLink('/dashboard', 'Dashboard')}
          {/* Lists of discovered tasks */}
          {renderLink('/questions', 'Questions')}
          {renderLink('/clues', 'Clues')}
          {renderLink('/sidequests', 'Sidequests')}
          {/* Rosters */}
          {renderLink('/players', 'Players')}
          {renderLink('/teams', 'Teams')}
          {/* Current standings */}
          {renderLink('/scoreboard', 'Scoreboard')}
          {/* Photo gallery where players can see uploads */}
          {renderLink('/roguery', 'Gallery')}
          {/* Edit your profile and preferences */}
          {renderLink('/profile', 'Player Settings')}
        </>
      )}

      {/* Admin‑only links used for managing the game */}
      {adminToken && (
        <>
          {renderLink('/admin/dashboard', 'Admin Home')}
          {renderLink('/admin/clues', 'Clues')}
          {renderLink('/admin/questions', 'Questions')}
          {renderLink('/admin/sidequests', 'Side Quests')}
          {renderLink('/admin/players', 'Players')}
          {renderLink('/admin/teams', 'Teams')}
          {renderLink('/admin/gallery', 'Gallery')}
          {renderLink('/admin/settings', 'Settings')}
        </>
      )}
    </aside>
  );
}
