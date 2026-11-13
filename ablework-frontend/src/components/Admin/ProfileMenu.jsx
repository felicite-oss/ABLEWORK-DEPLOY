import { useState } from 'react';
import profileImage from '../../assets/5i.png';

export default function ProfileMenu({ adminUser, isLoggingOut, onLogoutClick, isDark }) {
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const handleLogout = () => {
    setShowProfileMenu(false);
    onLogoutClick();
  };

  const fullName = adminUser?.firstname
    ? `${adminUser.firstname} ${adminUser.lastname || ''}`.trim()
    : 'Administrator';
  const email = adminUser?.email || 'admin@ablework.com';
  const role = adminUser?.role || 'admin';

  return (
    <div className="relative">
      <button
        onClick={() => setShowProfileMenu((prev) => !prev)}
        className={`flex items-center gap-2 sm:gap-3 pl-1 pr-1 sm:pl-2 sm:pr-3 py-1.5 rounded-2xl border-2 transition-all duration-200 shadow-sm cursor-pointer ${
          isDark 
            ? 'bg-black border-white text-white' 
            : 'bg-[var(--color-card,#ffffff)] border-[var(--color-border,rgba(3,4,94,0.15))] text-[var(--color-text,#03045E)]'
        }`}
      >
        <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl overflow-hidden border-2 shrink-0 ${
          isDark ? 'border-white bg-black' : 'border-[#2C7FFF] bg-[#2C7FFF]/10'
        }`}>
          <img src={profileImage} alt="Admin Profile" className="w-full h-full object-cover" />
        </div>
        <div className="hidden sm:flex flex-col items-start leading-tight min-w-0">
          <span className={`text-[11px] font-black uppercase tracking-widest ${isDark ? 'text-white' : 'text-[#2C7FFF]'}`}>Admin</span>
          <span className={`text-xs font-black truncate max-w-[120px] ${isDark ? 'text-white' : 'text-[var(--color-text,#03045E)]'}`}>
            {adminUser?.firstname ? `${adminUser.firstname} ${adminUser.lastname || ''}` : (adminUser?.email || 'Administrator')}
          </span>
        </div>
        <svg className={`w-4 h-4 transition-transform duration-200 shrink-0 ${showProfileMenu ? 'rotate-180' : ''} ${isDark ? 'text-white' : 'text-[var(--color-text,#03045E)]'}`} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {showProfileMenu && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setShowProfileMenu(false)}></div>
          <div className={`fixed sm:absolute right-3 sm:right-0 left-3 sm:left-auto top-16 sm:top-full sm:mt-3 w-auto sm:w-72 rounded-2xl sm:rounded-3xl border-2 shadow-[0_20px_50px_rgba(3,4,94,0.25)] overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200 max-h-[calc(100vh-5rem)] overflow-y-auto ${
            isDark 
              ? 'bg-black border-white' 
              : 'bg-[var(--color-card,#ffffff)] border-[var(--color-border,rgba(3,4,94,0.15))]'
          }`}>

            <div className={`relative p-4 sm:p-5 ${isDark ? 'bg-black border-b-2 border-white' : 'bg-[#03045e]'}`}>
              <div className="relative flex items-center gap-3">
                <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl overflow-hidden border-2 shrink-0 ${
                  isDark ? 'border-white bg-black' : 'border-white bg-white'
                }`}>
                  <img src={profileImage} alt="Admin Profile" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-black truncate ${isDark ? 'text-white' : 'text-white'}`}>{fullName}</p>
                  <p className={`text-[10px] font-bold truncate ${isDark ? 'text-white/70' : 'text-white'}`}>{email}</p>
                </div>
              </div>

              <div className="relative mt-3 flex items-center gap-2 flex-wrap">
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${
                  isDark ? 'bg-black text-white border-white' : 'bg-white text-[#03045E] border-white'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${isDark ? 'bg-white' : 'bg-[#10B981]'}`}></span>
                  {role}
                </span>
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${
                  isDark ? 'bg-black text-white border-white' : 'bg-white text-[#03045E] border-white'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${isDark ? 'bg-white' : 'bg-[#10B981]'}`}></span>
                  Active
                </span>
              </div>
            </div>

            <div className={`p-3 pt-3 ${isDark ? 'bg-black' : ''}`}>
              <button
                disabled={isLoggingOut}
                onClick={handleLogout}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-left text-xs font-black border-2 transition-all cursor-pointer disabled:opacity-50 ${
                  isDark 
                    ? 'bg-black text-[#DC2626] border-[#DC2626] hover:bg-[#DC2626] hover:text-white' 
                    : 'text-[#DC2626] bg-[#FEE2E2] border-[#FCA5A5]'
                }`}
              >
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                  isDark ? 'bg-black text-[#DC2626] border border-[#DC2626]' : 'bg-[#dc2626] text-white'
                }`}>
                  <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </div>
                <span className="flex-1">Logout</span>
                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}