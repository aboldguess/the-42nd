import React, { useState } from 'react';
import ImageSelector from './ImageSelector';

export default function ProfilePic({ avatarUrl, onFileSelect }) {
  const [preview, setPreview] = useState(avatarUrl || '');

  // When a file is chosen via ImageSelector, update preview and inform parent
  const handleFileSelect = (file) => {
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
      {/* Use ImageSelector so the user can take or upload a photo */}
      <ImageSelector onSelect={handleFileSelect} />
    </div>
  );
}
