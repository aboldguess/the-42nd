import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { login } from '../services/api';

// This component handles both new player sign-up and returning player login in
// a single form. Players provide their first and last name and either join an
// existing team or create a new one. The last name acts as a password and never
// appears publicly.

export default function OnboardingPage() {
  const [isLogin, setIsLogin] = useState(false); // true -> login, false -> sign up
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [teams, setTeams] = useState([]);
  const [selectedTeamId, setSelectedTeamId] = useState('');
  const [isNewTeam, setIsNewTeam] = useState(false);
  const [teamName, setTeamName] = useState('');
  const [creatorName, setCreatorName] = useState('');
  const [selfieFile, setSelfieFile] = useState(null);
  const [teamPhotoFile, setTeamPhotoFile] = useState(null);

  const navigate = useNavigate();

  // Grab the list of existing teams for the "join" option on first render.
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

  // Handle form submission for both login and sign up flows.
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!firstName || !lastName) return alert('Please enter your full name');

    if (isLogin) {
      if (!selectedTeamId) return alert('Please select your team');
      if (!creatorName) return alert("Enter your team's creator name");
      const team = teams.find((t) => t._id === selectedTeamId);
      try {
        const { data } = await login({
          firstName,
          lastName,
          teamName: team?.name || '',
          creatorFirstName: creatorName,
        });
        localStorage.setItem('token', data.token);
        navigate('/dashboard');
      } catch (err) {
        alert(err.response?.data?.message || 'Login failed');
      }
      return;
    }

    if (!selfieFile) return alert('Please upload a selfie');

    // Build multipart form data for the onboarding endpoint
    const formData = new FormData();
    formData.append('firstName', firstName);
    formData.append('lastName', lastName);
    formData.append('isNewTeam', isNewTeam ? 'true' : 'false');

    if (isNewTeam) {
      if (!teamName) return alert('Please enter a new team name');
      if (!teamPhotoFile) return alert('Please upload a team photo');
      formData.append('teamName', teamName);
      formData.append('teamPhoto', teamPhotoFile);
    } else {
      if (!selectedTeamId) return alert('Please select a team');
      if (!creatorName) return alert("Enter your team's creator name");
      const chosen = teams.find((t) => t._id === selectedTeamId);
      formData.append('teamName', chosen?.name || '');
      formData.append('creatorFirstName', creatorName);
    }

    formData.append('selfie', selfieFile);

    try {
      const res = await axios.post('/api/onboard', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      localStorage.setItem('token', res.data.token);
      navigate('/dashboard');
    } catch (err) {
      alert(err.response?.data?.message || 'Registration failed');
    }
  };

  // Render the form. Fields are conditionally shown depending on whether the
  // player is logging in or signing up / creating a team.
  return (
    <div className="card" style={{ maxWidth: '500px', margin: '0 auto' }}>
      <h2>{isLogin ? 'Player Login' : 'Player Onboarding'}</h2>
      <form onSubmit={handleSubmit}>
        <label>First Name:</label>
        <input
          type="text"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          required
        />
        <label>Last Name:</label>
        <input
          type="password"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          required
        />

        <div style={{ margin: '1rem 0' }}>
          <label>
            <input
              type="radio"
              name="mode"
              checked={isLogin}
              onChange={() => setIsLogin(true)}
            />{' '}
            Login
          </label>
          <label style={{ marginLeft: '1rem' }}>
            <input
              type="radio"
              name="mode"
              checked={!isLogin}
              onChange={() => setIsLogin(false)}
            />{' '}
            Sign Up
          </label>
        </div>

        {!isLogin && (
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
                }}
              />
              Create New Team
            </label>
          </div>
        )}

        {!isNewTeam && (
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
            <label>Team Creator First Name:</label>
            <input
              type="text"
              value={creatorName}
              onChange={(e) => setCreatorName(e.target.value)}
              required
            />
          </>
        )}

        {isNewTeam && !isLogin && (
          <>
            <label>New Team Name:</label>
            <input
              type="text"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              required
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

        {!isLogin && (
          <>
            <label>Your Selfie:</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setSelfieFile(e.target.files[0])}
              required
            />
          </>
        )}

        <button type="submit" style={{ marginTop: '1rem' }}>
          {isLogin ? 'Log In' : isNewTeam ? 'Create Team & Join' : 'Join Team'}
        </button>
      </form>
    </div>
  );
}
