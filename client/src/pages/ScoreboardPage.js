import React, { useEffect, useState } from 'react';
import { fetchScoreboard } from '../services/api';

export default function ScoreboardPage() {
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await fetchScoreboard();
        setScores(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <p>Loading…</p>;

  // Card wrapper used across admin lists
  return (
    <div className="card spaced-card">
      <h2>Scoreboard</h2>
      <table>
        <thead>
          <tr>
            <th>Team</th>
            <th>Questions Found</th>
            <th>Correct Answers</th>
            <th>Sidequests Found</th>
            <th>Sidequests Completed</th>
            <th>Sidequests Created</th>
            <th>Score</th>
          </tr>
        </thead>
        <tbody>
          {scores.map((s) => (
            <tr key={s.teamId}>
              <td data-label="Team">
                {s.photoUrl && (
                  <img
                    src={s.photoUrl}
                    alt={`${s.name} avatar`}
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      objectFit: 'cover',
                      marginRight: '0.5rem'
                    }}
                  />
                )}
                {s.name}
              </td>
              <td data-label="Questions Found">{s.questionsFound}</td>
              <td data-label="Correct Answers">{s.correctAnswers}</td>
              <td data-label="Sidequests Found">{s.sideQuestsFound}</td>
              <td data-label="Sidequests Completed">{s.sideQuestsCompleted}</td>
              <td data-label="Sidequests Created">{s.sideQuestsCreated}</td>
              <td data-label="Score">{s.score}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

