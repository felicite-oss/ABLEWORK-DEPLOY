import { useState, useEffect, useContext, useRef } from 'react';
import { AccessibilityContext } from '../context/AccessibilityContext';
import ColorPalettePicker from './ColorPalettePicker';

const ONBOARD_KEY = 'accessibility_onboarded';
const FONT_KEY = 'ui_fontsize';

const THEMES = [
  { key: 'Standard', label: 'Standard', tagline: 'Bright & clean' },
  { key: 'Dark', label: 'Dark Mode', tagline: 'Soft on the eyes' },
];

const SIZES = [
  { key: 'normal', label: 'Normal', desc: 'Default size' },
  { key: 'large', label: 'Large', desc: 'Easier to read' },
  { key: 'xlarge', label: 'Max', desc: 'Biggest text' },
];

const PREVIEW_PX = { normal: 14, large: 17, xlarge: 21 };

function SunIcon({ className = 'h-4 w-4 sm:h-5 sm:w-5', forceColor }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke={forceColor || 'currentColor'}
      strokeWidth="2"
      aria-hidden="true"
      style={forceColor ? { stroke: forceColor, color: forceColor } : undefined}
    >
      <circle cx="12" cy="12" r="4" />
      <path strokeLinecap="round" d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  );
}

function MoonIcon({ className = 'h-4 w-4 sm:h-5 sm:w-5', forceColor }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke={forceColor || 'currentColor'}
      strokeWidth="2"
      aria-hidden="true"
      style={forceColor ? { stroke: forceColor, color: forceColor } : undefined}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

export function AccessibilityWelcome() {
  const { mode, setMode } = useContext(AccessibilityContext);
  const panelRef = useRef(null);

  const [visible, setVisible] = useState(() => {
    try {
      return !localStorage.getItem(ONBOARD_KEY);
    } catch {
      return true;
    }
  });
  const [leaving, setLeaving] = useState(false);
  const [step, setStep] = useState(0);
  const [selectedTheme, setSelectedTheme] = useState(() =>
    mode && typeof mode === 'string' && mode.toLowerCase().includes('dark') ? 'Dark' : 'Standard'
  );
  const [fontSize, setFontSize] = useState(() => {
    try {
      return localStorage.getItem(FONT_KEY) || 'normal';
    } catch {
      return 'normal';
    }
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (visible && panelRef.current && !isLoading) {
      const timer = setTimeout(() => {
        panelRef.current.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [visible, isLoading]);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('font-normal', 'font-large', 'font-xlarge');
    root.classList.add(`font-${fontSize}`);
    try {
      localStorage.setItem(FONT_KEY, fontSize);
    } catch {
      void 0;
    }
  }, [fontSize]);

  useEffect(() => {
    if (!visible) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [visible]);

  const chooseTheme = (key) => {
    setSelectedTheme(key);
    setMode(key);
  };

  const finish = () => {
    setMode(selectedTheme);
    setIsLoading(true);
    window.setTimeout(() => {
      setLeaving(true);
      window.setTimeout(() => {
        try {
          localStorage.setItem(ONBOARD_KEY, 'true');
        } catch {
          void 0;
        }
        setVisible(false);
      }, 380);
    }, 3000);
  };

  if (!visible) return null;

  const isDarkScreen = mode === 'Dark';
  const sizeLabel = SIZES.find((s) => s.key === fontSize)?.label || 'Normal';
  const themeLabel = selectedTheme === 'Dark' ? 'Dark Mode' : 'Standard';

  return (
    <div
      className="fixed inset-0 z-[9999999] flex items-center justify-center px-3 py-3 sm:px-6 sm:py-5 md:px-8 md:py-6 backdrop-blur-[1px] overflow-y-auto"
      style={{ backgroundColor: 'rgba(72, 71, 71, 0.6)' }}
      role="dialog"
      aria-modal="true"
      aria-label="Accessibility setup"
    >
      <style>{`
        /* Background fade-in */
        @keyframes awFade { from { opacity: 0; } to { opacity: 1; } }
        
        /* Bouncy pop-up effect */
        @keyframes awPop { 
          0% { opacity: 0; transform: scale(0.85) translateY(40px); } 
          70% { opacity: 1; transform: scale(1.02) translateY(-5px); } 
          100% { opacity: 1; transform: scale(1) translateY(0); } 
        }
        
        @keyframes awOut { to { opacity: 0; transform: scale(0.9) translateY(20px); } }
        @keyframes awSlide { 0% { opacity: 0; transform: translateX(20px); } 100% { opacity: 1; transform: translateX(0); } }
        
        .aw-backdrop { animation: awFade 0.3s ease-out both; }
        .aw-pop { animation: awPop 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) both; }
        .aw-leaving { animation: awOut 0.35s ease-in forwards; }
        .aw-step { animation: awSlide 0.4s cubic-bezier(.22,1,.36,1) both; }
        
        @media (prefers-reduced-motion: reduce) {
          .aw-pop, .aw-leaving, .aw-step, .aw-backdrop { animation: none !important; }
        }
      `}</style>

      {isLoading && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Applying settings"
          aria-labelledby="loading-title"
          aria-describedby="loading-desc"
          aria-live="assertive"
          tabIndex="-1"
          className="fixed inset-0 z-[99999999] flex items-center justify-center p-4 backdrop-blur-[1px] animate-in fade-in transition-all duration-300"
          style={{ backgroundColor: isDarkScreen ? 'rgba(0, 0, 0, 0.75)' : 'rgba(72, 71, 71, 0.6)' }}
        >
          <div className={`relative w-full max-w-md rounded-2xl sm:rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 ${isDarkScreen ? 'bg-black border-2 border-white' : 'bg-white border-2 border-[#2C7FFF]'}`}>
            <div aria-hidden="true" className="h-2 w-full bg-[#2C7FFF]" />

            <div className="relative px-5 pt-8 pb-6 sm:px-8 sm:pt-10 sm:pb-8 flex flex-col items-center text-center">
              <div aria-hidden="true" className="relative mb-4 sm:mb-5">
                <div className={`w-16 h-16 sm:w-24 sm:h-24 rounded-full flex items-center justify-center ${isDarkScreen ? 'bg-transparent border-4 border-white' : 'bg-transparent border-4 border-[#2C7FFF]'}`}>
                  <svg className={`w-8 h-8 sm:w-12 sm:h-12 animate-spin ${isDarkScreen ? 'text-white' : 'text-[#2C7FFF]'}`} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                  </svg>
                </div>
                <div className={`absolute -top-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-[10px] sm:text-xs font-bold ${isDarkScreen ? 'bg-white text-black' : 'bg-[#03045E] text-white'}`}>✓</div>
              </div>

              <span aria-hidden="true" className={`inline-flex items-center gap-1 sm:gap-1.5 px-3 py-1 sm:px-4 sm:py-1.5 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-widest mb-3 sm:mb-4 border-2 ${isDarkScreen ? 'text-white bg-transparent border-white' : 'text-[#2C7FFF] bg-transparent border-[#2C7FFF]'}`}>
                <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-[#10B981]"></span>
                Notice
              </span>

              <h2 id="loading-title" className={`text-xl sm:text-3xl font-black tracking-tight mb-1.5 sm:mb-2 ${isDarkScreen ? 'text-white' : 'text-[#03045E]'}`}>
                Applying Settings...
              </h2>
              <p id="loading-desc" className={`text-xs sm:text-sm font-bold leading-relaxed mb-6 sm:mb-8 max-w-xs ${isDarkScreen ? 'text-white/80' : 'text-[#03045E]/80'}`}>
                Please wait while we personalize your experience.
              </p>

              <div aria-hidden="true" className="flex items-center gap-1 sm:gap-1.5">
                <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#2C7FFF] animate-pulse" />
                <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#2C7FFF] animate-pulse [animation-delay:150ms]" />
                <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#2C7FFF] animate-pulse [animation-delay:300ms]" />
              </div>
            </div>
          </div>
        </div>
      )}

      <div className={`w-full max-w-lg my-auto ${leaving ? 'aw-leaving' : 'aw-pop'} ${isLoading ? 'opacity-0 pointer-events-none' : ''}`}>
        <div
          ref={panelRef}
          tabIndex={-1}
          className="relative flex flex-col h-[85vh] sm:h-[600px] md:h-[650px] max-h-[90dvh] overflow-hidden rounded-xl sm:rounded-2xl border-2 border-[#03045E]/20 bg-white shadow-[0_30px_80px_rgba(3,4,94,0.4)] focus:outline-none"
        >
          <div className="h-1 sm:h-1.5 w-full shrink-0 bg-[#2C7FFF]" />

          <div className="px-3.5 sm:px-6 md:px-8 pt-3.5 sm:pt-5 md:pt-6 pb-2.5 sm:pb-3 md:pb-4 flex items-center justify-between gap-2 shrink-0">
            <div className="flex items-center gap-2 sm:gap-2.5 md:gap-3 min-w-0">
              <span className="flex h-8 w-8 sm:h-10 sm:w-10 md:h-11 md:w-11 shrink-0 items-center justify-center rounded-lg sm:rounded-xl md:rounded-2xl bg-[#2C7FFF] text-white shadow-md">
                <svg
                  className="h-4 w-4 sm:h-5 sm:w-5"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden="true"
                  style={isDarkScreen ? { fill: '#000000', color: '#000000', WebkitTextFillColor: '#000000' } : undefined}
                >
                  <circle cx="12" cy="4" r="2" />
                  <path d="M19 13h-2v-3c0-1.1-.9-2-2-2h-3.5c-.3-.6-.9-1-1.5-1h-2c-1.1 0-2 .9-2 2v5c0 1.1.9 2 2 2h2v4h2v-4h1v4h2v-5.5c0-.8-.7-1.5-1.5-1.5z" />
                </svg>
              </span>
              <div className="min-w-0">
                <p tabIndex="0" className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.18em] sm:tracking-[0.2em] text-[#2C7FFF] transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2C7FFF] focus-visible:ring-offset-2 rounded w-fit">AbleWork</p>
                <h2 tabIndex="0" className="text-xs sm:text-sm md:text-base font-black text-[#03045E] leading-tight truncate transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2C7FFF] focus-visible:ring-offset-2 rounded w-fit">Accessibility Setup</h2>
              </div>
            </div>
            <button
              type="button"
              onClick={finish}
              className="shrink-0 cursor-pointer text-[9px] sm:text-[10px] md:text-[11px] font-black uppercase tracking-[0.1em] sm:tracking-[0.15em] text-[#03045E]/45 hover:text-[#2C7FFF] transition focus:outline-none"
            >
              Skip
            </button>
          </div>

          <div className="px-3.5 sm:px-6 md:px-8 flex items-center gap-1 sm:gap-1.5 shrink-0 pb-2.5 sm:pb-3" aria-hidden="true">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className={`h-1 sm:h-1.5 rounded-full transition-all duration-300 ${
                  i === step ? 'w-6 sm:w-8 bg-[#2C7FFF]' : i < step ? 'w-2.5 sm:w-3 bg-[#2C7FFF]/40' : 'w-2.5 sm:w-3 bg-[#03045E]/15'
                }`}
              />
            ))}
          </div>

                    <div key={step} className="aw-step flex-1 min-h-0 overflow-y-auto px-3.5 sm:px-6 md:px-8 py-3 sm:py-4 md:py-5 flex flex-col [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
            {step === 0 && (
              <div className="flex flex-col gap-3 sm:gap-4">
                <div>
                  <h3 tabIndex="0" className="text-base sm:text-lg md:text-xl font-black text-[#03045E] transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2C7FFF] focus-visible:ring-offset-2 rounded-lg p-1 -m-1 w-fit">Choose a theme</h3>
                  <p tabIndex="0" className="mt-0.5 sm:mt-1 text-[11px] sm:text-xs font-semibold text-[#03045E]/60 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2C7FFF] focus-visible:ring-offset-2 rounded-lg p-1 -m-1 w-fit">Pick the look that's easiest on your eyes.</p>
                </div>
                <div className="grid grid-cols-2 gap-2 sm:gap-2.5 md:gap-3">
                                {THEMES.map((theme) => {
                    const isSelected = selectedTheme === theme.key;
                    const dark = theme.key === 'Dark';
                    const isDarkDefault = dark && !isDarkScreen;
                    const labelColor = isDarkDefault ? 'text-[#03045E]' : 'text-white';
                    
                    return (
                      <button
                        key={theme.key}
                        type="button"
                        onClick={() => chooseTheme(theme.key)}
                        aria-pressed={isSelected}
                        className={`flex flex-col gap-1.5 sm:gap-2 rounded-xl sm:rounded-2xl border-2 p-2 sm:p-2.5 md:p-3 transition-all focus:outline-none ${
                          isSelected
                            ? `border-[#2C7FFF] ${dark ? 'bg-black' : 'bg-[#2C7FFF]/5'} shadow-md`
                            : `border-[#03045E]/15 ${dark ? 'bg-black' : 'bg-white'} hover:border-[#2C7FFF]/50`
                        }`}
                      >
                        <div className={`flex h-11 sm:h-14 md:h-16 items-center justify-center rounded-lg sm:rounded-xl border ${dark ? 'border-white/20 bg-black' : 'border-[#03045E]/10 bg-[#F6F8FF]'}`}>
                          {dark
                            ? <MoonIcon className="h-4 w-4 sm:h-5 sm:w-5" forceColor="#FFFFFF" />
                            : <SunIcon className="h-4 w-4 sm:h-5 sm:w-5" forceColor={isDarkScreen ? '#000000' : undefined} />}
                        </div>
                        <div className="flex items-center justify-between gap-1">
                          <div className="text-left min-w-0">
                            {/* ONLY forces white text for dark mode. Standard mode uses the exact original labelColor */}
                            <p className={`text-[11px] sm:text-xs font-black truncate ${dark ? 'text-white' : labelColor}`}>{theme.label}</p>
                            <p className={`text-[9px] sm:text-[10px] font-bold truncate ${dark ? 'text-white/70' : labelColor}`}>{theme.tagline}</p>
                          </div>
                          {isSelected && (
                            <span
                              className={`flex h-4 w-4 sm:h-5 sm:w-5 shrink-0 items-center justify-center rounded-full text-[8px] sm:text-[10px] font-black ${
                                dark
                                  ? 'bg-white text-black'
                                  : (isDarkScreen
                                      ? 'bg-white text-black'
                                      : isDarkDefault
                                        ? 'bg-[#F6F8FF] text-[#03045E]'
                                        : 'bg-[#2C7FFF] text-white')
                              }`}
                            >
                              ✓
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {selectedTheme !== 'Dark' && (
                  <div className="rounded-xl sm:rounded-2xl border border-[#03045E]/10 bg-[#F6F8FF] p-2.5 sm:p-3">
                    <p tabIndex="0" className="text-[8px] sm:text-[9px] font-black uppercase tracking-[0.15em] sm:tracking-[0.18em] text-[#03045E]/45 mb-1.5 sm:mb-2 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2C7FFF] focus-visible:ring-offset-2 rounded w-fit">Color Palette</p>
                    <ColorPalettePicker />
                  </div>
                )}

                {/* ADDED: Pro Tip Card for Dark Mode */}
                             {/* ADDED: Pro Tip Card for Dark Mode */}
                {selectedTheme === 'Dark' && (
                  <div className="mt-2 rounded-xl sm:rounded-2xl border-2 p-3 sm:p-4 flex gap-3 items-start animate-in fade-in slide-in-from-top-2 duration-300 bg-black border-white/20">
                    <div className="shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center bg-white/10 text-white">
                      <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-black text-white">Pro Tip: Dark Mode</h4>
                      <p className="text-[10px] sm:text-xs font-semibold mt-1 leading-relaxed text-white/70">
                        Dark Mode is excellent for reducing glare and eye strain in low-light environments. If you have astigmatism, feel free to switch back to Standard Mode anytime.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
            {step === 1 && (
              <div className="flex flex-col gap-3 sm:gap-4">
                <div>
                  <h3 tabIndex="0" className="text-base sm:text-lg md:text-xl font-black text-[#03045E] transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2C7FFF] focus-visible:ring-offset-2 rounded-lg p-1 -m-1 w-fit">Text size</h3>
                  <p tabIndex="0" className="mt-0.5 sm:mt-1 text-[11px] sm:text-xs font-semibold text-[#03045E]/60 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2C7FFF] focus-visible:ring-offset-2 rounded-lg p-1 -m-1 w-fit">Pick the size that's most comfortable to read.</p>
                </div>
                <div className="grid grid-cols-3 gap-1.5 sm:gap-2 md:gap-2.5">
                  {SIZES.map((size) => {
                    const isSelected = fontSize === size.key;
                    const scale =
                      size.key === 'normal' ? 'text-sm sm:text-lg md:text-xl' :
                      size.key === 'large' ? 'text-lg sm:text-2xl md:text-3xl' :
                      'text-xl sm:text-3xl md:text-4xl';
                    return (
                      <button
                        key={size.key}
                        type="button"
                        onClick={() => setFontSize(size.key)}
                        aria-pressed={isSelected}
                        className={`flex flex-col items-center justify-center gap-0.5 sm:gap-1 rounded-lg sm:rounded-xl md:rounded-2xl border-2 px-1 sm:px-2 py-2 sm:py-3 md:py-4 transition-all focus:outline-none ${
                          isSelected
                            ? 'border-[#2C7FFF] shadow-md'
                            : 'border-[#03045E]/15 bg-white text-[#03045E] hover:border-[#2C7FFF]/50'
                        }`}
                        style={
                          isSelected
                            ? {
                                backgroundColor: '#f4f4f4',
                                color: '#000000',
                              }
                            : undefined
                        }
                      >
                        <span
                          className={`${scale} font-black leading-none`}
                          style={
                            isSelected
                              ? {
                                  color: '#000000',
                                  WebkitTextFillColor: '#000000',
                                }
                              : undefined
                          }
                        >
                          Aa
                        </span>
                        <span
                          className={`text-[8px] sm:text-[9px] md:text-[10px] font-black uppercase tracking-wider sm:tracking-widest ${
                            isSelected ? '' : 'text-[#03045E]'
                          }`}
                          style={
                            isSelected
                              ? {
                                  color: '#000000',
                                  WebkitTextFillColor: '#000000',
                                }
                              : undefined
                          }
                        >
                          {size.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
                <div className="rounded-xl sm:rounded-2xl border border-[#03045E]/10 bg-[#F6F8FF] p-2.5 sm:p-3 md:p-4">
                  <p
                    tabIndex="0"
                    className={`text-[8px] sm:text-[9px] font-black uppercase tracking-[0.15em] sm:tracking-[0.18em] mb-1.5 sm:mb-2 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2C7FFF] focus-visible:ring-offset-2 rounded w-fit ${isDarkScreen ? 'text-black' : 'text-[#03045E]/45'}`}
                    style={isDarkScreen ? { color: '#000000', WebkitTextFillColor: '#000000' } : undefined}
                  >
                    Preview
                  </p>
                  <p
                    tabIndex="0"
                    className={`font-semibold leading-relaxed transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2C7FFF] focus-visible:ring-offset-2 rounded p-1 -m-1 w-fit ${isDarkScreen ? 'text-black' : 'text-[#03045E]'}`}
                    style={{ fontSize: `${PREVIEW_PX[fontSize]}px`, ...(isDarkScreen ? { color: '#000000', WebkitTextFillColor: '#000000' } : {}) }}
                  >
                    ABLEWORK connects persons with disabilities to inclusive employers who value every ability.
                  </p>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="flex flex-col gap-3 sm:gap-4">
                <div>
                  <h3 tabIndex="0" className="text-base sm:text-lg md:text-xl font-black text-[#03045E] transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2C7FFF] focus-visible:ring-offset-2 rounded-lg p-1 -m-1 w-fit">All set!</h3>
                  <p tabIndex="0" className="mt-0.5 sm:mt-1 text-[11px] sm:text-xs font-semibold text-[#03045E]/60 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2C7FFF] focus-visible:ring-offset-2 rounded-lg p-1 -m-1 w-fit">Here's what we'll remember for you.</p>
                </div>
                <div className="space-y-2 sm:space-y-2.5">
                  <div className="flex items-center gap-2 sm:gap-3 rounded-xl sm:rounded-2xl border border-[#03045E]/10 bg-[#F6F8FF] px-2.5 sm:px-3 md:px-4 py-2 sm:py-2.5 md:py-3">
                    <span 
                      className="flex h-7 w-7 sm:h-8 sm:w-8 md:h-9 md:w-9 shrink-0 items-center justify-center rounded-lg sm:rounded-xl bg-[#2C7FFF]/10 text-[#2C7FFF]" 
                      style={isDarkScreen ? { color: '#000000', WebkitTextFillColor: '#000000' } : undefined}
                    >
                      {selectedTheme === 'Dark' 
                        ? <MoonIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5" forceColor={isDarkScreen ? '#000000' : '#FFFFFF'} /> 
                        : <SunIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5" forceColor={isDarkScreen ? '#000000' : undefined} />}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p 
                        tabIndex="0"
                        className="text-[8px] sm:text-[9px] font-black uppercase tracking-[0.15em] sm:tracking-[0.18em] text-[#03045E]/45 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2C7FFF] focus-visible:ring-offset-2 rounded w-fit"
                        style={isDarkScreen ? { color: '#000000', WebkitTextFillColor: '#000000', opacity: 1 } : undefined}
                      >
                        Display theme
                      </p>
                      <p 
                        tabIndex="0"
                        className="text-xs sm:text-sm font-black text-[#03045E] truncate transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2C7FFF] focus-visible:ring-offset-2 rounded w-fit"
                        style={isDarkScreen ? { color: '#000000', WebkitTextFillColor: '#000000' } : undefined}
                      >
                        {themeLabel}
                      </p>
                    </div>
                    <span className={`flex h-4 w-4 sm:h-5 sm:w-5 shrink-0 items-center justify-center rounded-full text-[8px] sm:text-[10px] font-black ${isDarkScreen ? 'bg-black text-white' : 'bg-[#2C7FFF] text-white'}`}>✓</span>
                  </div>
                  
                  <div className="flex items-center gap-2 sm:gap-3 rounded-xl sm:rounded-2xl border border-[#03045E]/10 bg-[#F6F8FF] px-2.5 sm:px-3 md:px-4 py-2 sm:py-2.5 md:py-3">
                    <span 
                      className="flex h-7 w-7 sm:h-8 sm:w-8 md:h-9 md:w-9 shrink-0 items-center justify-center rounded-lg sm:rounded-xl bg-[#2C7FFF]/10 text-[#2C7FFF] font-black text-[11px] sm:text-sm"
                      style={isDarkScreen ? { color: '#000000', WebkitTextFillColor: '#000000' } : undefined}
                    >
                      Aa
                    </span>
                    <div className="flex-1 min-w-0">
                      <p 
                        tabIndex="0"
                        className="text-[8px] sm:text-[9px] font-black uppercase tracking-[0.15em] sm:tracking-[0.18em] text-[#03045E]/45 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2C7FFF] focus-visible:ring-offset-2 rounded w-fit"
                        style={isDarkScreen ? { color: '#000000', WebkitTextFillColor: '#000000', opacity: 1 } : undefined}
                      >
                        Text size
                      </p>
                      <p 
                        tabIndex="0"
                        className="text-xs sm:text-sm font-black text-[#03045E] truncate transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2C7FFF] focus-visible:ring-offset-2 rounded w-fit"
                        style={isDarkScreen ? { color: '#000000', WebkitTextFillColor: '#000000' } : undefined}
                      >
                        {sizeLabel}
                      </p>
                    </div>
                    <span className={`flex h-4 w-4 sm:h-5 sm:w-5 shrink-0 items-center justify-center rounded-full text-[8px] sm:text-[10px] font-black ${isDarkScreen ? 'bg-black text-white' : 'bg-[#2C7FFF] text-white'}`}>✓</span>
                  </div>
                </div>
                <div className="rounded-xl sm:rounded-2xl border border-dashed border-[#2C7FFF]/30 bg-[#2C7FFF]/5 p-2.5 sm:p-3 md:p-3.5 flex gap-2 sm:gap-2.5">
                  <span 
                    className={`flex h-5 w-5 sm:h-6 sm:w-6 shrink-0 items-center justify-center rounded-full bg-[#2C7FFF] text-[9px] sm:text-[11px] font-black ${isDarkScreen ? 'text-black' : 'text-white'}`}
                    style={isDarkScreen ? { color: '#000000', WebkitTextFillColor: '#000000' } : undefined}
                  >
                    i
                  </span>
                  <p 
                    tabIndex="0"
                    className="text-[10px] sm:text-[11px] font-semibold text-[#03045E]/75 leading-relaxed transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2C7FFF] focus-visible:ring-offset-2 rounded w-fit"
                    style={!isDarkScreen ? { color: '#ffffff', WebkitTextFillColor: '#ffffff' } : undefined}
                  >
                    You can change these anytime using the accessibility button at the bottom-left of the screen.
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="px-3.5 sm:px-6 md:px-8 pb-3.5 sm:pb-5 md:pb-6 pt-2.5 sm:pt-3 flex items-center justify-between gap-2 sm:gap-3 border-t border-[#03045E]/10 shrink-0">
            <button
              type="button"
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              disabled={step === 0}
              className="cursor-pointer rounded-lg sm:rounded-xl px-2 sm:px-3 md:px-4 py-2 sm:py-2.5 text-[10px] sm:text-xs font-black uppercase tracking-wider text-[#03045E]/50 transition hover:text-[#03045E] disabled:opacity-0 disabled:cursor-not-allowed focus:outline-none"
            >
              Back
            </button>
            {step < 2 ? (
              <button
                type="button"
                onClick={() => setStep((s) => Math.min(2, s + 1))}
                className="group flex items-center gap-1.5 sm:gap-2 rounded-lg sm:rounded-xl bg-[#2C7FFF] px-4 sm:px-5 md:px-6 py-2.5 sm:py-2.5 md:py-3 text-xs sm:text-sm font-black text-white shadow-md hover:bg-[#03045E] transition focus:outline-none"
                style={isDarkScreen ? { color: '#000000', WebkitTextFillColor: '#000000' } : undefined}
              >
                Continue
                <svg
                  className="h-3.5 w-3.5 sm:h-4 sm:w-4 transition-transform group-hover:translate-x-1"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                  style={isDarkScreen ? { stroke: '#000000', color: '#000000' } : undefined}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            ) : (
              <button
                type="button"
                onClick={finish}
                className="group flex items-center gap-1.5 sm:gap-2 rounded-lg sm:rounded-xl bg-[#2C7FFF] px-4 sm:px-5 md:px-6 py-2.5 sm:py-2.5 md:py-3 text-xs sm:text-sm font-black text-white shadow-md hover:bg-[#03045E] transition focus:outline-none"
                style={isDarkScreen ? { color: '#000000', WebkitTextFillColor: '#000000' } : undefined}
              >
                Enter AbleWork
                <svg
                  className="h-3.5 w-3.5 sm:h-4 sm:w-4 transition-transform group-hover:translate-x-1"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                  style={isDarkScreen ? { stroke: '#000000', color: '#000000' } : undefined}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AccessibilityWelcome;