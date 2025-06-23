import React, { useEffect, useState } from 'react';
import { fetchSettingsAdmin, updateSettingsAdmin } from '../services/api';

// Page allowing admin users to configure global game settings
export default function AdminSettingsPage() {
  const [settings, setSettings] = useState({
    gameName: '',
    qrBaseUrl: '',
    theme: { primary: '#2196F3', secondary: '#FFC107' }
  });

  // Load settings on mount
  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await fetchSettingsAdmin();
        setSettings(data);
      } catch (err) {
        console.error(err);
      }
    };
    load();
  }, []);

  const handleSave = async () => {
    try {
      const { data } = await updateSettingsAdmin(settings);
      setSettings(data);
      alert('Settings saved');
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving settings');
    }
  };

  return (
    <div className="card" style={{ padding: '1rem', margin: '1rem', maxWidth: '500px' }}>
      <h2>Game Settings</h2>
      <label>Game Name:</label>
      <input value={settings.gameName} onChange={(e) => setSettings({ ...settings, gameName: e.target.value })} />
      <label>QR Base URL:</label>
      <input value={settings.qrBaseUrl} onChange={(e) => setSettings({ ...settings, qrBaseUrl: e.target.value })} />
      <label>Primary Colour:</label>
      <input type="color" value={settings.theme.primary}
             onChange={(e) => setSettings({ ...settings, theme: { ...settings.theme, primary: e.target.value } })} />
      <label>Secondary Colour:</label>
      <input type="color" value={settings.theme.secondary}
             onChange={(e) => setSettings({ ...settings, theme: { ...settings.theme, secondary: e.target.value } })} />
      <button onClick={handleSave}>Save Changes</button>
    </div>
  );
}
