import React, { useEffect, useState } from 'react';
import { fetchSideQuests, submitSideQuest } from '../services/api';
import PhotoUploader from '../components/PhotoUploader';

export default function SideQuestPage() {
  // List of available quests
  const [quests, setQuests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load quest data on mount
    const load = async () => {
      try {
        const { data } = await fetchSideQuests();
        setQuests(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Upload media proof for a quest
  const handleUpload = async (id, formData) => {
    try {
      await submitSideQuest(id, formData);
      alert('Submission received!');
    } catch (err) {
      alert(err.response?.data?.message || 'Upload failed');
    }
  };

  if (loading) return <p>Loading…</p>;

  return (
    <div>
      <h2>Side Quests</h2>
      {quests.map((q) => (
        <div key={q._id} style={{ marginBottom: '1rem' }}>
          <div className="card" style={{ marginBottom: '0.5rem' }}>
            <h3>{q.title}</h3>
            <p>{q.text}</p>
            {q.imageUrl && (
              <img
                src={q.imageUrl}
                alt={q.title}
                style={{ width: '100%', borderRadius: '4px' }}
              />
            )}
          </div>
          <PhotoUploader
            label="Upload Proof"
            requiredMediaType={q.requiredMediaType}
            onUpload={(formData) => handleUpload(q._id, formData)}
          />
        </div>
      ))}
    </div>
  );
}
