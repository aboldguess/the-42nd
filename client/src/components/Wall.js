import React, { useEffect, useState } from 'react';
import ImageSelector from './ImageSelector';
import { fetchWall, postComment } from '../services/api';

// Displays comments for a profile and allows posting new ones.
// type must be either 'user' or 'team'.
export default function Wall({ type, id, onNewComment }) {
  const [comments, setComments] = useState([]);
  const [text, setText] = useState('');
  const [file, setFile] = useState(null);

  // Load comments whenever type or id changes
  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetchWall(type, id);
        setComments(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    load();
  }, [type, id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    if (text) data.append('content', text);
    if (file) data.append('image', file);

    try {
      const res = await postComment(type, id, data);
      // Prepend new comment to the list
      setComments([res.data, ...comments]);
      if (onNewComment) onNewComment();
      setText('');
      setFile(null);
    } catch (err) {
      alert(err.response?.data?.message || 'Error posting comment');
    }
  };

  return (
    <div className="card" style={{ marginTop: '1rem' }}>
      <h3>Wall</h3>
      <form onSubmit={handleSubmit} style={{ marginBottom: '1rem' }}>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Write a comment..."
          rows={3}
          style={{ width: '100%', marginBottom: '0.5rem' }}
        />
        <ImageSelector onSelect={(f) => setFile(f)} />
        <button type="submit">Post</button>
      </form>
      <div>
        {comments.map((c) => {
          // Some comments may have a missing author if the user
          // who wrote the comment was deleted. Guard against null
          // so we don't crash when accessing name or photoUrl.
          const authorName = c.author?.name || 'Unknown';
          const photoUrl = c.author?.photoUrl || '';

          return (
            // Display each comment in its own card. Use flexbox so the
            // author's avatar can sit beside the text content.
            <div
              key={c._id}
              className="card"
              style={{
                marginBottom: '0.5rem',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.5rem'
              }}
            >
              {photoUrl && (
                <img
                  src={photoUrl}
                  alt={`${authorName} avatar`}
                  // Small circular avatar used for comment authors
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    objectFit: 'cover'
                  }}
                />
              )}
              <div style={{ flex: 1 }}>
                <p>
                  <strong>{authorName}</strong>{' '}
                  <span style={{ fontSize: '0.8em' }}>
                    {new Date(c.createdAt).toLocaleString()}
                  </span>
                </p>
                {c.content && <p>{c.content}</p>}
                {c.imageUrl && (
                  <img
                    src={c.imageUrl}
                    alt="wall"
                    style={{ maxWidth: '100%', borderRadius: '4px' }}
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
