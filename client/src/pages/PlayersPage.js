import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchPlayersPublic } from '../services/api';

// List all players with their team names
export default function PlayersPage() {
  const [players, setPlayers] = useState([]); // roster from API
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load player list once on mount
    const load = async () => {
      try {
        const { data } = await fetchPlayersPublic();
        setPlayers(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <p>Loading…</p>;

  return (
    <div className="card" style={{ padding: '1rem', margin: '1rem' }}>
      <h2>Players</h2>
      <table>
        <thead>
          <tr>
            <th>Player</th>
            <th>Team</th>
          </tr>
        </thead>
        <tbody>
          {players.map((p) => (
            <tr key={p._id}>
              <td data-label="Player">
                {p.photoUrl && (
                  <img
                    src={p.photoUrl}
                    alt={p.name}
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      objectFit: 'cover',
                      marginRight: '0.5rem'
                    }}
                  />
                )}
                <Link to={`/player/${p._id}`}>{p.name}</Link>
              </td>
              <td data-label="Team">{p.team?.name || '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
