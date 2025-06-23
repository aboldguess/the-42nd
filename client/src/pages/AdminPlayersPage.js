import React, { useEffect, useState } from 'react';
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

  const load = async () => {
    const { data } = await fetchPlayers();
    setPlayers(data);
    const teamRes = await fetchTeamsList();
    setTeams(teamRes.data);
  };

  const handleCreate = async () => {
    await createPlayer(newPlayer);
    setNewPlayer({ name: '', team: '' });
    load();
  };

  const handleSave = async (id) => {
    await updatePlayer(id, editData);
    setEditId(null);
    setEditData({});
    load();
  };

  const handleDelete = async (id) => {
    await deletePlayer(id);
    load();
  };

  return (
    <div className="card" style={{ padding: '1rem', margin: '1rem' }}>
      <h2>Players</h2>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Team</th>
            {/* Show each player's QR code */}
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
                  <td>
                    {/* Data URL from the API renders the player's QR */}
                    {p.qrCodeData && (
                      <img src={p.qrCodeData} alt="qr" width="40" />
                    )}
                  </td>
                  <td>
                    <button onClick={() => handleSave(p._id)}>Save</button>
                    <button onClick={() => setEditId(null)}>Cancel</button>
                  </td>
                </>
              ) : (
                <>
                  <td>{p.name}</td>
                  <td>{p.team?.name}</td>
                  <td>
                    {p.qrCodeData && (
                      <img src={p.qrCodeData} alt="qr" width="40" />
                    )}
                  </td>
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
