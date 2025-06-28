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
      <table>
        <thead>
          <tr>
            <th>Team</th>
            <th>Members</th>
          </tr>
        </thead>
        <tbody>
          {teams.map((team) => (
            <tr key={team._id}>
              <td data-label="Team">
                {team.photoUrl && (
                  <img
                    src={team.photoUrl}
                    alt={team.name}
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      objectFit: 'cover',
                      marginRight: '0.5rem'
                    }}
                  />
                )}
                <Link to={`/team/${team._id}`}>{team.name}</Link>
              </td>
              <td data-label="Members">
                <ul style={{ margin: 0, paddingLeft: '1rem' }}>
                  {playersForTeam(team._id).map((p) => (
                    <li key={p._id}>
                      <Link to={`/player/${p._id}`}>{p.name}</Link>
                    </li>
                  ))}
                </ul>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
