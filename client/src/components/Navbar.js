import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div>
        <Link to="/">Treasure Hunt</Link>
      </div>
      <div>
        {!token ? (
          <>
            <Link to="/login">Log In</Link>
            <Link to="/register">Register</Link>
          </>
        ) : (
          <>
            <button onClick={handleLogout}>Log Out</button>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
