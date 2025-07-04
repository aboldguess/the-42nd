import React, { useEffect, useState, useCallback } from 'react';
import ExpandableQr from '../components/ExpandableQr';
import ImageSelector from '../components/ImageSelector';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  fetchSideQuest,
  updateSideQuest,
  deleteSideQuest,
  fetchProgress,
  fetchSettings
} from '../services/api';

// Page for editing a single side quest. Fields change depending on the quest type.
export default function SideQuestEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  // Detect if the edit page was opened immediately after creating a new quest
  const isNew = new URLSearchParams(location.search).get('new') === '1';
  const [quest, setQuest] = useState(null);
  const [loading, setLoading] = useState(true);
  // Lists of potential targets for bonus quests
  const [players, setPlayers] = useState([]); // all players are valid targets
  const [scannedQuestions, setScannedQuestions] = useState([]); // team-scanned questions
  const [scannedClues, setScannedClues] = useState([]); // team-scanned clues
  const [hideTypes, setHideTypes] = useState({});

  // Retrieve the quest from the API. Memoized so React Hook rules
  // can list it as a dependency without re-running unnecessarily.
  const loadQuest = useCallback(async () => {
    try {
      const { data } = await fetchSideQuest(id);
      setQuest(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  // Load visibility settings so disallowed quest types can be hidden
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const settingsRes = await fetchSettings();
        setHideTypes(settingsRes.data.sideQuestAdminOnly || {});
      } catch (err) {
        console.error(err);
      }
    };
    loadSettings();
  }, []);

  // Fetch scanned items so a bonus quest can target one
  // Fetch scanned items so a bonus quest can target one. Wrapped in useCallback
  // so it can be safely listed in useEffect dependencies.
  const loadScanned = useCallback(async () => {
    try {
      const [cluesRes, questionsRes, playersRes] = await Promise.all([
        fetchProgress('clue'),
        fetchProgress('question'),
        fetchProgress('player')
      ]);

      // Store all players as potential targets
      setPlayers(playersRes.data.map((p) => ({ ...p, type: 'player' })));

      // Only include questions and clues our team has scanned
      setScannedQuestions(
        questionsRes.data
          .filter((q) => q.scanned)
          .map((q) => ({ ...q, type: 'question' }))
      );
      setScannedClues(
        cluesRes.data
          .filter((c) => c.scanned)
          .map((c) => ({ ...c, type: 'clue' }))
      );
    } catch (err) {
      console.error(err);
    }
  }, []);

  // When visibility settings load ensure the quest type is allowed
  useEffect(() => {
    if (quest && hideTypes[quest.questType]) {
      const first = questTypeOptions.find((o) => !hideTypes[o.value]);
      if (first) setQuest({ ...quest, questType: first.value });
    }
  }, [hideTypes]);

  // Load quest details and scanned items when the id changes
  useEffect(() => {
    if (id) {
      loadQuest();
      loadScanned();
    }
  }, [id, loadQuest, loadScanned]);

  // Save updated fields
  const handleSave = async () => {
    try {
      let payload = quest;
      if (quest.image) {
        const formData = new FormData();
        formData.append('title', quest.title);
        formData.append('text', quest.text);
        formData.append('questType', quest.questType);
        formData.append('image', quest.image);
        if (quest.targetId) formData.append('targetId', quest.targetId);
        if (quest.targetType) formData.append('targetType', quest.targetType);
        payload = formData;
      }
      await updateSideQuest(id, payload);
      if (isNew) {
        // After saving a newly created quest, send the player to the
        // quest's detail page to start interacting with it
        navigate(`/sidequest/${id}`);
      } else {
        alert('Saved');
        loadQuest();
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Error saving side quest');
    }
  };

  // Delete the quest entirely
  const handleDelete = async () => {
    if (!window.confirm('Delete this side quest?')) return;
    try {
      await deleteSideQuest(id);
      navigate('/progress/sidequests');
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Error deleting side quest');
    }
  };

  if (loading) return <p>Loading…</p>;
  if (!quest) return <p>Side quest not found.</p>;

  // Helper to update a property on the quest object
  // Generic helper for updating quest fields. Using the functional
  // form of setQuest ensures multiple updates in the same event
  // (e.g. setting both targetId and targetType) are merged correctly.
  const setField = (key, value) =>
    setQuest((q) => ({
      ...q,
      [key]: value
    }));

  // Options for quest types shown when editing. Admin-only types are filtered
  // out based on the settings loaded earlier.
  const allQuestTypeOptions = [
    { value: 'bonus', label: 'Bonus hunt!' },
    { value: 'meetup', label: 'Come and meet us!' },
    { value: 'photo', label: 'Take a photo!' },
    { value: 'race', label: 'Race!' },
    { value: 'passcode', label: 'Secret Passcode!' },
    { value: 'trivia', label: 'Trivia Challenge!' }
  ];
  const questTypeOptions = allQuestTypeOptions.filter((o) => !hideTypes[o.value]);

  return (
    <div className="card spaced-card">
      <h2>Edit Side Quest</h2>
      <div style={{ marginBottom: '1rem' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem' }}>
          Title:
          <input
            value={quest.title || ''}
            onChange={(e) => setField('title', e.target.value)}
            style={{ marginLeft: '0.5rem' }}
          />
        </label>
        <label style={{ display: 'block', marginBottom: '0.5rem' }}>
          Clue:
          <input
            value={quest.text || ''}
            onChange={(e) => setField('text', e.target.value)}
            style={{ marginLeft: '0.5rem' }}
          />
        </label>
        <label style={{ display: 'block', marginBottom: '0.5rem' }}>
          Photo:
          <ImageSelector onSelect={(file) => setField('image', file)} />
        </label>
        <label style={{ display: 'block', marginBottom: '0.5rem' }}>
          Type:
          <select
            value={quest.questType}
            onChange={(e) => setField('questType', e.target.value)}
            style={{ marginLeft: '0.5rem' }}
          >
            {questTypeOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>

        {/* Additional fields depending on the quest type */}
        {quest.questType === 'bonus' && (
          <div style={{ marginBottom: '0.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>
              Target QR:
            </label>
            <table>
              <thead>
                <tr>
                  <th>Players</th>
                  <th>Questions</th>
                  <th>Clues</th>
                </tr>
              </thead>
              <tbody>
                {Array.from({
                  length: Math.max(
                    players.length,
                    scannedQuestions.length,
                    scannedClues.length
                  )
                }).map((_, idx) => (
                  <tr key={idx}>
                    <td data-label="Players">
                      {players[idx] && (
                        <label>
                          <input
                            type="radio"
                            name="target"
                            value={players[idx]._id}
                            checked={quest.targetId === players[idx]._id}
                            /* Selecting a target sets both ID and type */
                            onChange={() => {
                              setField('targetId', players[idx]._id);
                              setField('targetType', 'player');
                            }}
                          />{' '}
                          {players[idx].title}
                        </label>
                      )}
                    </td>
                    <td data-label="Questions">
                      {scannedQuestions[idx] && (
                        <label>
                          <input
                            type="radio"
                            name="target"
                            value={scannedQuestions[idx]._id}
                            checked={quest.targetId === scannedQuestions[idx]._id}
                            /* Selecting a target sets both ID and type */
                            onChange={() => {
                              setField('targetId', scannedQuestions[idx]._id);
                              setField('targetType', 'question');
                            }}
                          />{' '}
                          {scannedQuestions[idx].title}
                        </label>
                      )}
                    </td>
                    <td data-label="Clues">
                      {scannedClues[idx] && (
                        <label>
                          <input
                            type="radio"
                            name="target"
                            value={scannedClues[idx]._id}
                            checked={quest.targetId === scannedClues[idx]._id}
                            /* Selecting a target sets both ID and type */
                            onChange={() => {
                              setField('targetId', scannedClues[idx]._id);
                              setField('targetType', 'clue');
                            }}
                          />{' '}
                          {scannedClues[idx].title}
                        </label>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {quest.questType === 'passcode' && (
          <label style={{ display: 'block', marginBottom: '0.5rem' }}>
            Passcode:
            <input
              value={quest.passcode || ''}
              onChange={(e) => setField('passcode', e.target.value)}
              style={{ marginLeft: '0.5rem' }}
            />
          </label>
        )}
        {quest.questType === 'trivia' && (
          <>
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>
              Question:
              <input
                value={quest.question || ''}
                onChange={(e) => setField('question', e.target.value)}
                style={{ marginLeft: '0.5rem' }}
              />
            </label>
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>
              Options (comma separated):
              <input
                value={quest.options ? quest.options.join(',') : ''}
                onChange={(e) =>
                  setField(
                    'options',
                    e.target.value.split(',').map((s) => s.trim())
                  )
                }
                style={{ marginLeft: '0.5rem' }}
              />
            </label>
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>
              Correct Option:
              <input
                value={quest.correctOption || ''}
                onChange={(e) => setField('correctOption', e.target.value)}
                style={{ marginLeft: '0.5rem' }}
              />
            </label>
          </>
        )}
        {quest.questType === 'race' && (
          <label style={{ display: 'block', marginBottom: '0.5rem' }}>
            Photo Count:
            <input
              type="number"
              value={quest.photoCount || 1}
              onChange={(e) => setField('photoCount', e.target.value)}
              style={{ marginLeft: '0.5rem' }}
            />
          </label>
        )}
      </div>
      {/*
        Display the quest's QR code only when editing an existing quest.
        When a new quest is first created (isNew === true) the QR should
        remain hidden so the user can finish configuring details before
        sharing it.
      */}
      {quest.qrCodeData && !isNew && (
        <div style={{ marginBottom: '1rem' }}>
          <ExpandableQr data={quest.qrCodeData} size={120} />
        </div>
      )}
      <button onClick={handleSave}>Save</button>
      <button onClick={handleDelete} style={{ marginLeft: '0.5rem' }}>
        Delete
      </button>
    </div>
  );
}
