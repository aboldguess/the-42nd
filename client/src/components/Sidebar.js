import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function Sidebar() {
  const location = useLocation();
  const token = localStorage.getItem('token');

  // Hide the sidebar if the user is not authenticated
  if (!token) return null;

  // Helper to render a link and highlight it when active
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
    <aside className="sidebar">
      {renderLink('/dashboard', 'Dashboard')}
      {renderLink('/clue/1', 'Hunt')}
      {renderLink('/profile', 'Profile')}
      {renderLink('/sidequests', 'Side Quests')}
      {renderLink('/roguery', 'Rogues Gallery')}
      {renderLink('/admin', 'Admin')}
    </aside>
  );
}
