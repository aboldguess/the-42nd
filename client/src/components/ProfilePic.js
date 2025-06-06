import React, { useState } from 'react';

export default function ProfilePic({ avatarUrl, onFileSelect }) {
  const [preview, setPreview] = useState(avatarUrl || '');

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    onFileSelect(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div>
      {preview && (
        <img
          src={preview}
          alt="Avatar Preview"
          style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover' }}
        />
      )}
      <input type="file" accept="image/*" onChange={handleFileChange} />
    </div>
  );
}
