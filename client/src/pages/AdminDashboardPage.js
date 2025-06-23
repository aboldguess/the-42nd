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

  return (
    <div className="card" style={{ padding: '1rem', margin: '1rem' }}>
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
              <td>{s.name}</td>
              <td>{s.completedClues}</td>
              <td>{s.completedSideQuests}</td>
              <td>{s.score}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
