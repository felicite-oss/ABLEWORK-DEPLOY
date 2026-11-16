import React, { useState, useEffect, useMemo, useContext } from 'react';
import API_BASE_URL from '../../../config';
import { AccessibilityContext } from '../../context/AccessibilityContext';
import { useColorPalette } from '../../context/ColorPaletteContext';
import {WITHDRAWAL_REASON_OPTIONS,WITHDRAWABLE_STATUSES,} from '../../shared/withdrawalReasons';

export default function ApplicantJobTracker({ applications = [], profile, refreshData }) {
  const { mode } = useContext(AccessibilityContext);
  const { paletteKey } = useColorPalette();
  
  const isContrast = mode && typeof mode === 'string' && mode.toLowerCase().includes('contrast');
  const isDarkMode = mode && typeof mode === 'string' && (mode.toLowerCase().includes('dark') || mode.toLowerCase().includes('comfort'));
  const isDark = isContrast || isDarkMode;
  const isHighContrastOrDarkComfort = paletteKey === 'highContrast' || paletteKey === 'darkComfort';

  // Base Colors (60-30-10 Rule Applied)
  const pageBg = isDark ? 'bg-black' : 'bg-transparent';
  const textColor = isDark ? 'text-white' : 'text-[#03045E]';
  const mutedText = isDark ? 'text-white/70' : 'text-[#03045E]/70';
  const cardBg = isDark ? 'bg-[#111111] border-white/30' : 'bg-white border-[#03045E]/20';
  const panelBg = isDark ? 'bg-[#1A1A1A] border-white/20' : 'bg-[#f4f4f4] border-[#03045E]/15';

  const [filter, setFilter] = useState('All');
  const [expandedCompany, setExpandedCompany] = useState(null);
  const [selectedRolePerCompany, setSelectedRolePerCompany] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  // State for Modals
  const [viewingDetails, setViewingDetails] = useState(null); // Job details modal
  const [confirmWithdraw, setConfirmWithdraw] = useState({ isOpen: false, appId: null, loading: false });
  const [withdrawReasons, setWithdrawReasons] = useState([]);
  const [withdrawDetails, setWithdrawDetails] = useState('');
  const [withdrawError, setWithdrawError] = useState('');
const [withdrawTargetStatus, setWithdrawTargetStatus] = useState(null);
  const [sweetAlert, setSweetAlert] = useState({ isOpen: false, title: '', text: '', type: 'notice' });

  useEffect(() => {
    setCurrentPage(1);
    setExpandedCompany(null);
  }, [filter]);

  // Sync selected roles if data updates
  useEffect(() => {
    setSelectedRolePerCompany(prev => {
      const updated = { ...prev };
      let hasChanged = false;
      applications.forEach(app => {
        if (updated[app.company_name] && updated[app.company_name].application_id === app.application_id) {
          updated[app.company_name] = app;
          hasChanged = true;
        }
      });
      return hasChanged ? updated : prev;
    });
  }, [applications]);

  const executeWithdraw = async () => {
    if (!confirmWithdraw.appId) return;

    // Client-side validation before hitting the server
    if (withdrawReasons.length === 0) {
      setWithdrawError('Please select at least one reason.');
      return;
    }
    if (withdrawReasons.includes('other') && !withdrawDetails.trim()) {
      setWithdrawError('Please describe your reason in the text box.');
      return;
    }

    setWithdrawError('');
    setConfirmWithdraw(prev => ({ ...prev, loading: true }));

    try {
      const res = await fetch(`${API_BASE_URL}/api/applications/${confirmWithdraw.appId}/withdraw`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reasons: withdrawReasons,
          details: withdrawReasons.includes('other') ? withdrawDetails.trim() : null,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        const wasHired = withdrawTargetStatus === 'Hired';
        setConfirmWithdraw({ isOpen: false, appId: null, loading: false });
        setWithdrawReasons([]);
        setWithdrawDetails('');
        setWithdrawTargetStatus(null);
        setSweetAlert({
          isOpen: true,
          title: 'Success',
          text: wasHired
            ? 'You have withdrawn from this position. The job has been re-opened for other applicants, and the employer has been notified.'
            : 'Your application has been successfully withdrawn. The employer has been notified.',
          type: 'success',
        });
        if (refreshData) refreshData();
      } else {
        setConfirmWithdraw(prev => ({ ...prev, loading: false }));
        setWithdrawError(data.message || 'Unable to withdraw application at this time.');
      }
    } catch (err) {
      console.error("Error withdrawing:", err);
      setConfirmWithdraw(prev => ({ ...prev, loading: false }));
      setWithdrawError('Network error. Please try again.');
    }
  };

  const getStatusStyle = (status) => {
    if (isHighContrastOrDarkComfort) {
      switch (status) {
        case 'Received': return 'bg-white text-black border-white';
        case 'Under Review': return 'bg-white text-black border-white';
        case 'Shortlisted': return 'bg-white text-black border-white';
        case 'Hired': return 'bg-[#2C7FFF] text-white border-[#2C7FFF]';
        case 'Withdrawn': return 'bg-black text-white border-white';
        case 'Rejected': return 'bg-black text-blue-400 border-blue-400';
        default: return 'bg-white text-black border-white';
      }
    }
    if (isDark) {
      switch (status) {
        case 'Received': return 'bg-[#1A1A1A] text-white border-white/30';
        case 'Under Review': return 'bg-[#1A1A1A] text-blue-400 border-blue-500/50';
        case 'Shortlisted': return 'bg-[#1A1A1A] text-blue-400 border-blue-500/50';
        case 'Hired': return 'bg-[#2C7FFF] text-white border-[#2C7FFF]';
        case 'Withdrawn': return 'bg-[#1A1A1A] text-gray-400 border-gray-600';
        case 'Rejected': return 'bg-[#1A1A1A] text-blue-400 border-blue-500/50';
        default: return 'bg-[#1A1A1A] text-white border-white/30';
      }
    }
    switch (status) {
      case 'Received': return 'bg-gray-100 text-gray-700 border-gray-300';
      case 'Under Review': return 'bg-[#2C7FFF]/10 text-[#2C7FFF] border-[#2C7FFF]/30';
      case 'Shortlisted': return 'bg-[#2C7FFF]/10 text-[#2C7FFF] border-[#2C7FFF]/30';
      case 'Hired': return 'bg-[#2C7FFF] text-white border-[#2C7FFF]';
      case 'Withdrawn': return 'bg-gray-100 text-gray-600 border-gray-300';
      case 'Rejected': return 'bg-[#2C7FFF]/10 text-[#2C7FFF] border-[#2C7FFF]/30';
      default: return 'bg-[#f4f4f4] text-[#03045E] border-[#03045E]/20';
    }
  };

  const trackingTabs = ['All', 'Received', 'Under Review', 'Shortlisted', 'Hired', 'Rejected', 'Withdrawn'];
  
  const filteredApps = useMemo(() => {
    return applications.filter(app => filter === 'All' || app.status === filter);
  }, [applications, filter]);

  const groupedCompanies = useMemo(() => {
    const groups = {};
    filteredApps.forEach(app => {
      if (!groups[app.company_name]) {
        groups[app.company_name] = { company_name: app.company_name, applicationsList: [app] };
      } else {
        groups[app.company_name].applicationsList.push(app);
      }
    });
    return Object.values(groups);
  }, [filteredApps]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentCompanies = groupedCompanies.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(groupedCompanies.length / itemsPerPage);

  const getTabCount = (tabName) => tabName === 'All' ? applications.length : applications.filter(app => app.status === tabName).length;

  const getStatusMessage = (app) => {
    if (app.employer_message) return app.employer_message;
    switch (app.status) {
      case 'Received': return 'Application submitted. Waiting for employer review.';
      case 'Under Review': return 'Employer is viewing your profile.';
      case 'Shortlisted': return 'Employer may contact you soon.';
      case 'Hired': return 'Congratulations on the new job!';
      case 'Rejected': return 'Unfortunately, your application was not selected.';
      default: return 'Application submitted.';
    }
  };

  const parseSafeArray = (data) => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    try { return JSON.parse(data); } catch (e) { 
      return data.replace(/[\[\]"]/g, '').split(',').map(s => s.trim()).filter(Boolean); 
    }
  };

  // --- JOB DETAILS MODAL (TalkBack Friendly) ---
  const JobDetailsModal = ({ role, onClose, isDark }) => {
    if (!role) return null;

    return (
      <div 
        className="fixed inset-0 z-[9999999] flex items-center justify-center p-4 backdrop-blur-[2px] animate-in fade-in duration-200"
        style={{ backgroundColor: isDark ? 'rgba(0,0,0,0.85)' : 'rgba(0,0,0,0.5)' }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="job-details-title"
      >
        <div className={`relative w-full max-w-lg max-h-[90vh] flex flex-col rounded-2xl shadow-2xl overflow-hidden border-2 ${isDark ? 'bg-[#111111] border-white/20 text-white' : 'bg-white border-[#03045E]/20 text-[#03045E]'}`}>
          
          {/* Header */}
          <div className={`flex justify-between items-start p-5 border-b-2 ${isDark ? 'border-white/10' : 'border-gray-100'}`}>
            <div>
              <h2 id="job-details-title" className="text-xl font-extrabold leading-tight pr-4">
                {role.job_title}
              </h2>
              <p className={`text-sm font-semibold mt-1 ${isDark ? 'text-blue-400' : 'text-[#2C7FFF]'}`}>
                {role.company_name}
              </p>
              <p className={`text-[11px] sm:text-sm font-bold mt-1 ${isDark ? 'text-white/80' : 'text-[#03045E]/80'}`}>
                {role.job_type || 'Full-time'}
                {role.working_hours_per_week != null && ` · ${role.working_hours_per_week} hrs/week`}
                {role.work_schedule && ` · ${role.work_schedule}`}
              </p>
            </div>
            <button 
              onClick={onClose}
              className={`p-2 rounded-full transition-colors focus:outline-none focus-visible:ring-4 ${isDark ? 'hover:bg-white/20 focus-visible:ring-white' : 'hover:bg-gray-100 focus-visible:ring-[#2C7FFF]'}`}
              aria-label="Close job details"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          {/* Scrollable Content */}
          <div className="p-5 overflow-y-auto flex flex-col gap-5">
            {role.salary_range && (
              <div>
                <span className={`text-[10px] font-bold uppercase tracking-wider ${isDark ? 'text-white/60' : 'text-[#03045E]/60'}`}>Salary Range</span>
                <p className="text-base font-bold">{role.salary_range}</p>
              </div>
            )}

            {parseSafeArray(role.benefits).length > 0 && (
              <div>
                <span className={`text-[10px] font-bold uppercase tracking-wider ${isDark ? 'text-white/60' : 'text-[#03045E]/60'}`}>Benefits</span>
                <div className="flex flex-wrap gap-2 mt-2">
                  {parseSafeArray(role.benefits).map((benefit, i) => (
                    <span key={i} className={`px-3 py-1 text-xs font-semibold rounded-lg border ${isDark ? 'bg-white/5 border-white/20' : 'bg-gray-50 border-gray-200'}`}>{benefit}</span>
                  ))}
                </div>
              </div>
            )}

            {parseSafeArray(role.provided_accommodations).length > 0 && (
              <div>
                <span className={`text-[10px] font-bold uppercase tracking-wider ${isDark ? 'text-white/60' : 'text-[#03045E]/60'}`}>Provided Accommodations</span>
                <div className="flex flex-wrap gap-2 mt-2">
                  {parseSafeArray(role.provided_accommodations).map((acc, i) => (
                    <span key={i} className={`px-3 py-1 text-xs font-semibold rounded-lg border ${isDark ? 'bg-blue-900/30 border-blue-700 text-blue-300' : 'bg-blue-50 border-blue-200 text-[#2C7FFF]'}`}>{acc}</span>
                  ))}
                </div>
              </div>
            )}

            {role.job_description && (
              <div>
                <span className={`text-[10px] font-bold uppercase tracking-wider ${isDark ? 'text-white/60' : 'text-[#03045E]/60'}`}>Job Description</span>
                <p className={`text-sm mt-2 whitespace-pre-wrap leading-relaxed ${isDark ? 'text-white/80' : 'text-[#03045E]/80'}`}>
                  {role.job_description}
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className={`p-4 border-t-2 mt-auto ${isDark ? 'border-white/10' : 'border-gray-100'}`}>
            <button 
              onClick={onClose}
              className={`w-full py-3 rounded-xl font-bold text-sm uppercase tracking-wider border-2 transition-all focus:outline-none focus-visible:ring-4 ${isDark ? 'bg-white text-black border-white hover:bg-gray-200 focus-visible:ring-gray-400' : 'bg-[#03045E] text-white border-[#03045E] hover:bg-[#020236] focus-visible:ring-blue-300'}`}
            >
              Close Details
            </button>
          </div>
        </div>
      </div>
    );
  };
  
  const renderCard = (companyGroup) => {
    const isOpen = expandedCompany === companyGroup.company_name;
    const activeRole = selectedRolePerCompany[companyGroup.company_name] || companyGroup.applicationsList[0];
    const appCount = companyGroup.applicationsList.length;
// Withdrawable statuses come from the shared constant (includes Hired).
     const canWithdraw = WITHDRAWABLE_STATUSES.includes(activeRole.status);

    const activeIndex = companyGroup.applicationsList.findIndex(app => app.application_id === activeRole.application_id);
    const displayIndex = activeIndex >= 0 ? activeIndex + 1 : 1;

    return (
      <div key={companyGroup.company_name} role="listitem" className="w-full">
        <div className={`overflow-hidden rounded-lg sm:rounded-xl shadow-md border transition-all duration-200 hover:shadow-lg ${cardBg} ${activeRole.status === 'Rejected' ? 'opacity-80' : ''}`}>
          
          <button
            type="button"
            onClick={() => setExpandedCompany(isOpen ? null : companyGroup.company_name)}
            aria-expanded={isOpen}
            aria-controls={`panel-${companyGroup.company_name.replace(/\s+/g, '-')}`}
            aria-label={`${companyGroup.company_name}. You have ${appCount} application${appCount > 1 ? 's' : ''} here. Status: ${activeRole.status}. Click to ${isOpen ? 'hide' : 'show'} details.`}
            className={`w-full text-left min-h-[140px] sm:min-h-[160px] p-3 sm:p-4 flex flex-col justify-between cursor-pointer focus:outline-none focus-visible:ring-4 focus-visible:ring-[#2C7FFF] ${isDark ? 'focus-visible:ring-white' : ''}`}
          >
            <div className="flex flex-row justify-between items-start gap-2 sm:gap-4 w-full min-w-0">
              <div className="flex-1 min-w-0 flex flex-col">
                <h3 className={`text-sm sm:text-2xl font-extrabold leading-tight break-words line-clamp-2 w-full ${textColor}`}>
                  {companyGroup.company_name}
                </h3>
                <p className={`text-[10px] sm:text-sm font-extrabold mt-0.5 sm:mt-1 break-words line-clamp-1 flex items-center gap-1.5 ${isDark ? 'text-blue-400' : 'text-[#2C7FFF]'}`}>
                  <span className="truncate">{activeRole.job_title} {appCount > 1 && `(Showing ${displayIndex} of ${appCount} roles)`}</span>
                  <span className={`px-1.5 py-0.5 text-[8px] sm:text-[10px] rounded border whitespace-nowrap ${isDark ? 'border-white/20 bg-white/10 text-white' : 'border-[#03045E]/20 bg-[#03045E]/5 text-[#03045E]'}`}>
                    {activeRole.job_type || 'Full-time'}
                    {activeRole.working_hours_per_week != null && ` · ${activeRole.working_hours_per_week}h/wk`}
                  </span>
                </p>
              </div>

              <div className="flex shrink-0 items-start">
                <div className={`px-2 py-0.5 sm:px-3 sm:py-1.5 text-[10px] sm:text-sm font-extrabold rounded-lg border whitespace-nowrap flex items-center gap-1.5 sm:gap-2 ${getStatusStyle(activeRole.status)}`}>
                  {activeRole.status}
                  <svg className={`w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            <div>
              <p className={`text-[9px] sm:text-xs font-semibold mt-2 ${mutedText}`}>
                Applied on {new Date(activeRole.applied_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
          </button>

          <div
            id={`panel-${companyGroup.company_name.replace(/\s+/g, '-')}`}
            role="region"
            className={`grid transition-all duration-300 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
          >
            <div className="overflow-hidden">   
              <div className={`border-t px-3 py-3 sm:px-4 sm:py-4 flex flex-col gap-4 ${panelBg}`}>
                
                {/* Role Switcher */}
                {appCount > 1 && (
                  <div className="flex flex-col gap-2">
                    <label className={`text-[10px] sm:text-xs font-extrabold uppercase tracking-widest ${mutedText}`}>
                      Select Role to View
                    </label>
                    <div className="flex flex-wrap gap-2" role="group" aria-label="Select a role to view details">
                      {companyGroup.applicationsList.map((app, index) => {
                        const isSelected = activeRole.application_id === app.application_id;
                        const uniqueLabel = appCount > 1 && companyGroup.applicationsList.filter(a => a.job_title === app.job_title).length > 1 
                          ? `${app.job_title} (Application ${index + 1})` 
                          : app.job_title;

                        return (
                          <button
                            key={app.application_id}
                            onClick={() => setSelectedRolePerCompany(prev => ({ ...prev, [companyGroup.company_name]: app }))}
                            aria-pressed={isSelected}
                            aria-label={`View details for ${uniqueLabel}. Current status: ${app.status}.`}
                            className={`px-3 py-2 text-xs sm:text-sm font-bold rounded-lg border-2 transition-all cursor-pointer flex items-center gap-2 focus:outline-none focus-visible:ring-4 ${
                              isSelected
                                ? (isDark ? 'bg-white text-black border-white focus-visible:ring-gray-400' : 'bg-[#2C7FFF] text-white border-[#2C7FFF] focus-visible:ring-blue-300')
                                : (isDark ? 'bg-transparent text-white border-white/30 hover:border-white focus-visible:ring-white' : 'bg-white text-[#03045E] border-[#03045E]/20 hover:border-[#2C7FFF] focus-visible:ring-blue-300')
                            }`}
                          >
                            <span>{app.job_title}</span>
                            
                            {app.status === 'Hired' && (
                              <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-black uppercase tracking-wider border ${
                                isSelected 
                                  ? 'bg-white text-[#2C7FFF] border-white' 
                                  : 'bg-[#2C7FFF] text-white border-[#2C7FFF]'
                              }`}>
                                Hired
                              </span>
                            )}
                          </button>
                        );
                      })} 
                    </div>
                  </div>
                )}

                {/* Status Message */}
                <div className={`flex flex-col gap-0.5 flex-1 min-w-0 border-t pt-3 ${isDark ? 'border-white/10' : 'border-[#03045E]/10'}`}>
                  <h4 className={`text-[9px] sm:text-xs font-extrabold uppercase tracking-widest flex items-center gap-1.5 sm:gap-2 ${isDark ? 'text-blue-400' : 'text-[#2C7FFF]'}`}>
                    <svg className="w-3 h-3 sm:w-4 sm:h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path>
                    </svg>
                    {activeRole.employer_message ? 'Message from Employer' : 'Status Update'}
                  </h4>
                  <p className={`text-[11px] sm:text-sm font-medium whitespace-pre-wrap leading-snug break-words mt-1 ${textColor}`}>
                    {getStatusMessage(activeRole)}
                  </p>
                </div>

                {/* --- JOB DETAILS TRIGGER (Now opens Modal) --- */}
                <div className={`pt-3 border-t ${isDark ? 'border-white/10' : 'border-[#03045E]/10'}`}>
                  <button 
                    onClick={() => setViewingDetails(activeRole)}
                    aria-haspopup="dialog"
                    className={`text-[11px] sm:text-sm font-bold flex items-center gap-1.5 transition-colors focus:outline-none focus-visible:underline ${isDark ? 'text-blue-400 hover:text-white' : 'text-[#2C7FFF] hover:text-[#03045E]'}`}
                  >
                    View Job Details & Benefits
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                  </button>
                </div>

                {/* WITHDRAW BUTTON */}
                {canWithdraw && (
                  <div className={`pt-3 mt-1 border-t ${isDark ? 'border-white/10' : 'border-[#03045E]/10'}`}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        // Reset reason state each time the modal opens
                        setWithdrawReasons([]);
                        setWithdrawDetails('');
                        setWithdrawError('');
                        setWithdrawTargetStatus(activeRole.status);
                        setConfirmWithdraw({ isOpen: true, appId: activeRole.application_id, loading: false });
                      }}
                      aria-label={
                        activeRole.status === 'Hired'
                          ? `Withdraw from hired position: ${activeRole.job_title} at ${companyGroup.company_name}. The employer will be notified with your reason.`
                          : `Withdraw application for ${activeRole.job_title} at ${companyGroup.company_name}. The employer will be notified with your reason.`
                      }
                      className={`w-full sm:w-auto px-5 py-3 text-sm font-black rounded-xl border-2 transition-all cursor-pointer shadow-sm focus:outline-none focus-visible:ring-4 ${
                        activeRole.status === 'Hired'
                          ? (isDark
                              ? 'bg-red-600 text-white border-red-600 hover:bg-red-700 focus-visible:ring-red-500'
                              : 'bg-red-600 text-white border-red-600 hover:bg-red-700 focus-visible:ring-red-500')
                          : (isDark
                              ? 'bg-[#1A1A1A] text-white border-white/30 hover:bg-white hover:text-black focus-visible:ring-white'
                              : 'bg-white text-[#03045E] border-[#03045E]/30 hover:bg-gray-50 focus-visible:ring-[#03045E]')
                      }`}
                    >
                      {activeRole.status === 'Hired' ? 'Withdraw from Position' : 'Withdraw Application'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`animate-fadeIn w-full space-y-4 sm:space-y-8 pb-4 ${pageBg} ${textColor}`}>
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-4">
        <div className="min-w-0 w-full">
          <h2 className="text-xl sm:text-3xl md:text-4xl font-extrabold break-words">My Job Tracker</h2>
          <p className={`mt-0.5 sm:mt-1.5 text-[11px] sm:text-sm md:text-base font-semibold ${mutedText}`}>
            Monitor the status of your applications in real-time.
          </p>
        </div>
        {applications.length > 0 && (
          <div className={`flex items-center gap-1.5 px-2.5 py-1 sm:px-4 sm:py-2 rounded-full border shrink-0 ${isDark ? 'bg-[#111111] border-white/20' : 'bg-[#f4f4f4] border-[#03045E]/20'}`}>
            <span className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${isDark ? 'bg-blue-400' : 'bg-[#2C7FFF]'}`} />
            <span className="text-[9px] sm:text-xs font-extrabold uppercase tracking-widest">
              {applications.length} application{applications.length !== 1 ? 's' : ''}
            </span>
          </div>
        )}
      </div>
      
      {/* Total committed hours across all Hired roles */}
      {(() => {
        const hired = applications.filter(a => a.status === 'Hired' && a.working_hours_per_week != null);
        if (hired.length === 0) return null;
        const totalHours = hired.reduce((sum, a) => sum + Number(a.working_hours_per_week), 0);
        return (
          <div
            role="status"
            aria-live="polite"
            aria-label={`Total committed: ${totalHours} hours per week across ${hired.length} hired role${hired.length !== 1 ? 's' : ''}.`}
            className={`p-3 sm:p-4 rounded-xl border-2 flex flex-row items-start gap-3 ${
              isDark ? 'bg-[#111111] border-[#10B981]/50 text-white' : 'bg-green-50 border-[#10B981]/40 text-[#03045E]'
            }`}
          >
            <div aria-hidden="true" className={`p-1.5 sm:p-2 rounded-lg shrink-0 mt-0.5 ${isDark ? 'bg-[#10B981]/20' : 'bg-[#10B981]/15'}`}>
              <svg className={`w-4 h-4 sm:w-5 sm:h-5 ${isDark ? 'text-[#10B981]' : 'text-[#10B981]'}`} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] sm:text-sm font-bold leading-snug">
                <strong className="text-[#10B981]">Total committed:</strong> {totalHours} hrs/week across {hired.length} hired role{hired.length !== 1 ? 's' : ''}.
              </p>
            </div>
          </div>
        );
      })()}

      {/* --- UPDATED PRO-TIP BANNER (Mobile Responsive) --- */}
      <div 
        role="region" 
        aria-label="Important information about application wait times and auto-rejection"
        className={`p-3 sm:p-4 rounded-xl border-2 flex flex-row items-start gap-3 shadow-sm ${
          isDark ? 'bg-[#111111] border-[#2C7FFF]/50 text-white' : 'bg-blue-50 border-[#2C7FFF]/30 text-[#03045E]'
        }`}
      >
        <div 
          aria-hidden="true" 
          className={`p-1.5 sm:p-2 rounded-lg shrink-0 mt-0.5 ${isDark ? 'bg-[#2C7FFF]/20' : 'bg-[#2C7FFF]/10'}`}
        >
          <svg className={`w-4 h-4 sm:w-5 sm:h-5 ${isDark ? 'text-[#2C7FFF]' : 'text-[#2C7FFF]'}`} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        
        <div className="flex-1 min-w-0">
          <p 
            tabIndex="0" 
            aria-live="polite"
            className={`text-[11px] sm:text-sm font-bold leading-snug focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2C7FFF] rounded`}
          >
            <strong className={isDark ? 'text-blue-400' : 'text-[#2C7FFF]'}>Haven't heard back?</strong> It's normal for employers to take a few days to review. To prevent ghosting, applications left without an update for <strong>14 days</strong> will be automatically closed by the system. 
          </p>
          <p 
            tabIndex="0" 
            className={`hidden sm:block text-xs font-semibold mt-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2C7FFF] rounded ${isDark ? 'text-white/70' : 'text-[#03045E]/70'}`}
          >
            Don't wait around—keep exploring other job matches on your dashboard!
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div 
        role="tablist" 
        aria-label="Application status filters"
        className={`flex gap-1 p-1 sm:gap-2 sm:p-2 rounded-lg sm:rounded-xl border w-full overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none'] ${isDark ? 'bg-[#111111] border-white/20' : 'bg-[#f4f4f4] border-[#03045E]/15'}`}
      >
        {trackingTabs.map(tab => {
          const count = getTabCount(tab);
          return (
            <button
              key={tab}
              role="tab"
              aria-selected={filter === tab}
              onClick={() => setFilter(tab)}
              className={`flex-1 min-w-fit px-1.5 py-1.5 sm:px-4 sm:py-2.5 rounded-md sm:rounded-lg font-extrabold text-[9px] min-[380px]:text-[10px] sm:text-sm whitespace-nowrap transition-all flex items-center justify-center gap-1 sm:gap-2 cursor-pointer focus:outline-none focus-visible:ring-4 ${
                filter === tab
                  ? (isDark ? 'bg-white text-black shadow-md focus-visible:ring-gray-400' : 'bg-[#03045E] text-white shadow-md focus-visible:ring-blue-300')
                  : (isDark ? 'text-white/70 hover:bg-white/10 hover:text-white focus-visible:ring-white' : 'text-[#03045E]/70 hover:bg-white hover:text-[#03045E] focus-visible:ring-blue-300')
              }`}
            >
              {tab}
              {count > 0 && (
                <span className={`min-w-[16px] h-4 sm:min-w-[20px] sm:h-5 px-1 flex items-center justify-center rounded-full text-[10px] sm:text-xs font-black shrink-0 ${
                  filter === tab ? (isDark ? 'bg-black text-white' : 'bg-white text-[#03045E]') : (isDark ? 'bg-white/20 text-white' : 'bg-[#03045E]/10 text-[#03045E]')
                }`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Cards */}
      {groupedCompanies.length > 0 ? (
        <>
          <div role="list" className="md:hidden flex flex-col gap-3 w-full">
            {currentCompanies.map(company => renderCard(company))}
          </div>
          <div role="list" className="hidden md:flex flex-row gap-3 sm:gap-6 w-full items-start">
            <div className="flex-1 flex flex-col gap-3 sm:gap-6 w-full">
              {currentCompanies.filter((_, i) => i % 2 === 0).map(company => renderCard(company))}
            </div>
            <div className="flex-1 flex flex-col gap-3 sm:gap-6 w-full">
              {currentCompanies.filter((_, i) => i % 2 === 1).map(company => renderCard(company))}
            </div>
          </div>
        </>
      ) : (
        <div className={`p-5 sm:p-12 rounded-lg sm:rounded-xl border-2 border-dashed flex flex-col items-center justify-center text-center min-h-[200px] sm:min-h-[280px] ${isDark ? 'border-white/20 bg-[#111111]' : 'border-[#03045E]/30 bg-[#f4f4f4]'}`}>
          <div className={`w-10 h-10 sm:w-16 sm:h-16 rounded-full flex items-center justify-center shadow-sm mb-3 sm:mb-5 border ${isDark ? 'bg-black border-white/20 text-blue-400' : 'bg-white border-[#03045E]/20 text-[#2C7FFF]'}`}>
            <svg className="w-5 h-5 sm:w-8 sm:h-8" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"></path></svg>
          </div>
          <h3 className="text-base sm:text-xl font-extrabold mb-1.5 sm:mb-2">No {filter.toLowerCase()} applications found</h3>
          <p className={`text-[11px] sm:text-sm font-semibold max-w-md leading-relaxed px-2 ${mutedText}`}>
            {filter === 'All' ? "You haven't submitted any job applications yet. Head over to Smart Matches or Explore Jobs to get started!" : `You don't have any applications currently in the "${filter}" state.`}
          </p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <nav aria-label="Application tracker pagination" className={`flex justify-between items-center gap-3 w-full pt-4 mt-2 border-t ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className={`px-4 py-2 sm:px-5 sm:py-2.5 rounded-lg font-black text-[10px] sm:text-xs uppercase tracking-wider transition-all cursor-pointer border-2 disabled:opacity-50 focus:outline-none focus-visible:ring-4 ${isDark ? 'bg-black text-white border-white/30 focus-visible:ring-white' : 'bg-white text-[#03045E] border-[#03045E]/30 focus-visible:ring-blue-300'}`}
          >
            Previous
          </button>
          <span className={`text-[10px] sm:text-xs font-black ${mutedText}`}>Page {currentPage} of {totalPages}</span>
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className={`px-4 py-2 sm:px-5 sm:py-2.5 rounded-lg font-black text-[10px] sm:text-xs uppercase tracking-wider transition-all cursor-pointer border-2 disabled:opacity-50 focus:outline-none focus-visible:ring-4 ${isDark ? 'bg-black text-white border-white/30 focus-visible:ring-white' : 'bg-white text-[#03045E] border-[#03045E]/30 focus-visible:ring-blue-300'}`}
          >
            Next
          </button>
        </nav>
      )}

      {/* JOB DETAILS MODAL */}
      <JobDetailsModal role={viewingDetails} onClose={() => setViewingDetails(null)} isDark={isDark} />

      {/* Withdraw Confirmation Modal — with reason checklist */}
      {confirmWithdraw.isOpen && (
        <div
          className="fixed inset-0 z-[9999999] flex items-center justify-center p-4 backdrop-blur-[2px] animate-in fade-in duration-200"
          style={{ backgroundColor: isDark ? 'rgba(0,0,0,0.85)' : 'rgba(0,0,0,0.5)' }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-withdraw-title"
          aria-describedby="confirm-withdraw-desc"
        >
          <div className={`relative w-full max-w-md max-h-[90vh] flex flex-col rounded-xl sm:rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border-2 ${isDark ? 'bg-[#111111] border-white/20 text-white' : 'bg-white border-[#03045E]/20 text-[#03045E]'}`}>
            <div aria-hidden="true" className="h-1.5 sm:h-2 w-full bg-red-500 shrink-0" />

            <div className="px-5 sm:px-6 pt-5 pb-4 flex flex-col items-center text-center shrink-0 border-b-2 border-current/10">
              <div aria-hidden="true" className="w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center mb-3 border-4 border-red-500 text-red-500">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              </div>
              <h2 id="confirm-withdraw-title" tabIndex="0" className="text-lg sm:text-xl font-black mb-1 focus:outline-none">
                {withdrawTargetStatus === 'Hired' ? 'Withdraw from Hired Position?' : 'Withdraw Application?'}
              </h2>
              <p id="confirm-withdraw-desc" tabIndex="0" className={`text-xs font-semibold focus:outline-none ${mutedText}`}>
                {withdrawTargetStatus === 'Hired'
                  ? 'You are currently hired for this role. Withdrawing will re-open this position for other applicants, and the employer will be notified with your reason.'
                  : 'The employer will be notified with your reason. You will be removed from their candidate list for this role.'}
              </p>
            </div>

            <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-4">
              <fieldset>
                <legend className="text-[11px] sm:text-xs font-extrabold uppercase tracking-wider mb-2">
                  Why are you withdrawing? (required)
                </legend>
                <div className="flex flex-col gap-0.5">
                  {WITHDRAWAL_REASON_OPTIONS.map(reason => (
                   <label
  key={reason.key}
  className={`flex items-start gap-3 p-2 rounded-lg cursor-pointer focus-within:ring-2 ${isDark ? 'focus-within:ring-white' : 'focus-within:ring-[#2C7FFF]'}`}
>
                      <input
                        type="checkbox"
                        checked={withdrawReasons.includes(reason.key)}
                        onChange={() => {
                          setWithdrawReasons(prev =>
                            prev.includes(reason.key)
                              ? prev.filter(k => k !== reason.key)
                              : [...prev, reason.key]
                          );
                          setWithdrawError('');
                        }}
                        className="mt-0.5 w-5 h-5 accent-[#2C7FFF] shrink-0"
                      />
                      <span className="text-xs sm:text-sm font-semibold leading-snug">{reason.label}</span>
                    </label>
                  ))}
                </div>
              </fieldset>

              {withdrawReasons.includes('other') && (
                <div className="mt-3">
                  <label
                    htmlFor="withdraw-details-input"
                    className="block text-[11px] sm:text-xs font-extrabold uppercase tracking-wider mb-1.5"
                  >
                    Please describe your reason (required)
                  </label>
                  <textarea
                    id="withdraw-details-input"
                    required
                    maxLength={500}
                    value={withdrawDetails}
                    onChange={(e) => {
                      setWithdrawDetails(e.target.value);
                      setWithdrawError('');
                    }}
                    placeholder="Tell the employer briefly why you are withdrawing..."
                    className={`w-full p-3 rounded-lg border-2 min-h-[90px] text-sm font-medium resize-y focus:outline-none focus-visible:ring-4 ${
                      isDark
                        ? 'bg-black border-white/30 text-white placeholder-white/40 focus-visible:ring-white'
                        : 'bg-white border-[#03045E]/30 text-[#03045E] placeholder-[#03045E]/40 focus-visible:ring-blue-300'
                    }`}
                  />
                  <p className={`mt-1 text-[10px] font-semibold text-right ${mutedText}`}>
                    {withdrawDetails.length}/500
                  </p>
                </div>
              )}

              {withdrawError && (
                <p
                  role="alert"
                  aria-live="assertive"
                  className="mt-3 text-xs font-bold text-red-500"
                >
                  {withdrawError}
                </p>
              )}
            </div>

            <div className={`px-5 sm:px-6 py-4 border-t-2 flex flex-col-reverse sm:flex-row gap-2 shrink-0 ${isDark ? 'border-white/10' : 'border-gray-100'}`}>
              <button
                onClick={() => {
                  setConfirmWithdraw({ isOpen: false, appId: null, loading: false });
                  setWithdrawReasons([]);
                  setWithdrawDetails('');
                  setWithdrawError('');
                  setWithdrawTargetStatus(null);
                }}
                disabled={confirmWithdraw.loading}
                className={`flex-1 py-3 rounded-lg font-black text-xs uppercase tracking-wider border-2 bg-transparent disabled:opacity-50 transition-all focus:outline-none focus-visible:ring-4 ${isDark ? 'text-white/70 border-white/30 hover:bg-white/10 focus-visible:ring-white' : 'text-[#03045E]/70 border-[#03045E]/30 hover:bg-[#03045E]/5 focus-visible:ring-[#03045E]'}`}
              >
                Keep Application
              </button>
              <button
                onClick={executeWithdraw}
                disabled={
                  confirmWithdraw.loading ||
                  withdrawReasons.length === 0 ||
                  (withdrawReasons.includes('other') && !withdrawDetails.trim())
                }
                className={`flex-1 py-3 rounded-lg font-black text-xs uppercase tracking-wider border-2 disabled:opacity-50 flex items-center justify-center gap-2 transition-all focus:outline-none focus-visible:ring-4 ${isDark ? 'text-white bg-red-600 border-red-600 hover:bg-red-700 focus-visible:ring-red-500' : 'text-white bg-red-600 border-red-600 hover:bg-red-700 focus-visible:ring-red-500'}`}
              >
                {confirmWithdraw.loading ? 'Processing...' : (withdrawTargetStatus === 'Hired' ? 'Confirm Withdrawal' : 'Yes, Withdraw')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SweetAlert Modal */}
      {sweetAlert.isOpen && (
        <div className="fixed inset-0 z-[9999999] flex items-center justify-center p-4 backdrop-blur-[2px] animate-in fade-in duration-200" style={{ backgroundColor: isDark ? 'rgba(0,0,0,0.85)' : 'rgba(0,0,0,0.5)' }} role="alertdialog" aria-modal="true" aria-labelledby="sweetalert-title">
          <div className={`relative w-full max-w-sm rounded-xl sm:rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border-2 ${isDark ? 'bg-[#111111] border-white/20 text-white' : 'bg-white border-[#03045E]/20 text-[#03045E]'}`}>
            <div aria-hidden="true" className={`h-1.5 sm:h-2 w-full ${isDark ? 'bg-white' : 'bg-[#03045E]'}`} />
            <div className="relative px-6 pt-6 pb-6 flex flex-col items-center text-center">
              <div aria-hidden="true" className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mb-4 border-4 ${isDark ? 'border-white text-white' : 'border-[#03045E] text-[#03045E]'}`}>
                {sweetAlert.type === 'success' ? <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg> : <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>}
              </div>
              <h2 id="sweetalert-title" tabIndex="0" className="text-xl font-black mb-2 focus:outline-none">{sweetAlert.title}</h2>
              <p tabIndex="0" className={`text-xs font-bold mb-6 focus:outline-none ${mutedText}`}>{sweetAlert.text}</p>
              <button onClick={() => setSweetAlert({ ...sweetAlert, isOpen: false })} className={`w-full py-3 rounded-lg font-black text-xs uppercase tracking-wider bg-transparent border-2 transition-all focus:outline-none focus-visible:ring-4 ${isDark ? 'text-white border-white hover:bg-white hover:text-black focus-visible:ring-white' : 'text-[#03045E] border-[#03045E] hover:bg-[#03045E] hover:text-white focus-visible:ring-[#03045E]'}`}>Got It</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}