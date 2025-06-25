import React from 'react';

// Display a gallery thumbnail with a summary of reactions. Clicking the card
// will open a modal with the full media and reaction details.

function RogueItem({ media, onSelect }) {
  const { url, uploadedBy, team, sideQuest, createdAt, reactions = [] } = media;
  const isVideo = url.match(/\.(mp4|mov|avi)$/i);

  // Tally how many times each emoji was used so we can show counts next to
  // each button.
  const counts = reactions.reduce((acc, r) => {
    acc[r.emoji] = (acc[r.emoji] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="card" onClick={() => onSelect && onSelect(media)}>
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
        {/* Display reaction counts beside each emoji on the card */}
        {Object.keys(counts).length > 0 && (
          <div style={{ marginTop: '0.5rem' }}>
            {Object.entries(counts).map(([emo, c]) => (
              <span key={emo} style={{ marginRight: '0.5rem' }}>
                {emo} {c}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default RogueItem;
