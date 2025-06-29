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

  // List of all players with basic details
  return (
    <div className="card spaced-card">
      <h2>Players</h2>
      {/* Replaces the old table with a flex-based list for better mobile layout */}
      <div className="list">
        {players.map((p) => (
          <div key={p._id} className="list-row">
            {p.photoUrl && (
              <img src={p.photoUrl} alt={p.name} />
            )}
            <div>
              <Link to={`/player/${p._id}`}>{p.name}</Link>
              <span className="sub">{p.team?.name || '-'}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
