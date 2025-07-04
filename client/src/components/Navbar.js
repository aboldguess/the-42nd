import React, { useContext, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ThemeContext } from '../context/ThemeContext';
import { fetchMe } from '../services/api';
import NotificationBell from './NotificationBell';

export default function Navbar() {
  const navigate = useNavigate();
  const { theme } = useContext(ThemeContext);
  const [avatarUrl, setAvatarUrl] = useState('');
  const [userId, setUserId] = useState('');
  const [qrData, setQrData] = useState('');
  const [showQr, setShowQr] = useState(false);
  const [showMenu, setShowMenu] = useState(false); // toggle avatar dropdown menu

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
        setQrData(res.data.qrCodeData || '');
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

  // Close sidebar when clicking outside of it or on a menu item
  useEffect(() => {
    const handleClick = (e) => {
      const sidebar = document.querySelector('.sidebar');
      const hamburger = document.querySelector('.hamburger');
      if (!sidebar || !sidebar.classList.contains('show')) return;

      // Close if the click target is outside the sidebar and not the hamburger
      if (!sidebar.contains(e.target) && !hamburger.contains(e.target)) {
        toggleSidebar();
        return;
      }

      // Close if a link within the sidebar was clicked
      if (sidebar.contains(e.target) && e.target.closest('a')) {
        toggleSidebar();
      }
    };
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  // Hide the avatar dropdown when clicking anywhere outside of it
  useEffect(() => {
    const handleAvatar = (e) => {
      const menu = document.querySelector('.nav-avatar');
      if (showMenu && menu && !menu.contains(e.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('click', handleAvatar);
    return () => document.removeEventListener('click', handleAvatar);
  }, [showMenu]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('adminToken');
    navigate('/');
  };

  return (
    <>
    {/* Fragment wraps navbar and QR modal */}
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
          <Link
            /* Clicking the logo should take the user to their dashboard.
               Admin users without a player token go to the admin dashboard. */
            to={
              adminToken && !token
                ? '/admin/dashboard'
                : token
                ? '/dashboard'
                : '/'
            }
          >
            <img src={theme.logoUrl} alt="Logo" style={{ height: '40px' }} />
          </Link>
        ) : (
          <Link
            to={
              adminToken && !token
                ? '/admin/dashboard'
                : token
                ? '/dashboard'
                : '/'
            }
          >
            Treasure Hunt
          </Link>
        )}
      </div>

      <ul className="nav-right">
        {/* Show "Log In" when the user has no player token */}
        {!token && (
          <li>
            {/* Clicking leads to the login/signup screen */}
            <Link to="/">Log In</Link>
          </li>
        )}
        {/* When signed in display notifications, QR code and avatar */}
        {token && <li><NotificationBell /></li>}
        {token && qrData && (
          <li>
            <img
              src={qrData}
              alt="My QR"
              style={{ width: '32px', cursor: 'pointer' }}
              onClick={() => setShowQr(true)}
            />
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
                  background: 'var(--primary-color)',
                  color: 'var(--text-color)',
                  padding: '0.5rem',
                  listStyle: 'none',
                  // Inherit the admin-selected font for dropdown items
                  fontFamily: 'inherit',
                  whiteSpace: 'nowrap',
                  minWidth: '180px'
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
                {adminToken && (
                  <li>
                    <Link
                      to="/admin/dashboard"
                      onClick={() => setShowMenu(false)}
                    >
                      Admin Dashboard
                    </Link>
                  </li>
                )}
                {(token || adminToken) && (
                  <li>
                    <button
                      onClick={() => {
                        setShowMenu(false);
                        handleLogout();
                      }}
                      className="btn-link"
                    >
                      Log Out
                    </button>
                  </li>
                )}
              </ul>
            )}
          </li>
        )}
      </ul>
    </nav>
    {/* QR code modal for player */}
    {showQr && qrData && (
      <div className="modal-overlay" onClick={() => setShowQr(false)}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <img src={qrData} alt="QR Code" style={{ width: '80vw', maxWidth: 400 }} />
        </div>
      </div>
    )}
  </>
  );
}
