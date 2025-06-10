import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchClue, submitAnswer } from '../services/api';

export default function QuestionPage() {
  const { slug, clueId } = useParams();  // read both slug and clueId
  const navigate = useNavigate();
  const [clue, setClue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    const loadClue = async () => {
      setLoading(true);
      try {
        const res = await fetchClue(slug, clueId);
        setClue(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (slug && clueId) {
      loadClue();
    }
  }, [slug, clueId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!clue) return;
    try {
      if (clue.infoPage) {
        const res = await submitAnswer(slug, clueId, '');
        if (res.data.nextClue) {
          navigate(`/${slug}/clue/${res.data.nextClue}`);
        }
      } else {
        const res = await submitAnswer(slug, clueId, answer);
        if (res.data.correct) {
          setFeedback('Correct! Loading next clue…');
          setTimeout(() => {
            navigate(`/${slug}/clue/${res.data.nextClue}`);
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
            <img src={clue.qrCodeData} alt="QR Code" />
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
      </div>
    </div>
  );
}
