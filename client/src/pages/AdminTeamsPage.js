import React, { useEffect, useState } from 'react';
import { fetchTeamsAdmin, createTeamAdmin, updateTeamAdmin, deleteTeamAdmin } from '../services/api';

// Admin table for managing teams
export default function AdminTeamsPage() {
  const [teams, setTeams] = useState([]); // list of teams from the API
  const [newTeam, setNewTeam] = useState({ name: '', password: '' });
  const [editId, setEditId] = useState(null); // id of team being edited
  const [editData, setEditData] = useState({}); // form state for edit row

  // Load the list of teams on mount
  useEffect(() => {
    load();
  }, []);

  // Fetch all teams for display in the table
  const load = async () => {
    try {
      const { data } = await fetchTeamsAdmin();
      setTeams(data);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Error loading teams');
    }
  };

  // Create a new team with name and password
  const handleCreate = async () => {
    try {
      await createTeamAdmin(newTeam);
      setNewTeam({ name: '', password: '' });
      load();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Error creating team');
    }
  };

  // Save edits to an existing team
  const handleSave = async (id) => {
    try {
      await updateTeamAdmin(id, editData);
      setEditId(null);
      setEditData({});
      load();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Error updating team');
    }
  };

  // Delete a team by ID
  const handleDelete = async (id) => {
    try {
      await deleteTeamAdmin(id);
      load();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Error deleting team');
    }
  };

  return (
    <div className="card" style={{ padding: '1rem', margin: '1rem' }}>
      <h2>Teams</h2>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Leader</th>
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
                    {t.leader ? t.leader.name : '-'}
                  </td>
                  <td>
                    <button onClick={() => handleSave(t._id)}>Save</button>
                    <button onClick={() => setEditId(null)}>Cancel</button>
                  </td>
                </>
              ) : (
                <>
                  <td>{t.name}</td>
                  <td>{t.leader ? t.leader.name : '-'}</td>
                  <td>
                    <button onClick={() => { setEditId(t._id); setEditData({ name: t.name }); }}>Edit</button>
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
            <td>-</td>
            <td>
              <input
                type="password"
                value={newTeam.password}
                onChange={(e) => setNewTeam({ ...newTeam, password: e.target.value })}
                placeholder="Password"
              />
              <button onClick={handleCreate}>Add</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
