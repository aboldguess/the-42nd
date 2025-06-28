import React, { useContext, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ThemeContext } from '../context/ThemeContext';
import { fetchMe } from '../services/api';

export default function Navbar() {
  const navigate = useNavigate();
  const { theme } = useContext(ThemeContext);
  const [avatarUrl, setAvatarUrl] = useState('');
  const [userId, setUserId] = useState('');
  const [showMenu, setShowMenu] = useState(false);

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
      // Slide the sidebar in/out on small screens
      el.classList.toggle('mobile-hide');
      el.classList.toggle('show');
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
          <li className="hide-mobile">
            <Link to="/admin/login">Admin</Link>
          </li>
        )}
        {adminToken && (
          <li className="hide-mobile">
            <Link to="/admin/dashboard">Admin Dashboard</Link>
          </li>
        )}

        {/* Player shortcut */}
        {token && (
          <li className="hide-mobile">
            <Link to="/dashboard">My Dashboard</Link>
          </li>
        )}

        {/* Logout button if logged in as player or admin */}
        {(token || adminToken) && (
          <li className="hide-mobile">
            <button onClick={handleLogout} className="btn-link">
              Log Out
            </button>
          </li>
        )}
        {token && avatarUrl && (
          <li className="nav-avatar" style={{ position: 'relative' }}>
            <button
              onClick={() => setShowMenu(!showMenu)}
              style={{ background: 'none', border: 'none', padding: 0 }}
            >
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
            </button>
            {showMenu && (
              <ul
                style={{
                  position: 'absolute',
                  right: 0,
                  top: '100%',
                  background: '#333',
                  padding: '0.5rem',
                  listStyle: 'none'
                }}
              >
                <li>
                  <Link to="/profile" onClick={() => setShowMenu(false)}>
                    Player Settings
                  </Link>
                </li>
                <li>
                  <Link
                    to={`/player/${userId}`}
                    onClick={() => setShowMenu(false)}
                  >
                    View Profile
                  </Link>
                </li>
              </ul>
            )}
          </li>
        )}
      </ul>
    </nav>
  );
}
