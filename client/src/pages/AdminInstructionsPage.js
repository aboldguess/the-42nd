import React, { useEffect, useState } from 'react';
import { fetchSettingsAdmin, updateSettingsAdmin } from '../services/api';

// Admin page for editing the default instructions shown for each
// side quest type. The values are stored on the Settings document
// under `sideQuestInstructions`.
export default function AdminInstructionsPage() {
  const [instr, setInstr] = useState({
    bonus: '',
    meetup: '',
    photo: '',
    race: '',
    passcode: '',
    trivia: ''
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await fetchSettingsAdmin();
        setInstr(data.sideQuestInstructions || instr);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  // Helper to render a labelled textarea for a quest type
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
