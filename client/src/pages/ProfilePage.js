import React, { useEffect, useState } from 'react';
import ProfilePic from '../components/ProfilePic';
// Component allowing a team to select and save its colour scheme
import ColorSchemePicker from '../components/ColorSchemePicker';
import { fetchMe, updateMe } from '../services/api';

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [newName, setNewName] = useState('');
  const [selfieFile, setSelfieFile] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetchMe();
        setUser(res.data);
        setNewName(res.data.name);
      } catch (err) {
        console.error(err);
      }
    };
    load();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    if (newName && newName !== user.name) formData.append('name', newName);
    if (selfieFile) formData.append('selfie', selfieFile);

    try {
      const res = await updateMe(formData);
      setUser(res.data);
      alert('Profile updated!');
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating profile');
    }
  };

  if (!user) return <p>Loading profile…</p>;

  return (
    <div>
      <h2>Your Profile</h2>
      <div className="card" style={{ maxWidth: '450px' }}>
        <form onSubmit={handleSubmit}>
          <label>Name:</label>
          <input value={newName} onChange={(e) => setNewName(e.target.value)} required />

          <label>Profile Picture:</label>
          <ProfilePic avatarUrl={user.photoUrl} onFileSelect={(file) => setSelfieFile(file)} />

          <button type="submit">Save Changes</button>
        </form>
      </div>
      {/*
        The colour picker allows the team to customise its palette.
        It uses ThemeContext.updateTheme which persists changes via
        the /api/teams/:id/colour endpoint and updates the app theme.
      */}
      <ColorSchemePicker />
    </div>
  );
}
