import { useState, useContext, useEffect, useRef } from 'react';
import { Link, NavLink } from 'react-router-dom';
import lightLogo from '../assets/LIGHT MODE.png';
import darkLogo from '../assets/DARK MODE.png';
import backgroundImg from '../assets/BG.png';
import { useColorPalette } from '../context/ColorPaletteContext';
import { AccessibilityContext } from '../context/AccessibilityContext';
import { getPaletteUi } from '../styles/paletteUi';

export default function RegisterSelect() {
  const [isOpen, setIsOpen] = useState(false);
  const { paletteKey } = useColorPalette();
  const { mode } = useContext(AccessibilityContext);
  const ui = getPaletteUi(paletteKey);
  const isAccessibilityMode = paletteKey === 'highContrast' || paletteKey === 'darkComfort';
  const isDarkActive = mode && typeof mode === 'string' && mode.toLowerCase().includes('dark');
  const useLightLogo = (paletteKey === 'highContrast' || paletteKey === 'darkComfort') && !isDarkActive;
  const headerLogo = isAccessibilityMode ? darkLogo : (isDarkActive ? darkLogo : lightLogo);

  useEffect(() => {
    window.scrollTo(0, 0);
    const handleResize = () => {
      window.scrollTo(0, 0);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

    const isAPlusPlus = mode === 'A++' || mode === 'Assist' || mode === 'a++' || mode === 'assist';
  const isAPlus = mode === 'A+' || mode === 'a+';
  
    const navSize = isAPlusPlus ? 'text-xl' : isAPlus ? 'text-lg' : 'text-[0.9375rem]';
  const mobileNavSize = isAPlusPlus ? 'text-base' : isAPlus ? 'text-sm' : 'text-[0.8125rem]';

  const titleSize = 'text-xl sm:text-2xl md:text-3xl lg:text-4xl';
  const subtitleSize = 'text-xs sm:text-base md:text-lg';
  const cardTitleSize = 'text-base sm:text-xl md:text-2xl';
  const cardDescSize = 'text-[11px] sm:text-sm md:text-base';
  const containerPadding = 'pt-5 px-4 pb-3 sm:pt-6 sm:px-6 sm:pb-4 md:pt-8 md:px-8 md:pb-6 lg:pt-10 lg:px-10 lg:pb-8';
  const containerGap = 'gap-3 sm:gap-5';
const containerMaxWidth = 'max-w-[94%] sm:max-w-md md:max-w-xl lg:max-w-2xl';
  const containerMinHeight = 'min-h-[auto] sm:min-h-[400px] md:min-h-[460px]';

  return (
    <main role="main" aria-label="RegisterSelect Screen" className="flex flex-col bg-[#f4f4f4] min-h-screen overflow-x-hidden [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">

      <header role="banner" className="w-full bg-[#f4f4f4] border-b border-[#03045E]/10 fixed top-0 left-0 z-50">
      <div className="w-full h-14 sm:h-16 pl-3 pr-3 sm:pl-4 sm:pr-4 md:pr-8 flex items-center justify-between box-border">
         <div className="flex items-center gap-8 w-full box-border">
            <div className="flex items-center flex-shrink-0 py-1">
              <img
                src={headerLogo}
                alt="AbleWork logo"
                role="img"
                aria-label="AbleWork logo"
                title="AbleWork Logo"
                tabIndex="0"
                className="h-9 sm:h-12 md:h-14 w-auto object-contain max-h-full"
              />
            </div>
     <nav aria-label="Main navigation" className={`hidden md:flex items-center gap-6 ${navSize} font-medium ${isAccessibilityMode ? '!text-white' : 'text-[#03045E]'}`}>
              <NavLink to="/" title="Home" className={({ isActive }) => `transition-colors duration-200 hover:scale-105 transform ${isAccessibilityMode ? '!text-white' : ''} ${isActive ? (isAccessibilityMode ? '!text-white font-semibold border-b-2 border-white pb-0.5' : 'text-[#2C7FFF] font-semibold border-b-2 border-[#2C7FFF] pb-0.5') : ''}`}>Home</NavLink>
              <NavLink to="/about" title="About Us" className={({ isActive }) => `transition-colors duration-200 hover:scale-105 transform ${isAccessibilityMode ? '!text-white' : ''} ${isActive ? (isAccessibilityMode ? '!text-white font-semibold border-b-2 border-white pb-0.5' : 'text-[#2C7FFF] font-semibold border-b-2 border-[#2C7FFF] pb-0.5') : ''}`}>About Us</NavLink>
              <NavLink to="/policy" title="Policy" className={({ isActive }) => `transition-colors duration-200 hover:scale-105 transform ${isAccessibilityMode ? '!text-white' : ''} ${isActive ? (isAccessibilityMode ? '!text-white font-semibold border-b-2 border-white pb-0.5' : 'text-[#2C7FFF] font-semibold border-b-2 border-[#2C7FFF] pb-0.5') : ''}`}>Policy</NavLink>
            </nav>
          </div>
          <div className="hidden md:flex items-center">
            <NavLink to="/login" aria-label="Log In" title="Log In" className={({ isActive }) => `px-5 py-2 rounded-full ${isDarkActive ? 'bg-black text-white border-2 border-white' : isAccessibilityMode ? 'bg-transparent !text-white border-2 border-white' : 'bg-transparent text-[#03045E] border-2 border-[#03045E]'} text-sm font-bold hover:bg-[#2C7FFF] hover:text-[#f4f4f4] hover:border-[#2C7FFF] hover:brightness-125 transform duration-200 transition whitespace-nowrap ${isActive ? 'bg-[#2C7FFF] text-white border-[#2C7FFF] underline font-semibold' : ''}`}>Log In</NavLink>
          </div>
          <button aria-label="Menu" title="Menu" aria-expanded={isOpen} aria-controls="mobile-menu" className={`md:hidden flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-lg border-2 shadow-sm cursor-pointer transition-all duration-200 shrink-0 ${isAccessibilityMode ? 'bg-zinc-900 text-white border-white/30' : 'bg-white text-[#03045E] border-[#03045E]/20'}`} onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? (
              <svg aria-hidden="true" className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
            ) : (
              <svg aria-hidden="true" className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16M4 18h16" /></svg>
            )}
          </button>
        </div>
        <div id="mobile-menu" className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96 opacity-100 border-b border-[#03045E]/10 shadow-lg' : 'max-h-0 opacity-0'}`}>
          <div className="w-full bg-[#f4f4f4]">
            <nav aria-label="Mobile navigation" className={`flex flex-col px-2.5 pt-2.5 pb-2.5 gap-2 sm:px-3 sm:pt-3 sm:pb-3 sm:gap-2.5 ${isAccessibilityMode ? 'text-white' : 'text-[#03045E]'} max-w-[1700px] mx-auto`}>
              <NavLink to="/" onClick={() => setIsOpen(false)} aria-label="Home" title="Home" className={({ isActive }) => `relative flex items-center gap-2.5 text-left pl-3 pr-2.5 py-2.5 rounded-xl font-extrabold transition-all duration-300 cursor-pointer border-2 group overflow-hidden ${isActive ? 'bg-white text-[#03045E] border-[#03045E] shadow-md' : 'bg-white text-[#03045E] border-[#03045E]/25'}`}>
                {({ isActive }) => (
                  <>
                    {isActive && <span aria-hidden="true" className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#03045E]"></span>}
                    <div aria-hidden="true" className="p-1.5 rounded-lg transition-all duration-300 shrink-0 flex items-center justify-center border-2 bg-[#03045E] text-white border-[#03045E]">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                      </svg>
                    </div>
                    <div aria-hidden="true" className="flex-1 min-w-0">
                   <span aria-hidden="true" className={`${mobileNavSize} tracking-wide font-black block leading-tight text-[#03045E] break-words`}>Home</span>
                    </div>
                    <svg aria-hidden="true" className="w-3 h-3 shrink-0 transition-transform duration-300 text-[#03045E]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </>
                )}
              </NavLink>

              <NavLink to="/about" onClick={() => setIsOpen(false)} aria-label="About Us" title="About Us" className={({ isActive }) => `relative flex items-center gap-2.5 text-left pl-3 pr-2.5 py-2.5 rounded-xl font-extrabold transition-all duration-300 cursor-pointer border-2 group overflow-hidden ${isActive ? 'bg-white text-[#03045E] border-[#03045E] shadow-md' : 'bg-white text-[#03045E] border-[#03045E]/25'}`}>
                {({ isActive }) => (
                  <>
                    {isActive && <span aria-hidden="true" className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#03045E]"></span>}
                    <div aria-hidden="true" className="p-1.5 rounded-lg transition-all duration-300 shrink-0 flex items-center justify-center border-2 bg-[#03045E] text-white border-[#03045E]">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div aria-hidden="true" className="flex-1 min-w-0">
                    <span aria-hidden="true" className={`${mobileNavSize} tracking-wide font-black block leading-tight text-[#03045E] break-words`}>About Us</span>
                    </div>
                    <svg aria-hidden="true" className="w-3 h-3 shrink-0 transition-transform duration-300 text-[#03045E]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </>
                )}
              </NavLink>

              <NavLink to="/policy" onClick={() => setIsOpen(false)} aria-label="Policy" title="Policy" className={({ isActive }) => `relative flex items-center gap-2.5 text-left pl-3 pr-2.5 py-2.5 rounded-xl font-extrabold transition-all duration-300 cursor-pointer border-2 group overflow-hidden ${isActive ? 'bg-white text-[#03045E] border-[#03045E] shadow-md' : 'bg-white text-[#03045E] border-[#03045E]/25'}`}>
                {({ isActive }) => (
                  <>
                    {isActive && <span aria-hidden="true" className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#03045E]"></span>}
                    <div aria-hidden="true" className="p-1.5 rounded-lg transition-all duration-300 shrink-0 flex items-center justify-center border-2 bg-[#03045E] text-white border-[#03045E]">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                                       <div aria-hidden="true" className="flex-1 min-w-0">
                      <span className={`${mobileNavSize} tracking-wide font-black block leading-tight text-[#03045E] break-words`}>Policy</span>
                    </div>
                    <svg aria-hidden="true" className="w-3 h-3 shrink-0 transition-transform duration-300 text-[#03045E]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </>
                )}
              </NavLink>

              <div aria-hidden="true" className={`h-px my-0.5 ${isAccessibilityMode ? 'bg-[#2C7FFF]/30' : 'bg-[#03045E]/15'}`}></div>

              <NavLink to="/login" onClick={() => setIsOpen(false)} aria-label="Log In" title="Log In" className={({ isActive }) => `relative flex items-center gap-2.5 text-left pl-3 pr-2.5 py-2.5 rounded-xl font-extrabold transition-all duration-300 cursor-pointer border-2 group overflow-hidden ${isActive ? 'bg-white text-[#03045E] border-[#03045E] shadow-md' : 'bg-white text-[#03045E] border-[#03045E]/25'}`}>
                {({ isActive }) => (
                  <>
                    {isActive && <span aria-hidden="true" className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#03045E]"></span>}
                    <div aria-hidden="true" className="p-1.5 rounded-lg transition-all duration-300 shrink-0 flex items-center justify-center border-2 bg-[#03045E] text-white border-[#03045E]">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                      </svg>
                    </div>
                    <div aria-hidden="true" className="flex-1 min-w-0">
                      <span className={`${mobileNavSize} tracking-wide font-black block leading-tight text-[#03045E] break-words`}>Log In</span>
                    </div>
                    <svg aria-hidden="true" className="w-3 h-3 shrink-0 transition-transform duration-300 text-[#03045E]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </>
                )}
              </NavLink>
            </nav>
          </div>
        </div>
      </header>

  <div
  className={`flex-grow pt-20 pb-12 flex flex-col items-center md:items-end justify-center p-3 sm:p-6 md:p-10 w-full box-border relative bg-no-repeat bg-center bg-[size:600px_auto] md:bg-[size:1100px_auto] md:bg-left min-h-[110vh] md:min-h-[105vh] transition-all duration-300`}
  style={{
    backgroundImage: `url(${backgroundImg})`,
  }}
>
       <div className={`w-full ${containerMaxWidth} ${containerPadding} ${containerMinHeight} flex flex-col items-center justify-start ${containerGap} relative z-10 ${isDarkActive ? 'bg-black text-white border-2 border-white' : `${ui.mainCardBg}`} backdrop-blur-md rounded-2xl sm:rounded-3xl shadow-xl md:mt-15 md:mr-2 lg:mr-6`}>
          <div className="text-center w-full max-w-lg mb-2 sm:mb-4">
            <span aria-hidden="true" title="Welcome to AbleWork" tabIndex="0" className={`inline-block py-1 px-2.5 sm:px-3 rounded-full ${isDarkActive ? 'bg-white text-black' : `${ui.badgeBg}`} font-bold text-[10px] sm:text-xs uppercase tracking-widest mb-1.5`}>Welcome to AbleWork</span>
            <h1 aria-label="Choose Your Path" title="Choose Your Path" tabIndex="0" className={`${titleSize} font-black tracking-tight ${isDarkActive ? 'text-white' : `${ui.mainCardText}`} mb-1.5`}>Choose Your Path</h1>
            <p aria-label="Select how you would like to experience our inclusive employment platform tailored for your needs." title="Select how you would like to experience our inclusive employment platform tailored for your needs." tabIndex="0" className={`${subtitleSize} ${isDarkActive ? 'text-white/85' : `${ui.mainCardSub}`} font-medium leading-relaxed`}>Select how you would like to experience our inclusive employment platform tailored for your needs.</p>
          </div>
          <div className={`grid grid-cols-1 md:grid-cols-2 ${containerGap} w-full`}>
            <Link to="/register/applicant" title="I am a Job Seeker" className={`p-4 sm:p-4.5 md:p-5 rounded-xl sm:rounded-2xl shadow-md border-2 hover:shadow-xl hover:-translate-y-1 flex flex-col items-center text-center transition-all duration-300 cursor-pointer group ${isDarkActive ? 'bg-black text-white border-white' : `${ui.cardBg}`}`}>
              <div aria-hidden="true" className={`w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl ${isDarkActive ? 'bg-black border-white' : 'bg-[#2C7FFF] border-[#2C7FFF]'} border flex items-center justify-center mb-2.5 ${isDarkActive ? 'text-white' : `${ui.iconColor}`} group-hover:bg-[#03045E] group-hover:text-white group-hover:border-[#03045E] transition-all duration-300 shadow-inner`}>
                <svg className={`w-5 h-5 sm:w-7 sm:h-7 ${isDarkActive ? 'text-white group-hover:text-white' : `${ui.iconColor}`} transition-colors duration-300`} fill="none" stroke={isDarkActive ? "#ffffff" : (isAccessibilityMode ? "#ffffff" : "currentColor")} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>
              </div>
              <h2 className={`${cardTitleSize} font-black ${isDarkActive ? 'text-white' : `${ui.cardTitle}`} mb-1.5 transition-colors`}>I am a Job Seeker</h2>
              <p className={`${cardDescSize} ${isDarkActive ? 'text-white/80' : `${ui.cardDesc}`} font-medium leading-relaxed max-w-xs`}>Looking for accessible positions, tailored accommodations, and supportive career growth opportunities.</p>
              <span className={`mt-2.5 inline-flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-sm font-bold ${isDarkActive ? 'text-[#2C7FFF]' : `${ui.getStarted}`} group-hover:underline`}>Get Started <svg aria-hidden="true" className="w-3 h-3 sm:w-3.5 sm:h-3.5 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7"/></svg></span>
            </Link>
            <Link to="/register/employer" title="I am an Employer" className={`p-4 sm:p-4.5 md:p-5 rounded-xl sm:rounded-2xl shadow-md border-2 hover:shadow-xl hover:-translate-y-1 flex flex-col items-center text-center transition-all duration-300 cursor-pointer group ${isDarkActive ? 'bg-black text-white border-white' : `${ui.cardBg}`}`}>
              <div aria-hidden="true" className={`w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl ${isDarkActive ? 'bg-black border-white' : 'bg-[#2C7FFF] border-[#2C7FFF]'} border flex items-center justify-center mb-2.5 ${isDarkActive ? 'text-white' : `${ui.iconColor}`} group-hover:bg-[#03045E] group-hover:text-white group-hover:border-[#03045E] transition-all duration-300 shadow-inner`}>
                <svg className={`w-5 h-5 sm:w-7 sm:h-7 ${isDarkActive ? 'text-white group-hover:text-white' : `${ui.iconColor}`} transition-colors duration-300`} fill="none" stroke={isDarkActive ? "#ffffff" : (isAccessibilityMode ? "#ffffff" : "currentColor")} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125 1.125 1.125 1.125V21" /></svg>
              </div>
              <h2 className={`${cardTitleSize} font-black ${isDarkActive ? 'text-white' : `${ui.cardTitle}`} mb-1.5 transition-colors`}>I am an Employer</h2>
              <p className={`${cardDescSize} ${isDarkActive ? 'text-white/80' : `${ui.cardDesc}`} font-medium leading-relaxed max-w-xs`}>Looking to post accessible job listings, cultivate an inclusive workplace, and connect with verified diverse talent.</p>
              <span className={`mt-2.5 inline-flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-sm font-bold ${isDarkActive ? 'text-[#2C7FFF]' : `${ui.getStarted}`} group-hover:underline`}>Get Started <svg aria-hidden="true" className="w-3 h-3 sm:w-3.5 sm:h-3.5 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7"/></svg></span>
            </Link>
          </div>
        </div>
      </div>

      <footer role="contentinfo" className="w-full relative z-20 overflow-hidden mt-auto bg-[#03045E] text-white border-t-2 border-[#2C7FFF]" style={{ filter: 'none', WebkitFilter: 'none', forcedColorAdjust: 'none' }}>
        <div aria-hidden="true" className="h-1 w-full bg-[#2C7FFF]" />
       <div className="w-full h-auto px-4 md:px-10 py-6 sm:py-12 box-border">
          <div className="grid grid-cols-2 md:grid-cols-12 gap-4 sm:gap-8 items-start justify-between">
            <div className="col-span-2 md:col-span-5 flex flex-col items-center md:items-start text-center md:text-left space-y-2 sm:space-y-4">
              <div className="flex items-center gap-3">
                <img
                  src={useLightLogo ? lightLogo : darkLogo}
                  alt="AbleWork logo"
                  role="img"
                  aria-label="AbleWork logo"
                  title="AbleWork Logo"
                  tabIndex="0"
                  className="h-7 sm:h-10 w-auto object-contain"
                />
              </div>
              <p title="Empowering individuals and fostering an inclusive workforce with accessible smart-matching and equal opportunities for everyone." tabIndex="0" className="text-[10px] sm:text-base font-medium max-w-md leading-relaxed text-white/85">Empowering individuals and fostering an inclusive workforce with accessible smart-matching and equal opportunities for everyone.</p>
              <div title={`© ${new Date().getFullYear()} AbleWork. All rights reserved.`} tabIndex="0" className="pt-1 text-[9px] sm:text-sm font-semibold tracking-wide text-white/70">© {new Date().getFullYear()} AbleWork. All rights reserved.</div>
            </div>
            <div className="col-span-2 md:col-span-7 grid grid-cols-3 gap-4 sm:gap-8">
              <div className="text-left">
                <h4 title="Platform" tabIndex="0" className="font-bold mb-2 sm:mb-4 text-white text-xs sm:text-base">Platform</h4>
                <ul className="space-y-1 sm:space-y-3 text-[10px] sm:text-sm font-semibold text-white/80">
                  <li><Link to="/" aria-label="Home" title="Home" className="transition-all hover:translate-x-1 inline-flex items-center gap-1 hover:text-[#7FB0FF]">Home</Link></li>
                  <li><Link to="/about" aria-label="About AbleWork" title="About AbleWork" className="transition-all hover:translate-x-1 inline-flex items-center gap-1 hover:text-[#7FB0FF]">About ABLEWORK</Link></li>
                  <li><Link to="/policy" aria-label="Platform Policy" title="Platform Policy" className="transition-all hover:translate-x-1 inline-flex items-center gap-1 hover:text-[#7FB0FF]">Platform Policy</Link></li>
                </ul>
              </div>
              <div className="text-left">
                <h4 title="Support" tabIndex="0" className="font-bold mb-2 sm:mb-4 text-white text-xs sm:text-base">Support</h4>
                <ul className="space-y-1 sm:space-y-3 text-[10px] sm:text-sm font-semibold text-white/80">
                  <li><Link to="/contact" aria-label="Contact Support" title="Contact Support" className="transition-all hover:translate-x-1 inline-flex items-center gap-1 hover:text-[#7FB0FF]">Contact Support</Link></li>
                  <li><Link to="/contact" aria-label="User Feedback" title="User Feedback" className="transition-all hover:translate-x-1 inline-flex items-center gap-1 hover:text-[#7FB0FF]">User Feedback</Link></li>
                </ul>
              </div>
              <div className="text-left">
                <h4 title="Connect" tabIndex="0" className="font-bold mb-2 sm:mb-4 text-white text-xs sm:text-base">Connect</h4>
                <ul className="space-y-1 sm:space-y-3 text-[10px] sm:text-sm font-semibold text-white/80">
                  <li title="ableworksys5i@gmail.com" tabIndex="0" className="flex items-start gap-2"><svg aria-hidden="true" className="w-3.5 h-3.5 sm:w-5 sm:h-5 shrink-0 mt-0.5 text-[#7FB0FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg><span>ableworksys5i@gmail.com</span></li>
                 <li title="Burgos Street, Barangay Villamonte, Bacolod City, 6100 Negros Occidental, Philippines" tabIndex="0" className="flex items-start gap-2"><svg aria-hidden="true" className="w-3.5 h-3.5 sm:w-5 sm:h-5 shrink-0 mt-0.5 text-[#7FB0FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg><span className="text-left">Burgos Street, Barangay Villamonte, Bacolod City, 6100 Negros Occidental, Philippines</span></li>
                  <li title="+63 900 000 0000" tabIndex="0" className="flex items-start gap-2"><svg aria-hidden="true" className="w-3.5 h-3.5 sm:w-5 sm:h-5 shrink-0 mt-0.5 text-[#7FB0FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg><span>+63 900 000 0000</span></li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        <div className="w-full py-2.5 sm:py-4 px-4 text-center text-[9px] sm:text-sm font-medium tracking-wide bg-[#03045E] text-white/70 border-t border-white/10">
<div title="Designed with accessibility and inclusivity at heart." tabIndex="0" className="w-full flex items-center justify-center gap-4">
            <p>Designed with accessibility and inclusivity at heart.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}