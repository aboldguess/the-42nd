import React, { useEffect, useState } from 'react';
import ProfilePic from '../components/ProfilePic';
import { fetchMe, updateMe } from '../services/api';

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [newName, setNewName] = useState('');
  const [selfieFile, setSelfieFile] = useState(null);
  // Persist the user's preferred camera for QR scanning.
  const [cameraPref, setCameraPref] = useState(
    localStorage.getItem('cameraFacingMode') || 'rear'
  );

  // Store the preference whenever it changes so the
  // scanner component can read it from localStorage.
  useEffect(() => {
    localStorage.setItem('cameraFacingMode', cameraPref);
  }, [cameraPref]);

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
          <ProfilePic
            avatarUrl={user.photoUrl}
            onFileSelect={(file) => setSelfieFile(file)}
          />

          <label>QR Scanner Camera:</label>
          {/* Allows the user to control which camera opens when scanning */}
          <select
            value={cameraPref}
            onChange={(e) => setCameraPref(e.target.value)}
          >
            <option value="rear">Rear (default)</option>
            <option value="front">Front</option>
          </select>

          <button type="submit">Save Changes</button>
        </form>
      </div>
      {/* Colour scheme editing removed; only admins can change theme */}
    </div>
  );
}
