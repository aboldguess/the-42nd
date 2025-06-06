import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div>
        <Link to="/">Treasure Hunt</Link>
      </div>
      <div>
        {token ? (
          <button onClick={handleLogout}>Log Out</button>
        ) : null}
      </div>
    </nav>
  );
}
