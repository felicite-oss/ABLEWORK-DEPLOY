import { useState, useEffect } from 'react';

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      // Prevent the default browser popup
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e);
      // Update UI notify the user they can install the PWA
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    // Show the install prompt
    deferredPrompt.prompt();
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    } else {
      console.log('User dismissed the install prompt');
    }
    // We've used the prompt, and can't use it again, throw it away
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleClose = () => {
    setShowPrompt(false);
  };

  if (!showPrompt) return null;

  // Custom React UI that respects your dark mode
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] w-[90%] max-w-md bg-[#1a1a1a] text-white p-4 rounded-2xl shadow-2xl border border-gray-700 flex flex-col gap-4">
      <div className="flex items-start gap-4">
        <img src="/logo192.png" alt="AbleWork Logo" className="w-12 h-12 rounded-xl" />
        <div className="flex-1">
          <h3 className="text-lg font-bold">Install AbleWork App</h3>
          <p className="text-sm text-gray-400 mt-1">
            Add to your home screen for quick and easy access to job matches.
          </p>
        </div>
        <button onClick={handleClose} className="text-gray-400 hover:text-white transition-colors">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>
      <div className="flex items-center gap-3 mt-2">
                <button onClick={handleClose} className="flex-1 py-2.5 rounded-xl font-bold !text-gray-300 bg-[#2a2a2a] hover:bg-[#3a3a3a] transition-colors">
          NOT NOW
        </button>
               <button onClick={handleInstallClick} className="flex-1 py-2.5 rounded-xl font-bold !text-black bg-gray-300 hover:bg-gray-400 transition-colors">
          INSTALL APP
        </button>
      </div>
    </div>
  );
}