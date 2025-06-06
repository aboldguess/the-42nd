import React, { useContext, useState } from 'react';
import { ThemeContext } from '../context/ThemeContext';

export default function ColorSchemePicker() {
  const { theme, updateTheme } = useContext(ThemeContext);
  const [primary, setPrimary] = useState(theme.primary);
  const [secondary, setSecondary] = useState(theme.secondary);

  const handleSave = () => {
    updateTheme(primary, secondary);
  };

  return (
    <div className="card">
      <h3>Customize Colour Scheme</h3>
      <label>Primary:</label>
      <input type="color" value={primary} onChange={(e) => setPrimary(e.target.value)} />
      <label>Secondary:</label>
      <input type="color" value={secondary} onChange={(e) => setSecondary(e.target.value)} />
      <button onClick={handleSave}>Save Colours</button>
    </div>
  );
}
