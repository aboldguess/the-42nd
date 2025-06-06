import React, { useEffect, useState } from 'react';
import { fetchMe, fetchTeam, addTeamMember, fetchClue } from '../services/api';
import TeamMemberForm from '../components/TeamMemberForm';

function Dashboard() {
  const [user, setUser] = useState(null);
  const [team, setTeam] = useState(null);
  const [currentClue, setCurrentClue] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const meRes = await fetchMe();
        setUser(meRes.data);
        localStorage.setItem('teamId', meRes.data.team._id);
        const teamRes = await fetchTeam(meRes.data.team._id);
        setTeam(teamRes.data);
        if (teamRes.data.currentClue) {
          const clueRes = await fetchClue(teamRes.data.currentClue);
          setCurrentClue(clueRes.data);
        }
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleAddMember = async (formData) => {
    try {
      const res = await addTeamMember(team._id, formData);
      setTeam((prev) => ({ ...prev, members: res.data }));
    } catch (err) {
      alert(err.response?.data?.message || 'Error adding member');
    }
  };

  if (loading) return <p>Loading…</p>;
  if (!user || !team) return <p>Error loading dashboard.</p>;

  return (
    <div>
      <h2>Dashboard</h2>
      <div className="card">
        <h3>Team: {team.name}</h3>
        <p>
          <strong>Colour Scheme:</strong> <span style={{ color: team.colourScheme.primary }}>{team.colourScheme.primary}</span> / <span style={{ color: team.colourScheme.secondary }}>{team.colourScheme.secondary}</span>
        </p>
        <p>
          <strong>Current Clue:</strong> {team.infoPage || currentClue ? currentClue?.title || 'Info Page' : `Clue ${team.currentClue}`}
        </p>
        {currentClue && !currentClue.infoPage && (
          <p>
            <strong>Clue Snippet:</strong> {currentClue.text.substring(0, 50)}…
          </p>
        )}
        <p>
          <strong>Members:</strong>
        </p>
        <ul>
          {team.members.map((m, i) => (
            <li key={i}>
              {m.avatarUrl && (
                <img
                  src={m.avatarUrl}
                  alt="avatar"
                  width="30"
                  height="30"
                  style={{ borderRadius: '50%', marginRight: '0.5rem' }}
                />
              )}
              {m.name}
            </li>
          ))}
        </ul>
      </div>

      <TeamMemberForm onAdd={handleAddMember} />

      <div style={{ marginTop: '1rem' }}>
        <a href={`/clue/${team.currentClue}`}>
          <button>Go to Current Clue</button>
        </a>
      </div>
    </div>
  );
}

export default Dashboard;
