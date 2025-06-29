import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchPlayerById, fetchMe } from '../services/api';
import Wall from '../components/Wall';
import NotificationsList from '../components/NotificationsList';

// Read-only profile for any player
export default function PlayerProfilePage() {
  const { id } = useParams(); // player id from the route
  const [player, setPlayer] = useState(null);
  const [me, setMe] = useState(null); // logged in player

  useEffect(() => {
    // Load player data when id changes
    const load = async () => {
      try {
        const { data } = await fetchPlayerById(id);
        setPlayer(data);
        // Also fetch current user to check if this is their profile
        const meRes = await fetchMe();
        setMe(meRes.data);
      } catch (err) {
        console.error(err);
      }
    };
    load();
  }, [id]);

  if (!player) return <p>Loading…</p>;

  // Profile card for the selected player
  return (
    <div className="card spaced-card">
      <h2>{player.name}</h2>
      {player.photoUrl && (
        <img
          src={player.photoUrl}
          alt={`${player.name} avatar`}
          style={{ width: '150px', height: '150px', borderRadius: '50%', objectFit: 'cover' }}
        />
      )}
      <p>Team: {player.team ? player.team.name : '-'}</p>
      <Wall type="user" id={id} />
      {/* Show personal notifications when viewing your own profile */}
      {me && me._id === id && (
        <div style={{ marginTop: '1rem' }}>
          <h3>Notifications</h3>
          <NotificationsList />
        </div>
      )}
    </div>
  );
}
