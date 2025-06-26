import React, { useEffect, useState } from 'react';
import {
  fetchMe,
  fetchTeam,
  addTeamMember,
  fetchCluesPlayer,
  fetchProgress,
  fetchScoreboard
} from '../services/api';
import TeamMemberForm from '../components/TeamMemberForm';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [team, setTeam] = useState(null);
  const [currentClue, setCurrentClue] = useState(null);
  const [currentClueId, setCurrentClueId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState({
    qFound: 0,
    qTotal: 0,
    cluesFound: 0,
    cluesTotal: 0,
    sqFound: 0,
    sqTotal: 0,
    correct: 0,
    sqCreated: 0,
    photos: 0
  });

  useEffect(() => {
    const load = async () => {
      try {
        const meRes = await fetchMe();
        setUser(meRes.data);
        const teamRes = await fetchTeam(meRes.data.team._id);
        setTeam(teamRes.data);

        if (teamRes.data.currentClue) {
          setCurrentClue(teamRes.data.currentClue);

          // Fetch all clues so we can map the numeric progress index to the
          // actual clue ObjectId used in routes.
          const cluesRes = await fetchCluesPlayer();
          const idx = teamRes.data.currentClue - 1;
          if (idx >= 0 && idx < cluesRes.data.length) {
            setCurrentClueId(cluesRes.data[idx]._id);
          }
        }

        // Load progress tables for counts
        const [qProg, clueProg, sqProg, board] = await Promise.all([
          fetchProgress('question'),
          fetchProgress('clue'),
          fetchProgress('sidequest'),
          fetchScoreboard()
        ]);

        const myBoard = board.data.find((b) => b.teamId === teamRes.data._id);
        setProgress({
          qFound: qProg.data.filter((i) => i.scanned).length,
          qTotal: qProg.data.length,
          cluesFound: clueProg.data.filter((i) => i.scanned).length,
          cluesTotal: clueProg.data.length,
          sqFound: sqProg.data.filter((i) => i.scanned).length,
          sqTotal: sqProg.data.length,
          correct: clueProg.data.filter((i) => i.status === 'SOLVED!').length,
          sqCreated: myBoard?.sidequestsCreated || 0,
          photos: myBoard?.photosUploaded || 0
        });

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
          <strong>Colour Scheme:</strong>{' '}
          <span style={{ color: team.colourScheme.primary }}>{team.colourScheme.primary}</span> /{' '}
          <span style={{ color: team.colourScheme.secondary }}>{team.colourScheme.secondary}</span>
        </p>
        <p>
          <strong>Current Clue:</strong> {`Clue ${team.currentClue}`}
        </p>
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
        <p style={{ marginTop: '1rem' }}>
          <strong>Progress:</strong>
        </p>
        <ul>
          <li>
            Questions Found: {progress.qFound} / {progress.qTotal}
          </li>
          <li>
            Clues Found: {progress.cluesFound} / {progress.cluesTotal}
          </li>
          <li>
            Sidequests Found: {progress.sqFound} / {progress.sqTotal}
          </li>
          <li>Correct Answers: {progress.correct}</li>
          <li>Sidequests Created: {progress.sqCreated}</li>
          <li>Photos Uploaded: {progress.photos}</li>
        </ul>
      </div>

      {user.isAdmin && <TeamMemberForm onAdd={handleAddMember} />}

      <div style={{ marginTop: '1rem' }}>
        <a href={`/clue/${currentClueId || currentClue}`}> 
          <button>Go to Current Clue</button>
        </a>
      </div>
    </div>
  );
}
