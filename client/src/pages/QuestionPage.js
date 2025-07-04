import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchClue, fetchProgressItem } from '../services/api';

// Question view for the single active game
export default function QuestionPage() {
  // Grab clue ID from the URL
  const { clueId } = useParams();
  const [clue, setClue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null); // progress details

  useEffect(() => {
    const loadClue = async () => {
      setLoading(true);
      try {
        // fetchClue now only requires the clue ID
        const res = await fetchClue(clueId);
        setClue(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (clueId) {
      loadClue();
      // also fetch scan stats for this clue
      fetchProgressItem('clue', clueId)
        .then((data) => setStats(data))
        .catch((err) => console.error(err));
    }
  }, [clueId]);

  if (loading) return <p>Loading clue…</p>;
  if (!clue) return <p>Clue not found.</p>;

  return (
    <div>
      <h2>{clue.title}</h2>
      <div className="card">
        <p>{clue.text}</p>
        {clue.imageUrl && (
          <img
            src={clue.imageUrl}
            alt="Clue"
            style={{ maxWidth: '100%', marginTop: '1rem' }}
          />
        )}
        {stats && (
          <div style={{ marginTop: '1rem', fontSize: '0.9rem' }}>
            <p>Last scanned by: {stats.lastScannedBy || '-'}</p>
            <p>Total scans: {stats.totalScans}</p>
          </div>
        )}
      </div>
    </div>
  );
}
