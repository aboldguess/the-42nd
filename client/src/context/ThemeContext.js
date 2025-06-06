import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState({
    primary: '#2196F3',
    secondary: '#FFC107'
  });

  useEffect(() => {
    const fetchTheme = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        const teamId = localStorage.getItem('teamId');
        if (!teamId) return;
        const res = await axios.get(`/api/teams/${teamId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const cs = res.data.colourScheme;
        setTheme({ primary: cs.primary, secondary: cs.secondary });
      } catch (err) {
        console.error('Error fetching theme:', err);
      }
    };
    fetchTheme();
  }, []);

  const updateTheme = async (primary, secondary) => {
    try {
      const token = localStorage.getItem('token');
      const teamId = localStorage.getItem('teamId');
      if (!token || !teamId) return;
      await axios.put(
        `/api/teams/${teamId}/colour`,
        { primary, secondary },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTheme({ primary, secondary });
    } catch (err) {
      console.error('Error updating theme:', err);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, updateTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
