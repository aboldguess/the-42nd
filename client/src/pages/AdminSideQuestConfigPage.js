import React, { useEffect, useState } from 'react';
import { fetchSettingsAdmin, updateSettingsAdmin } from '../services/api';

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

  // Helper component to render a labelled textarea for one quest type. Updates
  // the corresponding field in state when edited.
  const Field = ({ type, label }) => (
    <label style={{ display: 'block', marginBottom: '1rem' }}>
      {label}:
      <textarea
        value={instr[type] || ''}
        onChange={(e) => setInstr({ ...instr, [type]: e.target.value })}
        style={{ width: '100%', height: '4rem', marginTop: '0.25rem' }}
      />
      <div style={{ marginTop: '0.25rem' }}>
        <label>
          <input
            type="checkbox"
            checked={adminOnly[type] || false}
            onChange={(e) =>
              setAdminOnly({ ...adminOnly, [type]: e.target.checked })
            }
          />
          Admin only
        </label>
      </div>
    </label>
  );

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
        <Field type="bonus" label="Bonus" />
        <Field type="meetup" label="Meetup" />
        <Field type="photo" label="Photo" />
        <Field type="race" label="Race" />
        <Field type="passcode" label="Passcode" />
        <Field type="trivia" label="Trivia" />
        <button type="submit">Save</button>
      </form>
    </div>
  );
}
