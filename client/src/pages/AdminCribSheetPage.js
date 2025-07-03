import React, { useEffect, useState } from 'react';
import {
  fetchClues,
  fetchQuestions,
  fetchSideQuestsAdmin
} from '../services/api';
import ExpandableQr from '../components/ExpandableQr';

// Printable overview for gamemasters showing all game data
export default function AdminCribSheetPage() {
  const [clues, setClues] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [quests, setQuests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [cRes, qRes, sqRes] = await Promise.all([
          fetchClues(),
          fetchQuestions(),
          fetchSideQuestsAdmin()
        ]);
        setClues(cRes.data);
        setQuestions(qRes.data);
        setQuests(sqRes.data);
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
            <th>QR</th>
            <th>Title</th>
            <th>Text</th>
            <th>Answer</th>
          </tr>
        </thead>
        <tbody>
          {clues.map((c) => (
            <tr key={c._id}>
              <td>
                {c.qrCodeData && (
                  /* Large QR so printed copies can be scanned */
                  <img src={c.qrCodeData} alt={`QR for ${c.title}`} width={120} />
                )}
              </td>
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
            <th>QR</th>
            <th>Title</th>
            <th>Question</th>
            <th>Answer</th>
          </tr>
        </thead>
        <tbody>
          {questions.map((q) => (
            <tr key={q._id}>
              <td>
                {q.qrCodeData && (
                  /* Include QR for each question */
                  <img src={q.qrCodeData} alt={`QR for ${q.title}`} width={120} />
                )}
              </td>
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
            <th>QR</th>
            <th>Title</th>
            <th>Text</th>
            <th>Time Limit</th>
          </tr>
        </thead>
        <tbody>
          {quests.map((q) => (
            <tr key={q._id}>
              <td>
                {q.qrCodeData && (
                  /* Display quest QR for quick scanning */
                  <img src={q.qrCodeData} alt={`QR for ${q.title}`} width={120} />
                )}
              </td>
              <td>{q.title}</td>
              <td>{q.text}</td>
              <td>{q.timeLimitSeconds || '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>

    </div>
  );
}
