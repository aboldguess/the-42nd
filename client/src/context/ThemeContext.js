import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState({
    primary: '#2196F3',
    secondary: '#FFC107'
  });

  useEffect(() => {
    // Fetch global theme, then override with team colours if logged in
    const fetchTheme = async () => {
      try {
        let th = { primary: '#2196F3', secondary: '#FFC107' };
        const globalRes = await axios.get('/api/settings');
        if (globalRes.data.theme) th = globalRes.data.theme;

        const token = localStorage.getItem('token');
        if (token) {
          const userRes = await axios.get('/api/users/me');
          const teamId = userRes.data.team._id;
          const teamRes = await axios.get(`/api/teams/${teamId}`);
          const cs = teamRes.data.colourScheme;
          th = { primary: cs.primary, secondary: cs.secondary };
        }
        setTheme(th);
      } catch (err) {
        console.error('Error fetching theme:', err);
      }
    };
    fetchTheme();
  }, []);

  return (
    // Expose only the current theme values; modifications are restricted to admin
    <ThemeContext.Provider value={{ theme }}>
      {children}
    </ThemeContext.Provider>
  );
};
