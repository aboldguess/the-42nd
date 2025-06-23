import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { useNavigate } from 'react-router-dom';

export default function OnboardingPage() {
  // Store first and last names separately. Previously we used a single
  // `name` field but the API now expects `firstName` and `lastName`.
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [teams, setTeams] = useState([]);
  const [selectedTeamId, setSelectedTeamId] = useState('');
  const [isNewTeam, setIsNewTeam] = useState(false);
  const [teamName, setTeamName] = useState('');
  const [teamPassword, setTeamPassword] = useState('');
  const [selfieFile, setSelfieFile] = useState(null);
  const [teamPhotoFile, setTeamPhotoFile] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const res = await axios.get('/api/teams/list/all');
        setTeams(res.data);
      } catch (err) {
        console.error('Error fetching teams:', err);
      }
    };
    fetchTeams();
  }, []);

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
      if (!teamName) return alert('Please enter a new team name');
      if (!teamPassword) return alert('Please set a team password');
      if (!teamPhotoFile) return alert('Please upload a team photo');

      formData.append('teamName', teamName);
      formData.append('teamPassword', teamPassword);
      formData.append('teamPhoto', teamPhotoFile);
    } else {
      if (!selectedTeamId) return alert('Please select a team');
      if (!teamPassword) return alert('Please enter the team password');
      const chosen = teams.find((t) => t._id === selectedTeamId);
      formData.append('teamName', chosen?.name || '');
      formData.append('teamPassword', teamPassword);
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
                setTeamName('');
                setTeamPhotoFile(null);
                setSelectedTeamId('');
                setTeamPassword('');
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
                setSelectedTeamId('');
                setTeamPassword('');
              }}
            />
            Create New Team
          </label>
        </div>

        {!isNewTeam ? (
          <>
            <label>Select Team:</label>
            <select
              value={selectedTeamId}
              onChange={(e) => setSelectedTeamId(e.target.value)}
              required
            >
              <option value="">— Choose a Team —</option>
              {teams.map((t) => (
                <option key={t._id} value={t._id}>
                  {t.name}
                </option>
              ))}
            </select>

            <label>Team Password:</label>
            <input
              type="text"
              value={teamPassword}
              onChange={(e) => setTeamPassword(e.target.value)}
              required
              placeholder="Enter team password"
            />
          </>
        ) : (
          <>
            <label>New Team Name:</label>
            <input
              type="text"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              required
              placeholder="Your new team’s name"
            />

            <label>Create Team Password:</label>
            <input
              type="text"
              value={teamPassword}
              onChange={(e) => setTeamPassword(e.target.value)}
              required
              placeholder="Choose a password"
            />

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
