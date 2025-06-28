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

  // Helper to normalise any persisted value from older versions of the app.
  const readStoredFacingMode = () => {
    const stored = localStorage.getItem('cameraFacingMode');
    if (stored === 'front' || stored === 'user') return 'user';
    if (stored === 'rear' || stored === 'environment') return 'environment';
    return 'environment'; // default to the outward facing camera
  };

  // Keep track of which camera should be used. We default to the rear camera
  // (labelled "environment" by most browsers) but persist the user's choice so
  // it is reused next time.
  const [facingMode, setFacingMode] = useState(readStoredFacingMode);

  // When multiple cameras are present choose the most likely rear-facing option
  // based on device labels. This helper is used with the `chooseDeviceId` prop
  // of `react-qr-scanner` to override its default camera selection logic.
  const chooseDeviceId = (matching, all) => {
    if (facingMode === 'environment') {
      const rear = all.find((d) => /back|rear|environment/i.test(d.label));
      return (rear || matching[matching.length - 1] || all[0])?.deviceId;
    }
    // For the user-facing camera fall back to the first matching device
    return (matching[0] || all[0])?.deviceId;
  };

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
        className="qr-scan-button"
        onClick={async () => {
          // Reload the user's preferred camera in case it was changed via the
          // profile page while this component remained mounted.
          setFacingMode(readStoredFacingMode());
          if (!cameraAvailable) {
            alert('Camera access is not available. Use HTTPS or localhost.');
            return;
          }
          try {
            // Request permission before opening the scanner so the browser
            // prompts the user to allow camera access on first use.
            const stream = await navigator.mediaDevices.getUserMedia({
              video: { facingMode }
            });
            // Immediately stop the stream so `react-qr-scanner` can take over
            stream.getTracks().forEach((t) => t.stop());
            setErrorMsg('');
            setOpen(true);
          } catch (err) {
            console.error('Camera permission error:', err);
            // If the preferred camera fails (often due to unavailable rear
            // camera on some devices), fall back to the user facing camera.
            if (facingMode === 'environment') {
              try {
                await navigator.mediaDevices.getUserMedia({
                  video: { facingMode: 'user' }
                });
                setFacingMode('user');
                localStorage.setItem('cameraFacingMode', 'user');
                setErrorMsg('');
                setOpen(true);
                return;
              } catch (fallbackErr) {
                console.error('Fallback camera error:', fallbackErr);
              }
            }
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
                fontSize: '3rem',
                cursor: 'pointer',
                zIndex: 1010
              }}
              aria-label="Close scanner"
            >
              ×
            </button>
            {/* Allow the user to swap between front and rear cameras */}
            <button
              onClick={() => {
                const next = facingMode === 'environment' ? 'user' : 'environment';
                setFacingMode(next);
                localStorage.setItem('cameraFacingMode', next);
              }}
              style={{
                position: 'absolute',
                top: 8,
                left: 8,
                background: 'none',
                border: 'none',
                fontSize: '3rem',
                cursor: 'pointer',
                zIndex: 1010
              }}
              aria-label="Switch camera"
            >
              ↻
            </button>
            {cameraAvailable ? (
              <>
                <QrReader
                  key={facingMode} // force re-mount when switching cameras
                  delay={300}
                  onError={handleError}
                  onScan={handleScan}
                  // Pass `rear` or `front` as expected by the library while
                  // maintaining the modern `environment`/`user` values
                  // internally.
                  facingMode={facingMode === 'environment' ? 'rear' : 'front'}
                  chooseDeviceId={chooseDeviceId}
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
