import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  fetchNotifications,
  fetchTeamNotifications,
  markNotificationViewed
} from '../services/api';

/**
 * Simple list of notifications. If `teamOnly` is true only team notifications
 * are fetched. Used on profile pages to show all recent items.
 */
export default function NotificationsList({ teamOnly = false }) {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Append the notification id to any provided link so the destination page
  // can mark it as read when visited
  const buildLink = (note) => {
    if (!note.link) return '';
    try {
      const url = new URL(note.link, window.location.origin);
      url.searchParams.set('note', note._id);
      return url.pathname + url.search + url.hash;
    } catch {
      return note.link;
    }
  };

  useEffect(() => {
    const load = async () => {
      try {
        const res = teamOnly
          ? await fetchTeamNotifications()
          : await fetchNotifications();
        setNotes(res.data);
        // Mark any newly retrieved notifications as viewed
        res.data.forEach((n) => {
          if (!n.viewed) {
            markNotificationViewed(n._id).catch((err) =>
              console.error('Failed to mark notification as viewed', err)
            );
          }
        });
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
          {n.link ? (
            <Link to={buildLink(n)} style={{ fontWeight: n.read ? 'normal' : 'bold' }}>
              {n.message}
            </Link>
          ) : (
            <span style={{ fontWeight: n.read ? 'normal' : 'bold' }}>{n.message}</span>
          )}
          {!n.viewed ? ' (new)' : !n.read ? ' (unread)' : ''}
        </li>
      ))}
    </ul>
  );
}
