import React, { useState } from 'react';
import ImageSelector from './ImageSelector';

// Widget allowing players to attach media to side quest submissions.
// For photo quests we let the user either capture a new image or upload one.
function PhotoUploader({ label, requiredMediaType, onUpload }) {
  const [file, setFile] = useState(null);   // currently selected File object
  const [preview, setPreview] = useState(''); // preview URL or filename

  // Reads the chosen file and sets up a preview
  const handleFileSelect = (f) => {
    if (!f) return;
    setFile(f);

    if (requiredMediaType === 'photo') {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(f);
    } else {
      // For videos we simply show the filename
      setPreview(f.name);
    }
  };

  // Remove the chosen file and reset preview
  const handleClear = () => {
    setFile(null);
    setPreview('');
  };

  // Send the selected file to the parent component as FormData
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!file) return alert('Please select a file');
    const formData = new FormData();
    formData.append('sideQuestMedia', file);
    onUpload(formData);
  };

  return (
    <div className="card">
      <h3>{label}</h3>
      <form onSubmit={handleSubmit}>
        {requiredMediaType === 'photo' ? (
          // Allow users to take a new photo or upload an existing one
          <ImageSelector onSelect={handleFileSelect} />
        ) : (
          // For video quests we just need a regular file input
          <input
            type="file"
            accept="video/*"
            onChange={(e) => handleFileSelect(e.target.files[0])}
          />
        )}
          {preview && requiredMediaType === 'photo' && (
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <img
                src={preview}
                alt="Preview"
                style={{ width: '120px', borderRadius: '4px', marginTop: '0.5rem' }}
              />
              {/* Allow clearing the selected image */}
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
          {preview && requiredMediaType === 'video' && (
            <p>
              Selected video: {preview}
              <button type="button" onClick={handleClear} className="btn-ml">
                Cancel
              </button>
            </p>
          )}
          <button type="submit">Submit</button>
        </form>
      </div>
    );
  }

export default PhotoUploader;
