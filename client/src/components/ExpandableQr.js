import React, { useState } from 'react';

/**
 * Display a small QR code thumbnail that can be clicked to view a larger
 * version in a modal overlay. The modal uses the global `.modal-overlay` and
 * `.modal-content` styles defined in `index.css`.
 */
export default function ExpandableQr({ data, size = 50, max = 400 }) {
  const [open, setOpen] = useState(false); // track modal visibility

  if (!data) return null; // nothing to show if no QR data provided

  return (
    <>
      {/* Small preview image shown inline */}
      <img
        src={data}
        alt="QR"
        style={{ width: size, cursor: 'pointer' }}
        onClick={() => setOpen(true)}
      />

      {/* Full-size modal, appears when `open` is true */}
      {open && (
        <div className="modal-overlay" onClick={() => setOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <img src={data} alt="QR Code" style={{ width: '80vw', maxWidth: max }} />
          </div>
        </div>
      )}
    </>
  );
}
