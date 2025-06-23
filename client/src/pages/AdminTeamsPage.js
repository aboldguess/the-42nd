import React, { useEffect, useState } from 'react';
import {
  fetchTeamsAdmin,
  createTeamAdmin,
  updateTeamAdmin,
  deleteTeamAdmin
} from '../services/api';

// Admin table for managing teams
export default function AdminTeamsPage() {
  const [teams, setTeams] = useState([]);          // list of teams
  const [newTeam, setNewTeam] = useState({ name: '', password: '' });
  const [editId, setEditId] = useState(null);      // id currently being edited
  const [editData, setEditData] = useState({});    // form data for edit row

  // Fetch all teams on component mount
  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    const { data } = await fetchTeamsAdmin();
    setTeams(data);
  };

  const handleCreate = async () => {
    await createTeamAdmin(newTeam);
    setNewTeam({ name: '', password: '' });
    load();
  };

  const handleSave = async (id) => {
    await updateTeamAdmin(id, editData);
    setEditId(null);
    setEditData({});
    load();
  };

  const handleDelete = async (id) => {
    await deleteTeamAdmin(id);
    load();
  };

  return (
    <div className="card" style={{ padding: '1rem', margin: '1rem' }}>
      <h2>Teams</h2>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Password</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {teams.map((t) => (
            <tr key={t._id}>
              {editId === t._id ? (
                <>
                  <td>
                    <input
                      value={editData.name}
                      onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                    />
                  </td>
                  <td>
                    <input
                      type="password"
                      value={editData.password || ''}
                      onChange={(e) => setEditData({ ...editData, password: e.target.value })}
                    />
                  </td>
                  <td>
                    <button onClick={() => handleSave(t._id)}>Save</button>
                    <button onClick={() => setEditId(null)}>Cancel</button>
                  </td>
                </>
              ) : (
                <>
                  <td>{t.name}</td>
                  <td>••••••</td>
                  <td>
                    <button
                      onClick={() => {
                        setEditId(t._id);
                        setEditData({ name: t.name });
                      }}
                    >
                      Edit
                    </button>
                    <button onClick={() => handleDelete(t._id)}>Delete</button>
                  </td>
                </>
              )}
            </tr>
          ))}
          <tr>
            <td>
              <input
                value={newTeam.name}
                onChange={(e) => setNewTeam({ ...newTeam, name: e.target.value })}
                placeholder="Name"
              />
            </td>
            <td>
              <input
                type="password"
                value={newTeam.password}
                onChange={(e) => setNewTeam({ ...newTeam, password: e.target.value })}
                placeholder="Password"
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
