import React, { useEffect, useState } from 'react';
import {
  fetchMe,
  fetchTeam,
  addTeamMember,
  fetchCluesPlayer,
  fetchProgress,
  fetchScoreboard,
  fetchPlayersPublic
} from '../services/api';
import TeamMemberForm from '../components/TeamMemberForm';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [team, setTeam] = useState(null);
  const [currentClue, setCurrentClue] = useState(null);
  const [currentClueId, setCurrentClueId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState({
    questionsFound: 0,
    correctAnswers: 0,
    sideQuestsFound: 0,
    sideQuestsCreated: 0,
    photosUploaded: 0,
    questionsTotal: 0,
    questionsLeft: 0
  });

  // List of player documents for linking member names to profiles
  const [players, setPlayers] = useState([]);

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

        // Fetch progress details
        const [qProg, cProg, sqProg, board, playerRes] = await Promise.all([
          fetchProgress('question'),
          fetchProgress('clue'),
          fetchProgress('sidequest'),
          fetchScoreboard(),
          fetchPlayersPublic()
        ]);
        setPlayers(playerRes.data);
        const teamStats = board.data.find((b) => b.teamId === teamRes.data._id);
        setProgress({
          questionsFound: qProg.data.filter((i) => i.scanned).length,
          questionsTotal: qProg.data.length,
          questionsLeft: qProg.data.length - qProg.data.filter((i) => i.scanned).length,
          correctAnswers: cProg.data.filter((i) => i.status === 'SOLVED!').length,
          sideQuestsFound: sqProg.data.filter((i) => i.scanned).length,
          sideQuestsCreated: teamStats?.sideQuestsCreated || 0,
          photosUploaded: teamRes.data.members.filter((m) => m.avatarUrl).length
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
        {/* Show the team photo beside the name */}
        <h3>
          {team.photoUrl && (
            <img
              src={team.photoUrl}
              alt={`${team.name} photo`}
              width="40"
              height="40"
              style={{
                borderRadius: '50%',
                objectFit: 'cover',
                marginRight: '0.5rem',
                verticalAlign: 'middle'
              }}
            />
          )}
          Team: {team.name}
        </h3>
        <p>
          <strong>Current Clue:</strong> {`Clue ${team.currentClue}`}
        </p>
        <p>
          <strong>Members:</strong>
        </p>
        {/* Tabular layout showing avatars and linking to profiles */}
        <table>
          <thead>
            <tr>
              <th>Member</th>
            </tr>
          </thead>
          <tbody>
            {team.members.map((m, i) => {
              // Attempt to match this member to a user document so we can link
              const player = players.find(
                (p) => p.name === m.name && p.team && p.team._id === team._id
              );
              const content = (
                <>
                  {m.avatarUrl && (
                    <img
                      src={m.avatarUrl}
                      alt="avatar"
                      width="30"
                      height="30"
                      style={{
                        borderRadius: '50%',
                        marginRight: '0.5rem',
                        objectFit: 'cover'
                      }}
                    />
                  )}
                  {m.name}
                </>
              );
              return (
                <tr key={i}>
                  <td data-label="Member">
                    {player ? <Link to={`/player/${player._id}`}>{content}</Link> : content}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <p>
          <strong>Progress:</strong>
        </p>
        <ul>
          <li>Questions Found: {progress.questionsFound}</li>
          <li>Questions Left: {progress.questionsLeft}</li>
          <li>Correct Answers: {progress.correctAnswers}</li>
          <li>Sidequests Found: {progress.sideQuestsFound}</li>
          <li>Sidequests Created: {progress.sideQuestsCreated}</li>
          <li>Photos Uploaded: {progress.photosUploaded}</li>
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
