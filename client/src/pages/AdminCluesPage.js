import React, { useEffect, useState } from 'react';

// Simple CRUD interface for managing clue data. Supports optional image upload.
import {
  fetchClues,
  createClueAdmin,
  deleteClueAdmin
} from '../services/api';

export default function AdminCluesPage() {
  const [clues, setClues] = useState([]);
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [image, setImage] = useState(null);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    const { data } = await fetchClues();
    setClues(data);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('title', title);
    formData.append('text', text);
    if (image) formData.append('questionImage', image);
    await createClueAdmin(formData);
    setTitle('');
    setText('');
    setImage(null);
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
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
          required
        />
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Text"
          required
        />
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImage(e.target.files[0])}
        />
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

