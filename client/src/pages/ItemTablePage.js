import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchProgress } from '../services/api';

// Generic table listing progress for clues, questions or side quests
export default function ItemTablePage({ type, titlePrefix }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await fetchProgress(type);
        setItems(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [type]);

  if (loading) return <p>Loading…</p>;

  // List of all game items in a card
  return (
    <div className="card spaced-card">
      <h2>{titlePrefix}</h2>
      <table>
        <thead>
          <tr>
            <th>Title</th>
            <th>Scanned By</th>
            <th>Status</th>
            <th>Last Scanned By</th>
            <th>Total Scans</th>
            {type === 'sidequest' && (
              <>
                <th>Set By</th>
                <th>Team</th>
              </>
            )}
          </tr>
        </thead>
        <tbody>
          {items.map((it) => (
            <tr key={it._id}>
              <td>
                {it.scanned ? (
                  <Link to={`/${type === 'sidequest' ? 'sidequest' : type}/${it._id}`}>{it.title}</Link>
                ) : (
                  it.title
                )}
              </td>
              <td>{it.scannedBy || '-'}</td>
              <td>{it.status}</td>
              <td>{it.lastScannedBy || '-'}</td>
              <td>{it.totalScans}</td>
              {type === 'sidequest' && (
                <>
                  <td>{it.setBy || '-'}</td>
                  <td>{it.teamName || '-'}</td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
