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
        color: 'var(--text-color)',
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
      {/* Player‑only links */}
      {token && (
        <>
          {renderLink('/dashboard', 'Dashboard')}
          {renderLink('/progress/questions', 'Questions')}
          {renderLink('/progress/clues', 'Clues')}
          {renderLink('/progress/sidequests', 'Sidequests')}
          {renderLink('/players', 'Players')}
          {renderLink('/teams', 'Teams')}
          {renderLink('/scoreboard', 'Scoreboard')}
          {renderLink('/kudos', 'Kudos')}
          {renderLink('/roguery', 'Gallery')}
          {renderLink('/help', 'Help')}
        </>
      )}

      {/* Admin‑only links */}
      {adminToken && (
        <>
          {renderLink('/admin/dashboard', 'Admin Home')}
          {renderLink('/admin/clues', 'Clues')}
          {renderLink('/admin/questions', 'Questions')}
          {renderLink('/admin/sidequests', 'Side Quests')}
          {renderLink('/admin/players', 'Players')}
          {renderLink('/admin/teams', 'Teams')}
          {renderLink('/admin/kudos', 'Kudos')}
          {renderLink('/admin/gallery', 'Gallery')}
          {renderLink('/admin/settings', 'Settings')}
          {renderLink('/admin/sidequest-config', 'SideQuest Config')}
        </>
      )}
      {/* Provide a link for admins to sign in */}
      {renderLink('/admin/login', 'Admin Login')}
    </aside>
  );
}
