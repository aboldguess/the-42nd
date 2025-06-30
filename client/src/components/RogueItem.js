import React, { useState, useEffect } from 'react';
import { addReaction, fetchReactions } from '../services/api';
import Wall from './Wall';

// Set of emojis available for players to react with
const EMOJIS = ['👍', '😂', '😮', '😢', '❤️'];

// showInfo determines whether uploader and team details are displayed
function RogueItem({ media, showInfo = true }) {
  const {
    url,
    uploadedBy,
    team,
    sideQuest,
    createdAt,
    emojiCounts = {},
    commentCount = 0
  } = media;
  const isVideo = url.match(/\.(mp4|mov|avi)$/i);
  const [show, setShow] = useState(false); // modal visibility
  const [pickerOpen, setPickerOpen] = useState(false); // inline reaction picker
  const [reactions, setReactions] = useState([]); // fetched reactions for modal view
  // Track emoji counts on the card so they can update after reacting inline
  const [counts, setCounts] = useState(emojiCounts);
  const [comments, setComments] = useState(commentCount);

  // Fetch existing reactions when the modal is opened
  useEffect(() => {
    if (!show) return;
    const load = async () => {
      try {
        const { data } = await fetchReactions(media._id);
        setReactions(data);
        // Update counts so the modal displays up to date numbers
        const newCounts = data.reduce((acc, r) => {
          acc[r.emoji] = (acc[r.emoji] || 0) + 1;
          return acc;
        }, {});
        setCounts(newCounts);
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

  // Handle the user selecting an emoji reaction. An event parameter is optional
  // so that clicks on inline emoji buttons can prevent the card from opening.
  const handleReact = async (emoji, e) => {
    if (e) e.stopPropagation();
    try {
      await addReaction(media._id, emoji);
      // Refresh reactions from the server to keep counts in sync
      const { data } = await fetchReactions(media._id);
      setReactions(data);
      const newCounts = data.reduce((acc, r) => {
        acc[r.emoji] = (acc[r.emoji] || 0) + 1;
        return acc;
      }, {});
      setCounts(newCounts);
      // Hide the picker after reacting
      setPickerOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      <div className="gallery-tile" onClick={() => setShow(true)}>
        {isVideo ? (
          <video className="gallery-image" muted>
            <source src={url} />
            Your browser does not support the video tag.
          </video>
        ) : (
          <img src={url} alt="Media" className="gallery-image" />
        )}
        <div className="tile-icons">
          <button
            className="tile-icon"
            onClick={(e) => {
              e.stopPropagation();
              setPickerOpen((p) => !p);
            }}
          >
            👍 {Object.values(counts).reduce((a, b) => a + b, 0)}
          </button>
          <button
            className="tile-icon"
            onClick={(e) => {
              e.stopPropagation();
              setShow(true);
            }}
          >
            💬 {comments}
          </button>
        </div>
        {pickerOpen && (
          <div className="reaction-picker" onClick={(e) => e.stopPropagation()}>
            {EMOJIS.map((e) => (
              <button key={e} onClick={(evt) => handleReact(e, evt)}>
                {e}
              </button>
            ))}
          </div>
        )}
      </div>
      {showInfo && (
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
      )}

      {/* Modal displayed when an item is clicked */}
      {show && (
        <div className="modal-overlay" onClick={() => setShow(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setShow(false)}
              style={{ position: 'absolute', top: 8, right: 8, fontSize: '1.5rem', background: 'none', border: 'none', cursor: 'pointer' }}
            >
              ×
            </button>
            {isVideo ? (
              <video
                controls
                style={{ maxWidth: '100%', maxHeight: '80vh', objectFit: 'contain' }}
              >
                <source src={url} />
                Your browser does not support the video tag.
              </video>
            ) : (
              <img
                src={url}
                alt="Media"
                style={{ maxWidth: '100%', maxHeight: '80vh', borderRadius: '4px', objectFit: 'contain' }}
              />
            )}
            <div style={{ marginTop: '1rem' }}>
              {EMOJIS.map((e) => (
                // Same buttons shown again inside the modal
                <button
                  key={e}
                  onClick={() => handleReact(e)}
                  className="btn-mr"
                  style={{ fontSize: '1.5rem' }}
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
            <Wall
              type="media"
              id={media._id}
              onNewComment={() => setComments((c) => c + 1)}
            />
          </div>
        </div>
      )}
    </>
  );
}

export default RogueItem;
