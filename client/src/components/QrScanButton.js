import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import QrReader from 'react-qr-scanner';

/**
 * Floating button + modal for scanning QR codes.
 * Appears bottom-right on all pages and opens the camera when clicked.
 */
export default function QrScanButton() {
  const [open, setOpen] = useState(false); // show/hide scanner overlay
  const [errorMsg, setErrorMsg] = useState(''); // display permission errors
  const navigate = useNavigate();

  // Default to the rear camera, but allow users to override this
  // preference by storing a value in localStorage.
  const preferredFacing =
    localStorage.getItem('cameraFacingMode') || 'rear';

  // Determine if the browser exposes `getUserMedia` at all. Modern browsers
  // only make this API available on secure origins (HTTPS or `localhost`).
  const cameraAvailable =
    typeof navigator !== 'undefined' &&
    navigator.mediaDevices &&
    typeof navigator.mediaDevices.getUserMedia === 'function';

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
        className="qr-scan-button" // styled to float over the UI
        onClick={async () => {
          if (!cameraAvailable) {
            alert('Camera access is not available. Use HTTPS or localhost.');
            return;
          }
          try {
            // Request permission before opening the scanner so the browser
            // prompts the user to allow camera access on first use.
            const stream = await navigator.mediaDevices.getUserMedia({
              video: true
            });
            // Immediately stop the stream so `react-qr-scanner` can take over
            stream.getTracks().forEach((t) => t.stop());
            setErrorMsg('');
            setOpen(true);
          } catch (err) {
            console.error('Camera permission error:', err);
            setErrorMsg(
              'Unable to access camera. Please grant permission and refresh the page.'
            );
          }
        }}
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
            {cameraAvailable ? (
              <>
                <QrReader
                  delay={300}
                  onError={handleError}
                  onScan={handleScan}
                  // Use the rear camera by default; this value can be
                  // changed via the user profile settings.
                  facingMode={preferredFacing}
                  style={{ width: '100%' }}
                />
                <p style={{ textAlign: 'center' }}>Align QR code within frame</p>
              </>
            ) : (
              <p style={{ textAlign: 'center' }}>
                Camera access is not available. Use HTTPS or localhost.
              </p>
            )}
            {errorMsg && (
              <p style={{ textAlign: 'center', color: 'red' }}>{errorMsg}</p>
            )}
          </div>
        </div>
      )}
    </>
  );
}
