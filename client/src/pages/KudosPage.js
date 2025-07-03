import React, { useEffect, useState } from 'react';
import { fetchKudos, fetchPlayersPublic, voteKudos } from '../services/api';

export default function KudosPage() {
  const [categories, setCategories] = useState([]);
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [catRes, playersRes] = await Promise.all([
          fetchKudos(),
          fetchPlayersPublic()
        ]);
        setCategories(catRes.data);
        setPlayers(playersRes.data);
      } catch (err) {
        console.error('Failed to load kudos', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleVote = async (catId, recipient) => {
    try {
      await voteKudos(catId, recipient);
      const { data } = await fetchKudos();
      setCategories(data);
    } catch (err) {
      alert(err.response?.data?.message || 'Error voting');
    }
  };

  if (loading) return <p>Loading…</p>;

  return (
    <div className="card spaced-card">
      <h2>Kudos</h2>
      <table>
        <thead>
          <tr>
            <th>Title</th>
            <th>Your Vote</th>
            <th>Current Leader</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((c) => (
            <tr key={c._id}>
              <td>{c.title}</td>
              <td data-label="Your Vote">
                <select
                  value={c.myVote || ''}
                  onChange={(e) => handleVote(c._id, e.target.value)}
                >
                  <option value="">-- choose --</option>
                  {players.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.firstName || p.name}
                    </option>
                  ))}
                </select>
              </td>
              <td data-label="Current Leader">
                {c.leader ? (
                  <>
                    {c.leader.photoUrl && (
                      <img
                        src={c.leader.photoUrl}
                        alt="leader"
                        style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '50%',
                          objectFit: 'cover',
                          marginRight: '0.5rem'
                        }}
                      />
                    )}
                    {c.leader.firstName}
                  </>
                ) : (
                  '—'
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
