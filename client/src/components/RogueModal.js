import React from 'react';

/**
 * Display a full-screen overlay with the selected media item enlarged and
 * a list of which players reacted with each emoji.
 */
export default function RogueModal({ media, onClose, onReact, emojiOptions }) {
  if (!media) return null;
  const isVideo = media.url.match(/\.(mp4|mov|avi)$/i);

  // Group reactions by emoji so we can list the reacting players
  const grouped = media.reactions.reduce((acc, r) => {
    if (!acc[r.emoji]) acc[r.emoji] = [];
    acc[r.emoji].push(r.user.name);
    return acc;
  }, {});

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0,0,0,0.8)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#fff',
          padding: '1rem',
          borderRadius: '4px',
          maxWidth: '90%',
          maxHeight: '90%',
          overflow: 'auto'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {isVideo ? (
          <video width="100%" controls src={media.url} />
        ) : (
          <img src={media.url} alt="Media" style={{ width: '100%' }} />
        )}
        <div style={{ marginTop: '1rem' }}>
          {emojiOptions.map((emo) => (
            <button
              key={emo}
              onClick={() => onReact(emo)}
              style={{ fontSize: '1.5rem', marginRight: '0.5rem' }}
            >
              {emo}
            </button>
          ))}
        </div>
        <div style={{ marginTop: '1rem' }}>
          {Object.keys(grouped).map((emo) => (
            <div key={emo} style={{ marginBottom: '0.5rem' }}>
              <strong>{emo}</strong>: {grouped[emo].join(', ')}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
