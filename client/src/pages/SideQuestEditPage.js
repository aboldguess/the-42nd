import React, { useEffect, useState, useCallback } from 'react';
import ExpandableQr from '../components/ExpandableQr';
import { useParams, useNavigate } from 'react-router-dom';
import {
  fetchSideQuest,
  updateSideQuest,
  deleteSideQuest,
  fetchProgress
} from '../services/api';

// Page for editing a single side quest. Fields change depending on the quest type.
export default function SideQuestEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quest, setQuest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [scannedItems, setScannedItems] = useState([]); // used for bonus quests

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

  // Fetch scanned items so a bonus quest can target one
  // Fetch scanned items so a bonus quest can target one. Wrapped in useCallback
  // so it can be safely listed in useEffect dependencies.
  const loadScanned = useCallback(async () => {
    try {
      const [clues, questions, sqs] = await Promise.all([
        fetchProgress('clue'),
        fetchProgress('question'),
        fetchProgress('sidequest')
      ]);
      const scanned = [...clues, ...questions, ...sqs].filter((i) => i.scanned);
      setScannedItems(scanned);
    } catch (err) {
      console.error(err);
    }
  }, []);

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
      await updateSideQuest(id, quest);
      alert('Saved');
      loadQuest();
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
  const setField = (key, value) => setQuest({ ...quest, [key]: value });

  // Options for quest types shown when editing
  const questTypeOptions = [
    { value: 'bonus', label: 'Bonus hunt!' },
    { value: 'meetup', label: 'Come and meet us!' },
    { value: 'photo', label: 'Take a photo!' },
    { value: 'race', label: 'Race!' },
    { value: 'passcode', label: 'Secret Passcode!' },
    { value: 'trivia', label: 'Trivia Challenge!' }
  ];

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
          Text:
          <input
            value={quest.text || ''}
            onChange={(e) => setField('text', e.target.value)}
            style={{ marginLeft: '0.5rem' }}
          />
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
          <label style={{ display: 'block', marginBottom: '0.5rem' }}>
            Target QR:
            <select
              value={quest.targetId || ''}
              onChange={(e) => setField('targetId', e.target.value)}
              style={{ marginLeft: '0.5rem' }}
            >
              <option value="">Select scanned QR</option>
              {scannedItems.map((it) => (
                <option key={it._id} value={it._id}>
                  {it.title}
                </option>
              ))}
            </select>
          </label>
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
      {quest.qrCodeData && (
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
