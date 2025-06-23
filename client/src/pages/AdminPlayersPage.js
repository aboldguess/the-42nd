import React, { useEffect, useState } from 'react';
import { fetchPlayers, deletePlayer } from '../services/api';

export default function AdminPlayersPage() {
  const [players, setPlayers] = useState([]);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    const { data } = await fetchPlayers();
    setPlayers(data);
  };

  const handleDelete = async (id) => {
    await deletePlayer(id);
    load();
  };

  return (
    <div className="card" style={{ padding: '1rem', margin: '1rem' }}>
      <h2>Players</h2>
      <ul>
        {players.map((p) => (
          <li key={p._id}>
            {p.name} - Team: {p.team?.name}{' '}
            <button onClick={() => handleDelete(p._id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

