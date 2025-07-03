import React, { useEffect, useState } from 'react';
import {
  fetchClues,
  fetchQuestions,
  fetchSideQuestsAdmin,
  fetchPlayers,
  fetchTeamsAdmin
} from '../services/api';

// Printable overview for gamemasters showing all game data
export default function AdminCribSheetPage() {
  const [clues, setClues] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [quests, setQuests] = useState([]);
  const [players, setPlayers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [cRes, qRes, sqRes, pRes, tRes] = await Promise.all([
          fetchClues(),
          fetchQuestions(),
          fetchSideQuestsAdmin(),
          fetchPlayers(),
          fetchTeamsAdmin()
        ]);
        setClues(cRes.data);
        setQuestions(qRes.data);
        setQuests(sqRes.data);
        setPlayers(pRes.data);
        setTeams(tRes.data);
      } catch (err) {
        console.error('Error loading crib sheet data:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <p>Loading…</p>;

  return (
    <div className="card spaced-card">
      <h2>Gamemaster Crib Sheet</h2>
      <button onClick={() => window.print()}>Print</button>

      <h3>Clues</h3>
      <table>
        <thead>
          <tr>
            <th>Title</th>
            <th>Text</th>
            <th>Answer</th>
          </tr>
        </thead>
        <tbody>
          {clues.map((c) => (
            <tr key={c._id}>
              <td>{c.title}</td>
              <td>{c.text}</td>
              <td>{c.correctAnswer}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3>Questions</h3>
      <table>
        <thead>
          <tr>
            <th>Title</th>
            <th>Question</th>
            <th>Answer</th>
          </tr>
        </thead>
        <tbody>
          {questions.map((q) => (
            <tr key={q._id}>
              <td>{q.title}</td>
              <td>{q.text}</td>
              <td>{q.correctAnswer}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3>Side Quests</h3>
      <table>
        <thead>
          <tr>
            <th>Title</th>
            <th>Text</th>
            <th>Time Limit</th>
          </tr>
        </thead>
        <tbody>
          {quests.map((q) => (
            <tr key={q._id}>
              <td>{q.title}</td>
              <td>{q.text}</td>
              <td>{q.timeLimitSeconds || '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3>Teams</h3>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Leader</th>
          </tr>
        </thead>
        <tbody>
          {teams.map((t) => (
            <tr key={t._id}>
              <td>{t.name}</td>
              <td>{t.leader ? t.leader.name : '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3>Players</h3>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Team</th>
          </tr>
        </thead>
        <tbody>
          {players.map((p) => (
            <tr key={p._id}>
              <td>{p.name}</td>
              <td>{p.team ? p.team.name : '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
