import React, { useRef } from 'react';

/**
 * Presents buttons to capture a photo using the device camera or
 * upload an existing image from disk. The selected file is returned
 * via the onSelect callback.
 */
export default function ImageSelector({ onSelect }) {
  // refs to hidden input elements so we can trigger them programmatically
  const captureRef = useRef(null); // input for taking a new photo
  const uploadRef = useRef(null);  // input for choosing an existing image

  const handleChange = (e) => {
    const file = e.target.files[0];
    if (file && onSelect) {
      onSelect(file);
    }
    // clear the value so the same file can be selected again if needed
    e.target.value = '';
  };

  return (
    <div style={{ margin: '0.5rem 0' }}>
      {/* Hidden file input that opens the camera */}
      <input
        type="file"
        accept="image/*"
        capture="environment"
        ref={captureRef}
        style={{ display: 'none' }}
        onChange={handleChange}
      />
      {/* Hidden file input for selecting from disk */}
      <input
        type="file"
        accept="image/*"
        ref={uploadRef}
        style={{ display: 'none' }}
        onChange={handleChange}
      />
      <button type="button" onClick={() => captureRef.current.click()}>Take Photo</button>
      {/* Left margin keeps the upload button separated */}
      <button
        type="button"
        onClick={() => uploadRef.current.click()}
        className="btn-ml"
      >
        Upload Photo
      </button>
    </div>
  );
}
