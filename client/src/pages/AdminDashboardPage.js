import React, { useEffect, useState } from 'react';
import { fetchAdminScoreboard } from '../services/api';

export default function AdminDashboardPage() {
  const [scores, setScores] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await fetchAdminScoreboard();
        setScores(data);
      } catch (err) {
        console.error(err);
      }
    };
    load();
  }, []);

  // Summary table of team scores
  return (
    <div className="card spaced-card">
      <h2>Admin Dashboard</h2>
      <p>Welcome, Admin! Use the menu to manage clues, side quests and players.</p>
      <h3>Scoreboard</h3>
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
