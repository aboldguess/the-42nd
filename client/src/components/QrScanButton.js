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

  // Keep track of which camera should be used. We default to the rear camera
  // (often labelled "environment" by browsers) but persist the user's choice
  // in localStorage so it is reused next time.
  const [facingMode, setFacingMode] = useState(
    localStorage.getItem('cameraFacingMode') || 'rear'
  );

  // Determine if the browser exposes `getUserMedia` at all. Modern browsers
  // only make this API available on secure origins (HTTPS or `localhost`).
  const cameraAvailable =
    typeof navigator !== 'undefined' &&
    navigator.mediaDevices &&
    typeof navigator.mediaDevices.getUserMedia === 'function';

  // Map our simple facingMode state to browser media constraints. The WebRTC
  // API expects either `user` (front/selfie camera) or `environment` (rear
  // camera). We use the more intuitive `front`/`rear` strings in state and
  // localStorage and convert them here when requesting the camera.
  const videoConstraints = {
    facingMode:
      facingMode === 'rear'
        ? { ideal: 'environment' }
        : { ideal: 'user' }
  };

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
        onClick={async () => {
          if (!cameraAvailable) {
            alert('Camera access is not available. Use HTTPS or localhost.');
            return;
          }
          try {
            // Request permission before opening the scanner so the browser
            // prompts the user to allow camera access on first use.
            const stream = await navigator.mediaDevices.getUserMedia({
              audio: false,
              video: videoConstraints
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
            {/* Allow the user to swap between front and rear cameras */}
            <button
              onClick={() => {
                const next = facingMode === 'rear' ? 'front' : 'rear';
                setFacingMode(next);
                localStorage.setItem('cameraFacingMode', next);
              }}
              style={{
                position: 'absolute',
                top: 8,
                left: 8,
                background: 'none',
                border: 'none',
                fontSize: '1.5rem',
                cursor: 'pointer'
              }}
              aria-label="Switch camera"
            >
              ↻
            </button>
            {cameraAvailable ? (
              <>
                <QrReader
                  delay={300}
                  onError={handleError}
                  onScan={handleScan}
                  // Pass explicit constraints so the library opens the correct
                  // camera. The `facingMode` state is converted earlier into
                  // a standard WebRTC constraint object.
                  constraints={{ audio: false, video: videoConstraints }}
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
