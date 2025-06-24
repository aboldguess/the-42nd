import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../services/api';

// Simple login form for existing players
export default function LoginPage() {
  // Track input values for each field required by the API
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const navigate = useNavigate();

  // Submit credentials to the API and handle response
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Send credentials in the format expected by the backend
      // Only send the player's first and last name to authenticate
      const { data } = await login({
        firstName,
        lastName
      });
      // Store the JWT so subsequent requests are authenticated
      localStorage.setItem('token', data.token);
      // Navigate to the main dashboard on success
      navigate('/dashboard');
    } catch (err) {
      // Surface any server error messages to the user
      alert(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="card" style={{ maxWidth: 400, margin: '2rem auto' }}>
      <h2>Player Login</h2>
      {/* onSubmit triggers handleSubmit above */}
      <form onSubmit={handleSubmit}>
        {/* First and last name are required */}
        <label>First Name:</label>
        <input
          type="text"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          required
        />
        <label>Last Name:</label>
        <input
          type="text"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          required
        />

        {/* Only name fields are required for the simplified login flow */}
        <button type="submit">Log In</button>
      </form>
    </div>
  );
}
