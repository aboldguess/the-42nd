import React, { useEffect, useState } from 'react';
import {
  fetchKudosAdmin,
  createKudosCategory,
  updateKudosCategory,
  deleteKudosCategory
} from '../services/api';

export default function AdminKudosPage() {
  const [cats, setCats] = useState([]);
  const [newTitle, setNewTitle] = useState('');
  const [editId, setEditId] = useState(null);
  const [editTitle, setEditTitle] = useState('');

  const load = async () => {
    try {
      const { data } = await fetchKudosAdmin();
      setCats(data);
    } catch (err) {
      alert('Error loading categories');
    }
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async () => {
    try {
      await createKudosCategory({ title: newTitle });
      setNewTitle('');
      load();
    } catch (err) {
      alert('Error creating category');
    }
  };

  const handleSave = async (id) => {
    try {
      await updateKudosCategory(id, { title: editTitle });
      setEditId(null);
      setEditTitle('');
      load();
    } catch (err) {
      alert('Error updating category');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this category?')) return;
    try {
      await deleteKudosCategory(id);
      load();
    } catch (err) {
      alert('Error deleting category');
    }
  };

  return (
    <div className="card spaced-card">
      <h2>Kudos Titles</h2>
      <table>
        <thead>
          <tr>
            <th>Title</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {cats.map((c) => (
            <tr key={c._id}>
              {editId === c._id ? (
                <>
                  <td>
                    <input
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                    />
                  </td>
                  <td>
                    <button onClick={() => handleSave(c._id)}>Save</button>
                    <button onClick={() => setEditId(null)}>Cancel</button>
                  </td>
                </>
              ) : (
                <>
                  <td>{c.title}</td>
                  <td>
                    <button
                      onClick={() => {
                        setEditId(c._id);
                        setEditTitle(c.title);
                      }}
                    >
                      Edit
                    </button>
                    <button onClick={() => handleDelete(c._id)}>Delete</button>
                  </td>
                </>
              )}
            </tr>
          ))}
          <tr>
            <td>
              <input
                value={newTitle}
                placeholder="New title"
                onChange={(e) => setNewTitle(e.target.value)}
              />
            </td>
            <td>
              <button onClick={handleCreate}>Add</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
