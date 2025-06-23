import React, { useEffect, useState } from 'react';
import {
  fetchSideQuestsAdmin,
  createSideQuestAdmin,
  updateSideQuestAdmin,
  deleteSideQuestAdmin
} from '../services/api';

// Admin table for side quests with CRUD
export default function AdminSideQuestsPage() {
  const [quests, setQuests] = useState([]);
  const [newQuest, setNewQuest] = useState({ title: '', text: '', timeLimitSeconds: '', useStopwatch: false });
  const [editId, setEditId] = useState(null);
  const [editData, setEditData] = useState({});

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    const { data } = await fetchSideQuestsAdmin();
    setQuests(data);
  };

  const handleCreate = async () => {
    const formData = new FormData();
    formData.append('title', newQuest.title);
    formData.append('text', newQuest.text);
    if (newQuest.timeLimitSeconds)
      formData.append('timeLimitSeconds', newQuest.timeLimitSeconds);
    formData.append('useStopwatch', newQuest.useStopwatch ? 'true' : 'false');
    await createSideQuestAdmin(formData);
    setNewQuest({ title: '', text: '', timeLimitSeconds: '', useStopwatch: false });
    load();
  };

  const handleSave = async (id) => {
    await updateSideQuestAdmin(id, editData);
    setEditId(null);
    setEditData({});
    load();
  };

  const handleDelete = async (id) => {
    await deleteSideQuestAdmin(id);
    load();
  };

  return (
    <div className="card" style={{ padding: '1rem', margin: '1rem' }}>
      <h2>Side Quests</h2>
      <table>
        <thead>
          <tr>
            <th>Title</th>
            <th>Text</th>
            <th>Time Limit</th>
            <th>QR</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {quests.map((q) => (
            <tr key={q._id}>
              {editId === q._id ? (
                <>
                  <td><input value={editData.title} onChange={(e) => setEditData({ ...editData, title: e.target.value })} /></td>
                  <td><input value={editData.text} onChange={(e) => setEditData({ ...editData, text: e.target.value })} /></td>
                  <td><input value={editData.timeLimitSeconds} onChange={(e) => setEditData({ ...editData, timeLimitSeconds: e.target.value })} /></td>
                  <td>{q.qrCodeData ? <img src={q.qrCodeData} alt="QR" width={50} /> : '-'}</td>
                  <td>
                    <button onClick={() => handleSave(q._id)}>Save</button>
                    <button onClick={() => setEditId(null)}>Cancel</button>
                  </td>
                </>
              ) : (
                <>
                  <td>{q.title}</td>
                  <td>{q.text}</td>
                  <td>{q.timeLimitSeconds || '-'}</td>
                  <td>{q.qrCodeData ? <img src={q.qrCodeData} alt="QR" width={50} /> : '-'}</td>
                  <td>
                    <button onClick={() => { setEditId(q._id); setEditData({ title: q.title, text: q.text, timeLimitSeconds: q.timeLimitSeconds, useStopwatch: q.useStopwatch }); }}>Edit</button>
                    <button onClick={() => handleDelete(q._id)}>Delete</button>
                  </td>
                </>
              )}
            </tr>
          ))}
          <tr>
            <td><input value={newQuest.title} onChange={(e) => setNewQuest({ ...newQuest, title: e.target.value })} placeholder="Title" /></td>
            <td><input value={newQuest.text} onChange={(e) => setNewQuest({ ...newQuest, text: e.target.value })} placeholder="Text" /></td>
            <td><input value={newQuest.timeLimitSeconds} onChange={(e) => setNewQuest({ ...newQuest, timeLimitSeconds: e.target.value })} placeholder="Seconds" /></td>
            <td>-</td>
            <td><button onClick={handleCreate}>Add</button></td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
