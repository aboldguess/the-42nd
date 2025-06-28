import React, { useEffect, useState } from 'react';
import {
  fetchAdminGallery,
  updateMediaVisibility,
  fetchSettingsAdmin,
  deleteMediaAdmin
} from '../services/api';
import RogueItem from '../components/RogueItem';

// Admin view of all uploaded media with filtering and hide controls
export default function AdminGalleryPage() {
  const [media, setMedia] = useState([]);
  const [placeholder, setPlaceholder] = useState('');
  const [loading, setLoading] = useState(true);
  const [teamFilter, setTeamFilter] = useState('');
  const [playerFilter, setPlayerFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const gal = await fetchAdminGallery();
        setMedia(gal.data);
        const settings = await fetchSettingsAdmin();
        setPlaceholder(settings.data.placeholderUrl || '');
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const teamOptions = Array.from(new Set(media.map((m) => m.team?.name).filter(Boolean)));
  const playerOptions = Array.from(
    new Set(media.map((m) => m.uploadedBy?.name || m.uploadedBy?.username).filter(Boolean))
  );

  const getCategory = (m) => {
    if (m.type === 'profile') return m.tag === 'team_photo' ? 'usies' : 'selfies';
    return 'tasks';
  };

  const filteredMedia = media.filter((m) => {
    if (teamFilter && m.team?.name !== teamFilter) return false;
    const uploaderName = m.uploadedBy?.name || m.uploadedBy?.username;
    if (playerFilter && uploaderName !== playerFilter) return false;
    if (typeFilter && getCategory(m) !== typeFilter) return false;
    return true;
  });

  const toggleHidden = async (item) => {
    try {
      await updateMediaVisibility(item._id, !item.hidden);
      setMedia((prev) => prev.map((m) => (m._id === item._id ? { ...m, hidden: !item.hidden } : m)));
    } catch (err) {
      console.error(err);
      alert('Error updating media');
    }
  };

  const handleDelete = async (item) => {
    if (!window.confirm('Delete this media item?')) return;
    try {
      await deleteMediaAdmin(item._id);
      setMedia((prev) => prev.filter((m) => m._id !== item._id));
    } catch (err) {
      console.error(err);
      alert('Error deleting media');
    }
  };

  if (loading) return <p>Loading…</p>;

  return (
    <div>
      <h2>Admin Gallery</h2>
      <div style={{ marginBottom: '1rem' }}>
        <select value={teamFilter} onChange={(e) => setTeamFilter(e.target.value)}>
          <option value="">All Teams</option>
          {teamOptions.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>{' '}
        <select value={playerFilter} onChange={(e) => setPlayerFilter(e.target.value)}>
          <option value="">All Players</option>
          {playerOptions.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>{' '}
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
          <option value="">All Types</option>
          <option value="selfies">Selfies</option>
          <option value="usies">Usies</option>
          <option value="tasks">Tasks</option>
        </select>{' '}
        <button onClick={() => { setTeamFilter(''); setPlayerFilter(''); setTypeFilter(''); }}>
          Show All
        </button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
        {filteredMedia.map((m) => {
          // Only swap in the placeholder when a profile photo has been hidden
          const display = {
            ...m,
            url: m.type === 'profile' && m.hidden && placeholder ? placeholder : m.url
          };
          return (
            <div key={m._id}>
              <RogueItem media={display} />
              <button onClick={() => toggleHidden(m)}>{m.hidden ? 'Unhide' : 'Hide'}</button>{' '}
              <button onClick={() => handleDelete(m)}>Delete</button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
