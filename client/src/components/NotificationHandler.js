import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { markNotificationRead } from '../services/api';

/**
 * Global component that watches the current URL for a `note` query
 * parameter. When present, it marks that notification as read via
 * the API. This component renders nothing and simply performs the
 * side effect whenever the route changes.
 */
export default function NotificationHandler() {
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const id = params.get('note');
    if (id) {
      // Fire and forget – the notification bell will refresh later
      markNotificationRead(id).catch((err) =>
        console.error('Failed to mark notification as read', err)
      );
    }
  }, [location]);

  return null;
}
