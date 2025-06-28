import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchQuestion, submitQuestionAnswer } from '../services/api';

// Display a single trivia question for players
export default function QuestionPlayPage() {
  const { id } = useParams();
  const [question, setQuestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [answer, setAnswer] = useState('');
  const [lockedUntil, setLockedUntil] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await fetchQuestion(id);
        setQuestion(data);
        setAnswer(data.selectedAnswer || '');
        setLockedUntil(data.lockExpiresAt ? new Date(data.lockExpiresAt) : null);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (id) load();
  }, [id]);

  if (loading) return <p>Loading question…</p>;
  if (!question) return <p>Question not found.</p>;

  const isLocked = lockedUntil && new Date() < new Date(lockedUntil);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLocked) return;
    try {
      setSaving(true);
      const { data } = await submitQuestionAnswer(id, answer);
      setLockedUntil(data.lockExpiresAt ? new Date(data.lockExpiresAt) : null);
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving answer');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <h2>{question.title}</h2>
      <div className="card">
        <p>{question.text}</p>
        {question.imageUrl && (
          <img
            src={question.imageUrl}
            alt={question.title}
            style={{ maxWidth: '100%', marginTop: '1rem' }}
          />
        )}
        {question.options && question.options.length > 0 && (
          <form onSubmit={handleSubmit} style={{ marginTop: '1rem' }}>
            {question.options.map((o, idx) => (
              <div key={idx}>
                <label>
                  <input
                    type="radio"
                    value={o}
                    checked={answer === o}
                    onChange={() => setAnswer(o)}
                    disabled={isLocked}
                  />{' '}
                  {o}
                </label>
              </div>
            ))}
            <button type="submit" disabled={isLocked || saving}>
              {answer ? 'Update Answer' : 'Submit Answer'}
            </button>
            {isLocked && (
              <p style={{ color: 'red' }}>
                Answer locked until {new Date(lockedUntil).toLocaleTimeString()}
              </p>
            )}
          </form>
        )}
      </div>
    </div>
  );
}
