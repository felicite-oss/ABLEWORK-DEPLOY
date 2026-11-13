import { useState, useEffect, useContext, useRef } from 'react';
import { AccessibilityContext } from '../context/AccessibilityContext';
import ColorPalettePicker from './ColorPalettePicker';

export function AccessibilityToolbar() {
  const { mode, setMode } = useContext(AccessibilityContext);
  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef(null);
  const [fontSize, setFontSize] = useState(() => {
    try {
      const stored = localStorage.getItem('ui_fontsize');
      return ['normal', 'large', 'xlarge'].includes(stored) ? stored : 'normal';
    } catch {
      return 'normal';
    }
  });

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('dark-mode', 'standard');
    
    if (mode === 'Dark') {
      root.classList.add('dark-mode');
    } else {
      root.classList.add('standard');
    }
  }, [mode]);

  useEffect(() => {
    if (isOpen && panelRef.current) {
      const timer = setTimeout(() => {
        panelRef.current.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('ui_fontsize');
      if (stored && ['normal', 'large', 'xlarge'].includes(stored)) {
        setFontSize(stored);
      }
    } catch {
      void 0;
    }

    const observer = new MutationObserver(() => {
      const root = document.documentElement;
      if (root.classList.contains('font-xlarge')) {
        setFontSize('xlarge');
      } else if (root.classList.contains('font-large')) {
        setFontSize('large');
      } else if (root.classList.contains('font-normal')) {
        setFontSize('normal');
      }
    });

    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  const handleFontSizeChange = (size) => {
    setFontSize(size);
    const root = document.documentElement;
    root.classList.remove('font-normal', 'font-large', 'font-xlarge');
    root.classList.add(`font-${size}`);
    try {
      localStorage.setItem('ui_fontsize', size);
    } catch {
      void 0;
    }
  };

  const handleThemeChange = (newMode) => {
    setMode(newMode);
  };

  const isDarkMode = mode === 'Dark';

  return (
    <div className="fixed bottom-6 left-4 sm:left-6 z-[999999] flex flex-col items-start">
      
      {isOpen && (
        <div 
          ref={panelRef}
          // ...
          tabIndex={-1}
          className="mb-3 w-[calc(100vw-2rem)] max-w-80 sm:w-80 relative rounded-xl sm:rounded-2xl border-2 border-[var(--color-border)] overflow-hidden shadow-[0_25px_60px_rgba(0,0,0,0.35)] backdrop-blur-xl animate-in fade-in slide-in-from-bottom-3 duration-300 max-h-[62vh] flex flex-col bg-[var(--color-surface)] focus:outline-none"
          role="region"
          aria-label="Accessibility Control Panel. Adjust display theme, color palette, and text size settings."
        >
          <div className="absolute -top-16 -right-16 w-40 h-40 rounded-full bg-[var(--color-accent)] opacity-20 blur-2xl pointer-events-none" aria-hidden="true"></div>
          <div className="absolute -bottom-16 -left-16 w-40 h-40 rounded-full bg-[var(--color-primary)] opacity-20 blur-2xl pointer-events-none" aria-hidden="true"></div>

          <div className="relative px-3 pt-2 pb-2 sm:px-5 sm:pt-3 sm:pb-3 border-b-2 border-[var(--color-border)] shrink-0">
            <div className="flex items-center justify-between gap-2 sm:gap-3">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-[var(--color-accent)] text-[var(--color-background)] flex items-center justify-center border-2 border-[var(--color-border)] shadow-md" aria-hidden="true">
                  <svg className="w-3.5 h-3.5 sm:w-5 sm:h-5" viewBox="0 0 24 24" fill="currentColor">
                    <circle cx="12" cy="4" r="2" />
                    <path d="M19 13h-2v-3c0-1.1-.9-2-2-2h-3.5c-.3-.6-.9-1-1.5-1h-2c-1.1 0-2 .9-2 2v5c0 1.1.9 2 2 2h2v4h2v-4h1v4h2v-5.5c0-.8-.7-1.5-1.5-1.5z" />
                  </svg>
                </div>
                <div>
                  {/* Changed text-[11px] to text-[0.6875rem] */}
                  <h3 tabIndex="0" className="font-black text-[0.6875rem] sm:text-sm tracking-tight uppercase text-[var(--color-text)] leading-none transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2 rounded w-fit">Accessibility</h3>
                  {/* Changed text-[8px] to text-[0.5rem] and text-[10px] to text-[0.625rem] */}
                  <p tabIndex="0" className="text-[0.5rem] sm:text-[0.625rem] font-black uppercase tracking-[0.15em] text-[var(--color-accent)] mt-0.5 sm:mt-1 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2 rounded w-fit">Control Center</p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="w-6 h-6 sm:w-8 sm:h-8 rounded-md sm:rounded-lg border-2 border-[var(--color-border)] text-[var(--color-textMuted)] hover:text-[var(--color-text)] hover:border-[var(--color-accent)] font-black text-sm sm:text-lg flex items-center justify-center cursor-pointer transition-all focus:outline-none"
                aria-label="Close accessibility control center"
              >
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
          </div>

          <div className="relative px-3 py-2.5 sm:px-5 sm:py-4 flex flex-col gap-3 sm:gap-4 overflow-y-auto flex-1 min-h-0">
            <div className="flex flex-col gap-1.5 sm:gap-2.5" role="group" aria-label="Display Theme Settings">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-[var(--color-accent)]" aria-hidden="true"></span>
                {/* Changed text-[8px] to text-[0.5rem] and text-[10px] to text-[0.625rem] */}
                <span tabIndex="0" className="text-[0.5rem] sm:text-[0.625rem] font-black uppercase tracking-[0.15em] text-[var(--color-textMuted)] transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2 rounded w-fit">Display Theme</span>
              </div>
              <div className="grid grid-cols-2 gap-1.5 sm:gap-2.5">
                <button
                  onClick={() => handleThemeChange('Standard')}
                  aria-pressed={mode === 'Standard'}
                  className={`group relative py-2 px-1.5 sm:py-3 sm:px-3 rounded-lg sm:rounded-xl border-2 transition-all cursor-pointer shadow-sm flex flex-col items-center gap-1 sm:gap-1.5 focus:outline-none ${
                    mode === 'Standard' 
                      ? 'bg-[var(--color-primary)] text-[var(--color-background)] border-[var(--color-primary)] shadow-md scale-[1.02]' 
                      : 'bg-[var(--color-surface)] text-[var(--color-text)] border-[var(--color-border)] hover:border-[var(--color-accent)]'
                  }`}
                  aria-label="Standard Mode Theme"
                >
                  <div className={`w-5 h-5 sm:w-7 sm:h-7 rounded-md sm:rounded-lg flex items-center justify-center border-2 ${
                    mode === 'Standard' ? 'bg-[var(--color-background)] text-[var(--color-primary)] border-[var(--color-background)]' : 'bg-[var(--color-surface)] text-[var(--color-text)] border-[var(--color-border)]'
                  }`} aria-hidden="true">
                    <svg className="w-3 h-3 sm:w-4 sm:h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <circle cx="12" cy="12" r="4" />
                      <path strokeLinecap="round" d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
                    </svg>
                  </div>
                  {/* Changed text-[9px] to text-[0.5625rem] and text-[11px] to text-[0.6875rem] */}
                  <span className="text-[0.5625rem] sm:text-[0.6875rem] font-black tracking-wide" aria-hidden="true">Standard</span>
                </button>
                <button
                  onClick={() => handleThemeChange('Dark')}
                  aria-pressed={mode === 'Dark'}
                  className={`group relative py-2 px-1.5 sm:py-3 sm:px-3 rounded-lg sm:rounded-xl border-2 transition-all cursor-pointer shadow-sm flex flex-col items-center gap-1 sm:gap-1.5 focus:outline-none ${
                    mode === 'Dark' 
                      ? 'bg-[var(--color-primary)] text-[var(--color-background)] border-[var(--color-primary)] shadow-md scale-[1.02]' 
                      : 'bg-[var(--color-surface)] text-[var(--color-text)] border-[var(--color-border)] hover:border-[var(--color-accent)]'
                  }`}
                  aria-label="Toggle Dark Mode Theme"
                >
                  <div className={`w-5 h-5 sm:w-7 sm:h-7 rounded-md sm:rounded-lg flex items-center justify-center border-2 ${
                    mode === 'Dark' ? 'bg-[var(--color-background)] text-[var(--color-primary)] border-[var(--color-background)]' : 'bg-[var(--color-surface)] text-[var(--color-text)] border-[var(--color-border)]'
                  }`} aria-hidden="true">
                    <svg className="w-3 h-3 sm:w-4 sm:h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                    </svg>
                  </div>
                  {/* Changed text-[9px] to text-[0.5625rem] and text-[11px] to text-[0.6875rem] */}
                  <span className="text-[0.5625rem] sm:text-[0.6875rem] font-black tracking-wide" aria-hidden="true">Dark Mode</span>
                </button>
              </div>
            </div>

            {!isDarkMode && (
              <div className="flex flex-col gap-1.5 sm:gap-2.5 border-t-2 border-[var(--color-border)] pt-3 sm:pt-4" role="group" aria-label="Color Palette Settings">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-[var(--color-accent)]" aria-hidden="true"></span>
                  {/* Changed text-[8px] to text-[0.5rem] and text-[10px] to text-[0.625rem] */}
                  <span tabIndex="0" className="text-[0.5rem] sm:text-[0.625rem] font-black uppercase tracking-[0.15em] text-[var(--color-textMuted)] transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2 rounded w-fit">Color Palette</span>
                </div>
                <ColorPalettePicker />
              </div>
            )}

            <div className="flex flex-col gap-1.5 sm:gap-2.5 border-t-2 border-[var(--color-border)] pt-3 sm:pt-4" role="group" aria-label="Text Size Settings">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-[var(--color-accent)]" aria-hidden="true"></span>
                {/* Changed text-[8px] to text-[0.5rem] and text-[10px] to text-[0.625rem] */}
                <span tabIndex="0" className="text-[0.5rem] sm:text-[0.625rem] font-black uppercase tracking-[0.15em] text-[var(--color-textMuted)] transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2 rounded w-fit">Text Size</span>
              </div>
              <div className="grid grid-cols-3 gap-1.5 sm:gap-2.5">
                <button
                  onClick={() => handleFontSizeChange('normal')}
                  aria-pressed={fontSize === 'normal'}
                  className={`py-2 sm:py-3 rounded-lg sm:rounded-xl border-2 transition-all cursor-pointer shadow-sm flex flex-col items-center justify-center gap-0.5 sm:gap-1 focus:outline-none ${
                    fontSize === 'normal' 
                      ? 'bg-[var(--color-accent)] text-[var(--color-background)] border-[var(--color-accent)] shadow-md scale-[1.02]' 
                      : 'bg-[var(--color-surface)] text-[var(--color-text)] border-[var(--color-border)] hover:border-[var(--color-accent)]'
                  }`}
                  aria-label="Set Normal Font Size"
                >
                  {/* Changed text-[10px] to text-[0.625rem] */}
                  <span className="text-[0.625rem] sm:text-sm font-black leading-none" aria-hidden="true">A</span>
                  {/* Changed text-[7px] to text-[0.4375rem] and text-[9px] to text-[0.5625rem] */}
                  <span className="text-[0.4375rem] sm:text-[0.5625rem] font-black uppercase tracking-wider opacity-80" aria-hidden="true">Normal</span>
                </button>
                <button
                  onClick={() => handleFontSizeChange('large')}
                  aria-pressed={fontSize === 'large'}
                  className={`py-2 sm:py-3 rounded-lg sm:rounded-xl border-2 transition-all cursor-pointer shadow-sm flex flex-col items-center justify-center gap-0.5 sm:gap-1 focus:outline-none ${
                    fontSize === 'large' 
                      ? 'bg-[var(--color-accent)] text-[var(--color-background)] border-[var(--color-accent)] shadow-md scale-[1.02]' 
                      : 'bg-[var(--color-surface)] text-[var(--color-text)] border-[var(--color-border)] hover:border-[var(--color-accent)]'
                  }`}
                  aria-label="Set Large Font Size"
                >
                  <span className="text-xs sm:text-base font-black leading-none" aria-hidden="true">A+</span>
                  {/* Changed text-[7px] to text-[0.4375rem] and text-[9px] to text-[0.5625rem] */}
                  <span className="text-[0.4375rem] sm:text-[0.5625rem] font-black uppercase tracking-wider opacity-80" aria-hidden="true">Large</span>
                </button>
                <button
                  onClick={() => handleFontSizeChange('xlarge')}
                  aria-pressed={fontSize === 'xlarge'}
                  className={`py-2 sm:py-3 rounded-lg sm:rounded-xl border-2 transition-all cursor-pointer shadow-sm flex flex-col items-center justify-center gap-0.5 sm:gap-1 whitespace-nowrap focus:outline-none ${
                    fontSize === 'xlarge' 
                      ? 'bg-[var(--color-accent)] text-[var(--color-background)] border-[var(--color-accent)] shadow-md scale-[1.02]' 
                      : 'bg-[var(--color-surface)] text-[var(--color-text)] border-[var(--color-border)] hover:border-[var(--color-accent)]'
                  }`}
                  aria-label="Set Extra Large Font Size"
                >
                  <span className="text-xs sm:text-base font-black leading-none" aria-hidden="true">A++</span>
                  {/* Changed text-[7px] to text-[0.4375rem] and text-[9px] to text-[0.5625rem] */}
                  <span className="text-[0.4375rem] sm:text-[0.5625rem] font-black uppercase tracking-wider opacity-80" aria-hidden="true">Max</span>
                </button>
              </div>
            </div>
          </div>

          <div className="relative px-3 py-2 sm:px-5 sm:py-3 border-t-2 border-[var(--color-border)] flex items-center justify-between shrink-0">
            {/* Changed text-[8px] to text-[0.5rem] and text-[10px] to text-[0.625rem] */}
            <span tabIndex="0" className="text-[0.5rem] sm:text-[0.625rem] font-black uppercase tracking-[0.15em] text-[var(--color-textMuted)] transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2 rounded w-fit">Settings Auto-Save</span>
            <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[var(--color-accent)] animate-pulse" aria-hidden="true"></span>
          </div>
        </div>
      )}

      <div className="relative group flex flex-row items-center">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="group relative bg-[var(--color-accent)] hover:bg-[var(--color-primary)] text-[var(--color-background)] p-3 sm:p-4 rounded-2xl sm:rounded-3xl shadow-[0_8px_16px_rgba(44,127,255,0.4)] flex items-center justify-center transition-all hover:scale-110 border-[3px] border-[var(--color-border)] cursor-pointer focus:outline-none"
          aria-label="Open Accessibility Menu and Control Center"
          aria-haspopup="dialog"
          aria-expanded={isOpen}
        >
          <span className="absolute inset-0 rounded-2xl sm:rounded-3xl bg-[var(--color-accent)] opacity-40 animate-ping" aria-hidden="true"></span>
          <svg xmlns="http://www.w3.org/2000/svg" className="relative h-5 w-5 sm:h-7 sm:w-7" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <circle cx="12" cy="4" r="2" />
            <path d="M19 13h-2v-3c0-1.1-.9-2-2-2h-3.5c-.3-.6-.9-1-1.5-1h-2c-1.1 0-2 .9-2 2v5c0 1.1.9 2 2 2h2v4h2v-4h1v4h2v-5.5c0-.8-.7-1.5-1.5-1.5z" />
          </svg>
        </button>
        {/* Changed text-[10px] to text-[0.625rem] */}
        <span className="absolute bottom-full left-0 mb-2 px-3 py-1.5 rounded-lg bg-[var(--color-text)] text-[var(--color-background)] text-[0.625rem] sm:text-xs font-black uppercase tracking-wider whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible group-focus-within:opacity-100 group-focus-within:visible transition-all duration-200 pointer-events-none shadow-lg z-50">
          Accessibility
        </span>
      </div>

    </div>
  );
}

export default AccessibilityToolbar;