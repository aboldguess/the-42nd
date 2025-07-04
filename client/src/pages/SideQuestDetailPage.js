import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  fetchSideQuest,
  submitSideQuest,
  fetchSettings,
  fetchProgressItem,
  fetchMe,
  deleteSideQuest
} from '../services/api';
import PhotoUploader from '../components/PhotoUploader';

// Detailed view for a single side quest with upload option
export default function SideQuestDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quest, setQuest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [passcode, setPasscode] = useState(''); // passcode input for secret quests
  const [answer, setAnswer] = useState(''); // selected answer for trivia quests
  const [defaults, setDefaults] = useState({}); // default instructions per type
  const [timeLeft, setTimeLeft] = useState(null); // countdown for timed quests
  const [stats, setStats] = useState(null); // progress details
  const [me, setMe] = useState(null); // current user info

  useEffect(() => {
    const load = async () => {
      try {
        const [sqRes, settingsRes] = await Promise.all([
          fetchSideQuest(id),
          fetchSettings()
        ]);
        setQuest(sqRes.data);
        setDefaults(settingsRes.data.sideQuestInstructions || {});
        if (sqRes.data.timeLimitSeconds) {
          setTimeLeft(sqRes.data.timeLimitSeconds);
        }
        // Fetch the current user info at the same time
        const meRes = await fetchMe();
        setMe(meRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (id) load();
    const loadStats = async () => {
      try {
        const data = await fetchProgressItem('sidequest', id);
        setStats(data);
      } catch (err) {
        console.error(err);
      }
    };
    if (id) loadStats();
  }, [id]);

  const handleUpload = async (formData) => {
    try {
      // Include passcode or trivia answer when applicable
      if (quest.questType === 'passcode') {
        formData.append('passcode', passcode);
      }
      if (quest.questType === 'trivia') {
        formData.append('answer', answer);
      }
      await submitSideQuest(id, formData);
      alert('Submission received!');
    } catch (err) {
      alert(err.response?.data?.message || 'Upload failed');
    }
  };

  // Remove this quest when the creator chooses to delete it
  const handleDelete = async () => {
    if (!window.confirm('Delete this side quest?')) return;
    try {
      await deleteSideQuest(id);
      navigate('/progress/sidequests');
    } catch (err) {
      alert(err.response?.data?.message || 'Error deleting side quest');
    }
  };

  // Start a simple countdown when timeLeft is set. This effect must run on
  // every render to preserve hook ordering even if the component early returns
  // during the loading state below.
  useEffect(() => {
    if (timeLeft === null) return;
    if (timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((t) => (t > 0 ? t - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  if (loading) return <p>Loading…</p>;
  if (!quest) return <p>Side quest not found.</p>;

  // Use quest specific instructions when provided, otherwise fall back to
  // the defaults loaded from the settings document.
  const instructionsText = quest.instructions || defaults[quest.questType];
  // Determine if the logged in user created this quest
  const canEdit = me && quest.createdByType === 'User' && me._id === quest.createdBy;

  return (
    <div>
      {/* Link back to the progress list of all side quests */}
      <Link to="/progress/sidequests" className="btn-link">
        &larr; Return to list
      </Link>
      <h2>{quest.title}</h2>
      <div className="card">
        <p>{quest.text}</p>
        {instructionsText && <p>{instructionsText}</p>}
        {timeLeft !== null && (
          <p style={{ fontWeight: 'bold' }}>Time remaining: {timeLeft}s</p>
        )}
        {quest.imageUrl && (
          <img
            src={quest.imageUrl}
            alt={quest.title}
            style={{ width: '100%', borderRadius: '4px', marginTop: '1rem' }}
          />
        )}
        {quest.questType === 'bonus' && quest.targetName && (
          <p style={{ fontWeight: 'bold' }}>
            Find and scan the QR code for {quest.targetName}!
          </p>
        )}
        {/* Extra fields for special quest types */}
        {quest.questType === 'passcode' && (
          <input
            type="text"
            placeholder="Enter passcode"
            value={passcode}
            onChange={(e) => setPasscode(e.target.value)}
            style={{ marginTop: '0.5rem' }}
          />
        )}
        {quest.questType === 'trivia' && (
          <div style={{ marginTop: '0.5rem' }}>
            {quest.options.map((o) => (
              <label key={o} style={{ display: 'block' }}>
                <input
                  type="radio"
                  name="answer"
                  value={o}
                  checked={answer === o}
                  onChange={(e) => setAnswer(e.target.value)}
                />
                {o}
              </label>
            ))}
          </div>
        )}
        <div style={{ marginTop: '1rem' }}>
          <PhotoUploader
            label="Upload Proof"
            requiredMediaType={quest.requiredMediaType}
            onUpload={handleUpload}
          />
        </div>
        {quest.questType === 'bonus' && (
          <div style={{ marginTop: '1rem' }}>
            <p>
              STATUS:{' '}
              {stats && stats.status === 'DONE!' ? 'COMPLETE' : 'INCOMPLETE'}!
            </p>
            {stats && stats.status === 'DONE!' && stats.completedBy && (
              <p>
                {quest.targetName} QR code scanned by {stats.completedBy} at{' '}
                {new Date(stats.completedAt).toLocaleString()} - well done!
              </p>
            )}
          </div>
        )}
        {stats && (
          <div style={{ marginTop: '1rem', fontSize: '0.9rem' }}>
            <p>Last scanned by: {stats.lastScannedBy || '-'}</p>
            <p>Total scans: {stats.totalScans}</p>
            {stats.setBy && <p>Set by: {stats.setBy}</p>}
            {stats.teamName && <p>Team: {stats.teamName}</p>}
          </div>
        )}
      </div>
      {canEdit && (
        <div style={{ marginTop: '1rem' }}>
          <button onClick={() => navigate(`/sidequests/${id}/edit`)}>Edit</button>
          <button onClick={handleDelete} style={{ marginLeft: '0.5rem' }}>
            Delete
          </button>
        </div>
      )}
    </div>
  );
}
