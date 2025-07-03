import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { fetchTeamsPublic, onboard } from '../services/api';
import ProfilePic from '../components/ProfilePic';

// Second step of the authentication flow. Players can join an
// existing team or create a new one. After completion they are
// redirected to the page they originally attempted to visit.
export default function SignupPage() {
  const { state } = useLocation();
  const navigate = useNavigate();
  // Expect first and last names plus optional selfie preview
  const { firstName, lastName, next, selfiePreview } = state || {};

  const [teams, setTeams] = useState([]);
  const [leaderNames, setLeaderNames] = useState({});
  const [showJoinInput, setShowJoinInput] = useState({});
  const [selfieFile, setSelfieFile] = useState(null);
  const [selfieUrl, setSelfieUrl] = useState(selfiePreview || '');
  const [teamName, setTeamName] = useState('');
  const [teamPhotoFile, setTeamPhotoFile] = useState(null);
  const [tab, setTab] = useState('existing');

  useEffect(() => {
    // Fetch the public team roster for display
    fetchTeamsPublic().then(({ data }) => setTeams(data));
  }, []);

  const handleSelfieSelect = (file) => {
    setSelfieFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setSelfieUrl(reader.result);
    reader.readAsDataURL(file);
  };

  // Generic handler for joining an existing team
  const joinTeam = async (id) => {
    if (!showJoinInput[id]) {
      setShowJoinInput({ ...showJoinInput, [id]: true });
      return;
    }
    if (!selfieFile) return alert('Please select a profile picture.');
    const leaderLastName = leaderNames[id] || '';
    if (!leaderLastName) return alert('Please enter the leader\'s last name.');

    const form = new FormData();
    form.append('firstName', firstName);
    form.append('lastName', lastName);
    form.append('isNewTeam', 'false');
    form.append('leaderLastName', leaderLastName);
    form.append('selfie', selfieFile);
    try {
      const { data } = await onboard(form);
      localStorage.setItem('token', data.token);
      navigate(next || '/roguery');
    } catch (err) {
      alert(err.response?.data?.message || 'Unable to join team');
    }
  };

  // Creating a new team requires a name, selfie and team photo
  const createTeam = async () => {
    if (!teamName) return alert('Please enter a team name.');
    if (!selfieFile) return alert('Please select a profile picture.');
    if (!teamPhotoFile) return alert('Please select a team photo.');

    const form = new FormData();
    form.append('firstName', firstName);
    form.append('lastName', lastName);
    form.append('isNewTeam', 'true');
    form.append('teamName', teamName);
    form.append('selfie', selfieFile);
    form.append('teamPhoto', teamPhotoFile);
    try {
      const { data } = await onboard(form);
      localStorage.setItem('token', data.token);
      navigate(next || '/roguery');
    } catch (err) {
      alert(err.response?.data?.message || 'Unable to create team');
    }
  };

  return (
    <div className="card" style={{ maxWidth: 600, margin: '2rem auto' }}>
      <h2>Choose a Team</h2>
      <p>Upload a selfie then join an existing team or create your own.</p>
      <label>Your Selfie:</label>
      <ProfilePic avatarUrl={selfieUrl} onFileSelect={handleSelfieSelect} />

      <div style={{ display: 'flex', margin: '1rem 0' }}>
        <button
          type="button"
          className="btn-mr"
          onClick={() => setTab('existing')}
          style={{ background: tab === 'existing' ? 'var(--secondary-color)' : 'var(--primary-color)' }}
        >
          Choose Existing Team
        </button>
        <button
          type="button"
          onClick={() => setTab('new')}
          style={{ background: tab === 'new' ? 'var(--secondary-color)' : 'var(--primary-color)' }}
        >
          Create New Team
        </button>
      </div>

      {tab === 'existing' ? (
        <table>
          <thead>
            <tr>
              <th>Team</th>
              <th>Members</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {teams.map((team) => (
              <tr key={team._id}>
                <td>
                  {team.photoUrl && (
                    <img src={team.photoUrl} alt="team" style={{ width: 50, height: 50, objectFit: 'cover' }} />
                  )}{' '}
                  {team.name}
                </td>
                <td>{team.members.map((m) => m.name.split(' ')[0]).join(', ')}</td>
                <td>
                  {showJoinInput[team._id] && (
                    <input
                      type="text"
                      placeholder="Leader last name"
                      value={leaderNames[team._id] || ''}
                      onChange={(e) =>
                        setLeaderNames({ ...leaderNames, [team._id]: e.target.value })
                      }
                      style={{ marginRight: '0.5rem' }}
                    />
                  )}
                  <button onClick={() => joinTeam(team._id)}>
                    {showJoinInput[team._id] ? 'Confirm' : 'Join Team'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div>
          <input
            type="text"
            placeholder="Team Name"
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
          />
          <label>Team Photo:</label>
          <ProfilePic avatarUrl="" onFileSelect={(file) => setTeamPhotoFile(file)} />
          <button onClick={createTeam}>Create New Team</button>
        </div>
      )}
    </div>
  );
}
