import React, { useEffect, useState } from 'react';
import {
  fetchGames,
  createGame,
  deleteGame
} from '../services/api';

export default function AdminGamesPage() {
  const [games, setGames] = useState([]);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    const { data } = await fetchGames();
    setGames(data);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    await createGame({ name, slug });
    setName('');
    setSlug('');
    load();
  };

  const handleDelete = async (id) => {
    await deleteGame(id);
    load();
  };

  return (
    <div className="card" style={{ padding: '1rem', margin: '1rem' }}>
      <h2>Games</h2>
      <form onSubmit={handleCreate} style={{ marginBottom: '1rem' }}>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" required />
        <input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="slug" required />
        <button type="submit">Create</button>
      </form>
      <ul>
        {games.map((g) => (
          <li key={g._id}>
            {g.name} ({g.slug}){' '}
            <button onClick={() => handleDelete(g._id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

