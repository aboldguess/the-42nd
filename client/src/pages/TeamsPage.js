import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  fetchTeamsPublic,
  fetchPlayersPublic,
  fetchScoreboard
} from '../services/api';

// Display all teams with their leader and members shown in a simple list
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
          // Determine which players belong to this team
          const teamPlayers = playersForTeam(team._id);
          // The player who created the team is marked as isAdmin
          const leader = teamPlayers.find((p) => p.isAdmin);
          // Remaining players are regular members
          const members = teamPlayers.filter((p) => !p.isAdmin);
          return (
            <div key={team._id} className="list-row">
              {/* Team photo */}
              {team.photoUrl && (
                <img
                  src={team.photoUrl}
                  alt={team.name}
                  style={{ width: '32px', height: '32px', borderRadius: '50%' }}
                />
              )}
              <div>
                {/* Team name links to the profile page */}
                <Link to={`/team/${team._id}`}>{team.name}</Link>
                {stats && (
                  <p className="sub" style={{ marginBottom: '0.5rem' }}>
                    Score: {stats.score} | Questions Found: {stats.questionsFound} | Correct Answers: {stats.correctAnswers}
                  </p>
                )}
                {/* Display leader with avatar and bold name */}
                {leader && (
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.25rem' }}>
                    {leader.photoUrl && (
                      <img
                        src={leader.photoUrl}
                        alt={leader.name}
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          objectFit: 'cover',
                          marginRight: '0.5rem'
                        }}
                      />
                    )}
                    <strong>{leader.name}</strong>
                  </div>
                )}
                {/* List of member avatars with first names */}
                {members.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {members.map((m) => (
                      <span key={m._id} style={{ display: 'flex', alignItems: 'center' }}>
                        {m.photoUrl && (
                          <img
                            src={m.photoUrl}
                            alt={m.name}
                            style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: '50%',
                              objectFit: 'cover',
                              marginRight: '0.25rem'
                            }}
                          />
                        )}
                        {m.firstName || m.name.split(' ')[0]}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
