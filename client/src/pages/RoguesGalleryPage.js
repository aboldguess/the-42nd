import React, { useEffect, useState } from 'react';
import { fetchRoguesGallery, reactToMedia } from '../services/api';
import RogueItem from '../components/RogueItem';
import RogueModal from '../components/RogueModal';

export default function RoguesGalleryPage() {
  // Gallery items returned from the server
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  // Media item currently shown in the modal
  const [selected, setSelected] = useState(null);
  // Selected filters for team, player and type
  const [teamFilter, setTeamFilter] = useState('');
  const [playerFilter, setPlayerFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  // Emojis players can choose from when reacting.  Feel free to expand this list
  // as new reactions are desired.
  const emojiOptions = ['👍', '😂', '😮', '😢', '🎉'];

  useEffect(() => {
    // Load all uploaded media on mount
    const load = async () => {
      try {
        const { data } = await fetchRoguesGallery();
        setMedia(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  /**
   * Record a player's reaction for the currently selected media item and update
   * the gallery state with the server's response.
   */
  const handleReact = async (emoji) => {
    if (!selected) return;
    try {
      const { data } = await reactToMedia(selected._id, emoji);
      // Update both the modal and the grid with the latest reaction info
      setSelected(data);
      setMedia((list) => list.map((m) => (m._id === data._id ? data : m)));
    } catch (err) {
      console.error(err);
    }
  };

  // Build dropdown options from the loaded media
  const teamOptions = Array.from(
    new Set(media.map((m) => m.team?.name).filter(Boolean))
  );
  const playerOptions = Array.from(
    new Set(
      media
        .map((m) => m.uploadedBy?.name || m.uploadedBy?.username)
        .filter(Boolean)
    )
  );

  // Helper to categorize each media item for the type filter
  const getCategory = (m) => {
    if (m.type === 'profile') {
      return m.tag === 'team_photo' ? 'usies' : 'selfies';
    }
    return 'tasks';
  };

  // Apply all selected filters
  const filteredMedia = media.filter((m) => {
    if (teamFilter && m.team?.name !== teamFilter) return false;
    const uploaderName = m.uploadedBy?.name || m.uploadedBy?.username;
    if (playerFilter && uploaderName !== playerFilter) return false;
    if (typeFilter && getCategory(m) !== typeFilter) return false;
    return true;
  });

  if (loading) return <p>Loading…</p>;

  return (
    <div>
      <h2>Rogues Gallery</h2>
      {/* Filter controls */}
      <div style={{ marginBottom: '1rem' }}>
        <select value={teamFilter} onChange={(e) => setTeamFilter(e.target.value)}>
          <option value="">All Teams</option>
          {teamOptions.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>{' '}
        <select
          value={playerFilter}
          onChange={(e) => setPlayerFilter(e.target.value)}
        >
          <option value="">All Players</option>
          {playerOptions.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>{' '}
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
          <option value="">All Types</option>
          <option value="selfies">Selfies</option>
          <option value="usies">Usies</option>
          <option value="tasks">Tasks</option>
        </select>{' '}
        <button
          onClick={() => {
            setTeamFilter('');
            setPlayerFilter('');
            setTypeFilter('');
          }}
        >
          Show All
        </button>
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
          gap: '1rem'
        }}
      >
        {filteredMedia.map((m) => (
          <RogueItem key={m._id} media={m} onSelect={setSelected} />
        ))}
      </div>
      <RogueModal
        media={selected}
        onClose={() => setSelected(null)}
        onReact={handleReact}
        emojiOptions={emojiOptions}
      />
    </div>
  );
}
