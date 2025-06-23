import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { fetchMe } from '../services/api';

export default function Navbar() {
  const navigate = useNavigate();

  // Tokens for player and admin
  const token = localStorage.getItem('token');
  const adminToken = localStorage.getItem('adminToken');

  const [me, setMe] = useState(null);

  // Load current player info (including QR code) whenever the
  // login token changes
  useEffect(() => {
    if (token) {
      fetchMe()
        .then((res) => setMe(res.data))
        .catch((err) => console.error(err));
    } else {
      setMe(null);
    }
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

        <Link to="/">Treasure Hunt</Link>
      </div>

      <ul className="nav-right">
        {/* Player QR code: clicking or scanning goes to their profile */}
        {me && (
          <li onClick={() => navigate('/profile')} style={{ cursor: 'pointer' }}>
            <img
              src={me.qrCodeData}
              alt="My QR"
              style={{ width: '40px', height: '40px' }}
            />
          </li>
        )}
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
      </ul>
    </nav>
  );
}
