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

      const token = localStorage.getItem('token');
      // Only apply team-specific colours when not explicitly ignored
      if (token && !opts.ignoreTeam) {
        const userRes = await axios.get('/api/users/me');
        const teamId = userRes.data.team._id;
        const teamRes = await axios.get(`/api/teams/${teamId}`);
        const cs = teamRes.data.colourScheme;
        th = { ...th, primary: cs.primary, secondary: cs.secondary };
      }
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
