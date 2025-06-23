import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../services/api';

// Simple login form for existing players
export default function LoginPage() {
  // Track input values for first and last name
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const navigate = useNavigate();

  // Submit credentials to the API and handle response
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Send names as username/password to the login endpoint
      const { data } = await login({ username: firstName, password: lastName });
      // Save JWT for authenticated requests
      localStorage.setItem('token', data.token);
      // Redirect to the player dashboard after successful login
      navigate('/dashboard');
    } catch (err) {
      alert(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="card" style={{ maxWidth: 400, margin: '2rem auto' }}>
      <h2>Player Login</h2>
      {/* onSubmit triggers handleSubmit above */}
      <form onSubmit={handleSubmit}>
        <label>First Name:</label>
        <input
          type="text"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          required
        />
        <label>Surname:</label>
        <input
          type="password"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          required
        />
        <button type="submit">Log In</button>
      </form>
    </div>
  );
}
