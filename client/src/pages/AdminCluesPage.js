import React, { useEffect, useState } from 'react';
import {
  fetchClues,
  createClueAdmin,
  deleteClueAdmin
} from '../services/api';

export default function AdminCluesPage() {
  const [clues, setClues] = useState([]);
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    const { data } = await fetchClues();
    setClues(data);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    await createClueAdmin({ title, text });
    setTitle('');
    setText('');
    load();
  };

  const handleDelete = async (id) => {
    await deleteClueAdmin(id);
    load();
  };

  return (
    <div className="card" style={{ padding: '1rem', margin: '1rem' }}>
      <h2>Clues</h2>
      <form onSubmit={handleCreate} style={{ marginBottom: '1rem' }}>
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" required />
        <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Text" required />
        <button type="submit">Create</button>
      </form>
      <ul>
        {clues.map((c) => (
          <li key={c._id}>
            {c.title} <button onClick={() => handleDelete(c._id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

