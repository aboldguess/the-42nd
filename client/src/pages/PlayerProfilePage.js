import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchUserPublic } from '../services/api';

// Public profile page shown when a player's QR code is scanned

export default function PlayerProfilePage() {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch the player's data whenever the id param changes
  useEffect(() => {
    const load = async () => {
      try {
        // Request the player's info from the API
        const { data } = await fetchUserPublic(id);
        setUser(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) return <p>Loading profile…</p>;
  if (!user) return <p>Player not found.</p>;

  return (
    <div>
      <h2>{user.name}</h2>
      {/* Display avatar if available */}
      {user.photoUrl && (
        <img
          src={user.photoUrl}
          alt={user.name}
          style={{ width: '150px', borderRadius: '50%' }}
        />
      )}
      {user.team && <p>Team: {user.team.name}</p>}
    </div>
  );
}
