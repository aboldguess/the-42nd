import React, { useEffect, useState, useContext } from 'react';
import ImageSelector from '../components/ImageSelector';
// Pull in theme helpers so new colours update instantly
import { ThemeContext } from '../context/ThemeContext';
import { fetchSettingsAdmin, updateSettingsAdmin } from '../services/api';

// Page allowing admin users to configure global game settings
export default function AdminSettingsPage() {
  const { refreshTheme, updateTheme } = useContext(ThemeContext);
  const [settings, setSettings] = useState({
    gameName: '',
    qrBaseUrl: '',
    theme: { primary: '#2196F3', secondary: '#FFC107' },
    fontFamily: 'Arial, sans-serif',
    baseFontSize: 16,
    logoUrl: '',
    faviconUrl: '',
    placeholderUrl: ''
  });
  // Local file objects for uploads
  const [logoFile, setLogoFile] = useState(null);
  const [faviconFile, setFaviconFile] = useState(null);
  const [placeholderFile, setPlaceholderFile] = useState(null);

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
      const formData = new FormData();
      formData.append('gameName', settings.gameName);
      formData.append('qrBaseUrl', settings.qrBaseUrl);
      formData.append('fontFamily', settings.fontFamily);
      formData.append('baseFontSize', settings.baseFontSize);
      formData.append('theme', JSON.stringify(settings.theme));
      if (logoFile) formData.append('logo', logoFile);
      if (faviconFile) formData.append('favicon', faviconFile);
      if (placeholderFile) formData.append('placeholder', placeholderFile);

      const { data } = await updateSettingsAdmin(formData);
      setSettings(data);
      // Immediately update the site theme with the new colours
      updateTheme(data.theme.primary, data.theme.secondary);
      // Re-fetch from the server so fonts, logos and other settings refresh.
      // `ignoreTeam` prevents the admin's personal team colours from
      // overriding the newly saved global theme during preview.
      refreshTheme({ ignoreTeam: true });
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

      <h3>Appearance</h3>
      <label>Primary Colour:</label>
      <input
        type="color"
        value={settings.theme.primary}
        onChange={(e) =>
          setSettings({
            ...settings,
            theme: { ...settings.theme, primary: e.target.value }
          })
        }
      />
      <label>Secondary Colour:</label>
      <input
        type="color"
        value={settings.theme.secondary}
        onChange={(e) =>
          setSettings({
            ...settings,
            theme: { ...settings.theme, secondary: e.target.value }
          })
        }
      />
      <label>Font:</label>
      <select
        value={settings.fontFamily}
        onChange={(e) => setSettings({ ...settings, fontFamily: e.target.value })}
      >
        <option value="Arial, sans-serif">Arial</option>
        <option value="Georgia, serif">Georgia</option>
        <option value="'Times New Roman', serif">Times New Roman</option>
        <option value="'Courier New', monospace">Courier New</option>
      </select>
      <label>Base Font Size (px):</label>
      <input
        type="number"
        min="12"
        max="24"
        value={settings.baseFontSize}
        onChange={(e) =>
          setSettings({ ...settings, baseFontSize: parseInt(e.target.value, 10) })
        }
      />

      <label>Logo:</label>
      {/* Allow taking a new photo or uploading one for the logo */}
      <ImageSelector onSelect={(file) => setLogoFile(file)} />
      {settings.logoUrl && (
        <img src={settings.logoUrl} alt="Current logo" style={{ height: '40px', marginTop: '0.5rem' }} />
      )}
      <label>Favicon:</label>
      <ImageSelector onSelect={(file) => setFaviconFile(file)} />
      {settings.faviconUrl && (
        <img src={settings.faviconUrl} alt="Current favicon" style={{ height: '16px', marginTop: '0.5rem' }} />
      )}
      <label>Gallery Placeholder:</label>
      <ImageSelector onSelect={(file) => setPlaceholderFile(file)} />
      {settings.placeholderUrl && (
        <img src={settings.placeholderUrl} alt="Current placeholder" style={{ height: '40px', marginTop: '0.5rem' }} />
      )}

      <button onClick={handleSave}>Save Changes</button>
    </div>
  );
}
