import React, { createContext, useState, useCallback } from 'react';

// Context provides the `addToast` function to components
export const ToastContext = createContext({ addToast: () => {} });

export const ToastProvider = ({ children }) => {
  // Array of active toasts displayed on screen
  const [toasts, setToasts] = useState([]);

  /**
   * Add a new toast notification. Each toast automatically removes itself
   * after a short delay. The optional `link` navigates when clicked.
   */
  const addToast = useCallback((message, link = null, duration = 5000) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((t) => [...t, { id, message, link }]);
    setTimeout(() => {
      setToasts((t) => t.filter((toast) => toast.id !== id));
    }, duration);
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="toast-container" aria-live="polite">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="toast"
            onClick={() => {
              if (t.link) window.location.href = t.link;
            }}
          >
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};
