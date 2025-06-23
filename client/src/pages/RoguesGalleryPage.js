import React, { useEffect, useState } from 'react';
import { fetchRoguesGallery } from '../services/api';
import RogueItem from '../components/RogueItem';

export default function RoguesGalleryPage() {
  // Gallery items returned from the server
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) return <p>Loading…</p>;

  return (
    <div>
      <h2>Rogues Gallery</h2>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
          gap: '1rem'
        }}
      >
        {media.map((m) => (
          <RogueItem key={m._id} media={m} />
        ))}
      </div>
    </div>
  );
}
