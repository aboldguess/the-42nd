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

  // Clear the chosen avatar
  const handleClear = () => {
    setPreview('');
    onFileSelect(null);
  };

  return (
    <div>
      {preview && (
        <div style={{ position: 'relative', display: 'inline-block' }}>
          <img
            src={preview}
            alt="Avatar Preview"
            style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover' }}
          />
          {/* Provide a cancel button so the user can start over */}
          <button
            type="button"
            onClick={handleClear}
            style={{ position: 'absolute', top: 0, right: 0 }}
            aria-label="Remove"
          >
            ✕
          </button>
        </div>
      )}
      {/* Use ImageSelector so the user can take or upload a photo */}
      <ImageSelector onSelect={handleFileSelect} />
    </div>
  );
}
