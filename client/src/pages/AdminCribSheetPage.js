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
                  /*
                   * Display the QR with a caption underneath so a single
                   * table cell can be printed and cut out as a label.
                   */
                  <div className="qr-wrapper">
                    {/* Bigger QR to ensure easy scanning when printed */}
                    <img src={c.qrCodeData} alt={`QR for ${c.title}`} width={180} />
                    {/* Duplicate the title under the QR for standalone printouts */}
                    <div className="qr-title">{c.title}</div>
                  </div>
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
                  /*
                   * Questions also need printable QR labels. The wrapper adds
                   * the title beneath the code so each cell can be trimmed out.
                   */
                  <div className="qr-wrapper">
                    <img src={q.qrCodeData} alt={`QR for ${q.title}`} width={180} />
                    <div className="qr-title">{q.title}</div>
                  </div>
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
                  /*
                   * Side quests also print their QR code with a caption so
                   * individual squares can be cut out for hiding around the
                   * venue.
                   */
                  <div className="qr-wrapper">
                    <img src={q.qrCodeData} alt={`QR for ${q.title}`} width={180} />
                    <div className="qr-title">{q.title}</div>
                  </div>
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
