import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchQuestion } from '../services/api';

// Display a single trivia question for players
export default function QuestionPlayPage() {
  const { id } = useParams();
  const [question, setQuestion] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await fetchQuestion(id);
        setQuestion(data);
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
          <ul style={{ marginTop: '1rem' }}>
            {question.options.map((o, idx) => (
              <li key={idx}>{o}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
