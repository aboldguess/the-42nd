import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchProgress, fetchMe } from '../services/api';

// Generic table listing progress for clues, questions or side quests
export default function ItemTablePage({ type, titlePrefix }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [team, setTeam] = useState(null); // current player's team info

  useEffect(() => {
    const load = async () => {
      try {
        const [progRes, meRes] = await Promise.all([
          fetchProgress(type),
          type === 'sidequest' ? fetchMe() : Promise.resolve({ data: null })
        ]);
        setItems(progRes.data);
        if (type === 'sidequest') setTeam(meRes.data.team);
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
            <th>Last Scanned By</th>
            <th>Total Scans</th>
            {type === 'sidequest' && (
              <>
                <th>Set By</th>
                <th>Team</th>
                <th>Actions</th>
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
              <td>{it.status}</td>
              <td>{it.lastScannedBy || '-'}</td>
              <td>{it.totalScans}</td>
              {type === 'sidequest' && (
                <>
                  <td>{it.setBy || '-'}</td>
                  <td>{it.teamName || '-'}</td>
                  <td>
                    <Link to={`/sidequests/${it._id}/submissions`}>View submissions</Link>
                    {it.status === 'DONE!' && (
                      <>
                        {' '}
                        <Link to={`/sidequests/${it._id}/my-submission`}>Edit my submission</Link>
                      </>
                    )}
                    {team && team._id === it.teamId && (
                      <>
                        {' '}
                        <Link to={`/sidequests/${it._id}/edit`}>Edit sidequest</Link>
                      </>
                    )}
                  </td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
