import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchNotifications, markNotificationRead } from '../services/api';

/**
 * Small bell icon used in the navbar.
 * Requests Notification API permission on mount and displays a dropdown
 * showing the five most recent notifications. A red dot indicates any
 * unread items.
 */
export default function NotificationBell() {
  const [notes, setNotes] = useState([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // Ask the browser for permission to display notifications
    if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
      Notification.requestPermission();
    }
    // Load the latest notifications
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

  // Mark a single notification as read and update state
  const handleMark = async (id) => {
    try {
      await markNotificationRead(id);
      setNotes((prev) => prev.map((n) => (n._id === id ? { ...n, read: true } : n)));
    } catch (err) {
      console.error('Failed to mark notification as read', err);
    }
  };

  return (
    <div className="notification-bell" style={{ position: 'relative' }}>
      <button onClick={toggle} aria-label="Notifications" style={{ background: 'none', border: 'none' }}>
        🔔
        {unread && <span className="notification-dot" />}
      </button>
      {open && (
        <ul className="notification-dropdown">
          {notes.length === 0 && <li>No notifications</li>}
          {notes.map((n) => (
            <li key={n._id} onClick={() => handleMark(n._id)}>
              {n.link ? <Link to={n.link}>{n.message}</Link> : n.message}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
