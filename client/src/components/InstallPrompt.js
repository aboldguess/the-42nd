import React, { useEffect, useState } from 'react';

/**
 * Display a custom install prompt for the Progressive Web App.
 * The component listens for the `beforeinstallprompt` event and shows
 * an install button when the browser allows adding the app to the
 * home screen. iOS browsers do not emit this event so we display simple
 * instructions instead.
 */
export default function InstallPrompt() {
  const [deferred, setDeferred] = useState(null); // event saved for later
  const [showPrompt, setShowPrompt] = useState(false); // toggle banner visibility
  const [showIos, setShowIos] = useState(false); // whether to show iOS text

  useEffect(() => {
    // Handler for modern browsers (Chrome, Edge, etc.)
    const onBeforeInstall = (e) => {
      e.preventDefault();
      setDeferred(e); // stash the event so it can be triggered later
      setShowPrompt(true);
    };
    window.addEventListener('beforeinstallprompt', onBeforeInstall);

    // Detect iOS devices which do not support the event. Newer iPads use a
    // desktop-class user agent string, so we also check for touch support when
    // running on Mac platforms.
    const isIos =
      /iphone|ipad|ipod/i.test(window.navigator.userAgent) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone;
    if (isIos && !isStandalone) {
      setShowIos(true);
      setShowPrompt(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall);
    };
  }, []);

  // Trigger the browser's install prompt
  const install = async () => {
    if (!deferred) return;
    deferred.prompt();
    await deferred.userChoice; // wait for the user to respond
    setDeferred(null);
    setShowPrompt(false);
  };

  if (!showPrompt) return null;

  return (
    <div className="install-banner">
      {showIos ? (
        // iOS users must manually use the browser's Share menu
        <span>Install this app via Share &gt; Add to Home Screen</span>
      ) : (
        <>
          <span>Install this app for quick access</span>
          <button onClick={install} style={{ marginLeft: '0.5rem' }}>
            Install
          </button>
        </>
      )}
    </div>
  );
}
