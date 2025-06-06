import React, { useState } from 'react';
import ProfilePic from './ProfilePic';

function TeamMemberForm({ onAdd }) {
  const [name, setName] = useState('');
  const [avatarFile, setAvatarFile] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name) return alert('Please enter a name.');
    const formData = new FormData();
    formData.append('name', name);
    if (avatarFile) formData.append('avatar', avatarFile);
    onAdd(formData);
    setName('');
    setAvatarFile(null);
  };

  return (
    <div className="card">
      <h3>Add Team Member</h3>
      <form onSubmit={handleSubmit}>
        <label>Name:</label>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Member Name" />
        <label>Picture (optional):</label>
        <ProfilePic avatarUrl="" onFileSelect={(file) => setAvatarFile(file)} />
        <button type="submit">Add Member</button>
      </form>
    </div>
  );
}

export default TeamMemberForm;
