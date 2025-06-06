import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { register } from '../services/api';
import { v4 as uuidv4 } from 'uuid';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [teamName, setTeamName] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!teamName) return alert('Please provide a team name');

    // Generate a random email/password under the hood (so users only enter their name)
    const randomId = uuidv4();
    const email = `${randomId}@guest.local`;
    const password = randomId;

    try {
      // Call the same endpoint, but now with auto‐created email/password
      const res = await register({ name, email, password, teamName, isNewTeam: true });
      localStorage.setItem('token', res.data.token);
      navigate('/dashboard');
    } catch (err) {
      alert(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="card" style={{ maxWidth: '450px', margin: '0 auto' }}>
      <h2>Enter Your Name</h2>
      <form onSubmit={handleSubmit}>
        <label>Name:</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          placeholder="Your Name"
        />

        <label>Team Name:</label>
        <input
          type="text"
          value={teamName}
          onChange={(e) => setTeamName(e.target.value)}
          required
          placeholder="E.g. The Treasure Seekers"
        />

        <button type="submit">Start</button>
      </form>
    </div>
  );
}
