import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchPlayers, deletePlayer, createPlayer, updatePlayer } from '../services/api';
import { fetchTeamsList } from '../services/api';

// Admin table for managing players
export default function AdminPlayersPage() {
  const [players, setPlayers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [newPlayer, setNewPlayer] = useState({ name: '', team: '' });
  const [editId, setEditId] = useState(null);
  const [editData, setEditData] = useState({});

  useEffect(() => {
    load();
  }, []);

  // Fetch players and available teams for the dropdown
  const load = async () => {
    try {
      const { data } = await fetchPlayers();
      setPlayers(data);
      const teamRes = await fetchTeamsList();
      setTeams(teamRes.data);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Error loading players');
    }
  };

  // Add a new player record
  const handleCreate = async () => {
    try {
      await createPlayer(newPlayer);
      setNewPlayer({ name: '', team: '' });
      load();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Error creating player');
    }
  };

  // Persist edits to an existing player
  const handleSave = async (id) => {
    try {
      await updatePlayer(id, editData);
      setEditId(null);
      setEditData({});
      load();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Error updating player');
    }
  };

  // Remove a player
  const handleDelete = async (id) => {
    try {
      await deletePlayer(id);
      load();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Error deleting player');
    }
  };

  // Admin view listing all registered players
  return (
    <div className="card spaced-card">
      <h2>Players</h2>
      <p>
        <Link to="/admin/cribsheet">Print Crib Sheet</Link>
      </p>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Team</th>
            <th>QR</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {players.map((p) => (
            <tr key={p._id}>
              {editId === p._id ? (
                <>
                  <td><input value={editData.name} onChange={(e) => setEditData({ ...editData, name: e.target.value })} /></td>
                  <td>
                    <select value={editData.team} onChange={(e) => setEditData({ ...editData, team: e.target.value })}>
                      <option value="">--</option>
                      {teams.map((t) => (
                        <option key={t._id} value={t._id}>{t.name}</option>
                      ))}
                    </select>
                  </td>
                  <td>-</td>
                  <td>
                    <button onClick={() => handleSave(p._id)}>Save</button>
                    <button onClick={() => setEditId(null)}>Cancel</button>
                  </td>
                </>
              ) : (
                <>
                  <td>{p.name}</td>
                  <td>{p.team?.name}</td>
                  <td>-</td>
                  <td>
                    <button onClick={() => { setEditId(p._id); setEditData({ name: p.name, team: p.team?._id }); }}>Edit</button>
                    <button onClick={() => handleDelete(p._id)}>Delete</button>
                  </td>
                </>
              )}
            </tr>
          ))}
          <tr>
            <td><input value={newPlayer.name} onChange={(e) => setNewPlayer({ ...newPlayer, name: e.target.value })} placeholder="Name" /></td>
            <td>
              <select value={newPlayer.team} onChange={(e) => setNewPlayer({ ...newPlayer, team: e.target.value })}>
                <option value="">-- choose --</option>
                {teams.map((t) => (
                  <option key={t._id} value={t._id}>{t.name}</option>
                ))}
              </select>
            </td>
            <td>-</td>
            <td><button onClick={handleCreate}>Add</button></td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
