import React, { useEffect, useState, useContext } from 'react';
import ImageSelector from '../components/ImageSelector';
// Pull in theme helpers so new colours update instantly
import { ThemeContext } from '../context/ThemeContext';
import {
  fetchSettingsAdmin,
  updateSettingsAdmin,
  broadcastNotification
} from '../services/api';

// Pre-defined colour palettes used by the admin to theme the game
// Each palette consists of a primary and secondary colour
export const COLOUR_PALETTES = [
  { name: 'Ocean', primary: '#007AFF', secondary: '#5856D6' },
  { name: 'Sunset', primary: '#FF4500', secondary: '#FFA500' },
  { name: 'Forest', primary: '#228B22', secondary: '#2E8B57' },
  { name: 'Rose', primary: '#C71585', secondary: '#FF69B4' },
  { name: 'Aqua', primary: '#20B2AA', secondary: '#40E0D0' },
  { name: 'Slate', primary: '#708090', secondary: '#2F4F4F' },
  { name: 'Berry', primary: '#8A2BE2', secondary: '#BA55D3' },
  { name: 'Citrus', primary: '#FF8C00', secondary: '#FFD700' },
  { name: 'Lime', primary: '#9ACD32', secondary: '#6B8E23' },
  { name: 'Steel', primary: '#4682B4', secondary: '#5F9EA0' }
];

// Page allowing admin users to configure global game settings
export default function AdminSettingsPage() {
  const { refreshTheme, updateTheme } = useContext(ThemeContext);
  // Track which palette is selected in the UI
  const [paletteIndex, setPaletteIndex] = useState(0);
  const [settings, setSettings] = useState({
    gameName: '',
    qrBaseUrl: '',
    theme: { primary: '#007AFF', secondary: '#5856D6' },
    fontFamily:
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    logoUrl: '',
    faviconUrl: '',
    placeholderUrl: '',
    neumorphicShadows: true,
    roundedCorners: true,
    questionAnswerCooldown: 0,
    helpText: '',
    scorePerCorrect: 10,
    scorePerSideQuest: 5,
    scorePerCreatedQuest: 20
  });
  // Local file objects for uploads
  const [logoFile, setLogoFile] = useState(null);
  const [faviconFile, setFaviconFile] = useState(null);
  const [placeholderFile, setPlaceholderFile] = useState(null);
  // Message used when broadcasting a system alert to all players
  const [alertMessage, setAlertMessage] = useState('');

  // Load settings on mount
  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await fetchSettingsAdmin();
        setSettings(data);
        // Determine which palette matches the saved theme
        const idx = COLOUR_PALETTES.findIndex(
          (p) =>
            p.primary === data.theme.primary &&
            p.secondary === data.theme.secondary
        );
        if (idx >= 0) setPaletteIndex(idx);
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
      formData.append('helpText', settings.helpText);
      formData.append('scorePerCorrect', settings.scorePerCorrect);
      formData.append('scorePerSideQuest', settings.scorePerSideQuest);
      formData.append('scorePerCreatedQuest', settings.scorePerCreatedQuest);
      formData.append('neumorphicShadows', settings.neumorphicShadows);
      formData.append('roundedCorners', settings.roundedCorners);
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

  // Send a system-wide alert to all players
  const handleAlert = async () => {
    try {
      await broadcastNotification(alertMessage);
      alert('Alert sent');
      setAlertMessage('');
    } catch (err) {
      alert(err.response?.data?.message || 'Error sending alert');
    }
  };

  // Form for editing global settings. Wrapping everything in a <form> lets us
  // use the global form styles defined in index.css so labels and inputs stack
  // vertically rather than sitting on the same line.
  return (
    <div className="card spaced-card" style={{ maxWidth: '500px' }}>
      <h2>Game Settings</h2>
      {/* onSubmit prevents the page from reloading and calls handleSave */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSave();
        }}
      >
        <label>Game Name:</label>
        <input
          value={settings.gameName}
          onChange={(e) =>
            setSettings({ ...settings, gameName: e.target.value })
          }
        />
        <label>QR Base URL:</label>
        <input
          value={settings.qrBaseUrl}
          onChange={(e) =>
            setSettings({ ...settings, qrBaseUrl: e.target.value })
          }
        />
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
        <label>Colour Palette:</label>
      {/* Choose from ten predefined palettes so colours are consistent */}
      <select
        value={paletteIndex}
        onChange={(e) => {
          const idx = parseInt(e.target.value, 10);
          setPaletteIndex(idx);
          const pal = COLOUR_PALETTES[idx];
          // Immediately update local settings so the preview refreshes
          setSettings({
            ...settings,
            theme: { primary: pal.primary, secondary: pal.secondary }
          });
          // Update the applied theme colours right away
          updateTheme(pal.primary, pal.secondary);
        }}
      >
        {COLOUR_PALETTES.map((p, i) => (
          <option key={p.name} value={i}>
            {p.name}
          </option>
        ))}
      </select>
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

        <label>
          <input
            type="checkbox"
            checked={settings.neumorphicShadows}
            onChange={(e) =>
              setSettings({ ...settings, neumorphicShadows: e.target.checked })
            }
          />
          Use Soft Shadows
        </label>
        <label>
          <input
            type="checkbox"
            checked={settings.roundedCorners}
            onChange={(e) =>
              setSettings({ ...settings, roundedCorners: e.target.checked })
            }
          />
          Rounded Corners
        </label>

        <label>Help Page Text:</label>
        <textarea
          value={settings.helpText}
          onChange={(e) =>
            setSettings({ ...settings, helpText: e.target.value })
          }
          style={{ width: '100%', height: '6rem' }}
        />

        <h3>Alert All Players</h3>
        <input
          value={alertMessage}
          onChange={(e) => setAlertMessage(e.target.value)}
          placeholder="System message"
        />
        <button type="button" onClick={handleAlert}>Alert All</button>

        <button type="submit">Save Changes</button>
      </form>
    </div>
  );
}
