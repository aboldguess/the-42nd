import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchNotifications, markNotificationRead } from '../services/api';

/**
 * Small bell icon used in the navbar.
 * Displays a dropdown showing the five most recent notifications.
 * A red dot indicates any unread items.
 */
export default function NotificationBell() {
  const [notes, setNotes] = useState([]);
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null); // wrapper used for outside click detection

  useEffect(() => {
    // Load the latest notifications when the component mounts
    const load = async () => {
      try {
        const res = await fetchNotifications(5);
        setNotes(res.data);
      } catch (err) {
        console.error('Failed to load notifications', err);
      }
    };
    load();
  }, []);

  const unread = notes.some((n) => !n.read);

  // Toggle dropdown visibility
  const toggle = () => setOpen((v) => !v);

  // Close dropdown when clicking outside or selecting an item
  useEffect(() => {
    const handleClick = (e) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  // Mark a single notification as read and update state
  const handleMark = async (id) => {
    try {
      await markNotificationRead(id);
      setNotes((prev) => prev.map((n) => (n._id === id ? { ...n, read: true } : n)));
    } catch (err) {
      console.error('Failed to mark notification as read', err);
    }
  };

  // Helper to build a link that includes the notification id as a query param
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

  return (
    <div className="notification-bell" style={{ position: 'relative' }}>
      <button onClick={toggle} aria-label="Notifications" style={{ background: 'none', border: 'none' }}>
        🔔
        {unread && <span className="notification-dot" />}
      </button>
      {open && (
        <ul className="notification-dropdown" ref={containerRef}>
          {notes.length === 0 && <li>No notifications</li>}
          {notes.map((n) => (
            <li
              key={n._id}
              onClick={() => {
                // Non-linked items are marked read immediately
                if (!n.link) handleMark(n._id);
                // Hide the dropdown after any selection
                setOpen(false);
              }}
            >
              {n.link ? <Link to={buildLink(n)}>{n.message}</Link> : n.message}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
