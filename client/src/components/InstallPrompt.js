import React, { useEffect, useState } from 'react';

/**
 * Display a custom install prompt for the Progressive Web App.
 * The component listens for the `beforeinstallprompt` event and shows
 * an install button when the browser allows adding the app to the
 * home screen. iOS browsers do not emit this event so we display simple
 * instructions instead.
 */
export default function InstallPrompt() {
  // Save the install event so it can be triggered later
  const [deferred, setDeferred] = useState(null);
  // Controls whether the banner is visible at all
  const [showPrompt, setShowPrompt] = useState(false);
  // `true` when we should show the iOS instructions instead of a button
  const [showIos, setShowIos] = useState(false);

  useEffect(() => {
    // Determine if we're on a mobile device
    const ua = window.navigator.userAgent;
    const isIos = /iphone|ipad|ipod/i.test(ua);
    const isAndroid = /android/i.test(ua);
    const isMobile = isIos || isAndroid;

    // Track if the app is already installed in standalone mode
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone;
    let fallback;

    // Handler for modern browsers (mostly Android Chrome)
    const onBeforeInstall = (e) => {
      // Only intercept on mobile so desktops keep the default behaviour
      if (!isMobile) return;
      e.preventDefault();
      clearTimeout(fallback); // do not trigger the fallback instructions
      setDeferred(e); // stash the event so it can be triggered later
      setShowPrompt(true);
    };
    window.addEventListener('beforeinstallprompt', onBeforeInstall);

    if (isMobile && !isStandalone) {
      // If the event never fires (e.g. iOS Safari), show instructions
      fallback = setTimeout(() => {
        setShowIos(isIos);
        setShowPrompt(true);
      }, 3000);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall);
      if (fallback) clearTimeout(fallback);
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
      {showIos || !deferred ? (
        // When no install event is available we show plain instructions
        <span>Install this app via your browser's menu</span>
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
