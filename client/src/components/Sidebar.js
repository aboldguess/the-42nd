import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function Sidebar() {
  const location = useLocation();

  // Retrieve tokens from localStorage. If present we assume the user is
  // authenticated as a regular player or an admin respectively.
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


      {/* User section only shows when a player token is available */}
      {token && (
        <div className="sidebar-section">
          <h3>User</h3>
          {renderLink('/dashboard', 'Dashboard')}
          {renderLink('/clue/1', 'Hunt')}
          {renderLink('/sidequests', 'Side\u00A0Quests')}
          {renderLink('/roguery', 'Gallery')}
          {renderLink('/scoreboard', 'Scoreboard')}
          {renderLink('/profile', 'Profile')}
        </div>
      )}

      {/* Admin section is only visible for admin users */}
      {adminToken && (
        <div className="sidebar-section">
          <h3>Admin</h3>
          {renderLink('/admin/dashboard', 'Admin\u00A0Home')}
          {renderLink('/admin/clues', 'Clues')}
          {renderLink('/admin/questions', 'Questions')}
          {renderLink('/admin/sidequests', 'Side Quests')}
          {renderLink('/admin/players', 'Players')}
        </div>
      )}
    </aside>
  );
}
