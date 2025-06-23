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

  return (
    <div className="card" style={{ padding: '1rem', margin: '1rem' }}>
      <h2>Scoreboard</h2>
      <table>
        <thead>
          <tr>
            <th>Team</th>
            <th>Clues</th>
            <th>Side Quests</th>
            <th>Score</th>
          </tr>
        </thead>
        <tbody>
          {scores.map((s) => (
            <tr key={s.teamId}>
              {/* data-label attributes used by responsive CSS */}
              <td data-label="Team">{s.name}</td>
              <td data-label="Clues">{s.completedClues}</td>
              <td data-label="Side Quests">{s.completedSideQuests}</td>
              <td data-label="Score">{s.score}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

