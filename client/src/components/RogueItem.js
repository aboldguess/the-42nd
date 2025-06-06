import React from 'react';

function RogueItem({ media }) {
  const { url, uploadedBy, team, sideQuest, type, createdAt } = media;
  const isVideo = url.match(/\.(mp4|mov|avi)$/i);

  return (
    <div className="card">
      {isVideo ? (
        <video width="100%" controls>
          <source src={url} />
          Your browser does not support the video tag.
        </video>
      ) : (
        <img src={url} alt="Media" style={{ width: '100%', borderRadius: '4px' }} />
      )}
      <div style={{ marginTop: '0.5rem' }}>
        <strong>By:</strong> {uploadedBy?.name || 'Unknown'} <br />
        <strong>Team:</strong> {team?.name || 'N/A'} <br />
        {sideQuest && (
          <>
            <strong>Side Quest:</strong> {sideQuest.title} <br />
          </>
        )}
        <small style={{ color: '#666' }}>{new Date(createdAt).toLocaleString()}</small>
      </div>
    </div>
  );
}

export default RogueItem;
