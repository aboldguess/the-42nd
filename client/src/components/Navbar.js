import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Navbar() {
  const navigate = useNavigate();

  // Tokens for player and admin
  const token = localStorage.getItem('token');
  const adminToken = localStorage.getItem('adminToken');

  // Toggle sidebar on small screens
  const toggleSidebar = () => {
    const el = document.querySelector('.sidebar');
    if (el) {
      el.classList.toggle('mobile-hide');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('adminToken');
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="nav-left" style={{ display: 'flex', alignItems: 'center' }}>
        {/* Hamburger visible ≤600 px */}
        <button
          className="hamburger"
          aria-label="Menu"
          onClick={toggleSidebar}
        >
          &#9776;
        </button>
        <Link to="/">Treasure Hunt</Link>
      </div>

      <ul className="nav-right">
        {/* Admin link logic */}
        {!adminToken && (
          <li>
            <Link to="/admin/login">Admin</Link>
          </li>
        )}
        {adminToken && (
          <li>
            <Link to="/admin/dashboard">Admin Dashboard</Link>
          </li>
        )}

        {/* Player dashboard shortcut */}
        {token && (
          <li>
            <Link to="/dashboard">My Dashboard</Link>
          </li>
        )}

        {(token || adminToken) && (
          <li>
            <button onClick={handleLogout} className="btn-link">
              Log Out
            </button>
          </li>
        )}
      </ul>
    </nav>
  );
}
