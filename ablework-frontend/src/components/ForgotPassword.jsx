import React, { useState, useContext, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { AccessibilityContext } from '../context/AccessibilityContext';
import { useColorPalette } from '../context/ColorPaletteContext';
import lightLogo from '../assets/LIGHT MODE.png';
import darkLogo from '../assets/DARK MODE.png';
import backgroundImg from '../assets/BG.png';

export default function ForgotPassword({ onClose }) {
  const { mode } = useContext(AccessibilityContext);
  const { paletteKey } = useColorPalette();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const isContrast = mode && typeof mode === 'string' && mode.toLowerCase().includes('contrast');
  const isDarkMode = mode && typeof mode === 'string' && (mode.toLowerCase().includes('dark') || mode.toLowerCase().includes('comfort'));
  const isAccessibilityMode = paletteKey === 'highContrast' || paletteKey === 'darkComfort';
  const isDefaultPalette = paletteKey === 'default';
  const isDarkActive = mode && typeof mode === 'string' && mode.toLowerCase().includes('dark');
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [isLoading, setIsLoading] = useState(false);
   const [showSuccessModal, setShowSuccessModal] = useState(false);

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
  const isAssist = isAPlusPlus;

  const titleSize = isAPlusPlus
    ? 'text-3xl sm:text-5xl font-bold'
    : isAPlus
      ? 'text-2xl sm:text-4xl font-bold'
      : 'text-xl sm:text-3xl font-bold';

  const subtitleSize = isAPlusPlus
    ? 'text-base sm:text-xl font-semibold'
    : isAPlus
      ? 'text-sm sm:text-lg font-semibold'
      : 'text-xs sm:text-base font-semibold';

  const labelSize = isAPlusPlus
    ? 'text-lg sm:text-xl font-bold'
    : isAPlus
      ? 'text-base sm:text-lg font-bold'
      : 'text-xs sm:text-sm font-bold';

  const inputSize = isAPlusPlus
    ? 'p-5 sm:p-6 text-xl sm:text-2xl font-medium'
    : isAPlus
      ? 'p-4 sm:p-5 text-lg sm:text-xl font-medium'
      : 'p-3 sm:p-3.5 text-sm sm:text-base font-semibold';

  const buttonSize = isAPlusPlus
    ? 'py-5 sm:py-6 px-6 sm:px-8 text-xl sm:text-2xl font-black'
    : isAPlus
      ? 'py-4 px-5 sm:px-6 text-lg sm:text-xl font-black'
      : 'py-3.5 px-5 sm:px-6 text-sm sm:text-base font-black';

  const requestOtp = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ type: '', text: '' });

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail) {
      setMessage({ type: 'error', text: "Please enter your email address." });
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch('http://localhost:5001/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail })
      });

      let data = {};
      try {
        data = await res.json();
      } catch (parseErr) {
        data = { message: `Server responded with status ${res.status}. Please try again.` };
      }

      if (res.ok) {
        setEmail(cleanEmail);
        setMessage({ type: 'success', text: data.message || "Recovery code sent to your email." });
        setStep(2);
      } else {
        setMessage({ type: 'error', text: data.message || data.error || `Request failed (${res.status}). Please check your email and try again.` });
      }
    } catch (err) {
      console.error("Forgot password request failed:", err);
      setMessage({ type: 'error', text: "Cannot connect to server. Please make sure the backend is running." });
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: "Passwords do not match." });
      return;
    }
    setIsLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const res = await fetch('http://localhost:5001/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase(), otpCode: otpCode.trim(), newPassword })
      });

      let data = {};
      try {
        data = await res.json();
      } catch (parseErr) {
        data = { message: `Server responded with status ${res.status}. Please try again.` };
      }

      if (res.ok) {
        setShowSuccessModal(true);
        setTimeout(() => {
          setShowSuccessModal(false);
          if (onClose) onClose();
          else navigate('/login');
        }, 3000);
      } else {
        setMessage({ type: 'error', text: data.message || data.error || `Reset failed (${res.status}). Please try again.` });
      }
    } catch (err) {
      console.error("Reset password request failed:", err);
      setMessage({ type: 'error', text: "Cannot connect to server. Please make sure the backend is running." });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    if (onClose) onClose();
    else navigate('/login');
  };

  return (
    <main
      className={`min-h-screen flex flex-col ${isContrast ? 'bg-black text-white' : 'bg-[#f4f4f4] text-[#03045E]'} overflow-y-auto overflow-x-hidden [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]`}
    >
      {isDarkMode && (
        <style>{`
          #fpOtp::placeholder,
          #fpNewPass::placeholder,
          #fpConfirmPass::placeholder {
            color: #ffffff !important;
            opacity: 1 !important;
            -webkit-text-fill-color: #ffffff !important;
          }
        `}</style>
      )}

      {isAccessibilityMode && isDarkMode && (
        <style>{`
          .fp-accessibility-dark-override {
            background-color: #000000 !important;
            color: #ffffff !important;
            border-color: #000000 !important;
            border-radius: 9999px !important;
          }
          .fp-accessibility-dark-override:hover {
            background-color: #2C7FFF !important;
            border-color: #2C7FFF !important;
          }
          :root.palette-highContrast .fp-accessibility-dark-login-text,
          :root.palette-darkComfort .fp-accessibility-dark-login-text,
          :root.palette-highContrast .fp-accessibility-dark-login-text *,
          :root.palette-darkComfort .fp-accessibility-dark-login-text * {
            color: #000000 !important;
            -webkit-text-fill-color: #000000 !important;
          }
          :root.palette-highContrast .fp-accessibility-dark-login-container,
          :root.palette-darkComfort .fp-accessibility-dark-login-container {
            background-color: #f4f4f4 !important;
            border-color: #03045E !important;
          }
          :root.palette-highContrast .fp-accessibility-dark-register-text,
          :root.palette-darkComfort .fp-accessibility-dark-register-text,
          :root.palette-highContrast .fp-accessibility-dark-register-text *,
          :root.palette-darkComfort .fp-accessibility-dark-register-text * {
            color: #000000 !important;
            -webkit-text-fill-color: #000000 !important;
          }
        `}</style>
      )}

      {isDefaultPalette && isDarkMode && (
        <style>{`
          :root.palette-default .fp-default-dark-register-text,
          :root.palette-default .fp-default-dark-register-text * {
            color: #000000 !important;
            -webkit-text-fill-color: #000000 !important;
          }
          :root.palette-default .fp-default-dark-send-btn {
            background-color: #000000 !important;
            color: #ffffff !important;
            border-color: #000000 !important;
          }
          :root.palette-default .fp-default-dark-send-btn:hover {
            background-color: #2C7FFF !important;
            border-color: #2C7FFF !important;
          }
        `}</style>
      )}

      <header
        className={`w-full ${isContrast ? 'bg-black border-b-2 border-[#2C7FFF]' : 'bg-white border-b-2 border-[#03045E]/15'} fixed top-0 left-0 z-50 transition-all duration-300 shadow-sm`}
      >
      <div className="w-full h-14 sm:h-16 pl-3 pr-3 sm:pl-4 sm:pr-4 md:pr-8 flex items-center justify-between box-border">
          <div className="flex items-center gap-3 sm:gap-8">
            <div className="flex items-center flex-shrink-0 py-1">
              <img
                src={isContrast ? darkLogo : lightLogo}
                alt="AbleWork Logo"
                title="AbleWork Logo"
                tabIndex="0"
                className="h-9 sm:h-12 md:h-14 w-auto object-contain max-h-full"
              />
            </div>
            <nav className={`hidden md:flex items-center gap-6 text-[15px] font-medium ${isAccessibilityMode ? '!text-white' : (isContrast ? 'text-white' : 'text-[#03045E]')}`}>
              <Link to="/" title="Home" className={`${isAccessibilityMode ? '!text-white hover:!text-white' : isContrast ? 'text-white hover:text-blue-400' : 'text-[#03045E] hover:text-[#03045E]'} transition pb-0.5`}>Home</Link>
              <Link to="/about" title="About Us" className={`${isAccessibilityMode ? '!text-white hover:!text-white' : isContrast ? 'hover:text-blue-400' : 'text-[#03045E] hover:text-[#03045E]'} transition`}>About Us</Link>
              <Link to="/policy" title="Policy" className={`${isAccessibilityMode ? '!text-white hover:!text-white' : isContrast ? 'hover:text-blue-400' : 'text-[#03045E] hover:text-[#03045E]'} transition`}>Policy</Link>
            </nav>
          </div>

          <div className="hidden md:flex items-center">
            <NavLink to="/login" aria-label="Log In" title="Log In" className={({ isActive }) => `px-5 py-2 rounded-full ${isDarkActive ? 'bg-black text-white border-2 border-white' : isAccessibilityMode ? 'bg-transparent !text-white border-2 border-white' : 'bg-transparent text-[#03045E] border-2 border-[#03045E]'} text-sm font-bold hover:bg-[#2C7FFF] hover:text-[#f4f4f4] hover:border-[#2C7FFF] hover:brightness-125 transform duration-200 transition whitespace-nowrap ${isActive ? 'bg-[#2C7FFF] text-white border-[#2C7FFF] underline font-semibold' : ''}`}>Log In</NavLink>
          </div>

          <button
            title="Menu"
            className={`md:hidden flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-lg border-2 shadow-sm cursor-pointer transition-all duration-200 shrink-0 ${
              isContrast ? 'bg-zinc-900 text-white border-white/30' : 'bg-white text-[#03045E] border-[#03045E]/20'
            }`}
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? (
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        <div
          className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out border-b-2 ${
            isContrast ? 'bg-black border-[#2C7FFF]' : 'bg-white border-[#03045E]/20'
          } ${
            isOpen ? 'max-h-96 opacity-100 shadow-xl' : 'max-h-0 opacity-0'
          }`}
        >
          <div className={`w-full ${isContrast ? 'bg-black' : 'bg-white'}`}>
         <nav
  className={`flex flex-col px-2.5 pt-2.5 pb-2.5 gap-2 sm:px-3 sm:pt-3 sm:pb-3 sm:gap-2.5 ${isContrast ? 'text-white' : 'text-[#03045E]'}`}
>
              <Link
                to="/"
                title="Home"
                onClick={() => setIsOpen(false)}
                className="relative flex items-center gap-2.5 sm:gap-3 text-left px-3 py-2.5 sm:px-3.5 sm:py-3 rounded-lg text-xs sm:text-[13px] font-black transition-all capitalize cursor-pointer border-2 overflow-hidden bg-white text-[#03045E] border-[#03045E]/25 shadow-sm"
              >
                <div className="shrink-0 flex items-center justify-center border-none w-6 h-6 sm:w-7 sm:h-7 rounded-full overflow-hidden bg-[#03045E]/10 text-[#03045E]">
                  <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                </div>
                <span className="leading-tight">Home</span>
              </Link>

              <Link
                to="/about"
                title="About Us"
                onClick={() => setIsOpen(false)}
                className="relative flex items-center gap-2.5 sm:gap-3 text-left px-3 py-2.5 sm:px-3.5 sm:py-3 rounded-lg text-xs sm:text-[13px] font-black transition-all capitalize cursor-pointer border-2 overflow-hidden bg-white text-[#03045E] border-[#03045E]/25 shadow-sm"
              >
                <div className="shrink-0 flex items-center justify-center border-none w-6 h-6 sm:w-7 sm:h-7 rounded-full overflow-hidden bg-[#03045E]/10 text-[#03045E]">
                  <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="leading-tight">About Us</span>
              </Link>

              <Link
                to="/policy"
                title="Policy"
                onClick={() => setIsOpen(false)}
                className="relative flex items-center gap-2.5 sm:gap-3 text-left px-3 py-2.5 sm:px-3.5 sm:py-3 rounded-lg text-xs sm:text-[13px] font-black transition-all capitalize cursor-pointer border-2 overflow-hidden bg-white text-[#03045E] border-[#03045E]/25 shadow-sm"
              >
                <div className="shrink-0 flex items-center justify-center border-none w-6 h-6 sm:w-7 sm:h-7 rounded-full overflow-hidden bg-[#03045E]/10 text-[#03045E]">
                  <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <span className="leading-tight">Policy</span>
              </Link>

              <div className={`h-px my-0.5 ${isContrast ? 'bg-[#2C7FFF]/30' : 'bg-[#03045E]/15'}`}></div>

              <button
                type="button"
                title="Login"
                onClick={() => { setIsOpen(false); handleBack(); }}
                className="relative flex items-center gap-2.5 sm:gap-3 text-left px-3 py-2.5 sm:px-3.5 sm:py-3 rounded-lg text-xs sm:text-[13px] font-black transition-all capitalize cursor-pointer border-2 overflow-hidden bg-white text-[#03045E] border-[#03045E]/25 shadow-sm"
              >
                <div className="shrink-0 flex items-center justify-center border-none w-6 h-6 sm:w-7 sm:h-7 rounded-full overflow-hidden bg-[#03045E]/10 text-[#03045E]">
                  <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                </div>
                <span className="leading-tight">Login</span>
              </button>
            </nav>
          </div>
        </div>
      </header>
<div
  className="flex-grow pt-20 pb-12 flex flex-col items-center md:items-end justify-center p-3 sm:p-6 md:p-10 w-full box-border relative bg-no-repeat bg-center bg-[size:600px_auto] md:bg-[size:1100px_auto] md:bg-left min-h-[110vh] md:min-h-[105vh] transition-all duration-300"
  style={{ backgroundImage: `url(${backgroundImg})` }}
>
<div
  className={`w-full ${isAssist ? 'max-w-[480px] sm:max-w-xl' : 'max-w-[400px] sm:max-w-lg'} flex flex-col items-center justify-start gap-4 sm:gap-6 relative z-10
    ${isContrast ? 'bg-black text-white border-2 border-blue-400 shadow-[0_0_25px_rgba(0,204,21,0.4)]' : isDarkMode ? 'bg-zinc-900 text-white border-2 border-blue-500/50 shadow-2xl' : 'bg-white/90 text-[#03045E] border border-[#03045E]/15'} backdrop-blur-md rounded-xl sm:rounded-2xl shadow-2xl
    pt-8 px-5 pb-8 sm:pt-12 sm:px-10 sm:pb-14 mr-0 md:mr-4 lg:mr-8`}
>
          <div className="w-full flex items-center justify-start">
            <div className="flex items-center gap-2">
              <span className={`w-7 h-7 sm:w-9 sm:h-9 rounded-full flex items-center justify-center ${isContrast ? 'bg-blue-400 text-black' : isDarkMode ? 'bg-blue-500/20 text-blue-400' : 'bg-[#2C7FFF]/10 text-[#2C7FFF]'}`}>
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </span>
              <span tabIndex="0" title="Account Recovery" className={`text-[9px] sm:text-xs font-black uppercase tracking-widest ${(isContrast || isDarkMode) ? 'text-blue-400' : 'text-[#2C7FFF]'}`}>
                Account Recovery
              </span>
            </div>
          </div>

          <div className="text-center w-full">
            <h1 tabIndex="0" title={step === 1 ? 'Reset Password' : 'Create New Password'} className={`${titleSize} ${(isContrast || isDarkMode) ? 'text-white' : 'text-[#03045E]'} tracking-tight mb-2`}>
              {step === 1 ? 'Reset Password' : 'Create New Password'}
            </h1>
            <p tabIndex="0" title={step === 1 ? 'Enter your email to receive a recovery code.' : 'Enter your recovery code and set a new password.'} className={`${subtitleSize} ${(isContrast || isDarkMode) ? 'text-white/80' : 'text-[#03045E]/70'}`}>
              {step === 1
                ? 'Enter your email to receive a recovery code.'
                : 'Enter your recovery code and set a new password.'}
            </p>
          </div>

          <div className="w-full flex items-center justify-center gap-2">
            <span className={`h-1 sm:h-1.5 rounded-full transition-all ${step >= 1 ? (isContrast ? 'bg-blue-400 w-8 sm:w-10' : 'bg-[#2C7FFF] w-8 sm:w-10') : (isContrast || isDarkMode) ? 'bg-zinc-700 w-5 sm:w-6' : 'bg-gray-300 w-5 sm:w-6'}`} />
            <span className={`h-1 sm:h-1.5 rounded-full transition-all ${step >= 2 ? (isContrast ? 'bg-blue-400 w-8 sm:w-10' : 'bg-[#2C7FFF] w-8 sm:w-10') : (isContrast || isDarkMode) ? 'bg-zinc-700 w-5 sm:w-6' : 'bg-gray-300 w-5 sm:w-6'}`} />
          </div>

          {message.text && (
            <div
              tabIndex="0"
              title={message.text}
              className={`w-full p-3 sm:p-3.5 rounded-lg font-bold text-xs sm:text-sm text-center border-2 shadow-sm bg-white ${
                message.type === 'success'
                  ? 'text-green-600 border-green-500'
                  : 'text-red-600 border-red-500'
              }`}
            >
              {message.text}
            </div>
          )}

          {step === 1 ? (
            <form onSubmit={requestOtp} className="flex flex-col gap-4 sm:gap-5 w-full" autoComplete="off">
              <div className="flex flex-col gap-1.5 sm:gap-2">
                <label htmlFor="fpEmail" title="Email Address" tabIndex="0" className={`${labelSize} ${(isContrast || isDarkMode) ? 'text-white' : 'text-[#03045E]'}`}>
                  Email Address
                </label>
                <div className="relative">
                  <span className={`absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 ${(isContrast || isDarkMode) ? 'text-white' : 'text-[#03045E]/40'}`}>
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </span>
                  <input
                    id="fpEmail"
                    name="fpEmail"
                    type="email"
                    title="Email Address"
                    aria-label="Enter your registered email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="off"
                    placeholder="Enter your registered email"
                    className={`w-full ${inputSize} pl-10 sm:pl-12 ${(isContrast || isDarkMode) ? 'border-2 border-blue-400 bg-zinc-800 text-white placeholder:text-gray-400 focus:border-blue-300' : 'border-2 border-[#03045E]/20 bg-white text-[#03045E] placeholder:text-gray-400 focus:border-[#2C7FFF]'} rounded-lg sm:rounded-xl focus:outline-none shadow-sm transition`}
                  />
                </div>
              </div>
<button
  type="submit"
  disabled={isLoading}
  title={isLoading ? 'Sending Code...' : 'Send Recovery Code'}
  style={
    isAccessibilityMode && isDarkMode
      ? { backgroundColor: '#262626', color: '#ffffff', borderColor: '#404040', borderRadius: '9999px' }
      : isAccessibilityMode && !isDarkMode
        ? { backgroundColor: '#2C7FFF', borderColor: '#60A5FA', color: '#ffffff' }
        : undefined
  }
  className={`w-full ${buttonSize} ${
    isAccessibilityMode && isDarkMode
      ? 'border shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed mt-2'
      : isAccessibilityMode
        ? 'border rounded-full shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed mt-2'
        : (isContrast || isDarkMode)
          ? 'bg-blue-400 hover:bg-blue-300 border border-blue-400 text-black rounded-xl sm:rounded-2xl shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed mt-2'
          : isDefaultPalette && isDarkMode
            ? 'fp-default-dark-send-btn border rounded-xl sm:rounded-2xl shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed mt-2'
            : 'bg-[#03045E] hover:bg-[#2C7FFF] text-white rounded-xl sm:rounded-2xl shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed mt-2'
  }`}
>
  {isLoading ? 'Sending Code...' : 'Send Recovery Code'}
</button>
            </form>
          ) : (
            <form onSubmit={resetPassword} className="flex flex-col gap-4 sm:gap-5 w-full" autoComplete="off">
              <input type="text" name="fakeusernameremembered" autoComplete="username" style={{ display: 'none' }} tabIndex={-1} />
              <input type="password" name="fakepasswordremembered" autoComplete="new-password" style={{ display: 'none' }} tabIndex={-1} />

              <div className="flex flex-col gap-1.5 sm:gap-2">
                <label htmlFor="fpOtp" title="6-Digit Recovery Code" tabIndex="0" className={`${labelSize} ${(isContrast || isDarkMode) ? 'text-white' : 'text-[#03045E]'}`}>
                  6-Digit Recovery Code
                </label>
                <input
                  id="fpOtp"
                  name="fpOtp"
                  type="text"
                  title="6-Digit Recovery Code"
                  inputMode="numeric"
                  maxLength="6"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                  required
                  autoComplete="off"
                  placeholder="000000"
                  className={`w-full ${inputSize} text-center tracking-[0.4em] sm:tracking-[0.6em] ${(isContrast || isDarkMode) ? 'border-2 border-blue-400 bg-zinc-800 text-white placeholder:text-gray-400 focus:border-blue-300' : 'border-2 border-[#03045E]/20 bg-white text-[#03045E] placeholder:text-gray-400 focus:border-[#2C7FFF]'} rounded-lg sm:rounded-xl focus:outline-none shadow-sm transition font-black`}
                />
              </div>

              <div className="flex flex-col gap-1.5 sm:gap-2">
                <label htmlFor="fpNewPass" title="New Password" tabIndex="0" className={`${labelSize} ${(isContrast || isDarkMode) ? 'text-white' : 'text-[#03045E]'}`}>
                  New Password
                </label>
                <div className="relative">
                  <span className={`absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 ${(isContrast || isDarkMode) ? 'text-white' : 'text-[#03045E]/40'}`}>
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </span>
                  <input
                    id="fpNewPass"
                    name="fpNewPass"
                    type={showPassword ? "text" : "password"}
                    title="New Password"
                    aria-label="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    autoComplete="new-password"
                    placeholder="Enter new password"
                    className={`w-full ${inputSize} pl-10 sm:pl-12 pr-10 sm:pr-12 ${(isContrast || isDarkMode) ? 'border-2 border-blue-400 bg-zinc-800 text-white placeholder:text-gray-400 focus:border-blue-300' : 'border-2 border-[#03045E]/20 bg-white text-[#03045E] placeholder:text-gray-400 focus:border-[#2C7FFF]'} rounded-lg sm:rounded-xl focus:outline-none shadow-sm transition`}
                  />
                  <button
                    type="button"
                    title="Show password"
                    onClick={() => setShowPassword(!showPassword)}
                    className={`absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 transition cursor-pointer ${isAccessibilityMode ? 'text-white hover:text-white' : (isContrast || isDarkMode) ? 'text-white/60 hover:text-white' : 'text-[#03045E]/50 hover:text-[#2C7FFF]'}`}
                  >
                    {showPassword ? (
                      <svg className={`w-4 h-4 sm:w-5 sm:h-5 ${isAccessibilityMode ? '!text-white !stroke-white' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                      </svg>
                    ) : (
                      <svg className={`w-4 h-4 sm:w-5 sm:h-5 ${isAccessibilityMode ? '!text-white !stroke-white' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"></path>
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-1.5 sm:gap-2">
                <label htmlFor="fpConfirmPass" title="Confirm New Password" tabIndex="0" className={`${labelSize} ${(isContrast || isDarkMode) ? 'text-white' : 'text-[#03045E]'}`}>
                  Confirm New Password
                </label>
                <div className="relative">
                  <span className={`absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 ${(isContrast || isDarkMode) ? 'text-white' : 'text-[#03045E]/40'}`}>
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </span>
                  <input
                    id="fpConfirmPass"
                    name="fpConfirmPass"
                    type={showConfirmPassword ? "text" : "password"}
                    title="Confirm New Password"
                    aria-label="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    autoComplete="new-password"
                    placeholder="Confirm new password"
                    className={`w-full ${inputSize} pl-10 sm:pl-12 pr-10 sm:pr-12 ${(isContrast || isDarkMode) ? 'border-2 border-blue-400 bg-zinc-800 text-white placeholder:text-gray-400 focus:border-blue-300' : 'border-2 border-[#03045E]/20 bg-white text-[#03045E] placeholder:text-gray-400 focus:border-[#2C7FFF]'} rounded-lg sm:rounded-xl focus:outline-none shadow-sm transition`}
                  />
                  <button
                    type="button"
                    title="Show confirm password"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className={`absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 transition cursor-pointer ${isAccessibilityMode ? 'text-white hover:text-white' : (isContrast || isDarkMode) ? 'text-white/60 hover:text-white' : 'text-[#03045E]/50 hover:text-[#2C7FFF]'}`}
                  >
                    {showConfirmPassword ? (
                      <svg className={`w-4 h-4 sm:w-5 sm:h-5 ${isAccessibilityMode ? '!text-white !stroke-white' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                      </svg>
                    ) : (
                      <svg className={`w-4 h-4 sm:w-5 sm:h-5 ${isAccessibilityMode ? '!text-white !stroke-white' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"></path>
                      </svg>
                    )}
                  </button>
                </div>
              </div>
<button
  type="submit"
  disabled={isLoading}
  title={isLoading ? 'Resetting...' : 'Save New Password'}
  style={
    isAccessibilityMode && isDarkMode
      ? { backgroundColor: '#262626', color: '#ffffff', borderColor: '#404040', borderRadius: '9999px' }
      : isAccessibilityMode && !isDarkMode
        ? { backgroundColor: '#2C7FFF', borderColor: '#60A5FA', color: '#ffffff' }
        : undefined
  }
  className={`w-full ${buttonSize} ${
    isAccessibilityMode && isDarkMode
      ? 'border shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed mt-2'
      : isAccessibilityMode
        ? 'border rounded-full shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed mt-2'
        : (isContrast || isDarkMode)
          ? 'bg-blue-400 hover:bg-blue-300 border border-blue-400 text-black rounded-xl sm:rounded-2xl shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed mt-2'
          : isDefaultPalette && isDarkMode
            ? 'fp-default-dark-send-btn border rounded-xl sm:rounded-2xl shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed mt-2'
            : 'bg-[#2C7FFF] hover:bg-[#03045E] text-white rounded-xl sm:rounded-2xl shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed mt-2'
  }`}
>
  {isLoading ? 'Resetting...' : 'Save New Password'}
</button>
            </form>
          )}

          <div className="w-full flex items-center gap-3">
            <span className={`flex-1 h-px ${(isContrast || isDarkMode) ? 'bg-white/15' : 'bg-[#03045E]/10'}`} />
            <span tabIndex="0" title="or" className={`text-[10px] sm:text-xs font-bold uppercase tracking-widest ${(isContrast || isDarkMode) ? 'text-white/50' : 'text-[#03045E]/40'}`}>or</span>
            <span className={`flex-1 h-px ${(isContrast || isDarkMode) ? 'bg-white/15' : 'bg-[#03045E]/10'}`} />
          </div>

          <button
            type="button"
            title="Back to Log In"
            onClick={handleBack}
            className={`text-xs sm:text-sm font-bold transition hover:underline ${(isContrast || isDarkMode || isAccessibilityMode) ? 'text-white hover:text-white' : 'text-[#2C7FFF] hover:text-[#03045E]'}`}
          >
            ← Back to Log In
          </button>
        </div>
      </div>

      {showSuccessModal && (
        <div
          className="fixed inset-0 z-[9999999] flex items-center justify-center p-4 backdrop-blur-[1px] animate-in fade-in transition-all duration-300"
          style={{ backgroundColor: (isContrast || isDarkMode) ? 'rgba(0, 0, 0, 0.75)' : 'rgba(72, 71, 71, 0.6)', filter: 'none' }}
        >
          <div className={`relative w-full max-w-md rounded-2xl sm:rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 ${(isContrast || isDarkMode) ? 'bg-black border-2 border-white' : 'bg-white border-2 border-[#2C7FFF]'}`}>
            <div className="h-1.5 sm:h-2 w-full bg-[#2C7FFF]" />

            <div className="relative px-4 pt-6 pb-5 sm:px-8 sm:pt-10 sm:pb-8 flex flex-col items-center text-center">
              <div className="relative mb-3 sm:mb-5">
                <div className={`w-14 h-14 sm:w-24 sm:h-24 rounded-full flex items-center justify-center ${(isContrast || isDarkMode) ? 'bg-transparent border-4 border-white' : 'bg-transparent border-4 border-[#2C7FFF]'}`}>
                  <svg className="w-7 h-7 sm:w-12 sm:h-12" style={{ color: '#ffffff' }} fill="none" stroke="#ffffff" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>

              <span className={`inline-flex items-center gap-1 sm:gap-1.5 px-2.5 py-0.5 sm:px-4 sm:py-1.5 rounded-full text-[8px] sm:text-[10px] font-black uppercase tracking-widest mb-2.5 sm:mb-4 border-2 ${(isContrast || isDarkMode) ? 'text-white bg-transparent border-white' : 'text-[#2C7FFF] bg-transparent border-[#2C7FFF]'}`}>
                <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-[#10B981]"></span>
                Notice
              </span>

              <h2 className={`text-lg sm:text-3xl font-black tracking-tight mb-1 sm:mb-2 ${(isContrast || isDarkMode) ? 'text-white' : 'text-[#03045E]'}`}>
                Password Reset!
              </h2>
              <p className={`text-[11px] sm:text-sm font-bold leading-relaxed mb-5 sm:mb-8 max-w-xs ${(isContrast || isDarkMode) ? 'text-white/80' : 'text-[#03045E]/80'}`}>
                Your password has been successfully reset. Taking you to Log In…
              </p>

              <div className="flex items-center gap-1 sm:gap-1.5">
                <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#2C7FFF] animate-pulse" />
                <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#2C7FFF] animate-pulse [animation-delay:150ms]" />
                <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#2C7FFF] animate-pulse [animation-delay:300ms]" />
              </div>
            </div>
          </div>
        </div>
      )}

      <footer
        className={`py-8 sm:py-12 px-4 sm:px-6 mt-auto border-t-2 shadow-inner bg-[#03045E] text-white ${isContrast ? 'border-white/20' : 'border-[#03045E]/20'}`}
      >
       <div className={`w-full grid grid-cols-3 md:grid-cols-4 gap-4 sm:gap-8 pb-6 sm:pb-10 border-b ${isContrast ? 'border-white/10' : 'border-[#03045E]/10'}`}>
          
          <div className="col-span-3 md:col-span-1 space-y-2 sm:space-y-3">
            <img
              src={darkLogo}
              alt="AbleWork Logo"
              title="AbleWork Logo"
              tabIndex="0"
              className="h-8 sm:h-10 w-auto object-contain"
            />
            <p title="Building an inclusive workforce and equal employment opportunities for everyone." tabIndex="0" className={`text-[10px] sm:text-sm font-semibold leading-relaxed text-white/85`}>
              Building an inclusive workforce and equal employment opportunities for everyone.
            </p>
           <div title="Burgos Street, Barangay Villamonte, Bacolod City, 6100 Negros Occidental, Philippines" tabIndex="0" className={`pt-1 sm:pt-2 flex items-center space-x-3 text-[8px] sm:text-xs font-bold tracking-wider text-white/70`}>
  <span> Burgos Street, Barangay Villamonte, Bacolod City, 6100 Negros Occidental, Philippines</span>
  <span></span>
  <span></span>
</div>
          </div>

          <div>
            <h4 title="Quick Links" tabIndex="0" className={`font-black text-[11px] sm:text-base mb-2 sm:mb-4 text-white`}>Quick Links</h4>
            <ul className="space-y-1.5 sm:space-y-2 text-[9px] sm:text-sm font-semibold">
              <li>
                <Link to="/" title="Home Dashboard" className={`transition-colors text-white/85 hover:text-[#7FB0FF]`}>
                  Home Dashboard
                </Link>
              </li>
              <li>
                <Link to="/about" title="About Our Mission" className={`transition-colors text-white/85 hover:text-[#7FB0FF]`}>
                  About Our Mission
                </Link>
              </li>
              <li>
                <Link to="/contact" title="Contact Support" className={`transition-colors text-white/85 hover:text-[#7FB0FF]`}>
                  Contact Support
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 title="Legal & Support" tabIndex="0" className={`font-black text-[11px] sm:text-base mb-2 sm:mb-4 text-white`}>Legal & Support</h4>
            <ul className="space-y-1.5 sm:space-y-2 text-[9px] sm:text-sm font-semibold">
              <li>
                <Link to="/policy" title="Privacy Policy" className={`transition-colors text-white/85 hover:text-[#7FB0FF]`}>
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" title="Terms of Service" className={`transition-colors text-white/85 hover:text-[#7FB0FF]`}>
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 title="Get Started" tabIndex="0" className={`font-black text-[11px] sm:text-base mb-2 sm:mb-4 text-white`}>Get Started</h4>
            <p title="Are you an applicant or employer looking to join our network?" tabIndex="0" className={`text-[9px] sm:text-sm font-semibold mb-2 sm:mb-4 text-white/85`}>
              Are you an applicant or employer looking to join our network?
            </p>
            <Link
              to="/register-select"
              title="Register Now"
              className={`inline-block bg-[#2C7FFF] px-3 py-1.5 sm:px-5 sm:py-2.5 rounded-xl font-bold text-[8px] sm:text-xs uppercase tracking-wider shadow-md transition-all border-2 border-[#2C7FFF] ${
                isAccessibilityMode && isDarkMode
                  ? 'fp-accessibility-dark-register-text'
                  : isDefaultPalette && isDarkMode
                    ? 'fp-default-dark-register-text'
                    : 'text-white'
              }`}
            >
              Register Now
            </Link>
          </div>

        </div>

      <div title="Copyright information and slogan" tabIndex="0" className={`w-full pt-4 sm:pt-6 flex flex-col items-center justify-center gap-2 sm:gap-4 text-[8px] sm:text-xs font-bold text-center text-white/75`}>
          <p>© {new Date().getFullYear()} AgileWork Inc. All rights reserved.</p>
          <p className="font-bold">Empowering Abilities, Connecting Opportunities.</p>
        </div>

      </footer>
    </main>
  );q
}