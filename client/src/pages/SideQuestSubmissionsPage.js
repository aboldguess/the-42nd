import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchSideQuest, fetchSideQuestSubmissions } from '../services/api';
import RogueItem from '../components/RogueItem';

// Display all media submissions for a side quest
export default function SideQuestSubmissionsPage() {
  const { id } = useParams();
  const [quest, setQuest] = useState(null); // side quest details
  const [media, setMedia] = useState([]); // submission list
  const [loading, setLoading] = useState(true); // loading indicator

  useEffect(() => {
    const load = async () => {
      try {
        const [qRes, mRes] = await Promise.all([
          fetchSideQuest(id),
          fetchSideQuestSubmissions(id)
        ]);
        setQuest(qRes.data);
        setMedia(mRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (id) load();
  }, [id]);

  if (loading) return <p>Loading…</p>;
  if (!quest) return <p>Side quest not found.</p>;

  return (
    <div>
      <h2>Submissions for {quest.title}</h2>
      <div className="rogue-grid">
        {media.map((m) => (
          <RogueItem key={m._id} media={m} showInfo={false} />
        ))}
      </div>
    </div>
  );
}
