import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState({
    primary: '#007AFF',
    secondary: '#5856D6',
    fontFamily:
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    logoUrl: '',
    faviconUrl: ''
  });

  // ────────────────────────────────────────────────────────────────────────────
  // Colour helpers
  // ────────────────────────────────────────────────────────────────────────────

  /** Lighten a hex colour by mixing it with white. `amount` ranges 0-1. */
  const lighten = (hex, amount) => {
    let col = hex.replace('#', '');
    if (col.length === 3) col = col.split('').map((c) => c + c).join('');
    const num = parseInt(col, 16);
    const r = (num >> 16) + Math.round((255 - (num >> 16)) * amount);
    const g = ((num >> 8) & 0xff) + Math.round((255 - ((num >> 8) & 0xff)) * amount);
    const b = (num & 0xff) + Math.round((255 - (num & 0xff)) * amount);
    return (
      '#' +
      [r, g, b]
        .map((v) => {
          const clamped = Math.max(0, Math.min(255, v));
          return clamped.toString(16).padStart(2, '0');
        })
        .join('')
    );
  };

  /** Choose black or white text for best contrast with the given background. */
  const contrastText = (bg) => {
    const col = bg.replace('#', '');
    const r = parseInt(col.substr(0, 2), 16);
    const g = parseInt(col.substr(2, 2), 16);
    const b = parseInt(col.substr(4, 2), 16);
    // Standard luminance formula
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 125 ? '#000' : '#fff';
  };

  /**
   * Fetch the current theme from the server and update state. Team colours
   * override the global settings if a player is logged in.
   */
  /**
   * Retrieve the theme from the server. If `opts.ignoreTeam` is true the
   * currently logged in player's team colours will not override the global
   * settings. This is useful when an admin saves new colours and wants to
   * preview the global scheme regardless of their team membership.
   */
  const fetchTheme = async (opts = {}) => {
    try {
      let th = {
        primary: '#007AFF',
        secondary: '#5856D6',
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
        logoUrl: '',
        faviconUrl: ''
      };
      const globalRes = await axios.get('/api/settings');
      if (globalRes.data.theme) th = { ...th, ...globalRes.data.theme };
      if (globalRes.data.fontFamily) th.fontFamily = globalRes.data.fontFamily;
      if (globalRes.data.logoUrl) th.logoUrl = globalRes.data.logoUrl;
      if (globalRes.data.faviconUrl) th.faviconUrl = globalRes.data.faviconUrl;

      // Team colours are no longer applied so everyone shares the admin palette
      setTheme(th);
    } catch (err) {
      console.error('Error fetching theme:', err);
    }
  };

  // Fetch theme on first mount
  useEffect(() => {
    fetchTheme();
  }, []);

  // Apply the current theme values as CSS custom properties on the root
  // element so global styles like fonts and colours update immediately
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--primary-color', theme.primary);
    root.style.setProperty('--secondary-color', theme.secondary);
    root.style.setProperty('--font-family', theme.fontFamily);

    // Derive a lighter shade from the primary colour for general backgrounds
    const bg = lighten(theme.primary, 0.9);
    root.style.setProperty('--background-color', bg);

    // Choose text colour that contrasts with the primary/background colour
    const text = contrastText(bg);
    root.style.setProperty('--text-color', text);

    // Keep the browser UI (address bar etc) in sync with the chosen theme
    const metaTheme = document.querySelector('meta[name="theme-color"]');
    if (metaTheme) metaTheme.setAttribute('content', theme.primary);
  }, [theme]);

  // Apply favicon whenever it changes
  useEffect(() => {
    if (theme.faviconUrl) {
      let link = document.querySelector("link[rel='icon']");
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.head.appendChild(link);
      }
      link.href = theme.faviconUrl;
    }
  }, [theme.faviconUrl]);

  /**
   * Update the currently applied theme colours locally. This does not persist
   * to the server but ensures the UI updates immediately after the admin saves
   * new colours.
   */
  const updateTheme = (primary, secondary) => {
    // Immediately apply new colours locally so the UI reflects changes
    setTheme((t) => ({ ...t, primary, secondary }));
  };

  return (
    /* Expose the current theme plus helpers for fetching or locally updating
       the values after an admin changes them */
    <ThemeContext.Provider
      value={{ theme, refreshTheme: fetchTheme, updateTheme }}
    >
      {children}
    </ThemeContext.Provider>
  );
};
