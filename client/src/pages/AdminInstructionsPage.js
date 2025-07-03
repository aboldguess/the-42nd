import React, { useEffect, useState } from 'react';
import { fetchSettingsAdmin, updateSettingsAdmin } from '../services/api';

// Admin page for editing the default instructions shown for each
// side quest type. The values are stored on the Settings document
// under `sideQuestInstructions`.
export default function AdminInstructionsPage() {
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

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await fetchSettingsAdmin();
        // Use the default values if the server hasn't stored any yet
        setInstr(data.sideQuestInstructions || initialInstr);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []); // run once on mount

  // Save the updated instructions back to the server
  const handleSave = async () => {
    try {
      const payload = new FormData();
      payload.append('sideQuestInstructions', JSON.stringify(instr));
      await updateSettingsAdmin(payload);
      alert('Instructions saved');
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
    </label>
  );

  return (
    <div className="card spaced-card" style={{ maxWidth: '600px' }}>
      <h2>Side Quest Instructions</h2>
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
