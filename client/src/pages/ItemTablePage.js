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

  const remaining = items.filter((i) => !i.scanned).length;

  // List of all game items in a card
  return (
    <div className="card spaced-card">
      <h2>{titlePrefix}</h2>
      <p>
        Your team has found the following {titlePrefix.toLowerCase()} - {remaining}{' '}
        {titlePrefix.toLowerCase()} remaining!
      </p>
      <table>
        <thead>
          <tr>
            <th>Title</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {items.map((it) => (
            <tr key={it._id}>
              <td data-label="Title">
                {it.scanned ? (
                  <Link to={`/${type === 'sidequest' ? 'sidequest' : type}/${it._id}`}>{it.title}</Link>
                ) : (
                  it.title
                )}
              </td>
              <td data-label="Status">{it.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
