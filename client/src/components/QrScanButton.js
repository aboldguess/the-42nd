import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import QrReader from 'react-qr-scanner';

/**
 * Floating button + modal for scanning QR codes.
 * Appears bottom-right on all pages and opens the camera when clicked.
 */
export default function QrScanButton() {
  const [open, setOpen] = useState(false); // show/hide scanner overlay
  const navigate = useNavigate();

  // Called each time the scanner decodes a QR code
  const handleScan = (data) => {
    if (!data) return; // ignore empty scans

    // `react-qr-scanner` may return an object with a `text` field
    const raw = typeof data === 'string' ? data : data.text || '';
    if (!raw) return;
    let path;
    try {
      const url = new URL(raw); // parse full URLs
      path = url.pathname + url.search; // keep query string if present
    } catch (err) {
      // Already a relative path
      path = raw;
    }

    setOpen(false); // close overlay
    // Navigate to the scanned route; prefix with slash if needed
    navigate(path.startsWith('/') ? path : `/${path}`);
  };

  // Log camera errors for debugging
  const handleError = (err) => {
    console.error('QR scan error:', err);
  };

  return (
    <>
      <button
        className="qr-scan-button"
        onClick={() => setOpen(true)}
        aria-label="Scan QR Code"
      >
        &#128247;
      </button>
      {open && (
        <div className="modal-overlay" onClick={() => setOpen(false)}>
          {/* Stop propagation so clicking inside doesn't close */}
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{ position: 'relative' }}
          >
            <button
              onClick={() => setOpen(false)}
              style={{
                position: 'absolute',
                top: 8,
                right: 8,
                background: 'none',
                border: 'none',
                fontSize: '1.5rem',
                cursor: 'pointer'
              }}
              aria-label="Close scanner"
            >
              ×
            </button>
            <QrReader
              delay={300}
              onError={handleError}
              onScan={handleScan}
              style={{ width: '100%' }}
            />
            <p style={{ textAlign: 'center' }}>Align QR code within frame</p>
          </div>
        </div>
      )}
    </>
  );
}
