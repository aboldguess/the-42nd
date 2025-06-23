import React, { useEffect, useState } from 'react';
import { fetchWall, postToWall } from '../services/api';

// Display a player's wall and optionally allow posting
export default function Wall({ userId, allowPost }) {
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [message, setMessage] = useState('');
  const [file, setFile] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await fetchWall(userId);
        setUser(data.user);
        setPosts(data.posts);
      } catch (err) {
        console.error(err);
      }
    };
    load();
  }, [userId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    if (message) formData.append('message', message);
    if (file) formData.append('media', file);
    try {
      const { data } = await postToWall(userId, formData);
      setPosts((prev) => [data, ...prev]);
      setMessage('');
      setFile(null);
    } catch (err) {
      alert(err.response?.data?.message || 'Error posting');
    }
  };

  if (!user) return <p>Loading…</p>;

  return (
    <div>
      <h3>{user.name}'s Wall</h3>
      {allowPost && (
        <form onSubmit={handleSubmit} style={{ marginBottom: '1rem' }}>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Write a message"
            style={{ width: '100%', minHeight: '60px' }}
          />
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files[0])}
          />
          <button type="submit">Post</button>
        </form>
      )}
      {posts.map((p) => (
        <div key={p._id} className="card" style={{ marginBottom: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {p.author.photoUrl && (
              <img
                src={p.author.photoUrl}
                alt="avatar"
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  marginRight: '0.5rem'
                }}
              />
            )}
            <strong>{p.author.name}</strong>
          </div>
          {p.message && <p>{p.message}</p>}
          {p.mediaUrl && (
            <img
              src={p.mediaUrl}
              alt="attached"
              style={{ maxWidth: '100%', marginTop: '0.5rem' }}
            />
          )}
        </div>
      ))}
    </div>
  );
}
