import React, { useEffect, useState } from 'react';
import {
  fetchSideQuestsAdmin,
  createSideQuestAdmin,
  deleteSideQuestAdmin
} from '../services/api';

export default function AdminSideQuestsPage() {
  const [quests, setQuests] = useState([]);
  const [title, setTitle] = useState('');

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    const { data } = await fetchSideQuestsAdmin();
    setQuests(data);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    await createSideQuestAdmin({ title });
    setTitle('');
    load();
  };

  const handleDelete = async (id) => {
    await deleteSideQuestAdmin(id);
    load();
  };

  return (
    <div className="card" style={{ padding: '1rem', margin: '1rem' }}>
      <h2>Side Quests</h2>
      <form onSubmit={handleCreate} style={{ marginBottom: '1rem' }}>
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" required />
        <button type="submit">Create</button>
      </form>
      <ul>
        {quests.map((q) => (
          <li key={q._id}>
            {q.title} <button onClick={() => handleDelete(q._id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

