import { useState } from 'react';

export default function SettingsModal({ isOpen, onClose, adminUser }) {
  const [notifyPending, setNotifyPending] = useState(true);
  const [notifyApproved, setNotifyApproved] = useState(true);
  const [notifyRejected, setNotifyRejected] = useState(false);
  const [compactMode, setCompactMode] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);

  if (!isOpen) return null;

  const fullName = adminUser?.firstname
    ? `${adminUser.firstname} ${adminUser.lastname || ''}`.trim()
    : 'Administrator';
  const email = adminUser?.email || 'admin@ablework.com';
  const role = adminUser?.role || 'admin';

  const Toggle = ({ enabled }) => (
    <span className={`w-11 h-6 rounded-full border-2 flex items-center transition-all shrink-0 ${enabled ? 'bg-[#10B981] border-[#10B981] justify-end' : 'bg-transparent border-[#03045E]/30 justify-start'}`}>
      <span className={`w-4 h-4 rounded-full mx-0.5 transition-all ${enabled ? 'bg-white' : 'bg-[#03045E]/40'}`} />
    </span>
  );

    return (
    <div className="w-full max-w-6xl mx-auto relative pb-6 sm:pb-12 px-1 sm:px-0 animate-in fade-in duration-300 text-[#03045E]">

      <div className="mb-4 sm:mb-10 bg-[#f4f4f4] p-4 sm:p-8 rounded-2xl sm:rounded-3xl shadow-[0_10px_30px_rgba(3,4,94,0.06)] border border-[#03045E]/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 sm:gap-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 w-full">
          <div className="relative shrink-0">
            <div className="w-16 h-16 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-full overflow-hidden border-4 border-white shadow-md bg-white flex items-center justify-center">
              <svg className="w-8 h-8 sm:w-12 sm:h-12 text-[#2C7FFF]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div className="absolute bottom-0 right-0 w-6 h-6 sm:w-9 sm:h-9 rounded-full flex items-center justify-center bg-[#2C7FFF] text-white border-2 border-white shadow-md">
              <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>

          <div className="min-w-0 flex-1">
            <h1 className="text-lg sm:text-2xl md:text-3xl font-extrabold text-[#03045E] tracking-tight">
              Settings
            </h1>
            <p className="text-[11px] sm:text-sm font-semibold text-[#03045E] mt-1">
              Manage how your admin workspace behaves.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8">

        <div className="flex flex-col gap-4 sm:gap-6 p-4 sm:p-8 bg-[#f4f4f4] rounded-2xl sm:rounded-3xl shadow-[0_10px_30px_rgba(3,4,94,0.04)] border border-[#03045E]/20 h-fit transition-all duration-300 hover:shadow-[0_20px_40px_rgba(3,4,94,0.08)]">
          <div className="flex items-center gap-3 border-b border-[#03045E]/20 pb-3 sm:pb-4">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white text-[#2C7FFF] border border-[#03045E]/10 flex items-center justify-center shrink-0">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-[#2C7FFF]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
            <h2 className="text-base sm:text-xl font-bold text-[#03045E]">Notifications</h2>
          </div>

          <button
            onClick={() => setNotifyPending(!notifyPending)}
            className="flex items-center gap-3 p-3 sm:p-4 bg-white border border-[#03045E]/20 rounded-xl sm:rounded-2xl cursor-pointer text-left"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shrink-0 bg-[#f59e0b]/15 text-[#b45309]">
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-bold text-[#03045E]">Pending Reviews</p>
              <p className="text-[10px] sm:text-xs font-semibold text-[#03045E]/60 mt-0.5 truncate">Alert when new docs arrive</p>
            </div>
            <Toggle enabled={notifyPending} />
          </button>

          <button
            onClick={() => setNotifyApproved(!notifyApproved)}
            className="flex items-center gap-3 p-3 sm:p-4 bg-white border border-[#03045E]/20 rounded-xl sm:rounded-2xl cursor-pointer text-left"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shrink-0 bg-[#10b981]/15 text-[#047857]">
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-bold text-[#03045E]">Approval Activity</p>
              <p className="text-[10px] sm:text-xs font-semibold text-[#03045E]/60 mt-0.5 truncate">Confirm every approved account</p>
            </div>
            <Toggle enabled={notifyApproved} />
          </button>

          <button
            onClick={() => setNotifyRejected(!notifyRejected)}
            className="flex items-center gap-3 p-3 sm:p-4 bg-white border border-[#03045E]/20 rounded-xl sm:rounded-2xl cursor-pointer text-left"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shrink-0 bg-[#dc2626]/15 text-[#b91c1c]">
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-bold text-[#03045E]">Rejection Alerts</p>
              <p className="text-[10px] sm:text-xs font-semibold text-[#03045E]/60 mt-0.5 truncate">Notify when accounts are rejected</p>
            </div>
            <Toggle enabled={notifyRejected} />
          </button>
        </div>

        <div className="flex flex-col gap-4 sm:gap-6 p-4 sm:p-8 bg-[#f4f4f4] rounded-2xl sm:rounded-3xl shadow-[0_10px_30px_rgba(3,4,94,0.04)] border border-[#03045E]/20 h-fit transition-all duration-300 hover:shadow-[0_20px_40px_rgba(3,4,94,0.08)]">
          <div className="flex items-center gap-3 border-b border-[#03045E]/20 pb-3 sm:pb-4">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white text-[#2C7FFF] border border-[#03045E]/10 flex items-center justify-center shrink-0">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-[#2C7FFF]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h7" />
              </svg>
            </div>
            <h2 className="text-base sm:text-xl font-bold text-[#03045E]">Workspace</h2>
          </div>

          <button
            onClick={() => setCompactMode(!compactMode)}
            className="flex items-center gap-3 p-3 sm:p-4 bg-white border border-[#03045E]/20 rounded-xl sm:rounded-2xl cursor-pointer text-left"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shrink-0 bg-[#2C7FFF]/15 text-[#2C7FFF]">
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h7" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-bold text-[#03045E]">Compact List View</p>
              <p className="text-[10px] sm:text-xs font-semibold text-[#03045E]/60 mt-0.5 truncate">Show more users per screen</p>
            </div>
            <Toggle enabled={compactMode} />
          </button>

          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className="flex items-center gap-3 p-3 sm:p-4 bg-white border border-[#03045E]/20 rounded-2xl cursor-pointer text-left"
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-[#2C7FFF]/15 text-[#2C7FFF]">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-[#03045E]">Auto Refresh Data</p>
              <p className="text-xs font-semibold text-[#03045E]/60 mt-0.5">Keep dashboard stats up to date</p>
            </div>
            <Toggle enabled={autoRefresh} />
          </button>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-[#03045E]">Signed in as</label>
            <div className="flex items-center gap-3 p-4 bg-white border border-[#03045E]/20 rounded-2xl">
              <div className="w-10 h-10 rounded-xl bg-[#2C7FFF] text-white flex items-center justify-center shrink-0">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-[#03045E] truncate">{fullName}</p>
                <p className="text-xs font-semibold text-[#03045E]/60 truncate mt-0.5">{email}</p>
              </div>
              <span className="px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest bg-[#2C7FFF] text-white shrink-0">
                {role}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 pt-6 border-t border-[#03045E]/20 flex flex-col sm:flex-row gap-3">
        <button
          onClick={onClose}
          className="flex-1 py-4 bg-transparent border-2 border-[#03045E]/25 text-[#03045E] font-bold rounded-2xl transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
          <span>Cancel</span>
        </button>
        <button
          onClick={onClose}
          className="flex-1 py-4 bg-[#03045E] text-white font-bold rounded-2xl hover:bg-[#2C7FFF] transition-all shadow-[0_10px_25px_rgba(3,4,94,0.15)] flex items-center justify-center gap-2 cursor-pointer"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          <span>Save Changes</span>
        </button>
      </div>
    </div>
  );
}