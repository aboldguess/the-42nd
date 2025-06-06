import React from 'react';
import { Link } from 'react-router-dom';

function WelcomePage() {
  return (
    <div className="card" style={{ textAlign: 'center' }}>
      <h1>Welcome to the Treasure Hunt!</h1>
      <p>Ready for a day of adventure and fun? Get started now:</p>
      <div style={{ marginTop: '1rem' }}>
        <Link to="/login">
          <button>Log In</button>
        </Link>
        <Link to="/register" style={{ marginLeft: '1rem' }}>
          <button>Register</button>
        </Link>
      </div>
      <div style={{ marginTop: '2rem' }}>
        <Link to="/roguery">
          <button>View Rogues Gallery</button>
        </Link>
      </div>
    </div>
  );
}

export default WelcomePage;
