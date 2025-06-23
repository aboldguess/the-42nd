import React, { useEffect, useState } from 'react';

// Admin interface for CRUD operations on side quests
import {
  fetchSideQuestsAdmin,
  createSideQuestAdmin,
  deleteSideQuestAdmin
} from '../services/api';

export default function AdminSideQuestsPage() {
  const [quests, setQuests] = useState([]);
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [image, setImage] = useState(null);
  const [timeLimit, setTimeLimit] = useState('');
  const [useStopwatch, setUseStopwatch] = useState(false);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    const { data } = await fetchSideQuestsAdmin();
    setQuests(data);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('title', title);
    formData.append('text', text);
    if (image) formData.append('image', image);
    if (timeLimit) formData.append('timeLimitSeconds', timeLimit);
    formData.append('useStopwatch', useStopwatch ? 'true' : 'false');
    await createSideQuestAdmin(formData);
    setTitle('');
    setText('');
    setImage(null);
    setTimeLimit('');
    setUseStopwatch(false);
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
        <input
          type="number"
          min="0"
          value={timeLimit}
          onChange={(e) => setTimeLimit(e.target.value)}
          placeholder="Countdown seconds"
        />
        <label style={{ marginLeft: '0.5rem' }}>
          <input
            type="checkbox"
            checked={useStopwatch}
            onChange={(e) => setUseStopwatch(e.target.checked)}
          />
          Stopwatch
        </label>
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

