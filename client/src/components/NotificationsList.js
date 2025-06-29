import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchNotifications, fetchTeamNotifications } from '../services/api';

/**
 * Simple list of notifications. If `teamOnly` is true only team notifications
 * are fetched. Used on profile pages to show all recent items.
 */
export default function NotificationsList({ teamOnly = false }) {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = teamOnly
          ? await fetchTeamNotifications()
          : await fetchNotifications();
        setNotes(res.data);
      } catch (err) {
        console.error('Failed to load notifications', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [teamOnly]);

  if (loading) return <p>Loading…</p>;
  if (notes.length === 0) return <p>No notifications.</p>;

  return (
    <ul>
      {notes.map((n) => (
        <li key={n._id} style={{ marginBottom: '0.25rem' }}>
          {n.link ? <Link to={n.link}>{n.message}</Link> : n.message}
          {!n.read && ' (unread)'}
        </li>
      ))}
    </ul>
  );
}
