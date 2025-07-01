import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchSideQuest, submitSideQuest, fetchSettings } from '../services/api';
import PhotoUploader from '../components/PhotoUploader';

// Detailed view for a single side quest with upload option
export default function SideQuestDetailPage() {
  const { id } = useParams();
  const [quest, setQuest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [passcode, setPasscode] = useState(''); // passcode input for secret quests
  const [answer, setAnswer] = useState(''); // selected answer for trivia quests
  const [defaults, setDefaults] = useState({}); // default instructions per type
  const [timeLeft, setTimeLeft] = useState(null); // countdown for timed quests

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
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (id) load();
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

  if (loading) return <p>Loading…</p>;
  if (!quest) return <p>Side quest not found.</p>;

  // Use quest specific instructions when provided, otherwise fall back to
  // the defaults loaded from the settings document.
  const instructionsText = quest.instructions || defaults[quest.questType];

  // Start a simple countdown when timeLeft is set
  useEffect(() => {
    if (timeLeft === null) return;
    if (timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((t) => (t > 0 ? t - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  return (
    <div>
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
      </div>
    </div>
  );
}
