import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  fetchMySideQuests,
  createSideQuest,
  updateSideQuest,
  deleteSideQuest,
  fetchProgress,
  fetchMe
} from '../services/api';

// Player managed side quests with CRUD functionality
export default function NewSideQuestPage() {
  // navigation helper used to redirect after creating a quest
  const navigate = useNavigate();
  const [quests, setQuests] = useState([]);
  const [scannedItems, setScannedItems] = useState([]); // items scanned by the team
  const [teamName, setTeamName] = useState('');
  const [filter, setFilter] = useState('');
  const [newQuest, setNewQuest] = useState({
    title: '',
    text: '',
    questType: 'photo',
    image: null,
    targetId: '',
    targetType: ''
  });
  const [editId, setEditId] = useState(null);
  const [editData, setEditData] = useState({});

  useEffect(() => {
    load();
    loadScanned();
    const loadMe = async () => {
      try {
        const { data } = await fetchMe();
        setTeamName(data.team?.name || '');
      } catch (err) {
        console.error(err);
      }
    };
    loadMe();
  }, []);

  useEffect(() => {
    if (newQuest.questType === 'bonus' && teamName) {
      setNewQuest((q) => ({ ...q, title: `${teamName}'s sidequest QR hunt` }));
    }
  }, [newQuest.questType, teamName]);

  const load = async () => {
    try {
      const { data } = await fetchMySideQuests();
      setQuests(data);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Error loading side quests');
    }
  };

  // Load list of scanned items for "Bonus hunt" quests
  const loadScanned = async () => {
    try {
      const [clues, questions, players] = await Promise.all([
        fetchProgress('clue'),
        fetchProgress('question'),
        fetchProgress('player')
      ]);
      const typed = [
        ...clues.map((c) => ({ ...c, type: 'clue' })),
        ...questions.map((q) => ({ ...q, type: 'question' })),
        ...players.map((p) => ({ ...p, type: 'player' }))
      ];
      // only include items the team has scanned
      const scanned = typed.filter((i) => i.scanned);
      setScannedItems(scanned);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreate = async () => {
    try {
      const formData = new FormData();
      formData.append('title', newQuest.title);
      formData.append('text', newQuest.text);
      formData.append('questType', newQuest.questType);
      if (newQuest.image) formData.append('image', newQuest.image);
      if (newQuest.targetId) formData.append('targetId', newQuest.targetId);
      if (newQuest.targetType) formData.append('targetType', newQuest.targetType);
      const res = await createSideQuest(formData);
      setNewQuest({ title: '', text: '', questType: 'photo', image: null, targetId: '', targetType: '' });
      load();
      // After successfully creating the quest, take the user straight
      // to its page so they can view or continue editing it
      navigate(`/sidequest/${res.data._id}`);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Error creating side quest');
    }
  };

  const handleSave = async (id) => {
    try {
      let payload = editData;
      if (editData.image) {
        const formData = new FormData();
        formData.append('title', editData.title);
        formData.append('text', editData.text);
        formData.append('questType', editData.questType);
        formData.append('image', editData.image);
        if (editData.targetId) formData.append('targetId', editData.targetId);
        if (editData.targetType) formData.append('targetType', editData.targetType);
        payload = formData;
      } else if (editData.targetType) {
        payload = { ...editData };
      }
      await updateSideQuest(id, payload);
      setEditId(null);
      setEditData({});
      load();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Error updating side quest');
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteSideQuest(id);
      load();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Error deleting side quest');
    }
  };

  const questTypeOptions = [
    { value: 'bonus', label: 'Bonus hunt!' },
    { value: 'meetup', label: 'Come and meet us!' },
    { value: 'photo', label: 'Take a photo!' },
    { value: 'race', label: 'Race!' },
    // additional suggestions
    { value: 'passcode', label: 'Secret Passcode!' },
    { value: 'trivia', label: 'Trivia Challenge!' }
  ];

  return (
    <div className="card spaced-card">
      <h2>Manage Side Quests</h2>
      <table>
        <thead>
          <tr>
            <th>Title</th>
            <th>Type</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {quests.map((q) => (
            <tr key={q._id}>
              {editId === q._id ? (
                <>
                  <td>
                    <input
                      value={editData.title}
                      onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                    />
                  </td>
                  <td>
                    <select
                      value={editData.questType}
                      onChange={(e) => setEditData({ ...editData, questType: e.target.value })}
                    >
                      {questTypeOptions.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                    {editData.questType === 'bonus' && (
                      <>
                        <input
                          type="text"
                          placeholder="Search..."
                          value={filter}
                          onChange={(e) => setFilter(e.target.value)}
                        />
                        <select
                          value={editData.targetId}
                          onChange={(e) => {
                            const val = e.target.value;
                            const it = scannedItems.find((s) => s._id === val);
                            setEditData({
                              ...editData,
                              targetId: val,
                              targetType: it ? it.type : ''
                            });
                          }}
                        >
                          <option value="">Select scanned QR</option>
                          {scannedItems
                            .filter((it) =>
                              it.title.toLowerCase().includes(filter.toLowerCase())
                            )
                            .map((it) => (
                              <option key={it._id} value={it._id}>
                                {it.title}
                              </option>
                            ))}
                        </select>
                      </>
                    )}
                  </td>
                  <td>
                    <button onClick={() => handleSave(q._id)}>Save</button>
                    <button onClick={() => setEditId(null)}>Cancel</button>
                  </td>
                </>
              ) : (
                <>
                  <td>{q.title}</td>
                  <td>{questTypeOptions.find((o) => o.value === q.questType)?.label || q.questType}</td>
                  <td>
                    <button
                      onClick={() => {
                        setEditId(q._id);
                        setEditData({
                          title: q.title,
                          questType: q.questType,
                          targetId: q.targetId || '',
                          targetType: q.targetType || ''
                        });
                      }}
                    >
                      Edit
                    </button>
                    <button onClick={() => handleDelete(q._id)}>Delete</button>
                  </td>
                </>
              )}
            </tr>
          ))}
          <tr>
            <td>
              <input
                value={newQuest.title}
                onChange={(e) => setNewQuest({ ...newQuest, title: e.target.value })}
                placeholder="Title"
              />
            </td>
            <td>
              <select
                value={newQuest.questType}
                onChange={(e) => setNewQuest({ ...newQuest, questType: e.target.value })}
              >
                {questTypeOptions.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
              {newQuest.questType === 'bonus' && (
                <>
                  <input
                    type="text"
                    placeholder="Search..."
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                  />
                  <select
                    value={newQuest.targetId}
                    onChange={(e) => {
                      const val = e.target.value;
                      const it = scannedItems.find((s) => s._id === val);
                      setNewQuest({
                        ...newQuest,
                        targetId: val,
                        targetType: it ? it.type : ''
                      });
                    }}
                  >
                    <option value="">Select scanned QR</option>
                    {scannedItems
                      .filter((it) =>
                        it.title.toLowerCase().includes(filter.toLowerCase())
                      )
                      .map((it) => (
                        <option key={it._id} value={it._id}>
                          {it.title}
                        </option>
                      ))}
                  </select>
                </>
              )}
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
