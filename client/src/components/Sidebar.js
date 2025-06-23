import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function Sidebar() {
  const location = useLocation();

  const token = localStorage.getItem('token');        // player token
  const adminToken = localStorage.getItem('adminToken'); // admin token

  // Helper to render a menu link and bold it when active
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
    // "mobile-hide" class is hidden under 600 px (see index.css note below)
    <aside className="sidebar mobile-hide">
      {/* Always‑visible home */}
      {renderLink('/', 'Home')}

      {/* Player‑only links */}
      {token && (
        <>
          {renderLink('/dashboard', 'Dashboard')}
          {renderLink('/clue/1', 'Hunt')}
          {renderLink('/sidequests', 'Side Quests')}
          {renderLink('/roguery', 'Gallery')}
          {renderLink('/scoreboard', 'Scoreboard')}
          {renderLink('/profile', 'Profile')}
        </>
      )}

      {/* Admin‑only links */}
      {adminToken && (
        <>
          {renderLink('/admin/dashboard', 'Admin Home')}
          {renderLink('/admin/clues', 'Clues')}
          {renderLink('/admin/sidequests', 'Side Quests')}
          {renderLink('/admin/players', 'Players')}
        </>
      )}
    </aside>
  );
}
