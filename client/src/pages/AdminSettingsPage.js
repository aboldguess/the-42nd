import React, { useEffect, useState } from 'react';
import {
  fetchSettingsAdmin,
  updateSettingsAdmin,
  exportGameAdmin,
  importGameAdmin
} from '../services/api';

// Page allowing admin users to configure global game settings
export default function AdminSettingsPage() {
  const [settings, setSettings] = useState({
    gameName: '',
    qrBaseUrl: '',
    theme: { primary: '#2196F3', secondary: '#FFC107' }
  });
  // Holds the file chosen when restoring a game
  const [importFile, setImportFile] = useState(null);

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

  // Trigger download of the current game data
  const handleExport = async () => {
    try {
      // Request the export blob then create a download link on the fly
      const { data } = await exportGameAdmin();
      const url = window.URL.createObjectURL(new Blob([data]));
      const link = document.createElement('a');
      link.href = url;
      link.download = 'game_export.json';
      link.click();
      // Clean up the object URL to avoid memory leaks
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert('Error exporting game');
    }
  };

  // Upload a JSON file to restore the game state
  const handleImport = async () => {
    if (!importFile) {
      alert('Select a file first');
      return;
    }
    const formData = new FormData();
    // Field name must match the multer middleware on the server
    formData.append('file', importFile);
    try {
      // Post the file to the API and await completion
      await importGameAdmin(formData);
      alert('Game imported successfully');
    } catch (err) {
      alert('Error importing game');
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
      <hr />
      <div style={{ marginTop: '1rem' }}>
        <label>Import Game:</label>
        <input
          type="file"
          accept="application/json"
          onChange={(e) => setImportFile(e.target.files[0])}
        />
        <button onClick={handleImport} style={{ marginLeft: '0.5rem' }}>
          Import
        </button>
      </div>
      <button onClick={handleExport} style={{ marginTop: '1rem' }}>
        Export Current Game
      </button>
    </div>
  );
}
