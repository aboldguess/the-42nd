import React, { useContext, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ThemeContext } from '../context/ThemeContext';
import { fetchMe } from '../services/api';

export default function Navbar() {
  const navigate = useNavigate();
  const { theme } = useContext(ThemeContext);
  const [avatarUrl, setAvatarUrl] = useState('');

  // Tokens for player and admin
  const token = localStorage.getItem('token');
  const adminToken = localStorage.getItem('adminToken');

  // Fetch the logged in player's avatar to display it in the navbar
  useEffect(() => {
    if (!token) return;
    const load = async () => {
      try {
        const res = await fetchMe();
        setAvatarUrl(res.data.photoUrl);
      } catch (err) {
        console.error('Failed to load profile', err);
      }
    };
    load();
  }, [token]);

  // Toggle the sidebar on small screens
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
        {/* Hamburger — only shows on <=600 px (CSS handles display) */}
        <button
          className="hamburger"
          aria-label="Toggle menu"
          onClick={toggleSidebar}
        >
          &#9776;
        </button>

        {theme.logoUrl ? (
          <Link to="/">
            <img
              src={theme.logoUrl}
              alt="Logo"
              style={{ height: '40px' }}
            />
          </Link>
        ) : (
          <Link to="/">Treasure Hunt</Link>
        )}
      </div>

      <ul className="nav-right">
        {/* Admin links */}
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

        {/* Player shortcut */}
        {token && (
          <li>
            <Link to="/dashboard">My Dashboard</Link>
          </li>
        )}

        {/* Logout button if logged in as player or admin */}
        {(token || adminToken) && (
          <li>
            <button onClick={handleLogout} className="btn-link">
              Log Out
            </button>
          </li>
        )}
        {token && avatarUrl && (
          <li>
            <Link to="/profile">
              <img
                src={avatarUrl}
                alt="Profile"
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  objectFit: 'cover'
                }}
              />
            </Link>
          </li>
        )}
      </ul>
    </nav>
  );
}
