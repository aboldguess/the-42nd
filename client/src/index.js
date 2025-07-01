import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import './styles/index.css';

// Register the service worker after the app mounts so the PWA can work offline
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch((err) => {
      console.error('Service worker registration failed:', err);
    });
  });
}

ReactDOM.render(
  <ThemeProvider>
    {/* ToastProvider handles in-app ephemeral notifications */}
    <ToastProvider>
      <App />
    </ToastProvider>
  </ThemeProvider>,
  document.getElementById('root')
);
