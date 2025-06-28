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
    theme: { primary: '#007AFF', secondary: '#5856D6' },
    fontFamily:
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    logoUrl: '',
    faviconUrl: '',
    placeholderUrl: '',
    questionAnswerCooldown: 0,
    scorePerCorrect: 10,
    scorePerSideQuest: 5,
    scorePerCreatedQuest: 20
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
      formData.append('theme', JSON.stringify(settings.theme));
      formData.append('questionAnswerCooldown', settings.questionAnswerCooldown);
      formData.append('scorePerCorrect', settings.scorePerCorrect);
      formData.append('scorePerSideQuest', settings.scorePerSideQuest);
      formData.append('scorePerCreatedQuest', settings.scorePerCreatedQuest);
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

  // Form for editing global settings
  return (
    <div className="card spaced-card" style={{ maxWidth: '500px' }}>
      <h2>Game Settings</h2>
      <label>Game Name:</label>
      <input value={settings.gameName} onChange={(e) => setSettings({ ...settings, gameName: e.target.value })} />
      <label>QR Base URL:</label>
      <input value={settings.qrBaseUrl} onChange={(e) => setSettings({ ...settings, qrBaseUrl: e.target.value })} />
      <label>Answer Cooldown (minutes):</label>
      <input
        type="number"
        min="0"
        value={settings.questionAnswerCooldown}
        onChange={(e) =>
          setSettings({
            ...settings,
            questionAnswerCooldown: parseInt(e.target.value, 10)
          })
        }
      />

      <h3>Scoring</h3>
      <label>Points per Correct Answer:</label>
      <input
        type="number"
        value={settings.scorePerCorrect}
        onChange={(e) =>
          setSettings({
            ...settings,
            scorePerCorrect: parseInt(e.target.value, 10)
          })
        }
      />
      <label>Points per Side Quest Completed:</label>
      <input
        type="number"
        value={settings.scorePerSideQuest}
        onChange={(e) =>
          setSettings({
            ...settings,
            scorePerSideQuest: parseInt(e.target.value, 10)
          })
        }
      />
      <label>Points per Side Quest Created:</label>
      <input
        type="number"
        value={settings.scorePerCreatedQuest}
        onChange={(e) =>
          setSettings({
            ...settings,
            scorePerCreatedQuest: parseInt(e.target.value, 10)
          })
        }
      />

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
