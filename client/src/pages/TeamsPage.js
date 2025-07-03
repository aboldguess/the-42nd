import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  fetchTeamsPublic,
  fetchPlayersPublic,
  fetchScoreboard
} from '../services/api';

// Display all teams with players listed under each
export default function TeamsPage() {
  const [teams, setTeams] = useState([]); // teams from API
  const [players, setPlayers] = useState([]); // used to map players to teams
  const [scores, setScores] = useState([]); // scoreboard stats per team
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch both teams and players concurrently
    const load = async () => {
      try {
        const [teamRes, playerRes, scoreRes] = await Promise.all([
          fetchTeamsPublic(),
          fetchPlayersPublic(),
          fetchScoreboard()
        ]);
        setTeams(teamRes.data);
        setPlayers(playerRes.data);
        setScores(scoreRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <p>Loading…</p>;

  // Helper to list players belonging to a team
  const playersForTeam = (teamId) =>
    players.filter((p) => p.team && p.team._id === teamId);
  // Helper to grab scoreboard stats for a team
  const statsForTeam = (teamId) => scores.find((s) => s.teamId === teamId);

  // Main card container with consistent spacing
  return (
    <div className="card spaced-card">
      <h2>Teams</h2>
      {/* New flex-based layout; each team row lists members underneath */}
      <div className="list">
        {teams.map((team) => {
          const stats = statsForTeam(team._id);
          return (
            <div key={team._id} className="list-row">
              {team.photoUrl && <img src={team.photoUrl} alt={team.name} />}
              <div>
                <Link to={`/team/${team._id}`}>{team.name}</Link>
                {stats && (
                  <p className="sub" style={{ marginBottom: '0.5rem' }}>
                    Score: {stats.score} | Questions Found: {stats.questionsFound} | Correct Answers: {stats.correctAnswers}
                  </p>
                )}
                {/* Table of team members */}
                <table className="sub" style={{ margin: 0 }}>
                  <thead>
                    <tr>
                      <th>Member</th>
                    </tr>
                  </thead>
                  <tbody>
                    {playersForTeam(team._id).map((p) => (
                      <tr key={p._id}>
                        <td data-label="Member">
                          <Link to={`/player/${p._id}`}>
                            {p.photoUrl && (
                              <img
                                src={p.photoUrl}
                                alt={p.name}
                                width="30"
                                height="30"
                                style={{
                                  borderRadius: '50%',
                                  marginRight: '0.5rem',
                                  objectFit: 'cover'
                                }}
                              />
                            )}
                            {p.name}
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
