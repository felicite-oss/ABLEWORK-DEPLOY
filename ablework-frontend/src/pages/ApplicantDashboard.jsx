import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useApplicantTheme from '../hooks/useApplicantTheme';
import { useColorPalette } from '../context/ColorPaletteContext';
import ApplicantOverview from '../components/Applicant/ApplicantOverview';
import ApplicantJobTracker from '../components/Applicant/ApplicantJobTracker';
import ApplicantProfile from '../components/Applicant/ApplicantProfile';
import ApplicantAccountSettings from '../components/Applicant/ApplicantAccountSettings';
import ApplicantExploreJobs from '../components/Applicant/ApplicantExploreJobs';
import { ApplicantPolicy, ApplicantTerms, ApplicantContact, ApplicantFooter } from '../components/Applicant/ApplicantFooterPages';
import headerLogo from '../assets/LIGHT MODE.png';
import darkHeaderLogo from '../assets/DARK MODE.png';
import { MapContainer, TileLayer, Marker, Circle, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

export default function ApplicantDashboard() {
  const navigate = useNavigate();
  const { isContrast, isDarkMode } = useApplicantTheme();
  const { paletteKey } = useColorPalette();
  const isAccessibilityMode = paletteKey === 'highContrast' || paletteKey === 'darkComfort' || isContrast || isDarkMode;
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedJobFromMap, setSelectedJobFromMap] = useState(null);
  const [isOpen, setIsOpen] = useState(false); 
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false); 
  const [settingsAuthOpen, setSettingsAuthOpen] = useState(false);
  const [authPassword, setAuthPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [isAuthVerifying, setIsAuthVerifying] = useState(false);
  const [showAuthPassword, setShowAuthPassword] = useState(false);
  const [authTargetTab, setAuthTargetTab] = useState('settings');
  const [notificationDropdownOpen, setNotificationDropdownOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false); 
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showDesktopSidebar, setShowDesktopSidebar] = useState(true);
  const dropdownRef = useRef(null);
  const notifRef = useRef(null); 
  const notifPanelRef = useRef(null);
  const profilePanelRef = useRef(null);
  const logoutPanelRef = useRef(null);

  const handleTabChange = (tab, skipSecurity = false) => {
    // 1. GLOBAL SECURITY INTERCEPT: Force password check for Profile and Settings
    if ((tab === 'profile' || tab === 'settings') && !skipSecurity) {
      setAuthTargetTab(tab);
      setSettingsAuthOpen(true); // Pops open the mobile modal
      setAuthPassword('');
      setAuthError('');
      setShowAuthPassword(false);
      setIsOpen(false); // Closes mobile hamburger menu
      setProfileDropdownOpen(false); // Closes desktop dropdown
      return; // STOPS the tab from opening!
    }

    // 2. Normal Tab Change
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSettingsAuth = async (e) => {
    e.preventDefault();
    setAuthError('');
    setIsAuthVerifying(true);
    try {
      // Fallback to profile.id if profile.user_id isn't set yet
      const userId = profile?.user_id || profile?.id; 
      
      const res = await fetch(`http://localhost:5001/api/users/${userId}/verify-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: authPassword })
      });

      // Safely check if the response is JSON before parsing
      const contentType = res.headers.get("content-type");
      let data = {};
      if (contentType && contentType.includes("application/json")) {
        data = await res.json();
      }

      if (res.ok) {
        setSettingsAuthOpen(false);
        setAuthPassword('');
        handleTabChange(authTargetTab, true); 
      } else {
        // Show specific backend error or a fallback HTTP error message
        setAuthError(data.message || `Error: ${res.status} ${res.statusText}`);
      }
    } catch (err) {
      console.error("Security check failed:", err);
      setAuthError('Server connection error. Please ensure the backend is running.');
    } finally {
      setIsAuthVerifying(false);
    }
  };

  const [profile, setProfile] = useState(() => {
    const savedUser = JSON.parse(localStorage.getItem('user'));
    if (!savedUser || !savedUser.id) return null;
    const userPicKey = `profile_picture_${savedUser.id}`;
    const savedPic = localStorage.getItem(userPicKey) || localStorage.getItem('profile_picture');
    return { ...savedUser, profile_picture: savedPic, avatar_url: savedPic };
  });
  
  const [matches, setMatches] = useState([]);
  const [applications, setApplications] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const handleClickOutside = (event) => {
      
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setProfileDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setNotificationDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (notificationDropdownOpen && notifPanelRef.current) {
      const timer = setTimeout(() => {
        notifPanelRef.current.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [notificationDropdownOpen]);

  useEffect(() => {
    if ((profileDropdownOpen || settingsAuthOpen) && profilePanelRef.current) {
      const timer = setTimeout(() => {
        profilePanelRef.current.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [profileDropdownOpen, settingsAuthOpen]);

  useEffect(() => {
    if (showLogoutConfirm && logoutPanelRef.current) {
      const timer = setTimeout(() => {
        logoutPanelRef.current.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [showLogoutConfirm]);

  useEffect(() => {
    const handleStorageSync = () => {
      const storedUser = JSON.parse(localStorage.getItem('user'));
      if (storedUser && storedUser.id) {
        const userPicKey = `profile_picture_${storedUser.id}`;
        const savedPic = localStorage.getItem(userPicKey);
        if (savedPic) {
          setProfile(prev => prev ? { ...prev, profile_picture: savedPic, avatar_url: savedPic } : { ...storedUser, profile_picture: savedPic, avatar_url: savedPic });
        }
      }
    };
    window.addEventListener('storage', handleStorageSync);
    return () => window.removeEventListener('storage', handleStorageSync);
  }, []);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (!storedUser || !storedUser.id) {
      navigate('/login');
      return;
    }

    const fetchData = async () => {
      try {
        const profileRes = await fetch(`http://localhost:5001/api/applicant/${storedUser.id}/profile`);
        const profileData = await profileRes.json();
        if (profileRes.ok) {
          const userPicKey = `profile_picture_${storedUser.id}`;
          const savedPic = localStorage.getItem(userPicKey) || profileData.profile_picture || profileData.avatar_url || '';
          if (savedPic) localStorage.setItem(userPicKey, savedPic);
          
          setProfile({ 
            ...profileData, 
            user_id: storedUser.id,
            profile_picture: savedPic,
            avatar_url: savedPic
          });
        }

        const matchesRes = await fetch(`http://localhost:5001/api/applicant/${storedUser.id}/matches`);
        const matchesData = await matchesRes.json();
        if (matchesRes.ok) setMatches(matchesData);

        const trackerRes = await fetch(`http://localhost:5001/api/applicant/${storedUser.id}/applications`);
        const trackerData = await trackerRes.json();
        if (trackerRes.ok) setApplications(trackerData);

        const notifRes = await fetch(`http://localhost:5001/api/users/${storedUser.id}/notifications`);
        const notifData = await notifRes.json();
        if (notifRes.ok) setNotifications(notifData);

      } catch (err) {
        setError('Cannot connect to the server.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const refreshData = async () => {
    if(!profile) return;
    try {
      const matchesRes = await fetch(`http://localhost:5001/api/applicant/${profile.user_id}/matches`);
      if (matchesRes.ok) setMatches(await matchesRes.json());
      
      const trackerRes = await fetch(`http://localhost:5001/api/applicant/${profile.user_id}/applications`);
      if (trackerRes.ok) setApplications(await trackerRes.json());
    } catch(err) {
      console.error("Failed to refresh data", err);
    }
  };

  const handleMarkAsRead = async (notifId) => {
    try {
      const res = await fetch(`http://localhost:5001/api/notifications/${notifId}/read`, { method: 'PUT' });
      if (res.ok) {
        setNotifications(notifications.map(n => n.id === notifId ? { ...n, is_read: 1 } : n));
      }
    } catch (err) {
      console.error("Failed to mark notification as read");
    }
  };

  const handleLogout = () => {
    setShowLogoutConfirm(false);
    setIsLoggingOut(true);
    setTimeout(() => {
      localStorage.removeItem('profile_picture');
      navigate('/login');
    }, 3000);
  };

  if (error) return <div role="alert" aria-live="assertive" className={`min-h-screen flex items-center justify-center font-black p-4 text-center ${isContrast ? 'bg-black text-red-400' : 'text-red-600'}`}>{error}</div>;

  const isRejected = profile?.verification_status === 'Rejected';
  const unreadCount = notifications.filter(n => !n.is_read).length;
  
  let daysLeft = 0;
  let canResubmit = false;

  if (isRejected && profile?.rejection_timestamp) {
    const rejectDate = new Date(profile.rejection_timestamp);
    const today = new Date();
    const diffTime = Math.abs(today - rejectDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    daysLeft = 8 - diffDays;
    canResubmit = daysLeft <= 0;
  }

  const getHeaderImageSrc = () => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    const userPicKey = storedUser?.id ? `profile_picture_${storedUser.id}` : 'profile_picture';
    const pic = profile?.profile_picture || profile?.avatar_url || localStorage.getItem(userPicKey) || localStorage.getItem('profile_picture');
    if (!pic) return '';
    if (pic.startsWith('http') || pic.startsWith('blob') || pic.startsWith('data:image')) {
      return pic;
    }
    return `http://localhost:5001${pic}`;
  };

  return (
    <div className={`min-h-screen flex flex-col w-full overflow-x-hidden selection:bg-[#2C7FFF] selection:text-white ${(isContrast || isDarkMode) ? 'bg-black text-white' : 'bg-[#f4f4f4] text-[#03045E]'}`}>
      
      {isLoading && (
        <div
          className="fixed inset-0 z-[9999999] flex items-center justify-center p-4 backdrop-blur-[1px] animate-in fade-in transition-all duration-300"
          style={{ backgroundColor: (isContrast || isDarkMode) ? 'rgba(0, 0, 0, 0.75)' : 'rgba(72, 71, 71, 0.6)', filter: 'none' }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="loading-title"
          aria-describedby="loading-desc"
          tabIndex="-1"
        >
          <div className={`border-2 px-6 py-8 sm:px-8 sm:py-10 rounded-xl sm:rounded-2xl shadow-[0_20px_50px_rgba(3,4,94,0.15)] flex flex-col items-center max-w-sm w-full mx-auto transform animate-in fade-in zoom-in-95 duration-300 ${isContrast ? 'bg-black border-[#2C7FFF]' : 'bg-white border-[#03045E]/20'}`}>
            <div className="relative w-16 h-16 flex items-center justify-center mb-5">
              <div className="absolute inset-0 rounded-full border-4 border-[#2C7FFF]/30 animate-pulse"></div>
              <div className="absolute inset-0 rounded-full border-4 border-t-[#2C7FFF] border-r-transparent border-b-[#03045E] border-l-transparent animate-spin"></div>
              <div className={`w-6 h-6 rounded-full shadow-md animate-ping opacity-75 absolute ${isContrast ? 'bg-white' : 'bg-[#03045E]'}`}></div>
            </div>
            <h3 id="loading-title" className={`text-lg font-black tracking-tight text-center mb-1 ${isContrast ? 'text-white' : 'text-[#03045E]'}`}>Loading Workspace</h3>
            <p id="loading-desc" className={`text-xs text-center font-bold ${isContrast ? 'text-white/80' : 'text-[#03045E]/80'}`}>Preparing your dashboard and real-time updates...</p>
          </div>
        </div>
      )}

      {isLoggingOut && (
        <>
          <div role="alert" aria-live="assertive" className="sr-only">
            Logging Out... Please wait while we secure your account and end the session.
          </div>
          <div
            className="fixed inset-0 z-[9999999] flex items-center justify-center p-4 backdrop-blur-[1px] animate-in fade-in transition-all duration-300"
            style={{ backgroundColor: (isContrast || isDarkMode) ? 'rgba(0, 0, 0, 0.75)' : 'rgba(72, 71, 71, 0.6)', filter: 'none' }}
            aria-hidden="true"
          >
            <div className={`relative w-full max-w-md rounded-xl sm:rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 ${(isContrast || isDarkMode) ? 'bg-black border-2 border-white' : 'bg-white border-2 border-[#2C7FFF]'}`}>
              <div className="h-1.5 sm:h-2 w-full bg-[#2C7FFF]" />

              <div className="relative px-4 pt-6 pb-5 sm:px-8 sm:pt-10 sm:pb-8 flex flex-col items-center text-center">
                <div className="relative mb-3 sm:mb-5">
                  <div className={`w-14 h-14 sm:w-24 sm:h-24 rounded-full flex items-center justify-center ${(isContrast || isDarkMode) ? 'bg-transparent border-4 border-white' : 'bg-transparent border-4 border-[#2C7FFF]'}`}>
                    <svg className={`w-7 h-7 sm:w-12 sm:h-12 animate-spin ${(isContrast || isDarkMode) ? 'text-white' : 'text-[#2C7FFF]'}`} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                    </svg>
                  </div>
                  <div className={`absolute -top-1 -right-1 w-4 h-4 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-[9px] sm:text-xs font-bold ${(isContrast || isDarkMode) ? 'bg-white text-black' : 'bg-[#03045E] text-white'}`}>✓</div>
                </div>

                <span className={`inline-flex items-center gap-1 sm:gap-1.5 px-2.5 py-0.5 sm:px-4 sm:py-1.5 rounded-full text-[8px] sm:text-[10px] font-black uppercase tracking-widest mb-2.5 sm:mb-4 border-2 ${(isContrast || isDarkMode) ? 'text-white bg-transparent border-white' : 'text-[#2C7FFF] bg-transparent border-[#2C7FFF]'}`}>
                  <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-[#10B981]"></span>
                  Notice
                </span>

                <h2 id="logging-title" className={`text-lg sm:text-3xl font-black tracking-tight mb-1 sm:mb-2 ${(isContrast || isDarkMode) ? 'text-white' : 'text-[#03045E]'}`}>
                  Logging Out...
                </h2>
                <p id="logging-desc" className={`text-[11px] sm:text-sm font-bold leading-relaxed mb-5 sm:mb-8 max-w-xs ${(isContrast || isDarkMode) ? 'text-white/80' : 'text-[#03045E]/80'}`}>
                  Please wait while we secure your account and end the session.
                </p>

                <div className="flex items-center gap-1 sm:gap-1.5" aria-label="Logging out">
                  <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#2C7FFF] animate-pulse" />
                  <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#2C7FFF] animate-pulse [animation-delay:150ms]" />
                  <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#2C7FFF] animate-pulse [animation-delay:300ms]" />
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {showLogoutConfirm && (
        <div
          className="fixed inset-0 z-[9999999] flex items-center justify-center p-4 backdrop-blur-[1px] animate-in fade-in transition-all duration-300"
          style={{ backgroundColor: (isContrast || isDarkMode) ? 'rgba(0, 0, 0, 0.75)' : 'rgba(72, 71, 71, 0.6)', filter: 'none' }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="logout-title"
          aria-describedby="logout-desc"
          tabIndex="-1"
        >
          <div
            ref={logoutPanelRef}
            tabIndex={-1}
            className={`relative w-full max-w-md rounded-xl sm:rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 focus:outline-none ${(isContrast || isDarkMode) ? 'bg-black border-2 border-white' : 'bg-white border-2 border-[#2C7FFF]'}`}
          >
            <div className="h-1.5 sm:h-2 w-full bg-[#2C7FFF]" />

            <div className="relative px-4 pt-6 pb-5 sm:px-8 sm:pt-10 sm:pb-8 flex flex-col items-center text-center">
              <div className="relative mb-3 sm:mb-5">
                <div className={`w-14 h-14 sm:w-24 sm:h-24 rounded-full flex items-center justify-center ${(isContrast || isDarkMode) ? 'bg-transparent border-4 border-white' : 'bg-transparent border-4 border-[#2C7FFF]'}`}>
                  <svg className={`w-7 h-7 sm:w-12 sm:h-12 ${(isContrast || isDarkMode) ? 'text-white' : 'text-[#2C7FFF]'}`} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                  </svg>
                </div>
                <div className={`absolute -top-1 -right-1 w-4 h-4 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-[9px] sm:text-xs font-bold ${(isContrast || isDarkMode) ? 'bg-white text-black' : 'bg-[#03045E] text-white'}`}>!</div>
              </div>

              <span tabIndex="0" className={`inline-flex items-center gap-1 sm:gap-1.5 px-2.5 py-0.5 sm:px-4 sm:py-1.5 rounded-full text-[8px] sm:text-[10px] font-black uppercase tracking-widest mb-2.5 sm:mb-4 border-2 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2C7FFF] focus-visible:ring-offset-2 ${(isContrast || isDarkMode) ? 'text-white bg-transparent border-white' : 'text-[#2C7FFF] bg-transparent border-[#2C7FFF]'}`}>
                <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-[#10B981]"></span>
                Notice
              </span>

              <h2 id="logout-title" tabIndex="0" className={`text-lg sm:text-3xl font-black tracking-tight mb-1 sm:mb-2 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2C7FFF] focus-visible:ring-offset-2 rounded-lg p-1 -m-1 w-fit ${(isContrast || isDarkMode) ? 'text-white' : 'text-[#03045E]'}`}>
                Are you sure to logout?
              </h2>
              <p id="logout-desc" tabIndex="0" className={`text-[11px] sm:text-sm font-bold leading-relaxed mb-5 sm:mb-8 max-w-xs transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2C7FFF] focus-visible:ring-offset-2 rounded-lg p-1 -m-1 w-fit ${(isContrast || isDarkMode) ? 'text-white/80' : 'text-[#03045E]/80'}`}>
                You will be signed out of your account and returned to the login page.
              </p>

              <div className="flex flex-row gap-2 sm:gap-3 w-full">
                <button 
                  onClick={() => setShowLogoutConfirm(false)}
                  className="flex-1 py-2.5 sm:py-4 rounded-lg sm:rounded-xl font-black text-xs sm:text-sm uppercase tracking-wider transition-all duration-300 cursor-pointer bg-transparent border-2 focus:outline-none"
                  style={{ color: '#4c4d5b', borderColor: '#4c4d5b' }}
                >
                  No, Stay
                </button>
                <button
                  onClick={handleLogout}
                  aria-label="Confirm logout and end session"
                  className="flex-1 py-2.5 sm:py-4 rounded-lg sm:rounded-xl font-black text-[11px] sm:text-sm uppercase tracking-wider transition-all duration-300 cursor-pointer bg-transparent border-2 focus:outline-none"
                  style={{ color: '#DC2626', borderColor: '#DC2626' }}
                >
                  Yes, Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MOBILE SECURITY CHECK MODAL */}
      {settingsAuthOpen && (
        <div
          className="md:hidden fixed inset-0 z-[9999999] flex items-center justify-center p-4 backdrop-blur-[1px] animate-in fade-in transition-all duration-300"
          style={{ backgroundColor: (isContrast || isDarkMode) ? 'rgba(0, 0, 0, 0.75)' : 'rgba(72, 71, 71, 0.6)', filter: 'none' }}
        >
          <div 
            id="mobile-auth-modal"
            onClick={(e) => e.stopPropagation()} 
            className={`relative w-full max-w-sm rounded-xl sm:rounded-2xl shadow-2xl p-6 animate-in zoom-in-95 duration-300 ${isContrast ? 'bg-black border-2 border-white' : 'bg-white border-2 border-[#2C7FFF]'}`}
          >
            <h3 className={`text-lg font-black mb-2 text-center ${isContrast || isDarkMode ? 'text-white' : 'text-[#03045E]'}`}>Security Check</h3>
            <p className={`text-xs text-center font-bold mb-4 ${isContrast || isDarkMode ? 'text-white/70' : 'text-[#03045E]/70'}`}>Please enter your password to access {authTargetTab === 'profile' ? 'Profile' : 'Settings'}.</p>
            
            {authError && (
              <div role="alert" className={`mb-3 p-2 rounded-lg text-xs text-center font-bold border-2 ${isContrast || isDarkMode ? 'text-red-500 border-red-500' : 'text-red-600 border-red-600'}`}>
                {authError}
              </div>
            )}
            
            <form onSubmit={handleSettingsAuth} className="flex flex-col gap-4">
              <div className="relative">
                <input
                  type={showAuthPassword ? "text" : "password"}
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className={`w-full p-3 border-2 rounded-xl font-bold outline-none text-sm ${isContrast || isDarkMode ? 'bg-black border-white/30 text-white focus:border-white' : 'bg-[#f4f4f4] border-[#03045E]/20 text-[#03045E] focus:border-[#2C7FFF]'}`}
                />
                <button
                  type="button"
                  onClick={() => setShowAuthPassword(!showAuthPassword)}
                  className={`absolute right-3 top-1/2 -translate-y-1/2 ${isContrast || isDarkMode ? 'text-white/50 hover:text-white' : 'text-[#03045E]/50 hover:text-[#2C7FFF]'}`}
                >
                  {showAuthPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => { setSettingsAuthOpen(false); setAuthError(''); setAuthPassword(''); }}
                  className={`flex-1 py-3 rounded-xl font-black text-xs uppercase tracking-wider border-2 transition-all cursor-pointer ${isContrast || isDarkMode ? 'bg-black text-white border-white/30 hover:bg-white/10' : 'bg-white text-[#03045E] border-[#03045E]/30 hover:bg-[#f4f4f4]'}`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isAuthVerifying}
                  className={`flex-1 py-3 rounded-xl font-black text-xs uppercase tracking-wider border-2 transition-all cursor-pointer disabled:opacity-50 ${isContrast || isDarkMode ? 'bg-white text-black border-white hover:bg-white/90' : 'bg-[#2C7FFF] text-white border-[#2C7FFF] hover:bg-[#03045E]'}`}
                >
                  {isAuthVerifying ? 'Verifying...' : 'Unlock'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* HEADER */}
     <header role="banner" className={`w-full fixed top-0 left-0 z-50 ${isContrast ? 'bg-black border-b-2 border-[#2C7FFF]' : 'bg-white border-b border-[#03045E]/15'}`}>
       <div className="w-full h-14 sm:h-16 pl-3 pr-3 sm:pl-4 sm:pr-4 md:pr-8 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3 md:gap-6 min-w-0">
            <div className="flex items-center flex-shrink-0 py-1">
              <img
                tabIndex="0"
                aria-label="AbleWork logo"
                src={isAccessibilityMode ? darkHeaderLogo : headerLogo}
                alt="AbleWork logo"
                role="img"
                className="h-9 sm:h-12 md:h-14 w-auto object-contain max-h-full focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2C7FFF] focus-visible:ring-offset-2 rounded-lg p-1 -m-1 cursor-pointer"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setNotificationDropdownOpen(!notificationDropdownOpen)}
                aria-expanded={notificationDropdownOpen}
                aria-haspopup="true"
                aria-label={unreadCount > 0 ? `Notifications, ${unreadCount} unread` : 'Notifications, no unread'}
                className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 transition-all duration-200 cursor-pointer flex items-center justify-center shrink-0 p-0 shadow-sm focus:outline-none ${
                  (isContrast || isDarkMode)
                    ? notificationDropdownOpen
                      ? 'bg-zinc-900 text-[#2C7FFF] border-[#2C7FFF] ring-2 ring-[#2C7FFF]/30'
                      : 'bg-zinc-900 text-white border-white/30'
                    : notificationDropdownOpen
                      ? 'bg-[#f4f4f4] text-[#2C7FFF] border-[#2C7FFF] ring-2 ring-[#2C7FFF]/30'
                      : 'bg-[#f4f4f4] text-[#03045E] border-[#03045E]/20'
                }`}
                title="Notifications"
              >
                <svg aria-hidden="true" className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {unreadCount > 0 && (
                  <span aria-hidden="true" className={`absolute top-0 right-0 w-3 h-3 sm:w-3.5 sm:h-3.5 border-2 rounded-full ${isContrast ? 'bg-[#2C7FFF] border-black' : 'bg-[#2C7FFF] border-white'}`}></span>
                )}
              </button>

              {notificationDropdownOpen && (
                <div 
                  ref={notifPanelRef}
                  tabIndex={-1}
                  role="region" 
                  aria-label={`Notifications panel. ${unreadCount} unread notifications.`} 
                  className={`fixed left-1/2 -translate-x-1/2 top-16 sm:top-20 w-[calc(100vw-2rem)] max-w-sm sm:absolute sm:left-auto sm:translate-x-0 sm:top-auto sm:right-0 sm:mt-3 sm:w-96 sm:max-w-none rounded-lg sm:rounded-xl shadow-[0_15px_40px_rgba(3,4,94,0.2)] border-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200 overflow-hidden focus:outline-none ${isContrast ? 'bg-black border-[#2C7FFF]/50' : 'bg-white border-[#03045E]/20'}`}>
                  <div className={`px-3 py-2.5 sm:px-5 sm:py-3.5 border-b-2 flex justify-between items-center rounded-t-lg sm:rounded-t-xl relative z-20 ${isContrast ? 'bg-black border-[#2C7FFF]/40' : 'bg-[#f4f4f4] border-[#03045E]/15'}`}>
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <div aria-hidden="true" className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-[#2C7FFF]"></div>
                      <h3 tabIndex="0" aria-label="Notifications" className={`font-black text-xs sm:text-base tracking-tight focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2C7FFF] focus-visible:ring-offset-2 rounded w-fit ${isContrast ? 'text-white' : 'text-[#03045E]'}`}>Notifications</h3>
                    </div>
                    {unreadCount > 0 ? (
                      <span tabIndex="0" aria-label={`${unreadCount} New`} className="text-[9px] sm:text-[11px] font-black tracking-wide text-[#2c7fff] px-2 sm:px-3 py-0.5 sm:py-1 rounded-full uppercase focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2C7FFF] focus-visible:ring-offset-2 w-fit">
                        {unreadCount} New
                      </span>
                    ) : (
                      <span tabIndex="0" aria-label="All Read" className={`text-[9px] sm:text-[11px] font-black uppercase tracking-wider focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2C7FFF] focus-visible:ring-offset-2 rounded w-fit ${isContrast ? 'text-white/70' : 'text-[#03045E]/70'}`}>All Read</span>
                    )}
                  </div>
                  
                  <div className={`max-h-[300px] sm:max-h-[340px] overflow-y-auto flex flex-col divide-y-2 ${isContrast ? 'divide-[#2C7FFF]/20' : 'divide-[#03045E]/10'}`}>
                    {notifications.length > 0 ? notifications.map(notif => (
                      <div 
                        key={notif.id} 
                        role="menuitem"
                        tabIndex={0}
                        aria-label={`Notification: ${notif.title}. Message: ${notif.message}. Status: ${!notif.is_read ? 'Unread' : 'Read'}. Received: ${new Date(notif.created_at).toLocaleDateString(undefined, { month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}`}
                        onClick={() => {
                          if (!notif.is_read) handleMarkAsRead(notif.id);
                          if (notif.type === 'update' || notif.type === 'application') {
                            handleTabChange('tracker');
                          } else if (notif.type === 'match') {
                            handleTabChange('explore-jobs');
                          } else {
                            handleTabChange('overview');
                          }
                          setNotificationDropdownOpen(false);
                        }} 
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            if (!notif.is_read) handleMarkAsRead(notif.id);
                            if (notif.type === 'update' || notif.type === 'application') {
                              handleTabChange('tracker');
                            } else if (notif.type === 'match') {
                              handleTabChange('explore-jobs');
                            } else {
                              handleTabChange('overview');
                            }
                            setNotificationDropdownOpen(false);
                          }
                        }}
                        className={`p-2.5 sm:p-5 cursor-pointer relative focus:outline-none focus:ring-2 focus:ring-[#2C7FFF] focus:ring-inset ${
                          !notif.is_read 
                            ? (isContrast ? 'bg-[#2C7FFF]/15' : 'bg-[#2C7FFF]/10') 
                            : (isContrast ? 'bg-black' : 'bg-white')
                        }`}
                      >
                        {!notif.is_read && (
                          <div aria-hidden="true" className="absolute left-0 top-0 bottom-0 w-1 sm:w-1.5 bg-[#2C7FFF]"></div>
                        )}
                        <div className="flex items-start justify-between gap-1.5 sm:gap-2">
                          <h4 className={`text-[11px] sm:text-sm tracking-tight ${!notif.is_read ? (isContrast ? 'font-black text-white' : 'font-black text-[#03045E]') : (isContrast ? 'font-bold text-white/80' : 'font-bold text-[#03045E]/80')}`}>
                            {notif.title}
                          </h4>
                          {!notif.is_read && (
                            <span aria-hidden="true" className="w-1.5 h-1.5 sm:w-2.5 sm:h-2.5 rounded-full bg-[#2C7FFF] shrink-0 mt-1"></span>
                          )}
                        </div>
                        <p className={`text-[10px] sm:text-xs mt-0.5 sm:mt-1.5 leading-relaxed ${!notif.is_read ? (isContrast ? 'text-white font-bold' : 'text-[#03045E] font-bold') : (isContrast ? 'text-white/70 font-semibold' : 'text-[#03045E]/70 font-semibold')}`}>
                          {notif.message}
                        </p>
                        <span className="text-[8px] sm:text-[11px] text-[#2C7FFF] font-black tracking-wider uppercase mt-1 sm:mt-2.5 block">
                          {new Date(notif.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    )) : (
                      <div className={`p-6 sm:p-10 text-center flex flex-col items-center justify-center ${isContrast ? 'bg-black' : 'bg-white'}`}>
                        <div aria-hidden="true" className="w-8 h-8 sm:w-12 sm:h-12 bg-[#2C7FFF]/15 text-[#2C7FFF] rounded-lg sm:rounded-xl flex items-center justify-center mb-2 sm:mb-3">
                          <svg aria-hidden="true" className="w-4 h-4 sm:w-6 sm:h-6" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path></svg>
                        </div>
                        <span className={`text-[11px] sm:text-sm font-black ${isContrast ? 'text-white' : 'text-[#03045E]'}`}>You're all caught up!</span>
                        <span className={`text-[9px] sm:text-xs font-bold mt-1 ${isContrast ? 'text-white/70' : 'text-[#03045E]/70'}`}>No new notifications at the moment.</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="hidden md:block relative" ref={dropdownRef}>
              <button
                onClick={() => {
                  setProfileDropdownOpen(!profileDropdownOpen);
                  if (settingsAuthOpen) setSettingsAuthOpen(false);
                }}
                aria-expanded={profileDropdownOpen || settingsAuthOpen}
                aria-haspopup="true"
                aria-label={`Profile Menu for ${profile?.firstname || profile?.full_name || 'User'}`}
                className={`w-10 h-10 rounded-full overflow-hidden border-2 transition-all duration-200 cursor-pointer shadow-sm hover:border-[#2C7FFF] flex items-center justify-center shrink-0 p-0 focus:outline-none ${
                  profileDropdownOpen || activeTab === 'profile' || activeTab === 'settings' ? 'border-[#2C7FFF] ring-2 ring-[#2C7FFF]/30' : (isContrast ? 'bg-zinc-900 border-white/30' : 'bg-white border-[#03045E]/20')
                }`}
                title="Profile Menu"
              >
                {getHeaderImageSrc() ? (
                  <img 
                    src={getHeaderImageSrc()} 
                    alt={`Profile picture of ${profile?.firstname || profile?.full_name || 'User'}`} 
                    className="w-full h-full object-cover" 
                  />
                ) : (
                  <div aria-hidden="true" className={`w-full h-full flex items-center justify-center font-black text-sm ${isContrast ? 'bg-[#2C7FFF] text-white' : 'bg-[#03045E] text-white'}`}>
                    {profile?.firstname?.[0] || profile?.full_name?.[0] || 'U'}
                  </div>
                )}
              </button>

              {(profileDropdownOpen || settingsAuthOpen) && (
                <div 
                  ref={profilePanelRef}
                  tabIndex={-1}
                  role="region" 
                  aria-label={settingsAuthOpen ? "Security Check" : `Profile menu panel. Logged in as ${profile?.firstname || profile?.full_name || 'Applicant'}.`} 
                  className={`absolute right-0 mt-3 w-72 rounded-xl sm:rounded-2xl shadow-[0_20px_50px_rgba(3,4,94,0.25)] border-2 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 focus:outline-none ${isContrast ? 'bg-black border-[#2C7FFF]/60' : 'bg-white border-[#03045E]/20'}`}>
                  
                  {settingsAuthOpen ? (
                    <div className="p-5">
                      <h3 className={`text-lg font-black mb-2 text-center ${isContrast || isDarkMode ? 'text-white' : 'text-[#03045E]'}`}>Security Check</h3>
                      <p className={`text-xs text-center font-bold mb-4 ${isContrast || isDarkMode ? 'text-white/70' : 'text-[#03045E]/70'}`}>Please enter your password to access {authTargetTab === 'profile' ? 'Profile' : 'Settings'}.</p>
                   {authError && (
  <div role="alert" aria-live="assertive" className={`mb-3 p-2 rounded-lg text-xs text-center font-bold bg-transparent border-2 ${isContrast || isDarkMode ? '!text-red-500 !border-red-500' : 'text-red-600 border-red-600'}`}>
    {authError}
  </div>
)}
                      <form onSubmit={handleSettingsAuth} className="flex flex-col gap-4">
                        <div className="relative">
                          <input
                            type={showAuthPassword ? "text" : "password"}
                            value={authPassword}
                            onChange={(e) => setAuthPassword(e.target.value)}
                            placeholder="Enter your password"
                            required
                            className={`w-full p-3 border-2 rounded-xl font-bold outline-none transition text-sm ${isContrast || isDarkMode ? 'bg-black border-white/30 text-white focus:border-white' : 'bg-[#f4f4f4] border-[#03045E]/20 text-[#03045E] focus:border-[#2C7FFF]'}`}
                          />
                          <button
                            type="button"
                            onClick={() => setShowAuthPassword(!showAuthPassword)}
                            className={`absolute right-3 top-1/2 -translate-y-1/2 ${isContrast || isDarkMode ? 'text-white/50 hover:text-white' : 'text-[#03045E]/50 hover:text-[#2C7FFF]'}`}
                          >
                            {showAuthPassword ? (
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                            ) : (
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"></path></svg>
                            )}
                          </button>
                        </div>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => { setSettingsAuthOpen(false); setAuthError(''); setAuthPassword(''); }}
                            className={`flex-1 py-3 rounded-xl font-black text-xs uppercase tracking-wider border-2 transition-all cursor-pointer ${isContrast || isDarkMode ? 'bg-black text-white border-white/30 hover:bg-white/10' : 'bg-white text-[#03045E] border-[#03045E]/30 hover:bg-[#f4f4f4]'}`}
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            disabled={isAuthVerifying}
                            className={`flex-1 py-3 rounded-xl font-black text-xs uppercase tracking-wider border-2 transition-all cursor-pointer disabled:opacity-50 ${isContrast || isDarkMode ? 'bg-white text-black border-white hover:bg-white/90' : 'bg-[#2C7FFF] text-white border-[#2C7FFF] hover:bg-[#03045E]'}`}
                          >
                            {isAuthVerifying ? 'Verifying...' : 'Unlock'}
                          </button>
                        </div>
                      </form>
                    </div>
                  ) : (
                    <>
                      <div className={`relative p-4 pb-5 ${isContrast ? 'bg-black border-b border-[#2C7FFF]/30' : 'bg-[#f4f4f4] border-b border-[#03045E]/10'}`}>
                        <div className="flex items-center gap-3.5">
                          <div className="relative shrink-0">
                            <div tabIndex="0" aria-label={`Profile picture of ${profile?.firstname || profile?.full_name || 'User'}`} className={`w-14 h-14 rounded-lg sm:rounded-xl overflow-hidden border-2 border-[#2C7FFF] shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2C7FFF] focus-visible:ring-offset-2`}>
                              {getHeaderImageSrc() ? (
                                <img src={getHeaderImageSrc()} alt={`Profile picture of ${profile?.firstname || profile?.full_name || 'User'}`} className="w-full h-full object-cover" />
                              ) : (
                                <div aria-hidden="true" className={`w-full h-full flex items-center justify-center font-black text-lg ${isContrast ? 'bg-[#2C7FFF] text-white' : 'bg-[#03045E] text-white'}`}>
                                  {profile?.firstname?.[0] || profile?.full_name?.[0] || 'U'}
                                </div>
                              )}
                            </div>
                            <span aria-hidden="true" className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white shadow-md"></span>
                          </div>
                          <div className="min-w-0 flex-1">
                            <p tabIndex="0" aria-label="Welcome back" className={`text-[10px] font-black uppercase tracking-[0.15em] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2C7FFF] focus-visible:ring-offset-2 rounded w-fit ${isContrast ? 'text-[#2C7FFF]' : 'text-[#2C7FFF]'}`}>Welcome back</p>
                            <p tabIndex="0" aria-label={profile?.firstname ? `${profile.firstname} ${profile.lastname || ''}`.trim() : (profile?.full_name || 'Applicant')} className={`text-sm font-black truncate leading-tight mt-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2C7FFF] focus-visible:ring-offset-2 rounded w-fit ${isContrast ? 'text-white' : 'text-[#03045E]'}`}>
                              {profile?.firstname ? `${profile.firstname} ${profile.lastname || ''}`.trim() : (profile?.full_name || 'Applicant')}
                            </p>
                            <p tabIndex="0" aria-label={profile?.email || 'job.seeker@ablework.ph'} className={`text-[11px] font-semibold truncate mt-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2C7FFF] focus-visible:ring-offset-2 rounded w-fit ${isContrast ? 'text-white/60' : 'text-[#03045E]/60'}`}>
                              {profile?.email || 'job.seeker@ablework.ph'}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="p-2">
                        <p tabIndex="0" aria-label="Account" className={`px-3 pt-1.5 pb-2 text-[10px] font-black uppercase tracking-[0.15em] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2C7FFF] focus-visible:ring-offset-2 rounded w-fit ${isContrast ? 'text-white/50' : 'text-[#03045E]/50'}`}>Account</p>
                        <button
                          role="menuitem"
                          onClick={() => { 
                            setProfileDropdownOpen(false); 
                            setSettingsAuthOpen(true); 
                            setAuthTargetTab('profile');
                            setAuthPassword('');
                            setAuthError('');
                            setShowAuthPassword(false);
                          }}
                          aria-label="Edit Profile"
                          aria-current={activeTab === 'profile' ? 'page' : undefined}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg sm:rounded-xl text-sm font-black transition-colors text-left cursor-pointer focus:outline-none ${
                            activeTab === 'profile'
                              ? (isContrast ? 'bg-[#2C7FFF] text-white' : 'bg-[#03045E] text-white')
                              : (isContrast ? 'text-white' : 'text-[#03045E]')
                          }`}
                        >
                          <div aria-hidden="true" className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                            activeTab === 'profile'
                              ? (isContrast ? 'bg-white text-[#2C7FFF]' : 'bg-white text-[#03045E]')
                              : (isContrast ? 'bg-[#2C7FFF] text-white' : 'bg-[#03045E] text-white')
                          }`}>
                            <svg aria-hidden="true" className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </div>
                          <div className="flex-1 min-w-0"><span className="truncate block">Edit Profile</span></div>
                          {activeTab === 'profile' && <span aria-hidden="true" className={`w-2 h-2 rounded-full shrink-0 ${isContrast ? 'bg-[#2C7FFF]' : 'bg-white'}`}></span>}
                        </button>

                        <button
                          role="menuitem"
                          onClick={() => { 
                            setProfileDropdownOpen(false); 
                            setSettingsAuthOpen(true); 
                            setAuthTargetTab('settings');
                            setAuthPassword('');
                            setAuthError('');
                            setShowAuthPassword(false);
                          }}
                          aria-label="Settings"
                          aria-current={activeTab === 'settings' ? 'page' : undefined}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg sm:rounded-xl text-sm font-black transition-colors text-left cursor-pointer focus:outline-none ${
                            activeTab === 'settings'
                              ? (isContrast ? 'bg-[#2C7FFF] text-white' : 'bg-[#03045E] text-white')
                              : (isContrast ? 'text-white' : 'text-[#03045E]')
                          }`}
                        >
                          <div aria-hidden="true" className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                            activeTab === 'settings'
                              ? (isContrast ? 'bg-white text-[#2C7FFF]' : 'bg-white text-[#03045E]')
                              : (isContrast ? 'bg-[#2C7FFF] text-white' : 'bg-[#03045E] text-white')
                          }`}>
                            <svg aria-hidden="true" className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                          </div>
                          <div className="flex-1 min-w-0"><span className="truncate block">Settings</span></div>
                          {activeTab === 'settings' && <span aria-hidden="true" className={`w-2 h-2 rounded-full shrink-0 ${isContrast ? 'bg-[#2C7FFF]' : 'bg-white'}`}></span>}
                        </button>

                        <div aria-hidden="true" className={`h-px my-2 mx-2 ${isContrast ? 'bg-[#2C7FFF]/30' : 'bg-[#03045E]/10'}`}></div>

                        <button
                          role="menuitem"
                          disabled={isLoggingOut}
                          onClick={() => { setProfileDropdownOpen(false); setShowLogoutConfirm(true); }}
                          style={{ color: '#DC2626' }}
                          aria-label={isLoggingOut ? 'Logging out' : 'Log Out'}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg sm:rounded-xl text-sm font-black transition-colors text-left cursor-pointer disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-[#DC2626] focus:ring-inset`}
                        >
                          <div aria-hidden="true" style={{ backgroundColor: '#FEE2E2', color: '#DC2626' }} className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0`}>
                            {isLoggingOut ? (
                              <svg aria-hidden="true" className="w-4 h-4 animate-spin shrink-0" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                              </svg>
                            ) : (
                              <svg aria-hidden="true" className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                              </svg>
                            )}
                          </div>
                          <div className="flex-1 min-w-0"><span className="truncate block">{isLoggingOut ? 'Logging out...' : 'Log Out'}</span></div>
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Hamburger Button */}
            <button
              aria-label={isOpen ? "Close menu" : "Open menu"}
              aria-expanded={isOpen}
              aria-controls="mobile-menu"
              className={`md:hidden flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-lg border-2 shadow-sm cursor-pointer transition-all duration-200 shrink-0 focus:outline-none ${
                isContrast ? 'bg-zinc-900 text-white border-white/30' : 'bg-white text-[#03045E] border-[#03045E]/20'
              }`}
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? (
                <svg aria-hidden="true" className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg aria-hidden="true" className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* MOBILE HAMBURGER MENU */}
        <div
          id="mobile-menu"
          inert={!isOpen ? true : undefined}
          className={`md:hidden absolute top-full left-0 w-full overflow-hidden transition-all duration-300 ease-in-out border-b-2 z-40 ${
            isContrast ? 'bg-black border-[#2C7FFF]' : 'bg-white border-[#03045E]/20'
          } ${
            isOpen ? 'max-h-[750px] opacity-100 shadow-xl' : 'max-h-0 opacity-0'
          }`}
        >
          <div className={`w-full ${isContrast ? 'bg-black' : 'bg-white'}`}>
            <nav aria-label="Mobile navigation" className={`flex flex-col px-2.5 pt-2.5 pb-2.5 gap-2 sm:px-3 sm:pt-3 sm:pb-3 sm:gap-2.5 ${isContrast ? 'text-white' : 'text-[#03045E]'}`}>
              
              <button
                onClick={() => { handleTabChange('profile')}}
                aria-label="Profile"
                aria-current={activeTab === 'profile' ? 'page' : undefined}
                className={`relative flex items-center gap-2.5 text-left pl-3 pr-2.5 py-2.5 rounded-lg font-extrabold transition-all duration-300 cursor-pointer border-2 group overflow-hidden focus:outline-none ${
                  activeTab === 'profile'
                    ? 'bg-white text-[#03045E] border-[#03045E] shadow-md'
                    : 'bg-white text-[#03045E] border-[#03045E]/25'
                }`}
              >
                {activeTab === 'profile' && (
                  <span aria-hidden="true" className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#03045E]"></span>
                )}
                <div aria-hidden="true" className={`p-1.5 rounded-lg transition-all duration-300 shrink-0 flex items-center justify-center border-2 overflow-hidden ${
                  activeTab === 'profile' ? 'bg-[#03045E] text-white border-[#03045E]' : 'bg-[#03045E] text-white border-[#03045E]'
                }`}>
                  {getHeaderImageSrc() ? (
                    <img src={getHeaderImageSrc()} alt="" className="w-3.5 h-3.5 object-cover rounded-md" />
                  ) : (
                    <span className="text-[9px] font-black leading-none">
                      {profile?.firstname?.[0] || profile?.full_name?.[0] || 'U'}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-[13px] tracking-wide font-black block leading-tight text-[#03045E] break-words">Profile</span>
                </div>
                <svg aria-hidden="true" className="w-3 h-3 shrink-0 transition-transform duration-300 text-[#03045E]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>

              <button
                onClick={() => { handleTabChange('settings') }}
                aria-label="Settings"
                aria-current={activeTab === 'settings' ? 'page' : undefined}
                className={`relative flex items-center gap-2.5 text-left pl-3 pr-2.5 py-2.5 rounded-lg font-extrabold transition-all duration-300 cursor-pointer border-2 group overflow-hidden focus:outline-none ${
                  activeTab === 'settings'
                    ? 'bg-white text-[#03045E] border-[#03045E] shadow-md'
                    : 'bg-white text-[#03045E] border-[#03045E]/25'
                }`}
              >
                {activeTab === 'settings' && (
                  <span aria-hidden="true" className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#03045E]"></span>
                )}
                <div aria-hidden="true" className="p-1.5 rounded-lg transition-all duration-300 shrink-0 flex items-center justify-center border-2 bg-[#03045E] text-white border-[#03045E]">
                  <svg aria-hidden="true" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-[13px] tracking-wide font-black block leading-tight text-[#03045E] break-words">Settings</span>
                </div>
                <svg aria-hidden="true" className="w-3 h-3 shrink-0 transition-transform duration-300 text-[#03045E]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>

              <div aria-hidden="true" className={`h-px my-0.5 ${isContrast ? 'bg-[#2C7FFF]/30' : 'bg-[#03045E]/15'}`}></div>

              {[
                { id: 'overview', label: 'Overview', icon: (
                  <svg aria-hidden="true" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
                )},
                { id: 'explore-jobs', label: 'Explore Jobs', icon: (
                  <svg aria-hidden="true" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                )},
                { id: 'tracker', label: 'Job Tracker', icon: (
                  <svg aria-hidden="true" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path></svg>
                )}
              ].map((item) => (
                <button 
                  key={item.id} 
                  onClick={() => { handleTabChange(item.id); setIsOpen(false); }} 
                  aria-label={item.label}
                  aria-current={activeTab === item.id ? 'page' : undefined}
                  className={`relative flex items-center gap-2.5 text-left pl-3 pr-2.5 py-2.5 rounded-lg font-extrabold transition-all duration-300 cursor-pointer border-2 group overflow-hidden focus:outline-none ${
                    activeTab === item.id
                      ? 'bg-white text-[#03045E] border-[#03045E] shadow-md'
                      : 'bg-white text-[#03045E] border-[#03045E]/25'
                  }`}
                >
                  {activeTab === item.id && (
                    <span aria-hidden="true" className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#03045E]"></span>
                  )}
                  <div aria-hidden="true" className="p-1.5 rounded-lg transition-all duration-300 shrink-0 flex items-center justify-center border-2 bg-[#03045E] text-white border-[#03045E]">
                    {item.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[13px] tracking-wide font-black block leading-tight text-[#03045E] break-words">{item.label}</span>
                  </div>
                  <svg aria-hidden="true" className="w-3 h-3 shrink-0 transition-transform duration-300 text-[#03045E]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              ))}

              <div aria-hidden="true" className={`h-px my-0.5 ${isContrast ? 'bg-[#2C7FFF]/30' : 'bg-[#03045E]/15'}`}></div>

              <button
                disabled={isLoggingOut}
                onClick={() => { setIsOpen(false); setShowLogoutConfirm(true); }}
                aria-label={isLoggingOut ? 'Logging out' : 'Logout'}
                className={`relative flex items-center gap-2.5 text-left pl-3 pr-2.5 py-2.5 rounded-lg font-extrabold transition-all duration-300 cursor-pointer border-2 group overflow-hidden bg-white text-[#03045E] border-[#DC2626]/40 disabled:opacity-50 focus:outline-none`}
              >
                <div aria-hidden="true" className="p-1.5 rounded-lg transition-all duration-300 shrink-0 flex items-center justify-center border-2 bg-[#DC2626] text-white border-[#DC2626]">
                  {isLoggingOut ? (
                    <svg aria-hidden="true" className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                    </svg>
                  ) : (
                    <svg aria-hidden="true" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                    </svg>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-[13px] tracking-wide font-black block leading-tight text-[#DC2626] break-words">{isLoggingOut ? 'Logging out...' : 'Logout'}</span>
                </div>
                <svg aria-hidden="true" className="w-3 h-3 shrink-0 transition-transform duration-300 text-[#DC2626]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </nav>
          </div>
        </div>
      </header>

          {/* SEPARATED SIDEBAR TOGGLE BUTTONS */}
      {showDesktopSidebar ? (
        
        /* --- CLOSE SIDEBAR BUTTON (Only exists when sidebar is OPEN) --- */
        <button
          onClick={() => setShowDesktopSidebar(false)}
          aria-label="Close sidebar"
          aria-expanded={true}
          aria-controls="sidebar-navigation"
          title="Hide navigation"
          className="hidden md:flex fixed z-40 shadow-md transition-all duration-300 cursor-pointer focus:outline-none items-center justify-center top-20 left-72 w-7 h-16 rounded-r-lg border-y-2 border-r-2 border-l-0 bg-[#f4f4f4] text-[#03045E] border-[#03045E]/20 hover:bg-white"
        >
          <svg aria-hidden="true" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>

      ) : (

        /* --- OPEN SIDEBAR BUTTON (Only exists when sidebar is CLOSED) --- */
        <button
          onClick={() => setShowDesktopSidebar(true)}
          aria-label="Open sidebar"
          aria-expanded={false}
          aria-controls="sidebar-navigation"
          title="Show navigation"
          className={`hidden md:flex fixed z-40 shadow-md transition-all duration-300 cursor-pointer focus:outline-none items-center justify-center top-[4.5rem] left-[1.125rem] w-11 h-11 rounded-lg border-2 ${
            isContrast || isDarkMode ? 'bg-black text-white border-white' : 'bg-white text-[#03045E] border-[#03045E]/15'
          }`}
        >
          <svg aria-hidden="true" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

      )}
      {/* MAIN CONTAINER - MATCHING ADMIN DASHBOARD STRUCTURE */}
          <div className={`flex flex-col md:flex-row flex-1 min-h-screen pt-10 transition-all duration-300 ${(isContrast || isDarkMode) ? 'bg-black' : ''}`}>
        
<aside id="sidebar-navigation" role="complementary" aria-label="Sidebar navigation" className={`hidden md:flex flex-col z-10 border-r-2 pb-4 justify-between shadow-sm flex-shrink-0 fixed top-16 left-0 h-[calc(100vh-4rem)] overflow-y-auto overflow-x-hidden focus:outline-none transition-all duration-300 ease-in-out ${(isContrast || isDarkMode) ? 'bg-black border-[#2C7FFF]' : 'bg-white border-[#03045E]/15'} ${showDesktopSidebar ? 'w-72 px-4 pt-10' : 'w-20 px-2 pt-16'}`}>
          <nav className="flex flex-col space-y-3 w-full" aria-label="Sidebar navigation links">
            {[
              { id: 'overview', label: 'Overview', desc: 'Your snapshot', icon: (
                <svg aria-hidden="true" className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
              )},
              { id: 'explore-jobs', label: 'Explore Jobs', desc: 'Browse openings', icon: (
                <svg aria-hidden="true" className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              )},
              { id: 'tracker', label: 'Job Tracker', desc: 'Your progress', icon: (
                <svg aria-hidden="true" className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path></svg>
              )}
            ].map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button 
                  key={item.id} 
                  onClick={() => handleTabChange(item.id)} 
                  aria-label={`${item.label}. ${item.desc}`}
                  title={!showDesktopSidebar ? item.label : undefined}
                  aria-current={isActive ? 'page' : undefined}
                  className={`relative flex items-center py-3.5 rounded-lg font-extrabold transition-all duration-300 ease-in-out capitalize cursor-pointer border-2 group overflow-hidden focus:outline-none w-full ${
                    showDesktopSidebar ? 'justify-start pl-4 pr-3.5' : 'justify-center px-0'
                  } ${
                    isActive
                      ? 'bg-white text-[#03045E] border-[#03045E] shadow-md'
                      : 'bg-white text-[#03045E] border-[#03045E]/25'
                  }`}
                >
                  {isActive && (
                    <span aria-hidden="true" className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#03045E] transition-all duration-300"></span>
                  )}
                  <div 
                    aria-hidden="true"
                    className={`p-2.5 rounded-lg transition-all duration-300 shrink-0 flex items-center justify-center border-2 ${
                      isActive
                        ? 'bg-[#03045E] text-white border-[#03045E]'
                        : 'bg-[#03045E] text-white border-[#03045E]'
                    }`}
                  >
                    {item.icon}
                  </div>
                                  <div className={`flex flex-col text-left transition-all duration-300 ease-in-out overflow-hidden whitespace-nowrap ${
                    showDesktopSidebar ? 'opacity-100 max-w-[150px] ml-3.5 flex-1' : 'opacity-0 max-w-0 ml-0 flex-none'
                  }`}>
                    <span className={`text-[0.9375rem] tracking-wide font-black truncate block leading-tight text-[#03045E]`}>{item.label}</span>
                    <span className={`text-[0.625rem] font-bold uppercase tracking-widest block mt-0.5 truncate text-[#03045E]/70`}>
                      {item.desc}
                    </span>
                  </div>
                  <svg 
                    aria-hidden="true"
                    className={`shrink-0 transition-all duration-300 ease-in-out text-[#03045E] ${
                      showDesktopSidebar ? 'w-4 h-4 opacity-100 ml-2' : 'w-0 h-0 opacity-0 ml-0'
                    }`}
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2.5" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              );
            })}
          </nav>
        </aside>

        <main role="main" aria-label="Dashboard content area" className={`flex-1 p-3 pt-6 sm:p-6 sm:pt-10 md:p-10 md:pt-14 relative min-w-0 transition-all duration-300 ease-in-out flex flex-col box-border ${showDesktopSidebar ? 'md:ml-72' : 'md:ml-20'} ${(isContrast || isDarkMode) ? 'bg-black' : ''}`}>
          <div className="flex items-start gap-4 w-full min-w-0">
            <div className="w-full flex-1 min-w-0 overflow-x-hidden">
              
              {isRejected && (
                <div 
                  role="alert"
                  aria-live="assertive"
                  aria-label={`Account Verification Failed. ${profile.rejection_reason || "Your verification document did not meet platform standards."}`}
                  className={`mb-4 p-6 sm:p-8 border-2 rounded-xl sm:rounded-2xl shadow-sm flex flex-col gap-5 animate-fadeIn transition-all`}
                  style={{
                    backgroundColor: (isContrast || isDarkMode) ? '#1a0505' : 'rgba(239, 68, 68, 0.08)',
                    borderColor: (isContrast || isDarkMode) ? '#ef4444' : '#fca5a5'
                  }}
                >
                  <div className="flex items-start gap-4">
                    <div 
                      aria-hidden="true"
                      className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{
                        backgroundColor: (isContrast || isDarkMode) ? '#ef4444' : '#fee2e2',
                        color: (isContrast || isDarkMode) ? '#000000' : '#b91c1c'
                      }}
                    >
                      <svg aria-hidden="true" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                    </div>
                    <div>
                      <h2 className="text-xl font-black tracking-tight" style={{ color: (isContrast || isDarkMode) ? '#ffffff' : '#991b1b' }}>Account Verification Failed</h2>
                      <p className="text-sm font-bold mt-0.5" style={{ color: (isContrast || isDarkMode) ? 'rgba(255,255,255,0.8)' : '#b91c1c' }}>Your platform access is currently suspended. Please review the admin feedback below.</p>
                    </div>
                  </div>
                  
                  <div 
                  className="p-5 rounded-lg sm:rounded-xl border-2 shadow-inner backdrop-blur-md transition-all"
                  style={{
                    backgroundColor: (isContrast || isDarkMode) ? 'rgba(0, 0, 0, 0.25)' : 'rgba(255, 255, 255, 0.26)',
                    borderColor: (isContrast || isDarkMode) ? 'rgba(239, 68, 68, 0.4)' : 'rgba(254, 202, 202, 0.99)'
                  }}
                >
                  <h3 className="text-xs font-black uppercase tracking-wider mb-2" style={{ color: (isContrast || isDarkMode) ? '#fca5a5' : '#b91c1c' }}>Admin Feedback</h3>
                  <p className="text-sm font-black" style={{ color: (isContrast || isDarkMode) ? '#ffffff' : '#03045E' }}>
                    {profile.rejection_reason || "Your verification document did not meet platform standards."}
                  </p>
                </div>
                  
                  <hr aria-hidden="true" style={{ borderColor: (isContrast || isDarkMode) ? 'rgba(239, 68, 68, 0.4)' : '#fca5a5' }} />
                  
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <h3 className="text-sm font-black" style={{ color: (isContrast || isDarkMode) ? '#ffffff' : '#991b1b' }}>Ready to try again?</h3>
                      {!canResubmit ? (
                        <p className="text-xs font-bold mt-1" style={{ color: (isContrast || isDarkMode) ? 'rgba(255,255,255,0.7)' : '#b91c1c' }}>
                          Due to security policies, you must wait <span className="font-black" style={{ color: (isContrast || isDarkMode) ? '#ffffff' : '#7f1d1d' }}>{daysLeft} days</span> before uploading a new document.
                        </p>
                      ) : (
                        <p className="text-xs font-bold mt-1" style={{ color: '#10b981' }}>Your cooldown period has ended. You may now resubmit your documents.</p>
                      )}
                    </div>
                    <button 
                      disabled={!canResubmit}
                      onClick={() => handleTabChange('settings')}
                      aria-label={canResubmit ? 'Go to Profile to Resubmit' : `Locked for ${daysLeft} Days`}
                      className="px-6 py-3 rounded-lg sm:rounded-xl font-black text-sm transition-all shadow-sm flex items-center gap-2 cursor-pointer focus:outline-none"
                      style={{
                        backgroundColor: canResubmit ? '#ef4444' : ((isContrast || isDarkMode) ? '#18181b' : '#fecaca'),
                        color: canResubmit ? '#ffffff' : ((isContrast || isDarkMode) ? 'rgba(255,255,255,0.4)' : '#991b1b'),
                        border: '2px solid',
                        borderColor: canResubmit ? '#ef4444' : 'transparent'
                      }}
                    >
                      {!canResubmit && <svg aria-hidden="true" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>}
                      {canResubmit ? 'Go to Profile to Resubmit' : `Locked for ${daysLeft} Days`}
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'overview' && profile && (
                <ApplicantOverview profile={profile} 
                matches={matches} 
                jobs={matches} 
                matchesCount={matches.length} 
                applications={applications} 
                setActiveTab={handleTabChange} 
                setJobFromMap={setSelectedJobFromMap} />
              )}

              {activeTab === 'explore-jobs' && profile && (
                <ApplicantExploreJobs 
                profile={profile} 
                jobs={matches} 
                applications={applications}
                refreshData={refreshData} 
                initialSelectedJob={selectedJobFromMap}
                clearJobFromMap={() => setSelectedJobFromMap(null)}/>
              )}
              
              {activeTab === 'tracker' && (
                <ApplicantJobTracker applications={applications} profile={profile} />
              )}
              
              {activeTab === 'profile' && profile && (
                <ApplicantProfile profile={profile} refreshData={refreshData} setProfile={setProfile} />
              )}
              
              {activeTab === 'settings' && profile && (
                <ApplicantAccountSettings profile={profile} />
              )}

              {activeTab === 'applicant-policy' && (
                <ApplicantPolicy onBack={() => handleTabChange('overview')} />
              )}

              {activeTab === 'applicant-terms' && (
                <ApplicantTerms onBack={() => handleTabChange('overview')} />
              )}

              {activeTab === 'applicant-contact' && (
                <ApplicantContact onBack={() => handleTabChange('overview')} />
              )}
            </div>
          </div>
        </main>
      </div>

      <div className={`transition-all duration-300 ease-in-out ${showDesktopSidebar ? 'md:ml-72' : 'md:ml-20'}`}>
        <ApplicantFooter activeTab={activeTab} setActiveTab={handleTabChange} isContrast={isContrast} />
      </div>
    </div>
  );
}