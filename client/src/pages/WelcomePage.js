import React from 'react';
import { Link } from 'react-router-dom';

function WelcomePage() {
  return (
    <div className="card" style={{ textAlign: 'center' }}>
      <h1>Welcome to the Treasure Hunt!</h1>
      <p>Ready for a day of adventure and fun? Get started now:</p>
      {/* Onboarding now handles both registration and login */}
      <div style={{ marginTop: '1rem' }}>
        <Link to="/">
          <button>Start</button>
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
