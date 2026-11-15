import React, { useState, useEffect } from 'react';

export default function InstallPWA() {
  const [supportsPWA, setSupportsPWA] = useState(false);
  const [promptInstall, setPromptInstall] = useState(null);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true) {
      setIsInstalled(true);
      return;
    }

    // Check if user dismissed it previously in this session
    if (sessionStorage.getItem('pwa-dismissed')) {
      setIsDismissed(true);
    }

    const handler = (e) => {
      e.preventDefault(); // Prevent the default browser mini-infobar
      setSupportsPWA(true);
      setPromptInstall(e);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const onInstallClick = (evt) => {
    evt.preventDefault();
    if (!promptInstall) return;
    
    promptInstall.prompt();
    promptInstall.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the install prompt');
        setIsInstalled(true);
      } else {
        console.log('User dismissed the install prompt');
      }
      setPromptInstall(null);
    });
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    sessionStorage.setItem('pwa-dismissed', 'true'); // Don't annoy them on every page load
  };

  // Hide if already installed, not supported, or manually dismissed
  if (isInstalled || !supportsPWA || isDismissed) return null;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[999999] w-[95%] max-w-md bg-white border-2 border-[#2C7FFF] shadow-[0_10px_40px_rgba(3,4,94,0.3)] rounded-2xl p-4 flex flex-col gap-3 animate-in slide-in-from-bottom-5 duration-500">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-[#03045E] flex items-center justify-center shrink-0 shadow-sm">
            <img src="/logo192.png" alt="AbleWork App Icon" className="w-8 h-8 object-contain" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-black text-[#03045E] leading-tight">Install AbleWork App</h3>
            <p className="text-[11px] sm:text-xs font-bold text-[#03045E]/70 mt-1">Add to your home screen for quick and easy access to job matches.</p>
          </div>
        </div>
        <button onClick={handleDismiss} aria-label="Close install prompt" className="text-[#03045E]/50 hover:text-[#03045E] transition-colors cursor-pointer p-1">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>
      
      <div className="flex gap-2 w-full mt-1">
        <button 
          onClick={handleDismiss}
          className="flex-1 py-2.5 rounded-xl bg-gray-100 text-[#03045E] font-black text-xs uppercase tracking-wider hover:bg-gray-200 transition-colors cursor-pointer border-2 border-transparent"
        >
          Not Now
        </button>
        <button 
          onClick={onInstallClick}
          className="flex-1 py-2.5 rounded-xl bg-[#2C7FFF] !text-white font-black text-xs uppercase tracking-wider hover:bg-[#03045E] transition-colors shadow-md cursor-pointer border-2 border-[#2C7FFF]"
        >
          Install App
        </button>
      </div>
    </div>
  );
}