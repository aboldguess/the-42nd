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
  // Reference to the bell wrapper so we can detect outside clicks
  const containerRef = useRef(null);
  // Store the previous set of notifications so we can detect new ones
  const prevNotesRef = useRef([]);
  // ID of the polling timer so we can clean it up
  const pollIdRef = useRef(null);

  useEffect(() => {
    /**
     * Fetch the latest notifications from the API. When not an initial
     * load, any newly arrived notifications will also trigger a browser
     * notification if permission has been granted.
     */
    const load = async (initial = false) => {
      try {
        const res = await fetchNotifications(5);
        const newNotes = res.data;

        if (!initial && Notification.permission === 'granted') {
          const prevIds = new Set(prevNotesRef.current.map((n) => n._id));
          newNotes.forEach((note) => {
            if (!prevIds.has(note._id)) {
              // Fire a native browser notification for the new item
              const pop = new Notification(note.message);
              // Navigate to the linked page when the notification is clicked
              if (note.link) {
                const dest = buildLink(note);
                pop.onclick = () => {
                  window.focus();
                  window.location.href = dest;
                };
              }
            }
          });
        }

        prevNotesRef.current = newNotes;
        setNotes(newNotes);
      } catch (err) {
        console.error('Failed to load notifications', err);
      }
    };

    // Initial fetch on mount
    load(true);
    // Poll the server every 30 seconds for new notifications
    pollIdRef.current = setInterval(() => load(false), 30000);

    // Clean up polling interval when the component unmounts
    return () => clearInterval(pollIdRef.current);
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
      // Remove the notification from the dropdown once read
      setNotes((prev) => prev.filter((n) => n._id !== id));
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
    <div
      className="notification-bell"
      style={{ position: 'relative' }}
      ref={containerRef}
    >
      <button
        onClick={toggle}
        aria-label="Notifications"
        style={{ background: 'none', border: 'none' }}
      >
        🔔
        {unread && <span className="notification-dot" />}
      </button>
      {open && (
        <ul className="notification-dropdown">
          {notes.length === 0 && <li>No notifications</li>}
          {notes.map((n) => (
            <li
              key={n._id}
              onClick={() => {
                handleMark(n._id);
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
