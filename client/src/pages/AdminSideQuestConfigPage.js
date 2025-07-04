import React, { useEffect, useState } from 'react';
import { fetchSettingsAdmin, updateSettingsAdmin } from '../services/api';

/**
 * Render a labeled textarea and admin-only toggle for a single quest type.
 *
 * This component is defined outside of the main page component so React
 * preserves its identity between re-renders. When it was defined inline, each
 * keystroke recreated the component, causing the textarea to lose focus. By
 * moving it to module scope we ensure focus remains stable while typing.
 */
function QuestField({ type, label, value, onChange, adminOnly, onAdminToggle }) {
  return (
    <label style={{ display: 'block', marginBottom: '1rem' }}>
      {label}:
      <textarea
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        style={{ width: '100%', height: '4rem', marginTop: '0.25rem' }}
      />
      <div style={{ marginTop: '0.25rem' }}>
        <label>
          <input
            type="checkbox"
            checked={adminOnly || false}
            onChange={(e) => onAdminToggle(e.target.checked)}
          />
          Admin only
        </label>
      </div>
    </label>
  );
}

// Admin page for editing the default instructions shown for each
// side quest type. The values are stored on the Settings document
// under `sideQuestInstructions`.
// Admin page for configuring side quest instructions and visibility. Instructions
// control the helper text players see when completing a quest. Visibility
// toggles determine which quest types regular players can create from the UI.
export default function AdminSideQuestConfigPage() {
  // Default instruction text for each quest type. This is used both for
  // initializing state and as a fallback if no settings exist on the server.
  const initialInstr = {
    bonus: '',
    meetup: '',
    photo: '',
    race: '',
    passcode: '',
    trivia: ''
  };

  const [instr, setInstr] = useState(initialInstr);
  // Boolean flags indicating quest types that are restricted to admin users
  const initialHide = {
    bonus: false,
    meetup: false,
    photo: false,
    race: false,
    passcode: false,
    trivia: false
  };
  const [adminOnly, setAdminOnly] = useState(initialHide);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await fetchSettingsAdmin();
        // Populate instructions and visibility settings from server
        setInstr(data.sideQuestInstructions || initialInstr);
        setAdminOnly(data.sideQuestAdminOnly || initialHide);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []); // run once on mount

  // Save the updated instructions and visibility flags back to the server
  const handleSave = async () => {
    try {
      const payload = new FormData();
      payload.append('sideQuestInstructions', JSON.stringify(instr));
      payload.append('sideQuestAdminOnly', JSON.stringify(adminOnly));
      await updateSettingsAdmin(payload);
      alert('Configuration saved');
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving instructions');
    }
  };

  if (loading) return <p>Loading…</p>;


  return (
    <div className="card spaced-card" style={{ maxWidth: '600px' }}>
      <h2>SideQuest Config</h2>
      {/* When the form is submitted, persist the instructions to the server */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSave();
        }}
      >
        {/*
          Use the standalone QuestField component for each quest type. The
          onChange handlers update the corresponding entry in state.
        */}
        <QuestField
          type="bonus"
          label="Bonus"
          value={instr.bonus}
          onChange={(val) => setInstr({ ...instr, bonus: val })}
          adminOnly={adminOnly.bonus}
          onAdminToggle={(val) => setAdminOnly({ ...adminOnly, bonus: val })}
        />
        <QuestField
          type="meetup"
          label="Meetup"
          value={instr.meetup}
          onChange={(val) => setInstr({ ...instr, meetup: val })}
          adminOnly={adminOnly.meetup}
          onAdminToggle={(val) => setAdminOnly({ ...adminOnly, meetup: val })}
        />
        <QuestField
          type="photo"
          label="Photo"
          value={instr.photo}
          onChange={(val) => setInstr({ ...instr, photo: val })}
          adminOnly={adminOnly.photo}
          onAdminToggle={(val) => setAdminOnly({ ...adminOnly, photo: val })}
        />
        <QuestField
          type="race"
          label="Race"
          value={instr.race}
          onChange={(val) => setInstr({ ...instr, race: val })}
          adminOnly={adminOnly.race}
          onAdminToggle={(val) => setAdminOnly({ ...adminOnly, race: val })}
        />
        <QuestField
          type="passcode"
          label="Passcode"
          value={instr.passcode}
          onChange={(val) => setInstr({ ...instr, passcode: val })}
          adminOnly={adminOnly.passcode}
          onAdminToggle={(val) => setAdminOnly({ ...adminOnly, passcode: val })}
        />
        <QuestField
          type="trivia"
          label="Trivia"
          value={instr.trivia}
          onChange={(val) => setInstr({ ...instr, trivia: val })}
          adminOnly={adminOnly.trivia}
          onAdminToggle={(val) => setAdminOnly({ ...adminOnly, trivia: val })}
        />
        <button type="submit">Save</button>
      </form>
    </div>
  );
}
