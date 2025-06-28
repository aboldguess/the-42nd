import React, { useEffect, useState } from 'react';
import {
  fetchTeamsAdmin,
  createTeamAdmin,
  updateTeamAdmin,
  deleteTeamAdmin,
  fetchPlayersByTeam,
  createPlayer,
  deletePlayer
} from '../services/api';

// Admin table for managing teams. The expanded row lets an admin add or remove
// players without leaving the page.
export default function AdminTeamsPage() {
  const [teams, setTeams] = useState([]); // list of teams from the API
  const [newTeam, setNewTeam] = useState({ name: '', password: '' });
  const [editId, setEditId] = useState(null); // id of team being edited
  const [editData, setEditData] = useState({}); // form state for edit row
  const [expandedId, setExpandedId] = useState(null); // team showing players
  const [players, setPlayers] = useState([]); // players for expanded team
  const [newPlayerName, setNewPlayerName] = useState('');

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

  // Expand a row to show and manage the team's players
  const handleExpand = async (id) => {
    if (expandedId === id) {
      setExpandedId(null);
      setPlayers([]);
      return;
    }
    setExpandedId(id);
    try {
      const res = await fetchPlayersByTeam(id);
      setPlayers(res.data);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Error loading players');
    }
  };

  // Add a new player linked to the currently expanded team
  const handleAddPlayer = async () => {
    try {
      await createPlayer({ name: newPlayerName, team: expandedId });
      setNewPlayerName('');
      const res = await fetchPlayersByTeam(expandedId);
      setPlayers(res.data);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Error adding player');
    }
  };

  // Remove an existing player
  const handleRemovePlayer = async (playerId) => {
    try {
      await deletePlayer(playerId);
      const res = await fetchPlayersByTeam(expandedId);
      setPlayers(res.data);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Error deleting player');
    }
  };

  // Manage teams in a single table
  return (
    <div className="card spaced-card">
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
            <React.Fragment key={t._id}>
              <tr>
                {editId === t._id ? (
                  <>
                    <td>
                      <input
                        value={editData.name}
                        onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                      />
                    </td>
                    <td>{t.leader ? t.leader.name : '-'}</td>
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
                      <button onClick={() => handleExpand(t._id)}>
                        {expandedId === t._id ? 'Hide' : 'Players'}
                      </button>
                      <button onClick={() => { setEditId(t._id); setEditData({ name: t.name }); }}>Edit</button>
                      <button onClick={() => handleDelete(t._id)}>Delete</button>
                    </td>
                  </>
                )}
              </tr>
              {expandedId === t._id && (
                <tr>
                  <td colSpan="3">
                    {/* Existing players for this team */}
                    <ul>
                      {players.map((p) => (
                        <li key={p._id}>
                          {p.name}{' '}
                          <button onClick={() => handleRemovePlayer(p._id)}>Remove</button>
                        </li>
                      ))}
                    </ul>
                    {/* Add a new player */}
                    <input
                      value={newPlayerName}
                      onChange={(e) => setNewPlayerName(e.target.value)}
                      placeholder="New player name"
                    />
                    <button onClick={handleAddPlayer}>Add Player</button>
                  </td>
                </tr>
              )}
            </React.Fragment>
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
