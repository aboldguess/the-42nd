import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchProgress } from '../services/api';

// Generic list showing progress for clues, questions or side quests
export default function ItemTablePage({ type, titlePrefix }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  // Track which items to display based on completion state
  const [filter, setFilter] = useState('all'); // all | complete | incomplete

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
  // Apply completion filter to the list
  const filteredItems = items.filter((it) => {
    if (filter === 'complete') return it.status === 'DONE!';
    if (filter === 'incomplete') return it.status !== 'DONE!';
    return true;
  });

  // List of all game items in a card
  return (
    <div className="card spaced-card">
      <h2>{titlePrefix}</h2>
      <p>
        Your team has found the following {titlePrefix.toLowerCase()} - {remaining}{' '}
        {titlePrefix.toLowerCase()} remaining!
      </p>
      {/* Completion filter for side quests */}
      {type === 'sidequest' && (
        <div style={{ marginBottom: '0.5rem' }}>
          <label>
            Show:
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              style={{ marginLeft: '0.5rem' }}
            >
              <option value="all">All</option>
              <option value="incomplete">Incomplete</option>
              <option value="complete">Completed</option>
            </select>
          </label>
        </div>
      )}
      {/*
        Display items using a simple flex-based list instead of a table. This
        avoids repeated column headings on narrow screens and provides better
        mobile layout. Each row shows the item title with its completion status
        aligned to the right.
      */}
      <div className="list">
        {filteredItems.map((it) => (
          <div
            key={it._id}
            className="list-row"
            style={{ justifyContent: 'space-between' }}
          >
            <div>
              {type === 'sidequest' ? (
                // Side quests are always clickable regardless of scan state
                <Link to={`/sidequest/${it._id}`}>{it.title}</Link>
              ) : it.scanned ? (
                <Link to={`/${type}/${it._id}`}>{it.title}</Link>
              ) : (
                it.title
              )}
            </div>
            {/* Status text styled with the existing .sub class */}
            <span className="sub" style={{ marginLeft: '1rem' }}>
              {it.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
