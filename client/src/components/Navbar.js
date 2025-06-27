import React, { useContext, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ThemeContext } from '../context/ThemeContext';
import { fetchMe } from '../services/api';

export default function Navbar() {
  const navigate = useNavigate();
  const { theme } = useContext(ThemeContext);
  // URL of the logged in user's avatar shown in the navbar
  const [avatarUrl, setAvatarUrl] = useState('');
  // ID of the logged in user so the profile link can be built
  const [userId, setUserId] = useState('');
  // Whether the avatar dropdown is visible
  const [showMenu, setShowMenu] = useState(false);

  // Tokens for player and admin
  const token = localStorage.getItem('token');
  const adminToken = localStorage.getItem('adminToken');

  // Fetch the logged in player's basic info so we can show their
  // avatar and link to their public profile page.
  useEffect(() => {
    if (!token) return;
    const load = async () => {
      try {
        const res = await fetchMe();
        setAvatarUrl(res.data.photoUrl);
        setUserId(res.data._id);
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
            <Link to="/dashboard">Dashboard</Link>
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
          <li style={{ position: 'relative' }}>
            {/* Clicking the avatar toggles the dropdown menu */}
            <img
              src={avatarUrl}
              alt="Profile"
              onClick={() => setShowMenu((v) => !v)}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                objectFit: 'cover',
                cursor: 'pointer'
              }}
            />
            {showMenu && (
              <div className="profile-dropdown">
                <Link onClick={() => setShowMenu(false)} to={`/player/${userId}`}>View Profile</Link>
                <Link onClick={() => setShowMenu(false)} to="/profile">Player Settings</Link>
              </div>
            )}
          </li>
        )}
      </ul>
    </nav>
  );
}
