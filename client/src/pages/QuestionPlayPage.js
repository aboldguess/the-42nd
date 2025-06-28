import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  fetchQuestion,
  fetchTeamQuestionAnswer,
  submitTeamQuestionAnswer
} from '../services/api';

// Display a single trivia question for players
export default function QuestionPlayPage() {
  const { id } = useParams();
  const [question, setQuestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState('');
  const [cooldown, setCooldown] = useState(0);

  // Decrease the cooldown timer every second so the UI updates as time passes.
  // When the countdown reaches zero the interval clears itself.
  useEffect(() => {
    if (cooldown <= 0) return;
    const interval = setInterval(() => {
      setCooldown((c) => (c - 1000 > 0 ? c - 1000 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [cooldown]);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await fetchQuestion(id);
        setQuestion(data);
        const ans = await fetchTeamQuestionAnswer(id);
        setSelected(ans.data.answer || '');
        // Server responds with remaining cooldown in milliseconds. Store it so
        // the form can disable changes until time expires.
        setCooldown(ans.data.cooldownRemaining || 0);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (id) load();
  }, [id]);

  // Submit the currently selected answer to the server. The server enforces the
  // cooldown period and returns an error if the team must wait before changing
  // their choice again.
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await submitTeamQuestionAnswer(id, selected);
      // On success, request the saved answer again so we know how long until it
      // can be changed. The server returns the remaining cooldown in ms.
      const res = await fetchTeamQuestionAnswer(id);
      setSelected(res.data.answer || selected);
      setCooldown(res.data.cooldownRemaining || 0);
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving answer');
    }
  };

  if (loading) return <p>Loading question…</p>;
  if (!question) return <p>Question not found.</p>;

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
              <div key={idx} style={{ marginBottom: '0.5rem' }}>
                <label>
                  <input
                    type="radio"
                    value={o}
                    checked={selected === o}
                    disabled={cooldown > 0 && selected && selected !== o}
                    onChange={(e) => setSelected(e.target.value)}
                  />{' '}
                  {o}
                </label>
              </div>
            ))}
            {/* Save button is disabled while the cooldown is active */}
            <button type="submit" disabled={!selected || cooldown > 0}>Save</button>
            {cooldown > 0 && (
              <p style={{ color: 'red' }}>
                You can change your answer in {Math.ceil(cooldown / 60000)} minute
                {Math.ceil(cooldown / 60000) === 1 ? '' : 's'}.
              </p>
            )}
          </form>
        )}
      </div>
    </div>
  );
}
