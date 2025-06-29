import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchTeamsPublic, fetchPlayersPublic } from '../services/api';

// Display all teams with players listed under each
export default function TeamsPage() {
  const [teams, setTeams] = useState([]); // teams from API
  const [players, setPlayers] = useState([]); // used to map players to teams
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch both teams and players concurrently
    const load = async () => {
      try {
        const [teamRes, playerRes] = await Promise.all([
          fetchTeamsPublic(),
          fetchPlayersPublic()
        ]);
        setTeams(teamRes.data);
        setPlayers(playerRes.data);
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

  // Main card container with consistent spacing
  return (
    <div className="card spaced-card">
      <h2>Teams</h2>
      {/* New flex-based layout; each team row lists members underneath */}
      <div className="list">
        {teams.map((team) => (
          <div key={team._id} className="list-row">
            {team.photoUrl && (
              <img src={team.photoUrl} alt={team.name} />
            )}
            <div>
              <Link to={`/team/${team._id}`}>{team.name}</Link>
              <ul className="sub" style={{ margin: 0, paddingLeft: '1rem' }}>
                {playersForTeam(team._id).map((p) => (
                  <li key={p._id}>
                    <Link to={`/player/${p._id}`}>{p.name}</Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
