import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  fetchSideQuest,
  fetchMySideQuestSubmission,
  updateMySideQuestSubmission
} from '../services/api';
import PhotoUploader from '../components/PhotoUploader';

// Allows a team to replace their submission for a side quest
export default function MySideQuestSubmissionPage() {
  const { id } = useParams();
  const [quest, setQuest] = useState(null); // side quest details
  const [submission, setSubmission] = useState(null); // existing media
  const [loading, setLoading] = useState(true); // loading indicator

  useEffect(() => {
    const load = async () => {
      try {
        const [qRes, sRes] = await Promise.all([
          fetchSideQuest(id),
          fetchMySideQuestSubmission(id)
        ]);
        setQuest(qRes.data);
        setSubmission(sRes.data);
      } catch (err) {
        if (err.response?.status !== 404) console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (id) load();
  }, [id]);

  const handleUpload = async (formData) => {
    try {
      const { data } = await updateMySideQuestSubmission(id, formData);
      setSubmission(data);
      alert('Submission updated');
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Upload failed');
    }
  };

  if (loading) return <p>Loading…</p>;
  if (!quest) return <p>Side quest not found.</p>;

  return (
    <div>
      <h2>Edit Submission for {quest.title}</h2>
      {submission && (
        <div style={{ marginBottom: '1rem' }}>
          {submission.url.match(/\.(mp4|mov|avi)$/i) ? (
            <video src={submission.url} width={200} controls />
          ) : (
            <img src={submission.url} alt="current" width={200} />
          )}
        </div>
      )}
      <PhotoUploader
        label="Replace Media"
        requiredMediaType={quest.requiredMediaType}
        onUpload={handleUpload}
      />
    </div>
  );
}
