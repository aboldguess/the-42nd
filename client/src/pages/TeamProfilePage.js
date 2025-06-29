import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchTeam, fetchMe } from '../services/api';
import Wall from '../components/Wall';
import NotificationsList from '../components/NotificationsList';

// Displays a single team's details along with its comment wall
export default function TeamProfilePage() {
  const { id } = useParams();
  const [team, setTeam] = useState(null);
  const [me, setMe] = useState(null); // logged in player

  // Load team info on mount and when id changes
  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetchTeam(id);
        setTeam(res.data);
        // Fetch logged in player for permission check
        const meRes = await fetchMe();
        setMe(meRes.data);
      } catch (err) {
        console.error(err);
      }
    };
    load();
  }, [id]);

  if (!team) return <p>Loading…</p>;

  // Team info along with their gallery wall
  return (
    <div className="card spaced-card">
      <h2>{team.name}</h2>
      {team.photoUrl && (
        <img
          src={team.photoUrl}
          alt={`${team.name} photo`}
          style={{ width: '100%', maxWidth: '300px', objectFit: 'cover' }}
        />
      )}
      <Wall type="team" id={team._id} />
      {/* Team-wide notifications shown only to members */}
      {me && me.team && me.team._id === id && (
        <div style={{ marginTop: '1rem' }}>
          <h3>Team Notifications</h3>
          <NotificationsList teamOnly />
        </div>
      )}
    </div>
  );
}
