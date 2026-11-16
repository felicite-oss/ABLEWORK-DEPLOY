import React, { useState, useEffect, useContext, useMemo } from 'react';
import { AccessibilityContext } from '../../context/AccessibilityContext';
import { useColorPalette } from '../../context/ColorPaletteContext';
import API_BASE_URL from '../../../config';
import { parseWithdrawalReasons, labelForReason } from '../../shared/withdrawalReasons';


export default function EmployerApplications({ profile, refreshStats }) {
  const { mode } = useContext(AccessibilityContext);
  const { paletteKey } = useColorPalette();
  const isContrast = mode && typeof mode === 'string' && mode.toLowerCase().includes('contrast');
  const isDarkMode = mode && typeof mode === 'string' && (mode.toLowerCase().includes('dark') || mode.toLowerCase().includes('comfort'));
  const isDark = isContrast || isDarkMode;
  const isHighContrastOrDarkComfort = paletteKey === 'highContrast' || paletteKey === 'darkComfort';
  const [applications, setApplications] = useState([]);
  const [selectedApp, setSelectedApp] = useState(null); 
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');
  const [nextSteps, setNextSteps] = useState({ isOpen: false, status: '' });
  const [messageText, setMessageText] = useState('');
  const [showStatusAlert, setShowStatusAlert] = useState(false);
  const [statusAlert, setStatusAlert] = useState({ title: '', subtitle: '', tone: 'default' });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAppDropdownOpen, setIsAppDropdownOpen] = useState(false); 

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab]);

  const fetchApplications = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/employer/${profile.user_id}/applications`);
      if (res.ok) {
        const data = await res.json();
        setApplications(data);
      }
    } catch (err) {
      console.error("Failed to fetch applications");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [profile.user_id]);

    // --- REAL-TIME APPLICANT POLLING ---
  useEffect(() => {
    if (!profile || !profile.user_id) return;

    const pollApps = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/employer/${profile.user_id}/applications`);
        if (res.ok) {
          const latestApps = await res.json();
          setApplications(prevApps => {
            const hasUpdate = latestApps.length !== prevApps.length || 
              latestApps.some(newApp => {
                const oldApp = prevApps.find(a => a.application_id === newApp.application_id);
                return oldApp && oldApp.application_status !== newApp.application_status;
              });
            
            if (hasUpdate) return latestApps;
            return prevApps;
          });
        }
      } catch (err) {
        // Silently ignore network errors
      }
    };

    const interval = setInterval(pollApps, 10000);
    return () => clearInterval(interval);
  }, [profile]);

  const updateStatus = async (applicationId, newStatus, employerMessage = null, closeModal = true, showAlert = false) => {
    const applicantName = selectedApp?.firstname || 'The applicant';
    const jobTitle = selectedApp?.job_title || 'the position';

    try {
      const res = await fetch(`${API_BASE_URL}/api/applications/${applicationId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status: newStatus,
          employer_message: employerMessage,
          applicant_id: selectedApp?.applicant_id,
          job_title: selectedApp?.job_title,
          company_name: profile?.company_name || 'The Company'
        })
      });

      if (res.ok) {
        fetchApplications();
        if (refreshStats) refreshStats();

        if (showAlert) {
          if (newStatus === 'Hired') {
            setStatusAlert({
              title: 'Applicant Hired!',
              subtitle: `${applicantName} has been successfully hired for ${jobTitle}. A notification has been sent.`,
              tone: 'hired'
            });
          } else if (newStatus === 'Shortlisted') {
            setStatusAlert({
              title: 'Applicant Shortlisted!',
              subtitle: `${applicantName} has been shortlisted for ${jobTitle}. Next steps were forwarded.`,
              tone: 'shortlisted'
            });
          } else if (newStatus === 'Rejected') {
            setStatusAlert({
              title: 'Applicant Rejected',
              subtitle: `${applicantName}'s application for ${jobTitle} has been updated to Rejected.`,
              tone: 'rejected'
            });
          } else {
            setStatusAlert({
              title: 'Status Updated',
              subtitle: `${applicantName}'s application is now set to ${newStatus}.`,
              tone: 'default'
            });
          }
          setShowStatusAlert(true);
        }
        
        if (closeModal) {
          setSelectedApp(null);
          setNextSteps({ isOpen: false, status: '' });
          setMessageText('');
        } else if (selectedApp && selectedApp.application_id === applicationId) {
          setSelectedApp(prev => ({ ...prev, application_status: newStatus }));
        }
      } else {
        const errorData = await res.json();
        
        setStatusAlert({
          title: 'Cannot Complete Action',
          subtitle: errorData.message || 'Failed to update status.',
          tone: 'rejected'
        });
        setShowStatusAlert(true);
        
        setNextSteps({ isOpen: false, status: '' });
        setIsSubmitting(false);
      }
    } catch (err) {
      console.error("Failed to update status:", err);
      setStatusAlert({
        title: 'Network Error',
        subtitle: 'Could not connect to the server. Please try again.',
        tone: 'rejected'
      });
      setShowStatusAlert(true);
      setIsSubmitting(false);
    }
  };

   const getStatusColor = (status) => {
    if (isHighContrastOrDarkComfort) {
      switch (status) {
        case 'Received': return 'bg-white text-black border-white';
        case 'Under Review': return 'bg-white text-black border-white';
        case 'Shortlisted': return 'bg-white text-black border-white';
        case 'Hired': return 'bg-white text-emerald-400 border-emerald-500';
        case 'Withdrawn': return 'bg-black text-white border-white';
        case 'Rejected': return 'bg-white text-red-600 border-red-500';
        case 'Multiple': return 'bg-[#2C7FFF] text-white border-[#2C7FFF]';
        default: return 'bg-white text-black border-white';
      }
    }
    if (isDark) {
      switch (status) {
        case 'Received': return 'bg-black text-white border-white';
        case 'Under Review': return 'bg-black text-white border-white';
        case 'Shortlisted': return 'bg-black text-white border-white';
        case 'Hired': return 'bg-black text-emerald-400 border-emerald-500';
        case 'Withdrawn': return 'bg-gray-800 text-gray-300 border-gray-500';
        case 'Rejected': return 'bg-white text-red-600 border-red-500';
        default: return 'bg-black text-white border-white';
      }
    }
    switch (status) {
      case 'Received': return 'bg-white text-[#03045E] border-gray-200';
      case 'Under Review': return 'bg-white text-[#03045E] border-gray-200';
      case 'Shortlisted': return 'bg-white text-[#03045E] border-gray-200';
      case 'Hired': return 'bg-white text-emerald-700 border-emerald-500';
      case 'Withdrawn': return 'bg-gray-100 text-gray-500 border-gray-300';
      case 'Rejected': return 'bg-white text-red-600 border-red-500';
      default: return 'bg-white text-[#03045E] border-gray-200';
    }
  };

  // --- GROUP APPLICATIONS BY APPLICANT ---
  const groupedApplicants = useMemo(() => {
    const groups = {};
    
    const filtered = applications.filter(app => {
      if (activeTab === 'All') return true;
      return app.application_status === activeTab;
    });

    filtered.forEach(app => {
      if (!groups[app.applicant_id]) {
        groups[app.applicant_id] = {
          ...app,
          applicationsList: [app]
        };
      } else {
        groups[app.applicant_id].applicationsList.push(app);
      }
    });

    return Object.values(groups);
  }, [applications, activeTab]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentApplicants = groupedApplicants.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(groupedApplicants.length / itemsPerPage);

  const tabs = ['All', 'Received', 'Under Review', 'Shortlisted', 'Hired', 'Rejected', 'Withdrawn'];
  const pageText = isDark ? 'text-white' : 'text-[#03045E]';
  const panelBg = isDark ? 'bg-black border-white' : 'bg-white border-gray-200';
  const cardBg = isDark ? 'bg-black border-white' : 'bg-white border-gray-200';
  const softPanel = isDark ? 'bg-black border-white' : 'bg-white border-gray-200';
  const muted = isDark ? 'text-white/80' : 'text-[#03045E]/80';
  const subtle = isDark ? 'text-white/60' : 'text-[#03045E]/60';
  const dividerColor = isDark ? 'border-white' : 'border-gray-200';

  const renderAlertIcon = (tone) => {
    if (tone === 'rejected') {
      return (
        <svg className="w-5 h-5 sm:w-8 sm:h-8 text-[#f4f4f4]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" />
        </svg>
      );
    }
    if (tone === 'shortlisted') {
      return (
        <svg className="w-5 h-5 sm:w-8 sm:h-8 text-[#f4f4f4]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.196-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
      );
    }
    return (
      <svg className="w-5 h-5 sm:w-8 sm:h-8 text-[#f4f4f4]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
      </svg>
    );
  };

   const getAlertBadgeStyle = (tone) => {
    if (tone === 'rejected') return 'bg-red-500';
    if (tone === 'hired') return 'bg-[#2C7FFF]';
    return 'bg-[#2C7FFF]';
  };
  const getAlertPillLabel = (tone) => {
    if (tone === 'hired') return 'Applicant Hired';
    if (tone === 'shortlisted') return 'Applicant Shortlisted';
    if (tone === 'rejected') return 'Applicant Rejected';
    return 'Status Updated';
  };

  if (isLoading) return <div className={`p-6 sm:p-10 font-bold text-sm sm:text-base ${pageText}`}>Loading applicants...</div>;

  return (
    <div className={`animate-fadeIn max-w-9xl mx-auto pb-6 sm:pb-10 relative px-1 sm:px-0 ${pageText}`}>
      <div className={`flex flex-col md:flex-row justify-between items-start md:items-center gap-3 sm:gap-4 mb-6 sm:mb-8 backdrop-blur-md p-4 sm:p-6 rounded-xl sm:rounded-2xl border-2 ${panelBg}`}>
        <div>
          <div className="flex items-center gap-1.5 sm:gap-2 mb-1 sm:mb-1.5 flex-wrap">
            <span className={`text-[10px] sm:text-xs font-extrabold px-2 sm:px-3 py-0.5 sm:py-1 rounded-full uppercase tracking-wider border-2 ${isDark ? 'bg-black text-white border-white' : 'bg-white text-[#2C7FFF] border-gray-200'}`}>Candidate Hub</span>
            <span className={`text-[10px] sm:text-xs font-bold px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full flex items-center gap-1 sm:gap-1.5 border-2 ${isDark ? 'bg-black text-white border-white' : 'bg-white text-[#03045E] border-gray-200'}`}>
              <span className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${isDark ? 'bg-white' : 'bg-[#2C7FFF]'} animate-pulse`}></span> Active Pipeline
            </span>
          </div>
          <h1 className={`text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight ${pageText}`}>Review Applicants</h1>
          <p className={`text-xs sm:text-sm font-semibold mt-0.5 ${muted}`}>Manage incoming applications, review qualifications, and update recruitment statuses.</p>
        </div>
      </div>
      
                                                      <div className={`flex gap-1 p-1 sm:gap-2 sm:p-2 rounded-xl sm:rounded-2xl border-2 w-full overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none'] ${panelBg}`}>
        {tabs.map(tab => {
          const count = tab === 'All' 
            ? applications.length 
            : applications.filter(a => a.application_status === tab).length;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 min-w-0 px-1.5 py-1 sm:px-4 sm:py-2.5 rounded-lg font-extrabold text-[8px] sm:text-sm whitespace-nowrap transition-all flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-2 cursor-pointer ${
                activeTab === tab
                  ? (isHighContrastOrDarkComfort
                      ? (isDark ? 'bg-white text-black shadow-md' : 'bg-[#2C7FFF] !text-white shadow-md')
                      : isDark
                        ? 'bg-white text-black shadow-md'
                        : 'bg-[#2C7FFF] text-white shadow-md')
                  : (isDark
                    ? 'text-white/70 hover:bg-white hover:text-black'
                    : 'text-[#03045E]/70 hover:bg-white hover:text-[#03045E]')
              }`}
            >
              <span className="truncate w-full text-center">{tab}</span>
              {count > 0 && (
                <span className={`px-1 py-0 sm:px-1.5 sm:py-0.5 rounded-full text-[7px] sm:text-[10px] font-black shrink-0 ${
                  activeTab === tab 
                    ? (isDark ? 'bg-black text-white' : 'bg-white text-[#2C7FFF]')
                    : (isDark 
                      ? 'bg-white text-black'
                      : 'bg-[#03045E]/10 text-[#03045E]')
                }`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>
      
        {groupedApplicants.length > 0 ? (
               <div className="flex flex-col gap-6 w-full">
          <div className={`w-full overflow-hidden rounded-2xl border-2 ${panelBg}`}>
            <div className="w-full overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className={`border-b-2 ${isDark ? 'border-white/20 bg-black/50' : 'border-gray-200 bg-gray-50'}`}>
                  <th className={`p-4 text-xs font-black uppercase tracking-wider ${pageText}`}>Applicant Details</th>
                  <th className={`p-4 text-xs font-black uppercase tracking-wider ${pageText}`}>Applied For</th>
                 <th className={`p-4 text-xs font-black uppercase tracking-wider text-center ${pageText}`}>Status</th>
                  <th className={`p-4 text-xs font-black uppercase tracking-wider text-center ${pageText}`}>Actions</th>
                </tr>
              </thead>
              <tbody>
                                {currentApplicants.map(applicant => {
                  const appCount = applicant.applicationsList.length;
                  
                  // --- NEW: CALCULATE DAYS WAITING ---
                  const daysSinceApplied = Math.floor((new Date() - new Date(applicant.applied_at)) / (1000 * 60 * 60 * 24));
                  const showWarning = ['Received', 'Under Review'].includes(applicant.application_status) && daysSinceApplied >= 10;
                  const isUrgent = daysSinceApplied >= 13;
                  // -----------------------------------

                  return (
                  <tr key={applicant.applicant_id} className={`border-b-2 last:border-b-0 transition-colors ${isDark ? 'border-white/10 hover:bg-white/5' : 'border-gray-100 hover:bg-gray-50'}`}>
                    <td className="p-4 align-top">
                      <h3 className={`text-sm sm:text-base font-bold leading-tight ${pageText}`}>{applicant.firstname} {applicant.lastname}</h3>
                      <p className={`text-[10px] sm:text-xs mt-1 ${subtle}`}>Total Applications: {appCount}</p>
                      
                      {/* --- NEW: TIME WARNING BADGE --- */}
                      {showWarning && (
                        <div 
                          role="status"
                          aria-label={isUrgent ? `Urgent: Auto-rejects in ${14 - daysSinceApplied} days` : `Waiting for ${daysSinceApplied} days`}
                          className={`mt-2 inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-wider border-2 ${
                            isUrgent 
                              ? 'bg-red-50 text-red-700 border-red-300 animate-pulse' // Urgent (13+ days)
                              : 'bg-amber-50 text-amber-700 border-amber-300'        // Warning (10-12 days)
                          }`}
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                          </svg>
                          {isUrgent 
                            ? `Auto-rejects in ${14 - daysSinceApplied} day(s)!` 
                            : `Waiting ${daysSinceApplied} days`}
                        </div>
                      )}
                      {/* -------------------------------- */}
                      
                    </td>
                    <td className="p-4 align-top">
                      {appCount > 1 ? (
                        <p className={`text-xs sm:text-sm font-semibold ${isDark ? 'text-white' : 'text-[#2C7FFF]'}`}>
                          {appCount} Roles Applied
                        </p>
                      ) : (
                        <p className={`text-xs sm:text-sm font-semibold ${isDark ? 'text-white' : 'text-[#2C7FFF]'}`}>{applicant.job_title}</p>
                      )}
                    </td>
                    <td className="p-4 align-top text-center">
                      <span className={`inline-flex items-center justify-center w-28 sm:w-32 px-2.5 py-1 rounded-lg text-[10px] sm:text-xs font-black uppercase tracking-wider border-1 ${getStatusColor(appCount > 1 ? 'Multiple' : applicant.application_status)}`}>
                        {appCount > 1 ? 'Multiple' : applicant.application_status}
                      </span>
                    </td>
                    <td className="p-4 align-top text-center">
                      {/* --- FIXED: VIEW APPLICATIONS BUTTON --- */}
                      <button 
                        onClick={async () => {
                          setNextSteps({ isOpen: false, status: '' });
                          setMessageText('');
                          
                          // 1. Open the modal immediately
                          setSelectedApp(applicant); 

                          // 2. If status is 'Received', silently update to 'Under Review'
                          if (applicant.application_status === 'Received') {
                            try {
                              const res = await fetch(`${API_BASE_URL}/api/applications/${applicant.application_id}/view`, {
                                method: 'PUT'
                              });
                              if (res.ok) {
                                // Update local state
                                setSelectedApp(prev => {
                                  if (prev.applicationsList) {
                                    const updatedList = prev.applicationsList.map(a => 
                                      a.application_id === applicant.application_id 
                                        ? { ...a, application_status: 'Under Review' } 
                                        : a
                                    );
                                    return { ...prev, applicationsList: updatedList, application_status: 'Under Review' };
                                  }
                                  return { ...prev, application_status: 'Under Review' };
                                });
                                
                                // Refresh main table
                                fetchApplications();
                                if (refreshStats) refreshStats();
                              }
                            } catch (err) {
                              console.error("Failed to auto-update to Under Review:", err);
                            }
                          }
                        }} 
                        className={`px-3 py-1.5 sm:px-4 sm:py-2 text-[10px] sm:text-xs font-black rounded-lg border-2 transition cursor-pointer ${
                          isDark
                            ? 'bg-black text-white border-white hover:bg-white hover:text-black'
                            : 'bg-white text-[#03045E] border-gray-200 hover:bg-gray-100'
                        }`}
                      >
                        View Applications
                      </button>
                    </td>
                  </tr>
                )})}
              </tbody>
            </table>
            </div>
          </div>
        </div>
      ) : (
        <div className={`p-5 sm:p-12 rounded-lg sm:rounded-xl border-2 border-dashed flex flex-col items-center justify-center text-center min-h-[200px] sm:min-h-[280px] ${
          isDark 
            ? 'text-white/70 border-white bg-black' 
            : 'text-[#03045E]/70 border-gray-200 bg-white'
        }`}>
          <div className={`w-10 h-10 sm:w-16 sm:h-16 rounded-full flex items-center justify-center shadow-sm mb-3 sm:mb-5 border ${isDark ? 'bg-black border-white/20' : 'bg-white border-[#03045E]/20'}`}>
            <svg className={`w-5 h-5 sm:w-8 sm:h-8 ${isDark ? 'text-white' : 'text-[#2C7FFF]'}`} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
            </svg>
          </div>
          <h3 className={`text-base sm:text-xl font-extrabold mb-1.5 sm:mb-2 ${pageText}`}>
            No {activeTab !== 'All' ? activeTab.toLowerCase() : ''} applications found
          </h3>
          <p className={`text-[11px] sm:text-sm font-semibold max-w-md leading-relaxed px-2 ${muted}`}>
            {activeTab === 'All' 
              ? "You haven't received any job applications yet. Once candidates apply, they will appear here." 
              : `You don't have any applications currently in the "${activeTab}" state.`}
          </p>
        </div>
        
      )}

      {totalPages > 1 && (
        <div className={`flex justify-between items-center gap-3 w-full pt-4 mt-2 border-t-2 ${isDark ? 'border-white/15' : 'border-[#03045E]/10'}`}>
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className={`px-4 py-2 sm:px-5 sm:py-2.5 rounded-lg font-black text-[10px] sm:text-xs uppercase tracking-wider transition-all cursor-pointer border-2 disabled:opacity-50 disabled:cursor-not-allowed ${isDark ? 'bg-black text-white border-white/30' : 'bg-white text-[#03045E] border-[#03045E]/30'}`}
          >
            Previous
          </button>
          <span className={`text-[10px] sm:text-xs font-black ${isDark ? 'text-white/70' : 'text-[#03045E]/70'}`}>
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

      {selectedApp && (
        <div
          className="fixed inset-0 z-[9999999] flex items-center justify-center p-4 backdrop-blur-[1px] animate-in fade-in transition-all duration-300"
          style={{ backgroundColor: (isContrast || isDarkMode) ? 'rgba(0, 0, 0, 0.75)' : 'rgba(72, 71, 71, 0.6)', filter: 'none' }}
        >
          <div className={`p-4 sm:p-8 rounded-xl sm:rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto flex flex-col border-2 ${
            isDark ? 'bg-black border-white text-white' : 'bg-white border-gray-200 text-[#03045E]'
          }`}>
            
            <div className={`flex justify-between items-start gap-2 sm:gap-0 mb-4 sm:mb-6 pb-4 sm:pb-6 border-b-2 ${dividerColor}`}>
              <div className="pr-4">
                <h2 className={`text-xl sm:text-3xl font-extrabold ${pageText}`}>{selectedApp.firstname} {selectedApp.lastname}</h2>
                <p className={`text-xs sm:text-base font-semibold mt-1 ${muted}`}>
                  {selectedApp.applicationsList.length > 1 
                    ? `Applied for ${selectedApp.applicationsList.length} different roles.` 
                    : `Applying for: ${selectedApp.job_title}`}
                </p>
              </div>
              <button 
                onClick={() => { setSelectedApp(null); setIsAppDropdownOpen(false); }}
                className={`p-1.5 sm:p-2 rounded-lg transition-colors border-2 cursor-pointer shrink-0 ${
                  isDark 
                    ? 'bg-black text-white border-white hover:bg-white hover:text-black' 
                    : 'bg-white text-[#03045E] border-gray-200 hover:bg-gray-100'
                }`}
                aria-label="Close modal"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {selectedApp.applicationsList.length > 1 && (
               <div className="mb-6 flex flex-col gap-2 relative">
                  <label className={`text-[10px] sm:text-xs font-extrabold uppercase tracking-wider ${subtle}`}>Select Application to Review</label>
                  
                  <button
                    type="button"
                    onClick={() => setIsAppDropdownOpen(!isAppDropdownOpen)}
                    className={`w-full flex items-center justify-between p-3 border-2 rounded-xl font-bold text-sm outline-none transition cursor-pointer ${
                      isDark 
                        ? 'bg-black border-white/30 text-white hover:border-white' 
                        : 'bg-[#f4f4f4] border-[#03045E]/20 text-[#03045E] hover:border-[#2C7FFF]'
                    }`}
                  >
                    <span className="truncate pr-2">
                      {selectedApp.job_title} — <span className="opacity-70">(Status: {selectedApp.application_status})</span>
                    </span>
                    <svg 
                      className={`w-4 h-4 shrink-0 transition-transform duration-200 ${isAppDropdownOpen ? 'rotate-180' : ''}`} 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2.5" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {isAppDropdownOpen && (
                    <>
                      <div 
                        className="fixed inset-0 z-40" 
                        onClick={() => setIsAppDropdownOpen(false)}
                      ></div>
                      
                      <div className={`absolute top-full left-0 right-0 mt-2 z-50 rounded-xl border-2 shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 ${
                        isDark ? 'bg-black border-white/30' : 'bg-white border-[#03045E]/20'
                      }`}>
                        {selectedApp.applicationsList.map(app => {
                          const isSelected = String(selectedApp.application_id) === String(app.application_id);
                          return (
                            <button
                              key={app.application_id}
                              type="button"
                              onClick={() => {
                                setSelectedApp(prev => ({ 
                                  ...prev, 
                                  job_title: app.job_title,
                                  application_id: app.application_id,
                                  application_status: app.application_status,
                                  resume_path: app.resume_path,
                                  cover_letter: app.cover_letter
                                }));
                                setIsAppDropdownOpen(false);
                              }}
                              className={`w-full text-left px-4 py-3 text-sm font-bold transition-colors flex items-center justify-between gap-3 border-b-2 last:border-b-0 ${
                                isDark ? 'border-white/10' : 'border-gray-100'
                              } ${
                                isSelected
                                  ? (isDark ? 'bg-white/10 text-white' : 'bg-[#2C7FFF]/10 text-[#2C7FFF]')
                                  : (isDark ? 'text-white/80 hover:bg-white/5' : 'text-[#03045E]/80 hover:bg-gray-50')
                              }`}
                            >
                              <div className="flex items-center gap-2 truncate">
                                {isSelected && (
                                  <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                  </svg>
                                )}
                                <span className="truncate">{app.job_title}</span>
                              </div>
                              <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border-2 shrink-0 ${
                                getStatusColor(app.application_status)
                              }`}>
                                {app.application_status}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </>
                  )}
               </div>
            )}

            {selectedApp.application_status === 'Withdrawn' && selectedApp.withdrawal_reasons && (
              <div
                role="note"
                aria-label="Applicant withdrawal reason"
                className={`mb-6 p-4 rounded-xl border-2 ${
                  isHighContrastOrDarkComfort
                    ? 'bg-black border-red-500 text-white'
                    : isDark
                      ? 'bg-[#1A1A1A] border-red-400/50 text-white'
                      : 'bg-red-50 border-red-300 text-[#03045E]'
                }`}
              >
                <h4 className="text-[10px] sm:text-xs font-extrabold uppercase tracking-wider mb-2 text-red-500">
                  Withdrawn by Applicant
                  {selectedApp.withdrawn_at && (
                    <span className="normal-case font-semibold ml-1 opacity-70">
                      on {new Date(selectedApp.withdrawn_at).toLocaleDateString()}
                    </span>
                  )}
                </h4>
                <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm font-bold">
                  {parseWithdrawalReasons(selectedApp.withdrawal_reasons).map(key => (
                    <li key={key} className={isDark ? 'marker:text-red-400' : 'marker:text-red-500'}>
                      {labelForReason(key)}
                    </li>
                  ))}
                </ul>
                {selectedApp.withdrawal_details && (
                  <p className={`mt-3 text-xs sm:text-sm italic font-medium border-t pt-2 ${isDark ? 'border-white/10 opacity-90' : 'border-red-200 opacity-80'}`}>
                    "{selectedApp.withdrawal_details}"
                  </p>
                )}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 mb-6">
              
              <div className="flex flex-col gap-4 sm:gap-6">
                <div>
                  
                  <h4 className={`text-[10px] sm:text-xs font-extrabold uppercase tracking-wider mb-3 sm:mb-4 ${subtle}`}>Application Documents</h4>
                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                      {selectedApp.resume_path ? (
                        (() => {
                          const rawPath = String(selectedApp.resume_path).trim();
                          const fileUrl = rawPath.startsWith('http://') || rawPath.startsWith('https://')
                            ? rawPath
                            : `${API_BASE_URL}/uploads/${rawPath.replace(/^uploads[\\/]/, '')}`;
                          
                          return (
                            <a 
                              href={fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`flex-1 inline-flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 text-[10px] sm:text-sm font-bold rounded-lg sm:rounded-xl border-2 shadow-sm transition-all hover:shadow-md ${
                                isDark 
                                  ? 'bg-white text-black border-white' 
                                  : 'bg-[#03045E] text-white border-[#03045E]'
                              }`}
                            >
                              <svg className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                              <span>View Attached Resume</span>
                            </a>
                          );
                        })()
                      ) : (
                        <p className={`flex-1 text-xs sm:text-sm font-semibold p-2.5 sm:p-3 rounded-lg sm:rounded-xl border-2 text-center flex items-center justify-center ${
                          isDark ? 'text-white bg-black border-white' : 'text-[#03045E] bg-white border-gray-200'
                        }`}>
                          No resume attached.
                        </p>
                      )}

                      {selectedApp.certificate_path ? (
                        (() => {
                          const rawCertPath = String(selectedApp.certificate_path).trim();
                          const certUrl = rawCertPath.startsWith('http://') || rawCertPath.startsWith('https://')
                            ? rawCertPath
                            : `${API_BASE_URL}/uploads/${rawCertPath.replace(/^uploads[\\/]/, '')}`;

                          return (
                            <a 
                              href={certUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`flex-1 inline-flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 text-[10px] sm:text-sm font-bold rounded-lg sm:rounded-xl border-2 shadow-sm transition-all hover:shadow-md ${
                                isDark 
                                  ? 'bg-white text-black border-white' 
                                  : 'bg-[#03045E] text-white border-[#03045E]'
                              }`}
                            >
                              <svg className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                              </svg>
                              <span>View Certificate</span>
                            </a>
                          );
                        })()
                      ) : (
                        <p className={`flex-1 text-xs sm:text-sm font-semibold p-2.5 sm:p-3 rounded-lg sm:rounded-xl border-2 text-center flex items-center justify-center opacity-60 ${
                          isDark ? 'text-white bg-black border-white' : 'text-[#03045E] bg-white border-gray-200'
                        }`}>
                          No certificate attached.
                        </p>
                      )}
                    </div>
                </div>
              </div>

              <div className="flex flex-col gap-4 sm:gap-6">
                <div>
                  <h4 className={`text-[10px] sm:text-xs font-extrabold uppercase tracking-wider mb-2 ${subtle}`}>Verified Skills</h4>
                  <div className="flex flex-wrap gap-1.5 sm:gap-2">
                    {selectedApp.skills ? 
                      (typeof selectedApp.skills === 'string' ? JSON.parse(selectedApp.skills) : selectedApp.skills).map((skill, i) => (
                        <span key={i} className={`px-2 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-xs font-bold rounded-full border-2 ${
                          isDark 
                            ? 'bg-black text-white border-white' 
                            : 'bg-white text-[#03045E] border-gray-200'
                        }`}>
                          {skill}
                        </span>
                      ))
                    : <span className={`text-xs sm:text-sm ${subtle}`}>No skills listed</span>}
                  </div>
                </div>

                <div>
                  <h4 className={`text-[10px] sm:text-xs font-extrabold uppercase tracking-wider mb-2 ${subtle}`}>Requested Accommodations</h4>
                  <div className="flex flex-wrap gap-1.5 sm:gap-2">
                    {selectedApp.accommodations_needed ? 
                      (typeof selectedApp.accommodations_needed === 'string' ? JSON.parse(selectedApp.accommodations_needed) : selectedApp.accommodations_needed).map((acc, i) => (
                        <span key={i} className={`px-2 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-xs font-bold rounded-full border-2 ${
                          isDark 
                            ? 'bg-black text-white border-white' 
                            : 'bg-white text-[#03045E] border-gray-200'
                        }`}>
                          {acc}
                        </span>
                      ))
                    : <span className={`text-xs sm:text-sm ${subtle}`}>None requested</span>}
                  </div>
                </div>

                {selectedApp.cover_letter && selectedApp.cover_letter.trim() !== '' && (
                  <div className={`p-3 sm:p-5 rounded-lg sm:rounded-xl border-2 ${softPanel}`}>
                    <h5 className={`text-[10px] sm:text-xs font-extrabold uppercase tracking-wider mb-2 ${subtle}`}>Cover Letter / Message</h5>
                    <p className={`text-xs sm:text-sm font-medium whitespace-pre-wrap leading-relaxed ${pageText}`}>
                      {selectedApp.cover_letter}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className={`mt-auto pt-4 sm:pt-6 border-t-2 w-full ${dividerColor}`}>
              {nextSteps.isOpen ? (
                <div className="flex flex-col gap-3">
                  <label className={`text-xs sm:text-sm font-bold ${pageText}`}>
                    {nextSteps.status === 'Rejected' 
                        ? 'Provide a Reason for Rejection (Optional but recommended)' 
                        : `Provide Next Steps for the Applicant (for ${nextSteps.status} status)`}
                  </label>
                  <textarea
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    placeholder="e.g., We would love to invite you for an interview on Monday at 10 AM. Here is the Google Meet link..."
                    className={`w-full p-3 sm:p-4 border-2 rounded-lg sm:rounded-xl outline-none min-h-[80px] sm:min-h-[100px] text-xs sm:text-sm resize-none font-semibold ${
                      isDark 
                        ? 'border-white bg-black text-white placeholder-white/40' 
                        : 'border-gray-200 bg-white text-[#03045E] placeholder-[#03045E]/40'
                    }`}
                  />
                  <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 mt-2">
                    <button
                      onClick={() => { setNextSteps({ isOpen: false, status: '' }); setMessageText(''); }}
                      className={`w-full sm:w-auto px-4 sm:px-6 py-2.5 text-xs sm:text-sm font-bold rounded-md sm:rounded-lg cursor-pointer border-2 ${
                        isDark 
                          ? 'bg-black text-white border-white' 
                          : 'bg-white text-[#03045E] border-gray-200'
                      }`}
                    >
                      Cancel
                    </button>
                                      <button
                      onClick={async () => {
                        setIsSubmitting(true);
                        await new Promise(r => setTimeout(r, 2000));
                        await updateStatus(selectedApp.application_id, nextSteps.status, messageText, true, true);
                        setIsSubmitting(false);
                      }}
                      disabled={isSubmitting}
                      className={`w-full sm:w-auto px-5 sm:px-7 py-2.5 text-xs sm:text-sm font-bold rounded-xl sm:rounded-2xl cursor-pointer transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-70 flex items-center justify-center gap-2 ${
                        isDark 
                          ? 'bg-white text-black border-2 border-white hover:bg-gray-200 hover:border-gray-200' 
                          : 'bg-[#2C7FFF] text-white border-2 border-[#2C7FFF] hover:bg-[#1a5ce6] hover:border-[#1a5ce6]'
                      }`}
                    >
                      {isSubmitting ? (
                        <>
                          <svg className="w-4 h-4 animate-spin shrink-0" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                          </svg>
                          Sending...
                        </>
                      ) : (
                        'Confirm & Send'
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row justify-end items-center w-full gap-3 sm:gap-0">
                  {selectedApp.application_status !== 'Hired' && selectedApp.application_status !== 'Rejected' && selectedApp.application_status !== 'Withdrawn' ? (
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
                      <button 
                        onClick={() => setNextSteps({ isOpen: true, status: 'Rejected' })} 
                        className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 text-xs sm:text-sm font-bold rounded-md sm:rounded-lg cursor-pointer border-2 bg-white text-red-600 border-red-500"
                        >
                        Reject
                      </button>
                      
                      <button 
                        onClick={() => setNextSteps({ isOpen: true, status: 'Shortlisted' })} 
                        className={`w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 text-xs sm:text-sm font-bold rounded-md sm:rounded-lg cursor-pointer border-2 transition-colors ${
                          isDark 
                            ? 'bg-[#03045E]/40 text-white border-[#03045E] hover:bg-[#03045E]/60' 
                            : 'bg-[#03045E] text-white border-[#03045E] hover:bg-[#020236]'
                        }`}
                      >
                        Shortlist
                      </button>
                      
                      <button 
                        onClick={() => setNextSteps({ isOpen: true, status: 'Hired' })} 
                        className={`w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 text-xs sm:text-sm font-bold rounded-md sm:rounded-lg cursor-pointer border-2 ${
                          isDark 
                            ? 'bg-black text-emerald-400 border-emerald-500' 
                            : 'bg-white text-emerald-700 border-emerald-500'
                        }`}
                      >
                        Hire Applicant
                      </button>
                    </div>
                  ) : (
                    <div className={`w-full sm:w-auto px-3 sm:px-4 py-2 rounded-md sm:rounded-lg border-2 text-center ${isDark ? 'bg-black border-white' : 'bg-white border-gray-200'}`}>
                      <p className={`text-xs sm:text-sm font-bold italic ${pageText}`}>
                        Application finalized as <span className={isDark ? 'text-white' : 'text-[#2C7FFF]'}>{selectedApp.application_status}</span>.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

          </div>
        </div>
      )}

           {isSubmitting && (
        <div
          className="fixed inset-0 z-[9999999] flex items-center justify-center p-4 backdrop-blur-[1px] animate-in fade-in transition-all duration-300"
          style={{ backgroundColor: (isContrast || isDarkMode) ? 'rgba(0, 0, 0, 0.75)' : 'rgba(72, 71, 71, 0.6)', filter: 'none' }}
        >
          <div className={`border-2 px-8 py-10 rounded-2xl shadow-2xl flex flex-col items-center max-w-sm w-full mx-auto ${isDark ? 'bg-black border-[#2C7FFF]' : 'bg-white border-[#03045E]/20'}`}>
            <div className="relative w-16 h-16 flex items-center justify-center mb-5">
              <div className="absolute inset-0 rounded-full border-4 border-[#2C7FFF]/30 animate-pulse"></div>
              <div className="absolute inset-0 rounded-full border-4 border-t-[#2C7FFF] border-r-transparent border-b-[#03045E] border-l-transparent animate-spin"></div>
              <div className={`w-6 h-6 rounded-full shadow-md animate-ping opacity-75 absolute ${isDark ? 'bg-white' : 'bg-[#03045E]'}`}></div>
            </div>
            <h3 className={`text-lg font-black tracking-tight text-center mb-1 ${isDark ? 'text-white' : 'text-[#03045E]'}`}>Sending Message</h3>
            <p className={`text-xs text-center font-bold ${isDark ? 'text-white/80' : 'text-[#03045E]/80'}`}>Processing your update...</p>
          </div>
        </div>
      )}

      {showStatusAlert && (
        <div
          className="fixed inset-0 z-[9999999] flex items-center justify-center p-4 backdrop-blur-[1spx] animate-in fade-in transition-all duration-300"
          style={{ backgroundColor: (isContrast || isDarkMode) ? 'rgba(0, 0, 0, 0.75)' : 'rgba(72, 71, 71, 0.6)', filter: 'none' }}
        >
          <div className={`relative w-full max-w-md rounded-lg sm:rounded-xl shadow-2xl border-2 overflow-hidden animate-in zoom-in-95 duration-300 bg-white ${statusAlert.tone === 'rejected' ? 'border-red-500/30' : 'border-[#2C7FFF]/30'}`}>
            <div className="px-6 sm:px-8 pt-6 sm:pt-8 pb-5 sm:pb-7 flex flex-col items-center text-center">
              <div className="relative mb-4 sm:mb-5">
                <div className={`w-14 h-14 sm:w-20 sm:h-20 rounded-full flex items-center justify-center ${statusAlert.tone === 'rejected' ? 'bg-red-100' : 'bg-[#2C7FFF]/10'}`}>
                  <div className={`w-10 h-10 sm:w-14 sm:h-14 rounded-full flex items-center justify-center shadow-lg ${getAlertBadgeStyle(statusAlert.tone)} shadow-black/10`}>
                    {renderAlertIcon(statusAlert.tone)}
                  </div>
                </div>
                <div className={`absolute -top-1 -right-1 w-5 h-5 sm:w-7 sm:h-7 rounded-full flex items-center justify-center border-2 bg-[#03045E] border-white`}>
                  <svg className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>

              <h2 className="text-lg sm:text-2xl font-black text-[#03045E] tracking-tight mb-2">
                {statusAlert.title}
              </h2>
              <p className="text-xs sm:text-sm font-semibold text-[#03045E]/70 leading-relaxed mb-4 sm:mb-6">
                {statusAlert.subtitle}
              </p>

              <button
                onClick={() => setShowStatusAlert(false)}
                className={`w-full py-3 sm:py-3.5 rounded-md sm:rounded-lg font-black text-xs sm:text-sm uppercase tracking-wider shadow-md transition-all cursor-pointer ${getAlertBadgeStyle(statusAlert.tone)} ${isDark ? '!text-black' : 'text-white'} hover:opacity-90`}
              >
                Got it!
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}