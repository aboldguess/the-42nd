import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchClue, submitAnswer, fetchProgressItem } from '../services/api';
import ExpandableQr from '../components/ExpandableQr';

// Question view for the single active game
export default function QuestionPage() {
  // Grab clue ID from the URL
  const { clueId } = useParams();
  const navigate = useNavigate();
  const [clue, setClue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState(null);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!clue) return;
    try {
      if (clue.infoPage) {
        // submitAnswer likewise just takes the clue ID
        const res = await submitAnswer(clueId, '');
        // API returns the ObjectId of the next clue so we can route directly
        const nextId = res.data.nextClue;
        if (nextId) {
          navigate(`/clue/${nextId}`);
        }
      } else {
        const res = await submitAnswer(clueId, answer);
        if (res.data.correct) {
          setFeedback('Correct! Loading next clue…');
          const nextId = res.data.nextClue;
          setTimeout(() => {
            navigate(`/clue/${nextId}`);
          }, 1000);
        } else {
          setFeedback('Incorrect; try again.');
        }
      }
    } catch (err) {
      console.error(err);
      setFeedback('Error submitting answer.');
    }
  };

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
        {clue.qrCodeData && (
          <div style={{ marginTop: '1rem' }}>
            <p>Scan this QR code to proceed:</p>
            <ExpandableQr data={clue.qrCodeData} size={100} max={500} />
          </div>
        )}
        <form onSubmit={handleSubmit} style={{ marginTop: '1rem' }}>
          {clue.options && clue.options.length > 0 ? (
            <>
              <label>Select your answer:</label>
              <select
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                required
              >
                <option value="">-- Choose --</option>
                {clue.options.map((opt, idx) => (
                  <option key={idx} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </>
          ) : clue.infoPage ? null : (
            <>
              <label>Your answer:</label>
              <input
                type="text"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                required
                placeholder="Type your answer"
              />
            </>
          )}
          <button type="submit">
            {clue.infoPage ? 'Continue' : 'Submit'}
          </button>
        </form>
        {feedback && (
          <p
            style={{
              marginTop: '0.75rem',
              color: feedback.startsWith('Correct') ? 'green' : 'red'
            }}
          >
            {feedback}
          </p>
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
