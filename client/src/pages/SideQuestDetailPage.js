import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchSideQuest, submitSideQuest } from '../services/api';
import PhotoUploader from '../components/PhotoUploader';

// Detailed view for a single side quest with upload option
export default function SideQuestDetailPage() {
  const { id } = useParams();
  const [quest, setQuest] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await fetchSideQuest(id);
        setQuest(data);
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
      await submitSideQuest(id, formData);
      alert('Submission received!');
    } catch (err) {
      alert(err.response?.data?.message || 'Upload failed');
    }
  };

  if (loading) return <p>Loading…</p>;
  if (!quest) return <p>Side quest not found.</p>;

  return (
    <div>
      <h2>{quest.title}</h2>
      <div className="card">
        <p>{quest.text}</p>
        {quest.instructions && <p>{quest.instructions}</p>}
        {quest.imageUrl && (
          <img
            src={quest.imageUrl}
            alt={quest.title}
            style={{ width: '100%', borderRadius: '4px', marginTop: '1rem' }}
          />
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
