import React, { useState, useEffect } from 'react';
import { addReaction, fetchReactions } from '../services/api';

// Set of emojis available for players to react with
const EMOJIS = ['👍', '😂', '😮', '😢', '❤️'];

function RogueItem({ media }) {
  const { url, uploadedBy, team, sideQuest, createdAt } = media;
  const isVideo = url.match(/\.(mp4|mov|avi)$/i);
  const [show, setShow] = useState(false); // modal visibility
  const [reactions, setReactions] = useState([]); // fetched reactions

  // Fetch existing reactions when the modal is opened
  useEffect(() => {
    if (!show) return;
    const load = async () => {
      try {
        const { data } = await fetchReactions(media._id);
        setReactions(data);
      } catch (err) {
        console.error(err);
      }
    };
    load();
  }, [show, media._id]);

  // Group reactions by emoji to simplify rendering
  const grouped = reactions.reduce((acc, r) => {
    if (!acc[r.emoji]) acc[r.emoji] = [];
    acc[r.emoji].push(r.user.name);
    return acc;
  }, {});

  // Handle the user selecting an emoji reaction
  const handleReact = async (emoji) => {
    try {
      await addReaction(media._id, emoji);
      const { data } = await fetchReactions(media._id);
      setReactions(data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      <div className="card" onClick={() => setShow(true)} style={{ cursor: 'pointer' }}>
        {isVideo ? (
          <video width="100%" controls>
            <source src={url} />
            Your browser does not support the video tag.
          </video>
        ) : (
          <img src={url} alt="Media" style={{ width: '100%', borderRadius: '4px' }} />
        )}
        <div style={{ marginTop: '0.5rem' }}>
          {/* uploadedBy can be a User or Admin. Display whichever name field exists */}
          <strong>By:</strong>{' '}
          {uploadedBy?.name || uploadedBy?.username || 'Unknown'} <br />
          <strong>Team:</strong> {team?.name || 'N/A'} <br />
          {sideQuest && (
            <>
              <strong>Side Quest:</strong> {sideQuest.title} <br />
            </>
          )}
          <small style={{ color: '#666' }}>{new Date(createdAt).toLocaleString()}</small>
        </div>
      </div>

      {/* Modal displayed when an item is clicked */}
      {show && (
        <div className="modal-overlay" onClick={() => setShow(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            {isVideo ? (
              <video controls style={{ maxWidth: '100%' }}>
                <source src={url} />
                Your browser does not support the video tag.
              </video>
            ) : (
              <img src={url} alt="Media" style={{ maxWidth: '100%', borderRadius: '4px' }} />
            )}
            <div style={{ marginTop: '1rem' }}>
              {EMOJIS.map((e) => (
                <button
                  key={e}
                  onClick={() => handleReact(e)}
                  style={{ fontSize: '1.5rem', marginRight: '0.5rem' }}
                >
                  {e} {grouped[e] ? grouped[e].length : ''}
                </button>
              ))}
            </div>
            <div style={{ marginTop: '1rem' }}>
              {Object.entries(grouped).map(([emoji, names]) => (
                <div key={emoji}>
                  <strong>{emoji}</strong>: {names.join(', ')}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default RogueItem;
