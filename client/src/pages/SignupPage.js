import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { fetchTeamsPublic, onboard } from '../services/api';

// Second step of the authentication flow. Players can join an
// existing team or create a new one. After completion they are
// redirected to the page they originally attempted to visit.
export default function SignupPage() {
  const { state } = useLocation();
  const navigate = useNavigate();
  // Expect first and last names passed from the WelcomePage
  const { firstName, lastName, next } = state || {};

  const [teams, setTeams] = useState([]);
  const [leaderNames, setLeaderNames] = useState({});

  useEffect(() => {
    // Fetch the public team roster for display
    fetchTeamsPublic().then(({ data }) => setTeams(data));
  }, []);

  // Generic handler for joining an existing team
  const joinTeam = async (leaderLastName) => {
    const form = new FormData();
    form.append('firstName', firstName);
    form.append('lastName', lastName);
    form.append('isNewTeam', 'false');
    form.append('leaderLastName', leaderLastName);
    try {
      const { data } = await onboard(form);
      localStorage.setItem('token', data.token);
      navigate(next || '/profile');
    } catch (err) {
      alert(err.response?.data?.message || 'Unable to join team');
    }
  };

  // Creating a new team is simpler: no extra fields required
  const createTeam = async () => {
    const form = new FormData();
    form.append('firstName', firstName);
    form.append('lastName', lastName);
    form.append('isNewTeam', 'true');
    try {
      const { data } = await onboard(form);
      localStorage.setItem('token', data.token);
      navigate(next || '/profile');
    } catch (err) {
      alert(err.response?.data?.message || 'Unable to create team');
    }
  };

  return (
    <div className="card" style={{ maxWidth: 600, margin: '2rem auto' }}>
      <h2>Choose a Team</h2>
      {teams.map((team) => (
        <div key={team._id} style={{ borderBottom: '1px solid #ccc', padding: '1rem 0' }}>
          {team.photoUrl && (
            <img src={team.photoUrl} alt="team" style={{ width: 80, height: 80, objectFit: 'cover' }} />
          )}
          <div>
            {team.members.map((m) => (
              <span key={m.name} style={{ marginRight: '0.5rem' }}>{m.name.split(' ')[0]}</span>
            ))}
          </div>
          <input
            type="text"
            placeholder="Leader last name"
            value={leaderNames[team._id] || ''}
            onChange={(e) => setLeaderNames({ ...leaderNames, [team._id]: e.target.value })}
            style={{ marginRight: '0.5rem' }}
          />
          <button onClick={() => joinTeam(leaderNames[team._id] || '')}>Join Team</button>
        </div>
      ))}
      <div style={{ marginTop: '1rem' }}>
        <button onClick={createTeam}>Create New Team</button>
      </div>
    </div>
  );
}
