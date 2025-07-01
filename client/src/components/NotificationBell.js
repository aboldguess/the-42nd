import React, { useEffect, useRef, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { fetchNotifications, markNotificationRead } from '../services/api';
import { ToastContext } from '../context/ToastContext';

/**
 * Small bell icon used in the navbar.
 * Displays a dropdown showing the five most recent notifications.
 * A red dot indicates any unread items.
 */
export default function NotificationBell() {
  // addToast displays an in-app toast when system notifications fail
  const { addToast } = useContext(ToastContext);
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
        // Only keep unread notifications so the dropdown doesn't show items
        // the player has already opened elsewhere
        const newNotes = res.data.filter((n) => !n.read);

        if (!initial) {
          const prevIds = new Set(prevNotesRef.current.map((n) => n._id));
          newNotes.forEach((note) => {
            if (!prevIds.has(note._id)) {
              if (Notification.permission === 'granted') {
                // Prefer system-level notifications via the service worker
                showNotification(note);
              } else {
                // Fallback when browser permission denied
                addToast(note.message, note.link ? buildLink(note) : null);
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

  /**
   * Send a message to the service worker so it can display a
   * system-level notification. If the service worker isn't ready
   * or notifications aren't supported, fall back to the basic
   * Notification constructor.
   */
  const showNotification = async (note) => {
    try {
      if ('serviceWorker' in navigator) {
        const reg = await navigator.serviceWorker.ready;
        reg.active?.postMessage({
          type: 'SHOW_NOTIFICATION',
          payload: {
            title: note.message,
            options: { data: { link: note.link ? buildLink(note) : null } }
          }
        });
        return;
      }
    } catch (err) {
      console.error('Failed to notify via service worker', err);
    }

    // Fallback for older browsers or if the service worker failed
    try {
      const pop = new Notification(note.message);
      if (note.link) {
        const dest = buildLink(note);
        pop.onclick = () => {
          window.focus();
          window.location.href = dest;
        };
      }
    } catch {
      // Ultimately fall back to an in-app toast
      addToast(note.message, note.link ? buildLink(note) : null);
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
