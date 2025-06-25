import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { login } from '../services/api';

// Landing page shown when a player is not authenticated.
// Provides simple fields for their name and options to either
// log in or sign up for a new team.
export default function WelcomePage() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  // Destination after authentication defaults to the profile page
  const next = params.get('next') || '/profile';

  // Attempt to log the user in with the provided names
  const handleLogin = async () => {
    try {
      const { data } = await login({ firstName, lastName });
      localStorage.setItem('token', data.token);
      navigate(next);
    } catch (err) {
      alert(err.response?.data?.message || 'Login failed');
    }
  };

  // Proceed to the signup flow carrying over the entered names
  const handleSignup = () => {
    navigate('/signup', { state: { firstName, lastName, next } });
  };

  return (
    <div className="card" style={{ maxWidth: 400, margin: '2rem auto' }}>
      <h2>Welcome</h2>
      <label>First Name:</label>
      <input
        type="text"
        value={firstName}
        onChange={(e) => setFirstName(e.target.value)}
      />
      <label>Last Name:</label>
      <input
        type="text"
        value={lastName}
        onChange={(e) => setLastName(e.target.value)}
      />
      <div style={{ marginTop: '1rem' }}>
        <button onClick={handleLogin} style={{ marginRight: '0.5rem' }}>
          Log In
        </button>
        <button onClick={handleSignup}>Sign Up</button>
      </div>
    </div>
  );
}
