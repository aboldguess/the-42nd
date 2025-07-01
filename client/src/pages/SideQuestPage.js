import React, { useEffect, useState } from 'react';
import {
  fetchSideQuests,
  submitSideQuest,
  fetchSettings
} from '../services/api';
import PhotoUploader from '../components/PhotoUploader';

export default function SideQuestPage() {
  // List of available quests
  const [quests, setQuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [defaults, setDefaults] = useState({});

  useEffect(() => {
    // Load quest data on mount
    const load = async () => {
      try {
        const [qRes, sRes] = await Promise.all([
          fetchSideQuests(),
          fetchSettings()
        ]);
        setQuests(qRes.data);
        setDefaults(sRes.data.sideQuestInstructions || {});
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Upload media proof for a quest with optional passcode/answer fields
  const handleUpload = async (quest, formData, passcode = '', answer = '') => {
    try {
      if (quest.questType === 'passcode') {
        formData.append('passcode', passcode);
      }
      if (quest.questType === 'trivia') {
        formData.append('answer', answer);
      }
      await submitSideQuest(quest._id, formData);
      alert('Submission received!');
    } catch (err) {
      alert(err.response?.data?.message || 'Upload failed');
    }
  };

  // Render a single quest card with relevant inputs
  const QuestItem = ({ quest }) => {
    const [code, setCode] = useState('');
    const [ans, setAns] = useState('');
    const instructionsText = quest.instructions || defaults[quest.questType];
    const [timeLeft, setTimeLeft] = useState(
      quest.timeLimitSeconds ? quest.timeLimitSeconds : null
    );

    // Countdown timer when applicable
    useEffect(() => {
      if (timeLeft === null) return;
      if (timeLeft <= 0) return;
      const timer = setInterval(() => {
        setTimeLeft((t) => (t > 0 ? t - 1 : 0));
      }, 1000);
      return () => clearInterval(timer);
    }, [timeLeft]);

    return (
      <div key={quest._id} style={{ marginBottom: '1rem' }}>
        <div className="card" style={{ marginBottom: '0.5rem' }}>
          <h3>{quest.title}</h3>
          <p>{quest.text}</p>
          {instructionsText && <p>{instructionsText}</p>}
          {timeLeft !== null && (
            <p style={{ fontWeight: 'bold' }}>Time remaining: {timeLeft}s</p>
          )}
          {quest.imageUrl && (
            <img
              src={quest.imageUrl}
              alt={quest.title}
              style={{ width: '100%', borderRadius: '4px' }}
            />
          )}
          {quest.questType === 'passcode' && (
            <input
              type="text"
              placeholder="Enter passcode"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              style={{ marginTop: '0.5rem' }}
            />
          )}
          {quest.questType === 'trivia' && (
            <div style={{ marginTop: '0.5rem' }}>
              {quest.options.map((o) => (
                <label key={o} style={{ display: 'block' }}>
                  <input
                    type="radio"
                    name={`ans-${quest._id}`}
                    value={o}
                    checked={ans === o}
                    onChange={(e) => setAns(e.target.value)}
                  />
                  {o}
                </label>
              ))}
            </div>
          )}
        </div>
        <PhotoUploader
          label="Upload Proof"
          requiredMediaType={quest.requiredMediaType}
          onUpload={(formData) => handleUpload(quest, formData, code, ans)}
        />
      </div>
    );
  };

  if (loading) return <p>Loading…</p>;

  return (
    <div>
      <h2>Side Quests</h2>
      {quests.map((q) => (
        <QuestItem key={q._id} quest={q} />
      ))}
    </div>
  );
}
