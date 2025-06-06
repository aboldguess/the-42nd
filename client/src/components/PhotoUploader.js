import React, { useState } from 'react';

function PhotoUploader({ label, requiredMediaType, onUpload }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);

    if (requiredMediaType === 'photo') {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(f);
    } else {
      setPreview(f.name);
    }
  };

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
        <input
          type="file"
          accept={requiredMediaType === 'photo' ? 'image/*' : 'video/*'}
          onChange={handleFileChange}
        />
        {preview && requiredMediaType === 'photo' && (
          <img
            src={preview}
            alt="Preview"
            style={{ width: '120px', borderRadius: '4px', marginTop: '0.5rem' }}
          />
        )}
        {preview && requiredMediaType === 'video' && <p>Selected video: {preview}</p>}
        <button type="submit">Submit</button>
      </form>
    </div>
  );
}

export default PhotoUploader;
