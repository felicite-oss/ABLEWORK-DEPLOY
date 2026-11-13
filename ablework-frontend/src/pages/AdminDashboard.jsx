import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import headerLogo from '../assets/LIGHT MODE.png';
import headerLogoDark from '../assets/DARK MODE.png';
import ProfileMenu from '../components/Admin/ProfileMenu';
import SettingsModal from '../components/Admin/SettingsModal';
import DarkModeToggle from '../components/Admin/DarkModeToggle';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Overview');
  const [listFilter, setListFilter] = useState('Pending'); 
  const [overviewFilter, setOverviewFilter] = useState('All');
  const [isOpen, setIsOpen] = useState(false); 
  const [stats, setStats] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [employers, setEmployers] = useState([]);
  const [applicants, setApplicants] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showDesktopSidebar, setShowDesktopSidebar] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [adminUser, setAdminUser] = useState(null);
  const [isDark, setIsDark] = useState(false);
  const [isAnalyticsExpanded, setIsAnalyticsExpanded] = useState(false);
  const [ready, setReady] = useState(false);
  
  const mainRef = useRef(null);
  const usersOverviewRef = useRef(null);
  const usersListRef = useRef(null);

  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 10;

  const [pwdModal, setPwdModal] = useState({ isOpen: false, user: null });
  const [employerModal, setEmployerModal] = useState({ isOpen: false, user: null });
  const [rejectModal, setRejectModal] = useState({ isOpen: false, userId: null, reason: '' });
  const [approveModal, setApproveModal] = useState({ isOpen: false, userId: null });
  const [disableModal, setDisableModal] = useState({ isOpen: false, userId: null });
  const [restoreModal, setRestoreModal] = useState({ isOpen: false, userId: null });
  const [confirmPopup, setConfirmPopup] = useState({ isOpen: false, type: null, userId: null, reason: null, loading: false });

  const [approveLoading, setApproveLoading] = useState(false);
  const [disableLoading, setDisableLoading] = useState(false);
  const [rejectLoading, setRejectLoading] = useState(false);
  const [restoreLoading, setRestoreLoading] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setReady(true));

    let cancelled = false;
    const forceLight = () => {
      if (cancelled) return;
      const root = document.documentElement;
      root.classList.remove('dark-mode', 'dark', 'theme-Dark');
      root.setAttribute('data-theme', 'light');
      setIsDark(false);
    };

    forceLight();
    const t1 = setTimeout(forceLight, 0);
    const t2 = setTimeout(forceLight, 50);
    const t3 = setTimeout(forceLight, 150);
    const t4 = setTimeout(forceLight, 400);

    return () => {
      cancelled = true;
      cancelAnimationFrame(id);
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') setIsAnalyticsExpanded(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    if (isAnalyticsExpanded) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isAnalyticsExpanded]);

  const handleToggleDark = () => {
    setIsDark(prev => {
      const next = !prev;
      const root = document.documentElement;
      if (next) {
        root.classList.add('dark-mode');
        root.setAttribute('data-theme', 'dark');
      } else {
        root.classList.remove('dark-mode');
        root.setAttribute('data-theme', 'light');
      }
      return next;
    });
  };

  const fetchAdminData = async (silent = false) => {
    if (!silent) setIsLoading(true);
    try {
      const statsRes = await fetch('http://localhost:5001/api/admin/stats');
      const chartRes = await fetch('http://localhost:5001/api/admin/analytics/annual');
      const empRes = await fetch('http://localhost:5001/api/admin/employers/all');
      const appRes = await fetch('http://localhost:5001/api/admin/applicants/all'); 
      
      if (statsRes.ok) setStats(await statsRes.json());
      if (chartRes.ok) setChartData(await chartRes.json());
      if (empRes.ok) setEmployers(await empRes.json());
      if (appRes.ok) setApplicants(await appRes.json());
    } catch (error) {
      console.error("Failed to load admin data");
    } finally {
      if (!silent) setIsLoading(false);
    }
  };

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (!userStr) { navigate('/login'); return; }
    const user = JSON.parse(userStr);
    if (user.role !== 'admin') {
      alert("Unauthorized Access. Admin privileges required.");
      navigate('/'); return;
    }
    setAdminUser(user);
    fetchAdminData();
  }, [navigate]);

   useEffect(() => {
    setCurrentPage(1);
    if (mainRef.current) {
      mainRef.current.scrollTop = 0;
    }
  }, [activeTab, overviewFilter, listFilter]);
  
  useEffect(() => {
    if (usersListRef.current) {
      usersListRef.current.scrollTop = 0;
    }
    if (usersOverviewRef.current && mainRef.current) {
      const container = mainRef.current;
      const target = usersOverviewRef.current;
      const containerRect = container.getBoundingClientRect();
      const targetRect = target.getBoundingClientRect();
      
      const scrollTop = container.scrollTop + targetRect.top - containerRect.top - 100;
      
      container.scrollTo({
        top: scrollTop,
        behavior: 'smooth'
      });
    }
  }, [currentPage]);

  const handleLogout = () => {
    setShowLogoutConfirm(false);
    setIsLoggingOut(true);
    setTimeout(() => {
      localStorage.removeItem('user'); 
      navigate('/login'); 
    }, 3000);
  };

  const handleVerification = async (userId, newStatus, reason = null) => {
    try {
      const res = await fetch(`http://localhost:5001/api/admin/users/${userId}/verify`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, rejection_reason: reason })
      });
      if (res.ok) {
        setRejectModal({ isOpen: false, userId: null, reason: '' }); 
        setPwdModal({ isOpen: false, user: null });
        setEmployerModal({ isOpen: false, user: null });
        setApproveModal({ isOpen: false, userId: null });
        fetchAdminData(true);
      }
    } catch (error) { 
      alert("Failed to update status."); 
    }
  };

  const confirmApproval = () => {
    if (approveModal.userId) {
      setApproveLoading(true);
      setTimeout(() => {
        handleVerification(approveModal.userId, 'Approved');
        setApproveLoading(false);
      }, 2000);
    }
  };

  const confirmDisable = () => {
    if (disableModal.userId) {
      setDisableLoading(true);
      setTimeout(() => {
        handleAccountStatus(disableModal.userId, 'Disabled');
        setDisableLoading(false);
      }, 2000);
    }
  };

  const confirmRestore = () => {
    if (restoreModal.userId) {
      setRestoreLoading(true);
      setTimeout(() => {
        handleAccountStatus(restoreModal.userId, 'Active');
        setRestoreLoading(false);
      }, 2000);
    }
  };

  const submitRejection = () => {
    if (!rejectModal.reason.trim()) {
      alert("Please provide a reason for rejection.");
      return;
    }
    setConfirmPopup({ isOpen: true, type: 'reject', userId: rejectModal.userId, reason: rejectModal.reason, loading: false });
  };

  const executeConfirmedAction = async () => {
    const { type, userId, reason } = confirmPopup;
    setConfirmPopup(prev => ({ ...prev, loading: true }));
    await new Promise(r => setTimeout(r, 400));
    try {
      if (type === 'approve') {
        await handleVerification(userId, 'Approved');
      } else if (type === 'reject') {
        await handleVerification(userId, 'Rejected', reason);
      } else if (type === 'disable') {
        await handleAccountStatus(userId, 'Disabled');
      } else if (type === 'restore') {
        await handleAccountStatus(userId, 'Active');
      } else if (type === 'cancel') {
        setRejectModal({ isOpen: false, userId: null, reason: '' });
      }
    } finally {
      setConfirmPopup({ isOpen: false, type: null, userId: null, reason: null, loading: false });
    }
  };

  const handleAccountStatus = async (userId, newStatus) => {
    try {
      const res = await fetch(`http://localhost:5001/api/admin/users/${userId}/account-status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ account_status: newStatus })
      });
      if (res.ok) {
        setDisableModal({ isOpen: false, userId: null });
        setRestoreModal({ isOpen: false, userId: null });
        fetchAdminData(true);
      }
    } catch (error) { alert("Failed to update account status."); }
  };

  const filterList = (list) => {
    return list.filter(item => {
      if (listFilter === 'Disabled') return item.account_status === 'Disabled';
      if (item.account_status === 'Disabled') return false;
      return item.verification_status === listFilter;
    });
  };

  const handleDohPortalLaunch = (e) => {
    e.preventDefault();
    const popupWidth = 650; 
    const popupHeight = window.screen.availHeight;
    const leftPosition = window.screen.availWidth - popupWidth;
    window.open(
      'https://pwd.doh.gov.ph/tbl_pwd_id_verificationlist.php',
      'DOH_Verification_Window',
      `width=${popupWidth},height=${popupHeight},left=${leftPosition},top=0,menubar=no,toolbar=no,location=yes,status=no,scrollbars=yes,resizable=yes`
    );
  };

  const allUsers = [...employers.map(e => ({ ...e, userType: 'Employer' })), ...applicants.map(a => ({ ...a, userType: 'Applicant' }))];

  const filteredOverviewUsers = allUsers.filter(user => {
    if (overviewFilter === 'All') return true;
    if (overviewFilter === 'Disabled') return user.account_status === 'Disabled';
    if (user.account_status === 'Disabled') return false;
    return user.verification_status === overviewFilter;
  });

  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredOverviewUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredOverviewUsers.length / usersPerPage);

  const txtMain = isDark ? 'text-white' : 'text-[#03045E]';
  const txtMuted = isDark ? 'text-white/70' : 'text-[#03045E]/70';
  const cardBg = isDark ? 'bg-black' : 'bg-white';
  const surfaceBg = isDark ? 'bg-black' : 'bg-[#f4f4f4]';
  const bdrMain = isDark ? 'border-white/20' : 'border-[#03045E]/15';

  const pendingCount = (stats?.pendingEmployers || 0) + (stats?.pendingApplicants || 0);

  const confirmBarColor = confirmPopup.type === 'approve' ? 'bg-[#10B981]' :
    confirmPopup.type === 'restore' ? 'bg-[#03045e]' :
    confirmPopup.type === 'cancel' ? 'bg-[#f59e0b]' : 'bg-[#DC2626]';

  const confirmAccentBorder = confirmPopup.type === 'approve' ? 'border-[#10B981]' :
    confirmPopup.type === 'restore' ? 'border-[#2C7FFF]' :
    confirmPopup.type === 'cancel' ? 'border-[#f59e0b]' : 'border-[#DC2626]';

  const confirmAccentText = confirmPopup.type === 'approve' ? 'text-[#10B981]' :
    confirmPopup.type === 'restore' ? 'text-[#2C7FFF]' :
    confirmPopup.type === 'cancel' ? 'text-[#f59e0b]' : 'text-[#DC2626]';

  const confirmAccentBg = confirmPopup.type === 'approve' ? 'bg-[#10B981]' :
    confirmPopup.type === 'restore' ? 'bg-[#2C7FFF]' :
    confirmPopup.type === 'cancel' ? 'bg-[#f59e0b]' : 'bg-[#DC2626]';

  return (
    <div className={`min-h-screen flex flex-col ${isDark ? 'bg-black text-white' : 'bg-[#f4f4f4] text-[#03045E]'} selection:bg-[#2C7FFF] selection:text-white relative overflow-x-clip w-full max-w-[100vw] no-scrollbar ${ready ? 'transition-colors duration-300' : 'transition-none'}`}>
      
      {/* UPDATED LOADING SCREEN */}
      {isLoading && (
        <div
          className="fixed inset-0 z-[9999999] flex items-center justify-center p-4 backdrop-blur-[1px] animate-in fade-in transition-all duration-300"
          style={{ backgroundColor: isDark ? 'rgba(0, 0, 0, 0.75)' : 'rgba(72, 71, 71, 0.6)', filter: 'none' }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="loading-title"
          aria-describedby="loading-desc"
          tabIndex="-1"
        >
          <div className={`border-2 px-6 py-8 sm:px-8 sm:py-10 rounded-xl sm:rounded-2xl shadow-[0_20px_50px_rgba(3,4,94,0.15)] flex flex-col items-center max-w-sm w-full mx-auto transform animate-in fade-in zoom-in-95 duration-300 ${isDark ? 'bg-black border-[#2C7FFF]' : 'bg-white border-[#03045E]/20'}`}>
            <div className="relative w-16 h-16 flex items-center justify-center mb-5">
              <div className="absolute inset-0 rounded-full border-4 border-[#2C7FFF]/30 animate-pulse"></div>
              <div className="absolute inset-0 rounded-full border-4 border-t-[#2C7FFF] border-r-transparent border-b-[#03045E] border-l-transparent animate-spin"></div>
              <div className={`w-6 h-6 rounded-full shadow-md animate-ping opacity-75 absolute ${isDark ? 'bg-white' : 'bg-[#03045E]'}`}></div>
            </div>
            <h3 id="loading-title" className={`text-lg font-black tracking-tight text-center mb-1 ${isDark ? 'text-white' : 'text-[#03045E]'}`}>Loading Workspace</h3>
            <p id="loading-desc" className={`text-xs text-center font-bold ${isDark ? 'text-white/80' : 'text-[#03045E]/80'}`}>Preparing your dashboard and real-time updates...</p>
          </div>
        </div>
      )}

      {/* UPDATED LOGGING OUT SCREEN */}
      {isLoggingOut && (
        <div
          className="fixed inset-0 z-[9999999] flex items-center justify-center p-4 backdrop-blur-[1px] animate-in fade-in transition-all duration-300"
          style={{ backgroundColor: isDark ? 'rgba(0, 0, 0, 0.75)' : 'rgba(72, 71, 71, 0.6)', filter: 'none' }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="logging-title"
          aria-describedby="logging-desc"
          tabIndex="-1"
        >
          <div className={`relative w-full max-w-md rounded-xl sm:rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 ${isDark ? 'bg-black border-2 border-white' : 'bg-white border-2 border-[#2C7FFF]'}`}>
            <div className="h-1.5 sm:h-2 w-full bg-[#2C7FFF]" />

            <div className="relative px-4 pt-6 pb-5 sm:px-8 sm:pt-10 sm:pb-8 flex flex-col items-center text-center">
              <div className="relative mb-3 sm:mb-5">
                <div className={`w-14 h-14 sm:w-24 sm:h-24 rounded-full flex items-center justify-center ${isDark ? 'bg-transparent border-4 border-white' : 'bg-transparent border-4 border-[#2C7FFF]'}`}>
                  <svg className={`w-7 h-7 sm:w-12 sm:h-12 animate-spin ${isDark ? 'text-white' : 'text-[#2C7FFF]'}`} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                  </svg>
                </div>
                <div className={`absolute -top-1 -right-1 w-4 h-4 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-[9px] sm:text-xs font-bold ${isDark ? 'bg-white text-black' : 'bg-[#03045E] text-white'}`}>✓</div>
              </div>

              <span className={`inline-flex items-center gap-1 sm:gap-1.5 px-2.5 py-0.5 sm:px-4 sm:py-1.5 rounded-full text-[8px] sm:text-[10px] font-black uppercase tracking-widest mb-2.5 sm:mb-4 border-2 ${isDark ? 'text-white bg-transparent border-white' : 'text-[#2C7FFF] bg-transparent border-[#2C7FFF]'}`}>
                <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-[#10B981]"></span>
                Notice
              </span>

              <h2 id="logging-title" className={`text-lg sm:text-3xl font-black tracking-tight mb-1 sm:mb-2 ${isDark ? 'text-white' : 'text-[#03045E]'}`}>
                Logging Out...
              </h2>
              <p id="logging-desc" className={`text-[11px] sm:text-sm font-bold leading-relaxed mb-5 sm:mb-8 max-w-xs ${isDark ? 'text-white/80' : 'text-[#03045E]/80'}`}>
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
      )}

      {/* UPDATED LOGOUT CONFIRM MODAL */}
      {showLogoutConfirm && (
        <div
          className="fixed inset-0 z-[9999999] flex items-center justify-center p-4 backdrop-blur-[1px] animate-in fade-in transition-all duration-300"
          style={{ backgroundColor: isDark ? 'rgba(0, 0, 0, 0.75)' : 'rgba(72, 71, 71, 0.6)', filter: 'none' }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="logout-title"
          aria-describedby="logout-desc"
          tabIndex="-1"
        >
          <div
            className={`relative w-full max-w-md rounded-xl sm:rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 focus:outline-none ${isDark ? 'bg-black border-2 border-white' : 'bg-white border-2 border-[#2C7FFF]'}`}
          >
            <div className="h-1.5 sm:h-2 w-full bg-[#2C7FFF]" />

            <div className="relative px-4 pt-6 pb-5 sm:px-8 sm:pt-10 sm:pb-8 flex flex-col items-center text-center">
              <div className="relative mb-3 sm:mb-5">
                <div className={`w-14 h-14 sm:w-24 sm:h-24 rounded-full flex items-center justify-center ${isDark ? 'bg-transparent border-4 border-white' : 'bg-transparent border-4 border-[#2C7FFF]'}`}>
                  <svg className={`w-7 h-7 sm:w-12 sm:h-12 ${isDark ? 'text-white' : 'text-[#2C7FFF]'}`} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                  </svg>
                </div>
                <div className={`absolute -top-1 -right-1 w-4 h-4 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-[9px] sm:text-xs font-bold ${isDark ? 'bg-white text-black' : 'bg-[#03045E] text-white'}`}>!</div>
              </div>

              <span tabIndex="0" className={`inline-flex items-center gap-1 sm:gap-1.5 px-2.5 py-0.5 sm:px-4 sm:py-1.5 rounded-full text-[8px] sm:text-[10px] font-black uppercase tracking-widest mb-2.5 sm:mb-4 border-2 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2C7FFF] focus-visible:ring-offset-2 ${isDark ? 'text-white bg-transparent border-white' : 'text-[#2C7FFF] bg-transparent border-[#2C7FFF]'}`}>
                <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-[#10B981]"></span>
                Notice
              </span>

              <h2 id="logout-title" tabIndex="0" className={`text-lg sm:text-3xl font-black tracking-tight mb-1 sm:mb-2 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2C7FFF] focus-visible:ring-offset-2 rounded-lg p-1 -m-1 w-fit ${isDark ? 'text-white' : 'text-[#03045E]'}`}>
                Are you sure to logout?
              </h2>
              <p id="logout-desc" tabIndex="0" className={`text-[11px] sm:text-sm font-bold leading-relaxed mb-5 sm:mb-8 max-w-xs transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2C7FFF] focus-visible:ring-offset-2 rounded-lg p-1 -m-1 w-fit ${isDark ? 'text-white/80' : 'text-[#03045E]/80'}`}>
                You will be signed out of your account and returned to the login page.
              </p>

              <div className="flex flex-row gap-2 sm:gap-3 w-full">
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  aria-label="Cancel logout and stay on page"
                  className="flex-1 py-2.5 sm:py-4 rounded-lg sm:rounded-xl font-black text-[11px] sm:text-sm uppercase tracking-wider transition-all duration-300 cursor-pointer bg-transparent border-2 focus:outline-none"
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

      {confirmPopup.isOpen && (
        <div
          className="fixed inset-0 z-[99999999] flex items-center justify-center p-4 backdrop-blur-[1px] animate-in fade-in transition-all duration-300"
          style={{ backgroundColor: 'rgba(72, 71, 71, 0.6)', filter: 'none' }}
        >
          <div className={`relative w-full max-w-md rounded-xl sm:rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 ${isDark ? 'bg-black border-white' : `bg-white ${confirmAccentBorder}`} border-2`}>
            <div className={`h-2 w-full ${isDark ? 'bg-white' : confirmBarColor}`} />

            <div className="relative px-8 pt-10 pb-8 flex flex-col items-center text-center">
              <div className="relative mb-5">
                <div className={`w-24 h-24 rounded-full flex items-center justify-center bg-transparent border-4 ${isDark ? 'border-white' : confirmAccentBorder}`}>
                  {confirmPopup.type === 'approve' && (
                    <svg className={`w-12 h-12 ${isDark ? 'text-white' : confirmAccentText}`} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )}
                  {confirmPopup.type === 'reject' && (
                    <svg className={`w-12 h-12 ${isDark ? 'text-white' : confirmAccentText}`} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )}
                  {confirmPopup.type === 'disable' && (
                    <svg className={`w-12 h-12 ${isDark ? 'text-white' : confirmAccentText}`} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                    </svg>
                  )}
                  {confirmPopup.type === 'restore' && (
                    <svg className={`w-12 h-12 ${isDark ? 'text-white' : confirmAccentText}`} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  )}
                  {confirmPopup.type === 'cancel' && (
                    <svg className={`w-12 h-12 ${isDark ? 'text-white' : confirmAccentText}`} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  )}
                </div>
                <div className={`absolute -top-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${isDark ? 'bg-white text-black' : 'bg-[#03045E] text-white'}`}>!</div>
              </div>

              <span className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest mb-4 border-2 ${isDark ? 'text-white bg-transparent border-white' : `bg-transparent ${confirmAccentBorder} ${confirmAccentText}`}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${isDark ? 'bg-white' : confirmAccentBg}`}></span>
                Notice
              </span>

              <h2 className={`text-3xl font-black tracking-tight mb-2 ${txtMain}`}>
                {confirmPopup.type === 'approve' ? 'Approve this account?' :
                 confirmPopup.type === 'reject' ? 'Reject this application?' :
                 confirmPopup.type === 'disable' ? 'Disable this account?' :
                 confirmPopup.type === 'restore' ? 'Restore this account?' :
                 'Cancel this action?'}
              </h2>
              <p className={`text-sm font-bold leading-relaxed mb-8 max-w-xs ${txtMuted}`}>
                {confirmPopup.type === 'approve' ? 'This user will be granted full access to the platform.' :
                 confirmPopup.type === 'reject' ? 'The user will be notified and placed on a 7-day reapplication cooldown.' :
                 confirmPopup.type === 'disable' ? 'This user will immediately lose access to the platform.' :
                 confirmPopup.type === 'restore' ? 'This user will regain access to the platform.' :
                 'Your input will be discarded and nothing will be saved.'}
              </p>

              <div className="flex flex-row gap-3 w-full">
                <button
                  onClick={() => setConfirmPopup({ isOpen: false, type: null, userId: null, reason: null, loading: false })}
                  disabled={confirmPopup.loading}
                  className={`flex-1 py-4 rounded-xl font-black text-sm uppercase tracking-wider transition-all duration-300 cursor-pointer bg-transparent border-2 disabled:opacity-50 ${isDark ? 'text-white border-white hover:bg-white hover:text-black' : 'text-[#03045E] border-[#03045E]'}`}
                >
                  No, Cancel
                </button>
                <button
                  onClick={executeConfirmedAction}
                  disabled={confirmPopup.loading}
                  className={`flex-1 py-4 rounded-xl font-black text-sm uppercase tracking-wider transition-all duration-300 cursor-pointer bg-transparent border-2 disabled:opacity-70 flex items-center justify-center gap-2 ${isDark ? 'text-white border-white hover:bg-white hover:text-black' : `${confirmAccentText} ${confirmAccentBorder}`}`}
                >
                  {confirmPopup.loading ? (
                    <>
                      <svg className="w-4 h-4 animate-spin shrink-0" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                      </svg>
                      Processing...
                    </>
                  ) : (
                    confirmPopup.type === 'approve' ? 'Yes, Approve' :
                    confirmPopup.type === 'reject' ? 'Yes, Reject' :
                    confirmPopup.type === 'disable' ? 'Yes, Disable' :
                    confirmPopup.type === 'restore' ? 'Yes, Restore' :
                    'Yes, Cancel'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <header className={`w-full ${cardBg} border-b-2 ${bdrMain} fixed top-0 left-0 z-50 transition-all duration-300 shadow-sm`}>
        <div className="w-full h-14 sm:h-16 pl-3 pr-3 sm:pl-4 sm:pr-4 md:pr-8 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3 md:gap-6 min-w-0 flex-shrink overflow-hidden">
            <div className="flex items-center flex-shrink min-w-0 cursor-pointer overflow-hidden py-1" onClick={() => setActiveTab('Overview')}>
              <img
                src={isDark ? headerLogoDark : headerLogo}
                alt="AbleWork Logo"
                className="h-10 sm:h-12 md:h-14 w-auto object-contain max-h-full hover:opacity-95 transition-opacity"
              />
            </div>
          </div>

          <div className="flex items-center gap-1 sm:gap-2 md:gap-3 flex-shrink-0 relative z-[60]">
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowNotifications((prev) => !prev)}
                aria-label="Notifications"
                aria-pressed={showNotifications}
                className={`relative flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-lg ${cardBg} ${txtMain} border-2 ${bdrMain} shadow-sm cursor-pointer transition-all duration-200 shrink-0`}
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {pendingCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-[#DC2626] text-white text-[9px] font-black flex items-center justify-center border-2 border-white">
                    {pendingCount > 99 ? '99+' : pendingCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)}></div>
                  <div className={`fixed sm:absolute right-3 sm:right-0 left-3 sm:left-auto top-16 sm:top-full sm:mt-3 w-auto sm:w-80 rounded-xl sm:rounded-2xl border-2 shadow-[0_20px_50px_rgba(3,4,94,0.25)] overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200 max-h-[calc(100vh-5rem)] overflow-y-auto ${isDark ? 'bg-black border-white' : 'bg-white border-[#03045E]/20'}`}>
                    <div className={`px-4 py-3 border-b-2 ${isDark ? 'border-white/20' : 'border-[#03045E]/10'}`}>
                      <h3 className={`text-sm font-black tracking-tight ${txtMain}`}>Notifications</h3>
                      <p className={`text-[10px] font-bold ${txtMuted}`}>
                        {pendingCount > 0 ? `${pendingCount} pending item${pendingCount !== 1 ? 's' : ''}` : 'You are all caught up'}
                      </p>
                    </div>
                    <div className="p-3">
                      {pendingCount > 0 ? (
                        <div className="flex flex-col gap-2">
                          {stats?.pendingEmployers > 0 && (
                            <button
                              type="button"
                              onClick={() => {
                                setActiveTab('Employers');
                                setListFilter('Pending');
                                setShowNotifications(false);
                              }}
                              className={`w-full text-left p-3 rounded-lg border-2 transition-all cursor-pointer ${isDark ? 'bg-black border-white/20 hover:border-white' : 'bg-[#f4f4f4] border-[#f59e0b]/30 hover:border-[#f59e0b]'}`}
                            >
                              <div className="flex items-center gap-3">
                                <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 border-2 ${isDark ? 'bg-black text-white border-white/40' : 'bg-[#FEF3C7] text-[#B45309] border-[#f59e0b]'}`}>
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                  </svg>
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className={`text-xs font-black ${txtMain}`}>Pending Employers</p>
                                  <p className={`text-[10px] font-bold ${txtMuted}`}>{stats.pendingEmployers} awaiting verification</p>
                                </div>
                              </div>
                            </button>
                          )}
                          {stats?.pendingApplicants > 0 && (
                            <button
                              type="button"
                              onClick={() => {
                                setActiveTab('Applicants');
                                setListFilter('Pending');
                                setShowNotifications(false);
                              }}
                              className={`w-full text-left p-3 rounded-lg border-2 transition-all cursor-pointer ${isDark ? 'bg-black border-white/20 hover:border-white' : 'bg-[#f4f4f4] border-[#f59e0b]/30 hover:border-[#f59e0b]'}`}
                            >
                              <div className="flex items-center gap-3">
                                <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 border-2 ${isDark ? 'bg-black text-white border-white/40' : 'bg-[#FEF3C7] text-[#B45309] border-[#f59e0b]'}`}>
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                  </svg>
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className={`text-xs font-black ${txtMain}`}>Pending Applicants</p>
                                  <p className={`text-[10px] font-bold ${txtMuted}`}>{stats.pendingApplicants} awaiting verification</p>
                                </div>
                              </div>
                            </button>
                          )}
                        </div>
                      ) : (
                        <div className="py-6 flex flex-col items-center text-center">
                          <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-2 border-2 ${isDark ? 'bg-white/10 text-white border-white/30' : 'bg-[#10B981]/15 text-[#10B981] border-[#10B981]/30'}`}>
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                          <p className={`text-xs font-black ${txtMain}`}>All caught up!</p>
                          <p className={`text-[10px] font-bold mt-0.5 ${txtMuted}`}>No pending verifications</p>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="hidden md:block">
              <DarkModeToggle isDark={isDark} onToggle={handleToggleDark} />
            </div>

            <div className="hidden md:block">
              <ProfileMenu
                adminUser={adminUser}
                isLoggingOut={isLoggingOut}
                onLogoutClick={() => setShowLogoutConfirm(true)}
                onSettingsClick={() => setShowSettings(true)}
                onProfileClick={() => setShowSettings(true)}
                 isDark={isDark}
              />
            </div>

            <button
              className={`md:hidden relative z-[60] flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-lg ${cardBg} text-[#03045E] border-2 ${bdrMain} shadow-sm cursor-pointer transition-all duration-200 shrink-0`}
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? (
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        <div
          className={`md:hidden absolute top-full left-0 w-full overflow-hidden transition-all duration-300 ease-in-out ${cardBg} border-b-2 ${bdrMain} z-40 ${
            isOpen ? 'max-h-[600px] opacity-100 shadow-xl' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="w-full">
            <nav className={`flex flex-col px-2.5 pt-2.5 pb-2.5 gap-2 sm:px-3 sm:pt-3 sm:pb-3 sm:gap-2.5 ${isDark ? 'text-white' : 'text-[#03045E]'}`}>
              {[
                { id: 'Overview', label: 'Overview', desc: 'Dashboard summary', icon: (
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
                )},
                { id: 'Employers', label: 'Employers', desc: 'Manage companies', icon: (
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
                )},
                { id: 'Applicants', label: 'Applicants', desc: 'Manage job seekers', icon: (
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                )}
              ].map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => { 
                      setActiveTab(tab.id); 
                      setListFilter('Pending'); 
                      setIsOpen(false); 
                    }}
                    className={`relative flex items-center gap-2.5 text-left pl-3 pr-2.5 py-2.5 rounded-xl font-extrabold transition-all duration-300 cursor-pointer border-2 group overflow-hidden ${
                      isActive
                        ? `${isDark ? 'bg-black text-white border-white' : 'bg-white text-[#03045E] border-[#03045E]'} shadow-md`
                        : `${isDark ? 'bg-black text-white border-white/25' : 'bg-white text-[#03045E] border-[#03045E]/25'}`
                    }`}
                  >
                    {isActive && (
                      <span className={`absolute left-0 top-0 bottom-0 w-1.5 ${isDark ? 'bg-white' : 'bg-[#03045E]'}`}></span>
                    )}
                    <div className={`p-1.5 rounded-lg transition-all duration-300 shrink-0 flex items-center justify-center border-2 ${isDark ? 'bg-white text-black border-white' : 'bg-[#03045E] text-white border-[#03045E]'}`}>
                      {tab.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className={`text-[13px] tracking-wide font-black block leading-tight break-words ${isDark ? 'text-white' : 'text-[#03045E]'}`}>{tab.label}</span>
                    </div>
                    <svg className={`w-3 h-3 shrink-0 transition-transform duration-300 ${isDark ? 'text-white' : 'text-[#03045E]'}`} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                );
              })}
              <div className={`h-px my-0.5 ${isDark ? 'bg-white/15' : 'bg-[#03045E]/15'}`}></div>
              <div className="flex items-center justify-between px-3 py-2.5">
                <span className={`text-[13px] tracking-wide font-black ${isDark ? 'text-white' : 'text-[#03045E]'}`}>Dark Mode</span>
                <DarkModeToggle isDark={isDark} onToggle={handleToggleDark} />
              </div>
              <div className={`h-px my-0.5 ${isDark ? 'bg-white/15' : 'bg-[#03045E]/15'}`}></div>
              <button
                disabled={isLoggingOut}
                onClick={() => { setIsOpen(false); setShowLogoutConfirm(true); }}
                className={`relative flex items-center gap-2.5 text-left pl-3 pr-2.5 py-2.5 rounded-xl font-extrabold transition-all duration-300 cursor-pointer border-2 group overflow-hidden ${isDark ? 'bg-black text-white border-white/40' : 'bg-white text-[#03045E] border-[#DC2626]/40'} disabled:opacity-50`}
              >
                <div className={`p-1.5 rounded-lg transition-all duration-300 shrink-0 flex items-center justify-center border-2 ${isDark ? 'bg-white text-black border-white' : 'bg-[#DC2626] text-white border-[#DC2626]'}`}>
                  {isLoggingOut ? (
                    <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                    </svg>
                  ) : (
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                    </svg>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <span className={`text-[13px] tracking-wide font-black block leading-tight break-words ${isDark ? 'text-white' : 'text-[#DC2626]'}`}>{isLoggingOut ? 'Logging out...' : 'Logout'}</span>
                </div>
                <svg className={`w-3 h-3 shrink-0 transition-transform duration-300 ${isDark ? 'text-white' : 'text-[#DC2626]'}`} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
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
          className="hidden md:flex fixed z-[60] shadow-md transition-all duration-300 cursor-pointer focus:outline-none items-center justify-center top-20 left-72 w-7 h-16 rounded-r-lg border-y-2 border-r-2 border-l-0 bg-[#f4f4f4] text-[#03045E] border-[#03045E]/20 hover:bg-white"
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
          className={`hidden md:flex fixed z-[60] shadow-md transition-all duration-300 cursor-pointer focus:outline-none items-center justify-center top-[4.5rem] left-[1.125rem] w-11 h-11 rounded-lg border-2 ${
            isDark ? 'bg-black text-white border-white' : 'bg-white text-[#03045E] border-[#03045E]/15'
          }`}
        >
          <svg aria-hidden="true" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

      )}
      <div className={`flex flex-col md:flex-row flex-1 min-h-screen pt-20 transition-all duration-300 ${isDark ? 'bg-black' : ''}`}>
        
        <aside id="sidebar-navigation" role="complementary" aria-label="Sidebar navigation" className={`hidden md:flex flex-col z-10 border-r-2 shadow-sm flex-shrink-0 fixed top-16 left-0 h-[calc(100vh-4rem)] focus:outline-none transition-all duration-300 ease-in-out ${isDark ? 'bg-black border-[#2C7FFF]' : 'bg-white border-[#03045E]/15'} ${showDesktopSidebar ? 'w-72 px-4' : 'w-20 px-2'}`}>
          <div className="w-full flex flex-col h-full min-w-0">
        <nav className={`flex-1 flex flex-col space-y-3 w-full pb-4 overflow-y-auto overflow-x-hidden ${showDesktopSidebar ? 'pt-10' : 'pt-16'}`} aria-label="Sidebar navigation links">
              {[
                { id: 'Overview', label: 'Overview', desc: 'Dashboard summary' },
                { id: 'Employers', label: 'Employers', desc: 'Manage companies' },
                { id: 'Applicants', label: 'Applicants', desc: 'Manage job seekers' }
              ].map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button 
                    key={tab.id} 
                    onClick={() => { setActiveTab(tab.id); setListFilter('Pending'); }} 
                    title={!showDesktopSidebar ? tab.label : undefined}
                    className={`relative flex items-center py-3.5 rounded-xl font-extrabold transition-all duration-300 capitalize cursor-pointer border-2 group overflow-hidden ${
                      showDesktopSidebar ? 'justify-start pl-4 pr-3.5' : 'justify-center px-0'
                    } ${
                      isActive
                        ? `${isDark ? 'bg-black text-white border-white' : 'bg-white text-[#03045E] border-[#03045E]'} shadow-md`
                        : `${isDark ? 'bg-black text-white border-white/25' : 'bg-white text-[#03045E] border-[#03045E]/25'}`
                    }`}
                  >
                    {isActive && (
                      <span className={`absolute left-0 top-0 bottom-0 w-1.5 ${isDark ? 'bg-white' : 'bg-[#03045E]'}`}></span>
                    )}
                    <div 
                      className={`p-2.5 rounded-lg transition-all duration-300 shrink-0 flex items-center justify-center border-2 ${isDark ? 'bg-white text-black border-white' : 'bg-[#03045E] text-white border-[#03045E]'}`}
                    >
                      {tab.id === 'Overview' && (
                        <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
                      )}
                      {tab.id === 'Employers' && (
                        <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
                      )}
                      {tab.id === 'Applicants' && (
                        <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                      )}
                    </div>
                    <div className={`flex flex-col text-left transition-all duration-300 ease-in-out overflow-hidden whitespace-nowrap ${
                      showDesktopSidebar ? 'opacity-100 max-w-[150px] ml-3.5 flex-1' : 'opacity-0 max-w-0 ml-0 flex-none'
                    }`}>
                      <span className={`text-[15px] tracking-wide font-black truncate block leading-tight ${isDark ? 'text-white' : 'text-[#03045E]'}`}>{tab.label}</span>
                      <span className={`text-[10px] font-bold uppercase tracking-widest block mt-0.5 truncate ${isDark ? 'text-white/70' : 'text-[#03045E]/70'}`}>{tab.desc}</span>
                    </div>
                    <svg 
                      className={`shrink-0 transition-transform duration-300 ${isDark ? 'text-white' : 'text-[#03045E]'} ${
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
              
              <div className={`mt-auto pt-6 border-t-2 ${isDark ? 'border-white/30' : 'border-[#2C7FFF]/30'} ${showDesktopSidebar ? 'px-2 flex items-center justify-between' : 'flex flex-col items-center justify-center'}`}>
                <span className={`text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-white/40' : 'text-[#03045E]/40'} ${!showDesktopSidebar ? 'hidden' : ''}`}>AbleWork Admin</span>
                <span className={`text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-white/40' : 'text-[#03045E]/40'}`}>v1.0</span>
              </div>
            </nav>
          </div>
        </aside>

           <main ref={mainRef} role="main" aria-label="Dashboard content area" className={`flex-1 px-3 pb-3 sm:px-6 sm:pb-6 md:px-10 md:pb-10 relative min-w-0 transition-all duration-300 ease-in-out flex flex-col box-border h-[calc(100vh-5rem)] overflow-y-auto ${showDesktopSidebar ? 'md:ml-72' : 'md:ml-20'} ${isDark ? 'bg-black' : ''}`}>
          {showSettings ? (
            <SettingsModal
              isOpen={showSettings}
              onClose={() => setShowSettings(false)}
              adminUser={adminUser}
            />
          ) : (
          <>
                 <div className={`sticky top-0 z-40 ${isDark ? 'bg-black' : 'bg-[#f4f4f4]'} flex flex-col -mx-3 sm:-mx-6 md:-mx-10 px-3 sm:px-6 md:px-10 pt-2 sm:pt-4 md:pt-6 pb-2`}>
            <div className={`pt-0 pb-5 border-b-2 ${isDark ? 'border-white/20' : 'border-[#03045E]/15'} flex flex-col sm:flex-row sm:items-center justify-between gap-4 pl-0`}>
              <div>
                <h1 className={`text-3xl font-black tracking-tight ${txtMain}`}>Admin Control Center</h1>
                <p className={`text-sm font-bold mt-1 ${txtMuted}`}>
                  Manage platform integrity, verify documents, and control account access securely.
                </p>
              </div>
            </div>

            {(activeTab === 'Employers' || activeTab === 'Applicants') && (
              <div className="pt-6 pb-2">
                <div className={`flex items-center gap-0.5 sm:gap-2 ${cardBg} p-1 sm:p-4 rounded-lg sm:rounded-xl border-2 ${bdrMain} w-full shadow-md overflow-hidden`}>
                  {['Pending', 'Approved', 'Rejected', 'Disabled'].map(filter => {
                    const targetList = activeTab === 'Employers' ? employers : applicants;
                    let count = 0;
                    if (filter === 'Disabled') {
                      count = targetList.filter(i => i.account_status === 'Disabled').length;
                    } else {
                      count = targetList.filter(i => i.verification_status === filter && i.account_status !== 'Disabled').length;
                    }

                    let activeBg = isDark ? '#ffffff' : '#03045E';
                    let activeText = isDark ? '#000000' : '#ffffff';
                    let inactiveText = isDark ? '#ffffff' : '#03045E';
                    let badgeActiveBg = isDark ? 'rgba(0,0,0,0.15)' : '#2C7FFF';
                    let badgeActiveText = isDark ? '#000000' : '#ffffff';
                    let badgeInactiveBg = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(3,4,94,0.1)';
                    let badgeInactiveText = isDark ? '#ffffff' : '#03045E';

                    if (filter === 'Pending') {
                      activeBg = '#f59e0b';
                      activeText = '#ffffff';
                      inactiveText = isDark ? '#fbbf24' : '#b45309';
                      badgeActiveBg = 'rgba(255,255,255,0.25)';
                      badgeActiveText = '#ffffff';
                      badgeInactiveBg = 'rgba(245,158,11,0.15)';
                      badgeInactiveText = isDark ? '#fbbf24' : '#b45309';
                    } else if (filter === 'Approved') {
                      activeBg = '#10b981';
                      activeText = '#ffffff';
                      inactiveText = isDark ? '#34d399' : '#047857';
                      badgeActiveBg = 'rgba(255,255,255,0.25)';
                      badgeActiveText = '#ffffff';
                      badgeInactiveBg = 'rgba(16,185,129,0.15)';
                      badgeInactiveText = isDark ? '#34d399' : '#047857';
                    } else if (filter === 'Rejected' || filter === 'Disabled') {
                      activeBg = '#dc2626';
                      activeText = '#ffffff';
                      inactiveText = isDark ? '#f87171' : '#b91c1c';
                      badgeActiveBg = 'rgba(255,255,255,0.25)';
                      badgeActiveText = '#ffffff';
                      badgeInactiveBg = 'rgba(220,38,38,0.15)';
                      badgeInactiveText = isDark ? '#f87171' : '#b91c1c';
                    }

                    const isActive = listFilter === filter;

                    return (
                      <button
                        key={filter}
                        onClick={() => setListFilter(filter)}
                        className={`flex-1 min-w-0 px-0.5 sm:px-4 py-1.5 sm:py-3 rounded sm:rounded-lg text-[8px] sm:text-sm font-black transition-all cursor-pointer flex items-center justify-center gap-0.5 sm:gap-2 tracking-tight sm:tracking-normal border-2 ${isActive && isDark ? 'border-white/20' : 'border-transparent'}`}
                        style={{
                          backgroundColor: isActive ? activeBg : 'transparent',
                          color: isActive ? activeText : inactiveText
                        }}
                      >
                        <span>{filter}</span>
                        <span
                          className="px-1 sm:px-2 py-0.5 rounded-full text-[7px] sm:text-[10px] font-black tracking-wider inline-flex items-center justify-center min-w-[12px] sm:min-w-[24px] shrink-0"
                          style={{
                            backgroundColor: isActive ? badgeActiveBg : badgeInactiveBg,
                            color: isActive ? badgeActiveText : badgeInactiveText
                          }}
                        >
                          {count}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          {activeTab === 'Overview' && stats && (
            <div className="flex flex-col gap-6 animate-in fade-in duration-300 mt-6">
              <div className="flex flex-col lg:flex-row gap-6">
                <div className="w-full lg:w-1/3 grid grid-cols-2 lg:grid-cols-1 gap-4 sm:gap-5">
                  <StatCard 
                    title="Total Applicants" 
                    value={stats.totalApplicants} 
                    onClick={() => { setActiveTab('Applicants'); setListFilter('Approved'); }}
                    color="default"
                    isDark={isDark}
                    icon={
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
                      </svg>
                    } 
                  />
                  <StatCard 
                    title="Total Employers" 
                    value={stats.totalEmployers} 
                    onClick={() => { setActiveTab('Employers'); setListFilter('Approved'); }}
                    color="default"
                    isDark={isDark}
                    icon={
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                      </svg>
                    } 
                  />
                  <StatCard 
                    title="Pending Employers" 
                    value={stats.pendingEmployers} 
                    onClick={() => { setActiveTab('Employers'); setListFilter('Pending'); }}
                    color="pending"
                    isDark={isDark}
                    icon={
                      <svg className={`w-6 h-6 ${stats.pendingEmployers > 0 ? 'animate-pulse' : ''}`} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                    } 
                    alert={stats.pendingEmployers > 0} 
                  />
                  <StatCard 
                    title="Pending Applicants" 
                    value={stats.pendingApplicants} 
                    onClick={() => { setActiveTab('Applicants'); setListFilter('Pending'); }}
                    color="pending"
                    isDark={isDark}
                    icon={
                      <svg className={`w-6 h-6 ${stats.pendingApplicants > 0 ? 'animate-pulse' : ''}`} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                    } 
                    alert={stats.pendingApplicants > 0} 
                  />
                </div>

<div className={`${isAnalyticsExpanded ? 'fixed inset-0 z-[9999] w-screen h-screen bg-white' : `w-full lg:w-2/3 ${cardBg} p-3 sm:p-8 rounded-xl sm:rounded-2xl shadow-sm border-2 ${bdrMain}`}`}>
                  <div className={`${isAnalyticsExpanded ? `w-full h-full p-4 sm:p-8 ${isDark ? 'bg-black' : 'bg-[#f4f4f4]'} flex flex-col` : 'flex flex-col h-full'}`}>
                    <div className="mb-4 sm:mb-6 flex items-start justify-between gap-4 shrink-0">
                      <div>
                        <h2 className={`${isAnalyticsExpanded ? 'text-xl sm:text-2xl md:text-3xl' : 'text-base sm:text-xl'} font-black tracking-tight transition-all duration-300 ${txtMain}`}>Annual Platform Growth</h2>
                        <p className={`${isAnalyticsExpanded ? 'text-sm sm:text-base' : 'text-[10px] sm:text-xs'} font-bold mt-0.5 transition-all duration-300 ${txtMuted}`}>Monthly registration volume for new users.</p>
                      </div>
                      <button
                        onClick={() => setIsAnalyticsExpanded(!isAnalyticsExpanded)}
                        className={`p-2 rounded-lg border-2 ${bdrMain} ${txtMain} hover:bg-white/10 transition-all cursor-pointer shrink-0`}
                        title={isAnalyticsExpanded ? 'Minimize' : 'Maximize'}
                      >
                        {isAnalyticsExpanded ? (
                          <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5l5.25 5.25" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 4.5l5.25 5.25M4.5 4.5H9M4.5 4.5V9m14.25-4.5l-5.25 5.25M19.5 4.5H15m4.5 0V9m-14.25 10.5l5.25-5.25M4.5 19.5H9m-4.5 0V15m14.25 4.5l-5.25-5.25M19.5 19.5H15m4.5 0V15" />
                          </svg>
                        )}
                      </button>
                    </div>
                    <div className={`${isAnalyticsExpanded ? 'flex-1 w-full h-[calc(100vh-200px)]' : 'h-[260px] sm:h-[400px]'} w-full -ml-2 sm:ml-0 transition-all duration-300`}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} margin={{ top: 10, right: 8, left: isAnalyticsExpanded ? 0 : -20, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? 'rgba(255,255,255,0.15)' : 'rgba(3,4,94,0.1)'} />
                          <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: isDark ? '#ffffff' : '#03045E', fontSize: isAnalyticsExpanded ? 14 : 10, fontWeight: 700 }}
                            dy={8}
                            interval="preserveStartEnd"
                          />
                          <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: isDark ? '#ffffff' : '#03045E', fontSize: isAnalyticsExpanded ? 14 : 10, fontWeight: 700 }}
                            width={isAnalyticsExpanded ? 40 : 28}
                            allowDecimals={false}
                          />
                          <Tooltip
                           cursor={{ fill: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(3,4,94,0.08)' }}
                            contentStyle={{
                              borderRadius: '12px',
                              border: isDark ? '2px solid rgba(255,255,255,0.2)' : '2px solid rgba(3,4,94,0.15)',
                              boxShadow: '0 10px 25px rgba(3,4,94,0.1)',
                              fontWeight: 'bold',
                              color: isDark ? '#ffffff' : '#03045E',
                              backgroundColor: isDark ? '#000000' : '#ffffff',
                              fontSize: isAnalyticsExpanded ? '16px' : '11px',
                              padding: isAnalyticsExpanded ? '10px 14px' : '6px 10px'
                            }}
                          />
                          <Legend
                            iconType="circle"
                            wrapperStyle={{ paddingTop: '12px', fontWeight: 'bold', fontSize: isAnalyticsExpanded ? '14px' : '11px', color: isDark ? '#ffffff' : '#03045E' }}
                          />
                          <Bar
                            dataKey="users"
                            name="New Users"
                           fill={isDark ? '#ffffff' : '#03045E'}
                            radius={[4, 4, 0, 0]}
                            maxBarSize={isAnalyticsExpanded ? 64 : 28}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </div>

                         <div ref={usersOverviewRef} className={`${cardBg} p-4 sm:p-8 rounded-xl sm:rounded-2xl shadow-sm border-2 ${bdrMain} flex flex-col gap-4 sm:gap-6 scroll-mt-24`}>
                <div className={`flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4 border-b-2 ${isDark ? 'border-white/15' : 'border-[#03045E]/10'} pb-3 sm:pb-4`}>
                  <div>
                    <h2 className={`text-base sm:text-xl font-black tracking-tight leading-tight ${txtMain}`}>All Registered Users Overview</h2>
                    <p className={`text-[10px] sm:text-xs font-bold mt-1 ${txtMuted}`}>Comprehensive list of all platform applicants and employers.</p>
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <span className={`px-3 sm:px-4 py-1 sm:py-1.5 ${isDark ? 'bg-white/10 text-white border-white/20' : 'bg-[#03045E]/10 text-[#03045E] border-[#03045E]/20'} font-black text-[10px] sm:text-xs rounded-lg sm:rounded-xl border w-fit`}>
                      Showing: {currentUsers.length} of {filteredOverviewUsers.length} Users
                    </span>
                  </div>
                </div>

                <div className={`flex items-center gap-0.5 sm:gap-2 ${surfaceBg} p-1 sm:p-2 rounded-lg sm:rounded-xl border-2 ${isDark ? 'border-white/10' : 'border-[#03045E]/10'} w-full overflow-x-auto mb-2`}>
                  {['All', 'Pending', 'Approved', 'Rejected', 'Disabled'].map(filter => {
                    let count = 0;
                    if (filter === 'All') {
                      count = allUsers.length;
                    } else if (filter === 'Disabled') {
                      count = allUsers.filter(i => i.account_status === 'Disabled').length;
                    } else {
                      count = allUsers.filter(i => i.verification_status === filter && i.account_status !== 'Disabled').length;
                    }

                    const isStatus = filter === 'Pending' || filter === 'Approved' || filter === 'Rejected' || filter === 'Disabled';

                    let activeBg = isDark ? '#ffffff' : '#03045E';
                    let activeText = isDark ? '#000000' : '#ffffff';
                    let inactiveText = isDark ? '#ffffff' : '#03045E';
                    let badgeActiveBg = isDark ? 'rgba(0,0,0,0.15)' : '#2C7FFF';
                    let badgeActiveText = isDark ? '#000000' : '#ffffff';
                    let badgeInactiveBg = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(3,4,94,0.1)';
                    let badgeInactiveText = isDark ? '#ffffff' : '#03045E';

                    if (filter === 'Pending') {
                      activeBg = '#f59e0b';
                      activeText = '#ffffff';
                      inactiveText = isDark ? '#fbbf24' : '#b45309';
                      badgeActiveBg = 'rgba(255,255,255,0.25)';
                      badgeActiveText = '#ffffff';
                      badgeInactiveBg = 'rgba(245,158,11,0.15)';
                      badgeInactiveText = isDark ? '#fbbf24' : '#b45309';
                    } else if (filter === 'Approved') {
                      activeBg = '#10b981';
                      activeText = '#ffffff';
                      inactiveText = isDark ? '#34d399' : '#047857';
                      badgeActiveBg = 'rgba(255,255,255,0.25)';
                      badgeActiveText = '#ffffff';
                      badgeInactiveBg = 'rgba(16,185,129,0.15)';
                      badgeInactiveText = isDark ? '#34d399' : '#047857';
                    } else if (filter === 'Rejected' || filter === 'Disabled') {
                      activeBg = '#dc2626';
                      activeText = '#ffffff';
                      inactiveText = isDark ? '#f87171' : '#b91c1c';
                      badgeActiveBg = 'rgba(255,255,255,0.25)';
                      badgeActiveText = '#ffffff';
                      badgeInactiveBg = 'rgba(220,38,38,0.15)';
                      badgeInactiveText = isDark ? '#f87171' : '#b91c1c';
                    }

                    const isActive = overviewFilter === filter;

                    return (
                      <button
                        key={filter}
                        onClick={() => setOverviewFilter(filter)}
                        className={`flex-1 min-w-0 px-2 sm:px-4 py-1.5 sm:py-2.5 rounded-md sm:rounded-lg text-[9px] sm:text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 sm:gap-2 whitespace-nowrap border-2 ${isActive && isDark ? 'border-white/20' : 'border-transparent'}`}
                        style={{
                          backgroundColor: isActive ? activeBg : 'transparent',
                          color: isActive ? activeText : inactiveText
                        }}
                      >
                        <span>{filter}</span>
                        <span
                          className="px-1.5 sm:px-2 py-0.5 rounded-md sm:rounded-full text-[8px] sm:text-[10px] font-black tracking-wider inline-flex items-center justify-center min-w-[16px] sm:min-w-[24px] shrink-0"
                          style={{
                            backgroundColor: isActive ? badgeActiveBg : badgeInactiveBg,
                            color: isActive ? badgeActiveText : badgeInactiveText
                          }}
                        >
                          {count}
                        </span>
                      </button>
                    )
                  })}
                </div>
                <div ref={usersListRef} className="flex flex-col gap-2.5 sm:gap-3 max-h-[500px] overflow-y-auto pr-1">
                  {currentUsers.length > 0 ? (
                    currentUsers.map((user) => (
                      <div key={user.user_id} className={`p-3 sm:p-5 rounded-lg sm:rounded-xl ${surfaceBg} border-2 ${isDark ? 'border-white/15' : 'border-[#03045E]/15'} flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 transition-all ${user.account_status === 'Disabled' ? 'opacity-70' : ''}`}>

                        <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0 w-full sm:w-auto">
                          <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-md sm:rounded-lg ${isDark ? 'bg-white text-black' : 'bg-[#03045E] text-white'} flex items-center justify-center font-black text-xs sm:text-sm shrink-0 shadow-sm`}>
                            {user.userType === 'Employer' ? (user.company_name?.[0] || 'E') : (user.firstname?.[0] || 'A')}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className={`text-xs sm:text-sm font-black truncate ${txtMain}`}>
                                {user.userType === 'Employer' ? user.company_name : `${user.firstname} ${user.lastname}`}
                              </h4>
                              {user.reverification_attempts > 0 && (
                                <span className={`px-2 py-0.5 text-[8px] sm:text-[9px] font-black uppercase tracking-wider rounded-md border shadow-sm ${isDark ? 'bg-amber-500/20 text-amber-400 border-amber-500/50' : 'bg-amber-100 text-amber-700 border-amber-300'}`}>
                                  Resubmitted
                                </span>
                              )}
                            </div>
                            <p className={`text-[10px] sm:text-xs font-bold truncate ${txtMuted}`}>{user.email}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0 w-full sm:w-auto justify-start sm:justify-end flex-wrap">
                          <span
                            className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded-sm sm:rounded-md text-[8px] sm:text-[10px] font-black tracking-wider uppercase border ${isDark ? 'bg-white/10 text-white border-white/20' : 'bg-[#03045E]/10 text-[#03045E] border-[#03045E]/20'}`}
                          >
                            {user.userType}
                          </span>
                          <span
                            className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded-sm sm:rounded-md text-[8px] sm:text-[10px] font-black tracking-wider uppercase border`}
                            style={{
backgroundColor: user.account_status === 'Disabled' ? 'rgba(220,38,38,0.1)' :
  user.verification_status === 'Approved' ? 'rgba(16,185,129,0.1)' :
  user.verification_status === 'Rejected' ? 'rgba(220,38,38,0.1)' :
  'rgba(245,158,11,0.1)',
color: user.account_status === 'Disabled' ? '#f87171' :
  user.verification_status === 'Approved' ? '#34d399' :
  user.verification_status === 'Rejected' ? '#f87171' :
  '#fbbf24',
borderColor: user.account_status === 'Disabled' ? '#dc2626' :
  user.verification_status === 'Approved' ? '#10b981' :
  user.verification_status === 'Rejected' ? '#dc2626' :
  '#f59e0b'
}}
                          >
                            {user.account_status === 'Disabled' ? 'Disabled' : (user.verification_status || 'Pending')}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className={`p-8 text-center text-xs font-bold ${txtMuted}`}>No {overviewFilter.toLowerCase()} users found.</div>
                  )}
                </div>

                {totalPages > 1 && (
                  <div className={`flex justify-between items-center gap-3 w-full pt-3 border-t-2 ${isDark ? 'border-white/15' : 'border-[#03045E]/10'}`}>
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className={`px-4 py-2 sm:px-5 sm:py-2.5 rounded-lg font-black text-[10px] sm:text-xs uppercase tracking-wider transition-all cursor-pointer border-2 disabled:opacity-50 disabled:cursor-not-allowed ${isDark ? 'bg-black text-white border-white/30' : 'bg-white text-[#03045E] border-[#03045E]/30'}`}
                    >
                      Previous
                    </button>
                    <span className={`text-[10px] sm:text-xs font-black ${txtMuted}`}>
                      Page {currentPage} of {totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className={`px-4 py-2 sm:px-5 sm:py-2.5 rounded-lg font-black text-[10px] sm:text-xs uppercase tracking-wider transition-all cursor-pointer border-2 disabled:opacity-50 disabled:cursor-not-allowed ${isDark ? 'bg-black text-white border-white/30' : 'bg-white text-[#03045E] border-[#03045E]/30'}`}
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {(activeTab === 'Employers' || activeTab === 'Applicants') && (
            <div className="flex flex-col gap-3 sm:gap-6 animate-in fade-in duration-300 mt-6">
              <div className="flex flex-col gap-2.5 sm:gap-4">
                {filterList(activeTab === 'Employers' ? employers : applicants).length > 0 ? (
                  filterList(activeTab === 'Employers' ? employers : applicants).map(user => (
                    <div key={user.user_id} className={`${cardBg} p-3 sm:p-7 rounded-xl sm:rounded-2xl shadow-sm border-2 ${isDark ? 'border-white/15' : 'border-[#03045E]/15'} flex flex-col md:flex-row justify-between items-start md:items-center gap-3 sm:gap-6 transition-all hover:shadow-md ${listFilter === 'Disabled' ? 'opacity-70' : ''}`}>

                      <div className="flex items-start gap-2.5 sm:gap-4 flex-1 min-w-0 w-full">
                        <div
                          className={`w-9 h-9 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl flex items-center justify-center shrink-0 border-2 font-black text-sm sm:text-lg ${isDark ? 'bg-white text-black border-white' : 'bg-[#03045E] text-white border-[#03045E]'}`}
                        >
                          {activeTab === 'Employers' ? (user.company_name?.[0] || 'E') : (user.firstname?.[0] || 'A')}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className={`text-sm sm:text-xl font-black tracking-tight truncate ${txtMain}`}>
                            {activeTab === 'Employers' ? user.company_name : `${user.firstname} ${user.lastname}`}
                          </h3>
                          <div className={`flex flex-wrap items-center gap-1 sm:gap-2 text-[9px] sm:text-sm font-bold mt-1 ${txtMuted}`}>
                            <span className={`${surfaceBg} px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-sm sm:rounded-md border ${isDark ? 'border-white/10' : 'border-[#03045E]/10'}`}>
                              {activeTab === 'Employers' ? 'Industry:' : 'Disability:'} <strong className={txtMain}>{activeTab === 'Employers' ? (user.industry || 'N/A') : (user.disability_type || 'N/A')}</strong>
                            </span>
                            <span className="hidden sm:inline">•</span>
                            <span className="truncate w-full sm:w-auto">Email: <strong className={txtMain}>{user.email}</strong></span>
                          </div>
                          <div
                            className={`flex items-center gap-1 sm:gap-1.5 text-[8px] sm:text-[11px] font-black uppercase tracking-wider mt-1 sm:mt-2.5 ${isDark ? 'text-white/70' : 'text-[#03045E]/70'}`}
                          >
                            <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                            </svg>
                            Registered: {new Date(user.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row sm:flex-wrap gap-1.5 sm:gap-2 w-full md:w-auto shrink-0 items-stretch sm:items-center justify-stretch sm:justify-end">
                        <div className="flex flex-row gap-1.5 sm:gap-2 w-full sm:w-auto">
                          {activeTab === 'Employers' && user.verification_document && (
                            <button
                              onClick={() => setEmployerModal({ isOpen: true, user: user })}
                              className={`flex-1 min-w-0 text-center px-2 sm:px-4 py-2 sm:py-2.5 font-black text-[10px] sm:text-sm rounded-md sm:rounded-lg border-2 transition flex items-center justify-center gap-1.5 sm:gap-2 shadow-sm cursor-pointer ${isDark ? 'bg-black text-white border-white hover:bg-white hover:text-black' : 'bg-[#2C7FFF]/10 text-[#2c7fff] border-[#2c7fff]'}`}
                            >
                              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                              </svg>
                              <span className="truncate">View Business Document</span>
                            </button>
                          )}

                          {activeTab === 'Applicants' && user.pwd_document_path && (
                            <button
                              onClick={() => setPwdModal({ isOpen: true, user: user })}
                              className={`flex-1 min-w-0 text-center px-2 sm:px-4 py-2 sm:py-2.5 font-black text-[10px] sm:text-sm rounded-md sm:rounded-lg border-2 transition flex items-center justify-center gap-1.5 sm:gap-2 shadow-sm cursor-pointer ${isDark ? 'bg-black text-white border-white hover:bg-white hover:text-black' : 'bg-[#2C7FFF]/10 text-[#2c7fff] border-[#2c7fff]'}`}
                            >
                              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2"></path>
                              </svg>
                              <span className="truncate">View PWD ID</span>
                            </button>
                          )}

                          {(!user.verification_document && !user.pwd_document_path) && (
                            <div className={`flex-1 min-w-0 text-center px-2 sm:px-4 py-2 sm:py-2.5 ${surfaceBg} ${isDark ? 'text-white/50 border-white/10' : 'text-[#03045E]/50 border-[#03045E]/10'} font-black text-[10px] sm:text-sm rounded-md sm:rounded-lg border-2 flex items-center justify-center gap-1.5 sm:gap-2`}>
                              No Document Attached
                            </div>
                          )}
                        </div>

                        {(listFilter === 'Pending' || listFilter === 'Approved' || listFilter === 'Rejected' || listFilter === 'Disabled') && (
                          <div className="flex flex-row gap-1.5 sm:gap-2 w-full sm:w-auto">
                            {listFilter === 'Pending' && (
                              <>
                                <button
                                  onClick={() => setRejectModal({ isOpen: true, userId: user.user_id, reason: '' })}
                                  className={`flex-1 min-w-0 px-3 sm:px-4 py-2 sm:py-2 font-black text-[10px] sm:text-sm rounded-md sm:rounded-lg border-2 transition cursor-pointer shadow-sm flex items-center justify-center gap-1.5 bg-[#FEE2E2] text-[#B91C1C] border-[#DC2626]`}
                                >
                                  <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"></path>
                                  </svg>
                                  <span className="whitespace-nowrap">Reject</span>
                                </button>
                                <button
                                  onClick={() => setConfirmPopup({ isOpen: true, type: 'approve', userId: user.user_id, reason: null, loading: false })}
                                  className={`flex-1 min-w-0 px-3 sm:px-4 py-2 sm:py-2 font-black text-[10px] sm:text-sm rounded-md sm:rounded-lg border-2 shadow-sm transition cursor-pointer flex items-center justify-center gap-1.5 bg-[#10b981] text-white border-[#10b981]`}
                                >
                                  <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path>
                                  </svg>
                                  <span className="whitespace-nowrap">Approve</span>
                                </button>
                              </>
                            )}
                            {listFilter === 'Approved' && (
                              <button
                                onClick={() => setConfirmPopup({ isOpen: true, type: 'disable', userId: user.user_id, reason: null, loading: false })}
                                className={`flex-1 min-w-0 py-2 sm:py-2.5 px-3 sm:px-4 font-black text-[10px] sm:text-sm rounded-md sm:rounded-lg border-2 shadow-sm cursor-pointer flex items-center justify-center gap-1.5 sm:gap-2 bg-[#FEE2E2] text-[#B91C1C] border-[#DC2626]`}
                              >
                                <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"></path>
                                </svg>
                                <span className="truncate">Disable Account</span>
                              </button>
                            )}
                            {listFilter === 'Rejected' && (
                              <button
                                onClick={() => setConfirmPopup({ isOpen: true, type: 'approve', userId: user.user_id, reason: null, loading: false })}
                                className={`flex-1 min-w-0 py-2 sm:py-2.5 px-3 sm:px-4 font-black text-[10px] sm:text-sm rounded-md sm:rounded-lg border-2 shadow-sm transition cursor-pointer flex items-center justify-center gap-1.5 sm:gap-2 bg-[#D1FAE5] text-[#047857] border-[#10B981]`}
                              >
                                <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                                </svg>
                                <span className="whitespace-nowrap">Approve (Re-evaluate)</span>
                              </button>
                            )}
                            {listFilter === 'Disabled' && (
                              <button
                                onClick={() => setConfirmPopup({ isOpen: true, type: 'restore', userId: user.user_id, reason: null, loading: false })}
                                className={`flex-1 min-w-0 py-2 sm:py-2.5 px-3 sm:px-4 font-black text-[10px] sm:text-sm rounded-md sm:rounded-lg border-2 shadow-sm cursor-pointer flex items-center justify-center gap-1.5 sm:gap-2 bg-[#2C7FFF] text-white border-[#2C7FFF]`}
                              >
                                <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                                </svg>
                                <span className="truncate">Restore Account</span>
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className={`p-8 sm:p-16 text-center border-2 border-dashed ${isDark ? 'border-white/20 bg-black' : 'border-[#03045E]/20 bg-white'} rounded-xl sm:rounded-2xl shadow-sm flex flex-col items-center justify-center`}>
                    <div className={`w-12 h-12 sm:w-14 sm:h-14 ${isDark ? 'bg-white/10 text-white border-white/30' : 'bg-[#2C7FFF]/15 text-[#2C7FFF] border-[#2C7FFF]/30'} rounded-lg flex items-center justify-center mb-3 sm:mb-4 border-2`}>
                      <svg className="w-6 h-6 sm:w-7 sm:h-7" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path>
                      </svg>
                    </div>
                    <p className={`text-sm sm:text-base font-black ${txtMain}`}>No {listFilter.toLowerCase()} {activeTab.toLowerCase()} found.</p>
                    <p className={`text-[10px] sm:text-xs font-bold mt-1 ${txtMuted}`}>Check back later for new registrations in this category.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {pwdModal.isOpen && pwdModal.user && (
            <div
              className="fixed inset-0 z-[9999999] flex items-center justify-center p-2 sm:p-4 backdrop-blur-[1px] animate-in fade-in transition-all duration-300 overflow-y-auto"
              style={{ backgroundColor: 'rgba(72, 71, 71, 0.6)', filter: 'none' }}
            >
              <div className={`${cardBg} rounded-xl sm:rounded-2xl w-full max-w-[95vw] sm:max-w-7xl my-4 sm:my-0 shadow-[0_25px_60px_rgba(3,4,94,0.4)] border-2 ${isDark ? 'border-white/20' : 'border-[#03045E]/20'} flex flex-col overflow-hidden h-auto max-h-[95vh] sm:h-[90vh]`}>
                
                <div className={`px-3 sm:px-6 py-3 sm:py-4 ${surfaceBg} border-b-2 ${isDark ? 'border-white/15' : 'border-[#03045E]/15'} flex items-center justify-between shrink-0 gap-2`}>
                  <div className="min-w-0 flex-1">
                    <h2 className={`text-xs sm:text-lg md:text-xl font-black tracking-tight truncate ${txtMain}`}>
                      PWD ID Verification: {pwdModal.user.firstname} {pwdModal.user.lastname}
                    </h2>
                    <p className={`text-[9px] sm:text-xs font-bold truncate ${txtMuted}`}>
                      Review applicant PWD ID and cross-reference with the official portal.
                    </p>
                  </div>
                  <button
                    onClick={() => setPwdModal({ isOpen: false, user: null })}
                    className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg ${cardBg} ${txtMain} border-2 ${isDark ? 'border-white/20' : 'border-[#03045E]/20'} flex items-center justify-center font-black transition cursor-pointer shrink-0 text-xs sm:text-base`}
                  >
                    ✕                    </button>
                </div>

                <div className={`flex-1 flex flex-col lg:grid lg:grid-cols-3 lg:divide-x-2 ${isDark ? 'divide-white/15' : 'divide-[#03045E]/15'} overflow-y-auto lg:overflow-hidden`}>
                  
                  <div className={`lg:col-span-2 flex flex-col ${cardBg} p-3 sm:p-6 gap-3 sm:gap-6 lg:h-full lg:overflow-y-auto`}>
                    <div className="flex items-center justify-between shrink-0 gap-2 flex-wrap">
                      <span className={`text-[10px] sm:text-xs font-black uppercase tracking-wider ${txtMain}`}>Applicant Uploaded ID</span>
                      <span 
                        className={`px-2 sm:px-3 py-1 rounded-md text-[10px] sm:text-xs font-black border whitespace-nowrap ${isDark ? 'bg-white/10 text-white border-white/30' : ''}`}
                        style={!isDark ? {
                          backgroundColor: 'rgba(59,130,246,0.1)',
                          color: '#1d4ed8',
                          borderColor: '#3b82f6'
                        } : {}}
                      >
                        Disability: {pwdModal.user.disability_type || 'N/A'}
                      </span>
                    </div>

                    <div className={`min-h-[200px] sm:min-h-[350px] lg:flex-1 ${surfaceBg} rounded-xl border-2 ${isDark ? 'border-white/15' : 'border-[#03045E]/15'} overflow-hidden flex items-center justify-center relative shadow-inner p-2`}>
                      {pwdModal.user.pwd_document_path ? (
                        pwdModal.user.pwd_document_path.match(/\.(jpeg|jpg|png|gif)$/i) ? (
                          <img
                            src={`http://localhost:5001/uploads/${pwdModal.user.pwd_document_path.replace(/^uploads[\\/]/, '')}`}
                            alt="Applicant PWD ID"
                            className="max-h-full max-w-full object-contain rounded-lg shadow-md"
                          />
                        ) : (
                          <iframe
                            src={`http://localhost:5001/uploads/${pwdModal.user.pwd_document_path.replace(/^uploads[\\/]/, '')}`}
                            title="PWD ID Document PDF"
                            className="w-full h-full rounded-lg"
                          ></iframe>
                        )
                      ) : (
                        <p className={`text-sm font-bold ${txtMuted}`}>No document uploaded.</p>
                      )}
                    </div>

                    <div className={`flex flex-col sm:flex-row gap-2 sm:gap-3 pt-3 sm:pt-4 border-t-2 ${isDark ? 'border-white/15' : 'border-[#03045E]/10'} shrink-0`}>
                      <button
                        onClick={() => {
                          const userId = pwdModal.user.user_id;
                          setPwdModal({ isOpen: false, user: null });
                          setRejectModal({ isOpen: true, userId: userId, reason: '' });
                        }}
                        className={`flex-1 py-3 sm:py-3.5 font-black text-xs sm:text-sm rounded-lg border-2 transition cursor-pointer shadow-sm flex items-center justify-center gap-2 bg-[#FEE2E2] text-[#B91C1C] border-[#DC2626]`}
                      >
                        ✕ Reject & Cooldown
                      </button>
                      <button
                        onClick={() => {
                          const userId = pwdModal.user.user_id;
                          setPwdModal({ isOpen: false, user: null });
                          setConfirmPopup({ isOpen: true, type: 'approve', userId: userId, reason: null, loading: false });
                        }}
                        className={`flex-1 py-3 sm:py-3.5 font-black text-xs sm:text-sm rounded-lg border-2 shadow-md transition cursor-pointer flex items-center justify-center gap-2 bg-[#10b981] text-white border-[#10b981]`}
                      >
                        ✓ Approve PWD ID
                      </button>
                    </div>

                  </div>

                  <div className={`lg:col-span-1 flex flex-col ${surfaceBg} p-3 sm:p-6 justify-center items-center text-center lg:h-full lg:overflow-y-auto`}>
                    <div 
                      className={`w-10 h-10 sm:w-14 sm:h-14 rounded-lg flex items-center justify-center mb-2 sm:mb-4 border shadow-sm ${isDark ? 'bg-white/10 text-white border-white/30' : 'bg-[#2C7FFF]/15 text-[#2C7FFF] border-[#2C7FFF]/30'}`}
                    >
                      <svg className="w-5 h-5 sm:w-7 sm:h-7" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path>
                      </svg>
                    </div>
                    <h3 className={`text-xs sm:text-base font-black mb-1 sm:mb-2 ${txtMain}`}>DOH Verification Portal</h3>
                    <p className={`text-[10px] sm:text-xs font-bold mb-3 sm:mb-6 leading-relaxed px-2 sm:px-0 ${txtMuted}`}>
                      Government security policies prevent direct website embedding. Open the portal in a side-by-side view to cross-check details.
                    </p>
                    <button
                      onClick={handleDohPortalLaunch}
                      className={`w-full py-2.5 sm:py-3.5 ${isDark ? 'bg-white text-black hover:bg-white/90' : 'bg-[#03045E] text-white hover:bg-[#2C7FFF]'} font-black text-[10px] sm:text-xs uppercase tracking-wider rounded-lg shadow-md transition flex items-center justify-center gap-2 cursor-pointer`}
                    >
                      Launch Portal ↗
                    </button>
                  </div>

                </div>
              </div>
            </div>
          )}

          {employerModal.isOpen && employerModal.user && (
            <div
              className="fixed inset-0 z-[9999999] flex items-center justify-center p-4 backdrop-blur-[1px] animate-in fade-in transition-all duration-300"
              style={{ backgroundColor: 'rgba(72, 71, 71, 0.6)', filter: 'none' }}
            >
              <div className={`${cardBg} rounded-xl sm:rounded-2xl w-full max-w-4xl h-[85vh] shadow-[0_25px_60px_rgba(3,4,94,0.4)] border-2 ${isDark ? 'border-white/20' : 'border-[#03045E]/20'} flex flex-col overflow-hidden`}>
                
                <div className={`px-6 py-4 ${surfaceBg} border-b-2 ${isDark ? 'border-white/15' : 'border-[#03045E]/15'} flex items-center justify-between shrink-0`}>
                  <div>
                    <h2 className={`text-lg sm:text-xl font-black tracking-tight ${txtMain}`}>
                      Business Registration: {employerModal.user.company_name}
                    </h2>
                    <p className={`text-xs font-bold ${txtMuted}`}>
                      Review company registration permit or DTI/SEC document.
                    </p>
                  </div>
                  <button
                    onClick={() => setEmployerModal({ isOpen: false, user: null })}
                    className={`w-10 h-10 rounded-lg ${cardBg} ${txtMain} border-2 ${isDark ? 'border-white/20' : 'border-[#03045E]/20'} flex items-center justify-center font-black transition cursor-pointer`}
                  >
                    ✕
                  </button>
                </div>

                <div className={`flex-1 flex flex-col ${cardBg} p-6 gap-6 overflow-hidden`}>
                  <div className="flex items-center justify-between shrink-0">
                    <span className={`text-xs font-black uppercase tracking-wider ${txtMain}`}>Uploaded Verification File</span>
                    <span 
                      className={`px-3 py-1 rounded-md text-xs font-black border ${isDark ? 'bg-white/10 text-white border-white/30' : 'bg-[#8b5cf6]/10 text-[#6d28d9] border-[#8b5cf6]'}`}
                    >
                      Industry: {employerModal.user.industry || 'N/A'}
                    </span>
                  </div>

                  <div className={`flex-1 ${surfaceBg} rounded-xl border-2 ${isDark ? 'border-white/15' : 'border-[#03045E]/15'} overflow-hidden flex flex-col md:flex-row items-center justify-center relative shadow-inner p-2 gap-3 overflow-y-auto`}>
                    {(() => {
                      if (!employerModal.user.verification_document) {
                        return <p className={`text-sm font-bold ${txtMuted}`}>No document uploaded.</p>;
                      }

                      // 1. Safely parse the document string (handles both old single files and new arrays)
                      let docs = [];
                      try {
                        docs = JSON.parse(employerModal.user.verification_document);
                        if (!Array.isArray(docs)) docs = [employerModal.user.verification_document];
                      } catch (e) {
                        docs = [employerModal.user.verification_document];
                      }

                      // 2. Map through the 1 or 2 documents and render them side-by-side
                      return docs.map((doc, index) => {
                        let cleanPath = doc.replace(/\\/g, '/');
                        if (cleanPath.startsWith('/uploads/')) cleanPath = cleanPath.replace('/uploads/', '');
                        else if (cleanPath.startsWith('uploads/')) cleanPath = cleanPath.replace('uploads/', '');
                        
                        const fileUrl = `http://localhost:5001/uploads/${cleanPath}`;
                        const isImage = /\.(jpeg|jpg|png|gif)$/i.test(cleanPath);

                        return (
                          <div key={index} className="flex-1 w-full h-full min-h-[250px] flex flex-col rounded-lg overflow-hidden border border-[#03045E]/10 bg-white/50">
                            {docs.length > 1 && (
                              <div className="bg-[#03045E] text-white text-[10px] font-black uppercase tracking-widest py-1.5 px-3 text-center shrink-0">
                                Document {index + 1}
                              </div>
                            )}
                            <div className="flex-1 relative p-1">
                              {isImage ? (
                                <img
                                  src={fileUrl}
                                  alt={`Business Verification Document ${index + 1}`}
                                  onClick={() => window.open(fileUrl, '_blank')}
                                  title="Click to view full size and zoom"
                                  className="w-full h-full object-contain rounded shadow-sm cursor-zoom-in hover:opacity-80 transition-opacity"
                                />
                              ) : (
                                <iframe
                                  src={fileUrl}
                                  title={`Business Document PDF ${index + 1}`}
                                  className="w-full h-full rounded shadow-sm border-0"
                                ></iframe>
                              )}
                            </div>
                          </div>
                        );
                      });
                    })()}
                  </div>

                  <div className={`flex gap-3 pt-2 border-t-2 ${isDark ? 'border-white/15' : 'border-[#03045E]/10'} shrink-0`}>
                    <button
                      onClick={() => {
                        const userId = employerModal.user.user_id;
                        setEmployerModal({ isOpen: false, user: null });
                        setRejectModal({ isOpen: true, userId: userId, reason: '' });
                      }}
                      className={`flex-1 py-3.5 font-black text-sm rounded-lg border-2 transition cursor-pointer shadow-sm flex items-center justify-center gap-2 bg-[#FEE2E2] text-[#B91C1C] border-[#DC2626]`}
                    >
                      ✕ Reject & Cooldown
                    </button>
                    <button
                      onClick={() => {
                        const userId = employerModal.user.user_id;
                        setEmployerModal({ isOpen: false, user: null });
                        setConfirmPopup({ isOpen: true, type: 'approve', userId: userId, reason: null, loading: false });
                      }}
                      className={`flex-1 py-3.5 font-black text-sm rounded-lg border-2 shadow-md transition cursor-pointer flex items-center justify-center gap-2 bg-[#10b981] text-white border-[#10b981]`}
                    >
                      ✓ Approve Employer Permit
                    </button>
                  </div>

                </div>
              </div>
            </div>
          )}

          {rejectModal.isOpen && (
            <div
              className="fixed inset-0 z-[9999999] flex items-center justify-center p-4 backdrop-blur-[1px] animate-in fade-in transition-all duration-300"
              style={{ backgroundColor: 'rgba(72, 71, 71, 0.6)', filter: 'none' }}
            >
              <div 
                className={`${cardBg} rounded-xl sm:rounded-2xl w-full max-w-lg p-6 sm:p-8 shadow-[0_25px_60px_rgba(3,4,94,0.3)] border-2 flex flex-col gap-5`}
                style={{ borderColor: isDark ? '#ffffff' : '#dc2626' }}
              >
                <div>
                  <h2 className="text-xl font-black tracking-tight" style={{ color: isDark ? '#ffffff' : '#DC2626' }}>Reject Application & Cooldown</h2>
                  <p className={`text-xs sm:text-sm font-bold mt-1 ${txtMuted}`}>Select a document issue. A 7-day reapplication cooldown will be automatically applied.</p>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {[
                    "Uploaded document is blurry or illegible. Please resubmit a clear copy after your 7-day cooldown period.",
                    "Uploaded document is expired. Please provide a valid, up-to-date document after your 7-day cooldown period.",
                    "Name on the document does not match profile name. You may resubmit after your 7-day cooldown period.",
                    "Invalid document type. Please upload a valid PWD ID or Business Registration after your 7-day cooldown period.",
                    "Document is cropped and missing important details. Please try again after your 7-day cooldown period."
                  ].map((standardReason, index) => (
                    <button
                      key={index}
                      type="button"
                      disabled={rejectLoading}
                      onClick={() => setRejectModal({ ...rejectModal, reason: standardReason })}
                      className={`text-left px-3 py-2 text-xs font-black rounded-lg border-2 cursor-pointer disabled:opacity-50 bg-[#FEE2E2] text-[#B91C1C] border-[#DC2626]`}
                    >
                      + {standardReason.split('.')[0]}
                    </button>
                  ))}
                </div>
                
                <textarea
                  disabled={rejectLoading}
                  value={rejectModal.reason}
                  onChange={(e) => setRejectModal({ ...rejectModal, reason: e.target.value })}
                  placeholder="Select a reason above or type a custom reason here..."
                  className={`w-full p-4 border-2 ${isDark ? 'border-white/20 text-white placeholder-white/40 bg-black' : 'border-[#03045E]/20 text-[#03045E] placeholder-[#03045E]/40 bg-[#f4f4f4]'} rounded-xl resize-none focus:outline-none focus:ring-2 transition min-h-[140px] text-sm font-bold leading-relaxed disabled:opacity-50`}
                ></textarea>
                
                <div className="flex gap-3 mt-2">
                  <button 
                    disabled={rejectLoading}
                    onClick={() => setConfirmPopup({ isOpen: true, type: 'cancel', userId: rejectModal.userId, reason: null, loading: false })}
                    className={`flex-1 py-3 ${surfaceBg} ${txtMain} font-black text-sm rounded-lg border-2 ${isDark ? 'border-white/20' : 'border-[#03045E]/20'} cursor-pointer disabled:opacity-50`}
                  >
                    Cancel
                  </button>
                  <button 
                    disabled={rejectLoading}
                    onClick={submitRejection}
                    className={`flex-1 py-3 font-black text-sm rounded-lg border-2 shadow-md transition flex justify-center items-center gap-2 cursor-pointer disabled:opacity-80 bg-[#dc2626] text-white border-[#dc2626]`}
                  >
                    {rejectLoading ? (
                      <>
                        <svg className="w-4 h-4 animate-spin shrink-0" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                        </svg>
                        Loading...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                        Reject & Lock (7 Days)
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

             </>
          )}
          
                         <footer role="contentinfo" className={`mt-auto pt-6 pb-6 px-6 sm:px-10 md:px-14 border-t-4 -mx-3 -mb-3 sm:-mx-6 sm:-mb-6 md:-mx-10 md:-mb-10 bg-[#03045E] border-[#2C7FFF] transition-colors duration-300 animate-in fade-in slide-in-from-bottom-4`}>
                <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-4">
                  <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-center sm:text-left">
                    <p className="text-[10px] sm:text-xs font-bold text-white/75">
                      © {new Date().getFullYear()} ABLEWORK Inc. All rights reserved.
                    </p>
                    <span className="hidden sm:inline text-xs text-white/30">|</span>
                    <p className={`text-[10px] sm:text-xs font-black uppercase tracking-widest ${isDark ? 'text-white' : 'text-[#f4f4f4]'}`}>
                      Admin Portal v1.0
                    </p>
                  </div>
                </div>
             </footer>
        </main>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, alert, onClick, color = 'default', isDark = false }) {
  const colorMap = {
   default: {
  accent: isDark ? '#ffffff' : '#03045E',
  border: isDark ? 'rgba(255,255,255,0.4)' : '#03045E'
},
    pending: {
      accent: isDark ? '#ffffff' : '#03045E',
      border: isDark ? 'rgba(255,255,255,0.4)' : '#03045E'
    }
  };

  const scheme = colorMap[color] || colorMap.default;

  return (
    <div
      onClick={onClick}
      className={`flex items-center justify-between p-4 sm:p-5 rounded-xl shadow-sm border-2 transition-all duration-200 ${isDark ? 'bg-black border-white/15' : 'bg-white border-[#03045E]/15'} ${onClick ? 'cursor-pointer hover:shadow-lg hover:-translate-y-0.5' : ''}`}
    >
      <div className="flex flex-col min-w-0">
        <h3 className={`text-[10px] sm:text-xs font-black uppercase tracking-wider leading-tight ${isDark ? 'text-white/70' : 'text-[#03045E]/70'} truncate`}>
          {title}
        </h3>
        <p className={`text-2xl sm:text-3xl font-black tracking-tight leading-none ${isDark ? 'text-white' : 'text-[#03045E]'} mt-1`}>
          {value}
        </p>
      </div>
      <div
        className="p-2 sm:p-3 rounded-lg border flex items-center justify-center shrink-0 ml-3"
        style={{
          borderColor: scheme.border,
          color: scheme.accent
        }}
      >
        <div className="w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center [&>svg]:w-full [&>svg]:h-full">
          {icon}
        </div>
      </div>
    </div>
  );
}