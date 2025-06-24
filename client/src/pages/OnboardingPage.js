import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function OnboardingPage() {
  // Store first and last names separately. Previously we used a single
  // `name` field but the API now expects `firstName` and `lastName`.
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  // When joining an existing team the player will provide the first name of
  // the team leader instead of selecting a team by name.
  const [leaderFirstName, setLeaderFirstName] = useState('');
  const [isNewTeam, setIsNewTeam] = useState(false);
  const [selfieFile, setSelfieFile] = useState(null);
  const [teamPhotoFile, setTeamPhotoFile] = useState(null);

  const navigate = useNavigate();

  // No team list is fetched because players join a team using the leader's
  // first name.

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!firstName || !lastName) return alert('Please enter your full name');
    if (!selfieFile) return alert('Please upload a selfie');

    const formData = new FormData();
    // Send first and last name as separate fields
    formData.append('firstName', firstName);
    formData.append('lastName', lastName);
    formData.append('isNewTeam', isNewTeam ? 'true' : 'false');

    if (isNewTeam) {
      // Creating a team only requires an optional team photo
      if (!teamPhotoFile) return alert('Please upload a team photo');
      formData.append('teamPhoto', teamPhotoFile);
    } else {
      // Joining a team requires the leader's first name so the server can look
      // up the correct team.
      if (!leaderFirstName) return alert('Enter the team leader\'s first name');
      formData.append('leaderFirstName', leaderFirstName);
    }

    formData.append('selfie', selfieFile);

    try {
      const res = await axios.post('/api/onboard', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      localStorage.setItem('token', res.data.token);
      navigate('/dashboard');
    } catch (err) {
      alert(err.response?.data?.message || 'Registration failed');
      console.error(err);
    }
  };

  return (
    <div className="card" style={{ maxWidth: '500px', margin: '0 auto' }}>
      <h2>Welcome! Let’s get you set up.</h2>
      <form onSubmit={handleSubmit}>
        {/* Collect first and last names separately */}
        <label>First Name:</label>
        <input
          type="text"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          required
          placeholder="First"
        />
        <label>Last Name:</label>
        <input
          type="text"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          required
          placeholder="Last"
        />

        <div style={{ margin: '1rem 0' }}>
          <label>
            <input
              type="radio"
              name="teamChoice"
              checked={!isNewTeam}
              onChange={() => {
                setIsNewTeam(false);
                setTeamPhotoFile(null);
                // Reset leader name when switching modes
                setLeaderFirstName('');
              }}
            />
            Join Existing Team
          </label>
          <label style={{ marginLeft: '1rem' }}>
            <input
              type="radio"
              name="teamChoice"
              checked={isNewTeam}
              onChange={() => {
                setIsNewTeam(true);
                // Clear leader name when switching to create mode
                setLeaderFirstName('');
              }}
            />
            Create New Team
          </label>
        </div>

        {!isNewTeam ? (
          <>
            <label>Team Leader's First Name:</label>
            <input
              type="text"
              value={leaderFirstName}
              onChange={(e) => setLeaderFirstName(e.target.value)}
              required
              placeholder="Leader first name"
            />
          </>
        ) : (
          <>
            <label>Team Photo:</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setTeamPhotoFile(e.target.files[0])}
              required
            />
          </>
        )}

        <label>Your Selfie:</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setSelfieFile(e.target.files[0])}
          required
        />

        <button type="submit" style={{ marginTop: '1rem' }}>
          {isNewTeam ? 'Create Team & Join' : 'Join Team'}
        </button>
      </form>
    </div>
  );
}
