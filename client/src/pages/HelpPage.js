import React, { useEffect, useState } from 'react';
import { fetchSettings } from '../services/api';

// This page provides a high level overview of how the game works
// and explains each main feature players will encounter.
export default function HelpPage() {
  const [helpHtml, setHelpHtml] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetchSettings();
        setHelpHtml(res.data.helpText || '');
      } catch (err) {
        console.error(err);
      }
    };
    load();
  }, []);

  return (
    <div
      className="card spaced-card"
      dangerouslySetInnerHTML={{ __html: helpHtml }}
    />
  );
}
