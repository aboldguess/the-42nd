import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchPlayerById } from '../services/api';
import Wall from '../components/Wall';

// Read-only profile for any player
export default function PlayerProfilePage() {
  const { id } = useParams(); // player id from the route
  const [player, setPlayer] = useState(null);

  useEffect(() => {
    // Load player data when id changes
    const load = async () => {
      try {
        const { data } = await fetchPlayerById(id);
        setPlayer(data);
      } catch (err) {
        console.error(err);
      }
    };
    load();
  }, [id]);

  if (!player) return <p>Loading…</p>;

  return (
    <div className="card" style={{ padding: '1rem', margin: '1rem' }}>
      <h2>{player.name}</h2>
      {player.photoUrl && (
        <img
          src={player.photoUrl}
          alt={`${player.name} avatar`}
          style={{ width: '150px', height: '150px', borderRadius: '50%', objectFit: 'cover' }}
        />
      )}
      <p>Team: {player.team ? player.team.name : '-'}</p>
      <Wall type="user" id={id} />
    </div>
  );
}
