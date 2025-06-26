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

  return (
    <div className="card" style={{ padding: '1rem', margin: '1rem' }}>
      <h2>Teams</h2>
      {teams.map((team) => (
        <div key={team._id} className="card" style={{ marginBottom: '1rem' }}>
          <h3>
            <Link to={`/team/${team._id}`}>{team.name}</Link>
          </h3>
          {team.photoUrl && (
            <img
              src={team.photoUrl}
              alt={`${team.name} photo`}
              style={{ width: '100%', maxWidth: '300px', objectFit: 'cover' }}
            />
          )}
          <ul>
            {playersForTeam(team._id).map((p) => (
              <li key={p._id}>
                <Link to={`/player/${p._id}`}>{p.name}</Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
