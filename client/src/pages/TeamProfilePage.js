import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchTeam } from '../services/api';
import Wall from '../components/Wall';

// Displays a single team's details along with its comment wall
export default function TeamProfilePage() {
  const { id } = useParams();
  const [team, setTeam] = useState(null);

  // Load team info on mount and when id changes
  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetchTeam(id);
        setTeam(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    load();
  }, [id]);

  if (!team) return <p>Loading…</p>;

  return (
    <div className="card" style={{ padding: '1rem', margin: '1rem' }}>
      <h2>{team.name}</h2>
      {team.photoUrl && (
        <img
          src={team.photoUrl}
          alt={`${team.name} photo`}
          style={{ width: '100%', maxWidth: '300px', objectFit: 'cover' }}
        />
      )}
      <Wall type="team" id={team._id} />
    </div>
  );
}
