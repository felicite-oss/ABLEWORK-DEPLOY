import React, { useState, useEffect, useMemo } from 'react';
import API_BASE_URL from '../../../config';

export default function ApplicantJobTracker({ applications = [], profile, refreshData }) {
  const [filter, setFilter] = useState('All');
  const [expandedCompany, setExpandedCompany] = useState(null);
  const [selectedRolePerCompany, setSelectedRolePerCompany] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  const [confirmWithdraw, setConfirmWithdraw] = useState({ isOpen: false, appId: null, loading: false });
  const [sweetAlert, setSweetAlert] = useState({ isOpen: false, title: '', text: '', type: 'notice' });

  useEffect(() => {
    setCurrentPage(1);
    setExpandedCompany(null); // Close all when filter changes
  }, [filter]);

  const executeWithdraw = async () => {
    if (!confirmWithdraw.appId) return;
    setConfirmWithdraw(prev => ({ ...prev, loading: true }));

    try {
      const res = await fetch(`${API_BASE_URL}/api/applications/${confirmWithdraw.appId}/withdraw`, {
        method: 'PUT'
      });
      if (res.ok) {
        setConfirmWithdraw({ isOpen: false, appId: null, loading: false });
        setSweetAlert({ isOpen: true, title: 'Success', text: 'Your application has been successfully withdrawn.', type: 'success' });
        if (refreshData) refreshData();
      } else {
        setConfirmWithdraw({ isOpen: false, appId: null, loading: false });
        setSweetAlert({ isOpen: true, title: 'Notice', text: 'Unable to withdraw application at this time.', type: 'notice' });
      }
    } catch (err) {
      console.error("Error withdrawing:", err);
      setConfirmWithdraw({ isOpen: false, appId: null, loading: false });
      setSweetAlert({ isOpen: true, title: 'Error', text: 'Server error while withdrawing.', type: 'notice' });
    }
  };

  const closeSweetAlert = () => {
    setSweetAlert({ ...sweetAlert, isOpen: false });
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Received': return 'bg-gray-100 text-gray-700 border-gray-300';
      case 'Under Review': return 'bg-[#2C7FFF]/10 text-[#2C7FFF] border-[#2C7FFF]/30';
      case 'Shortlisted': return 'bg-[#2C7FFF]/10 text-[#2C7FFF] border-[#2C7FFF]/30';
      case 'Hired': return 'bg-[#2C7FFF]/10 text-[#2C7FFF] border-[#2C7FFF]/30';
      case 'Withdrawn': return 'bg-gray-100 text-gray-600 border-gray-300';
      case 'Rejected': return 'opacity-90';
      default: return 'bg-[#f4f4f4] text-[#03045E] border-[#03045E]/20';
    }
  };

  const getRejectedStyle = (status) => {
    if (status !== 'Rejected') return undefined;
    return {
      backgroundColor: 'rgba(239, 68, 68, 0.1)',
      color: '#b91c1c',
      borderColor: 'rgba(239, 68, 68, 0.5)'
    };
  };

  const trackingTabs = ['All', 'Received', 'Under Review', 'Shortlisted', 'Hired', 'Rejected', 'Withdrawn'];
  
  const filteredApps = useMemo(() => {
    return applications.filter(app => {
      if (filter === 'All') return true;
      return app.status === filter;
    });
  }, [applications, filter]);

  // Group by company to prevent duplicate company cards
  const groupedCompanies = useMemo(() => {
    const groups = {};
    filteredApps.forEach(app => {
      if (!groups[app.company_name]) {
        groups[app.company_name] = {
          company_name: app.company_name,
          applicationsList: [app]
        };
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

  const getTabCount = (tabName) => {
    if (tabName === 'All') return applications.length;
    return applications.filter(app => app.status === tabName).length;
  };

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

  const renderCard = (companyGroup) => {
    const isOpen = expandedCompany === companyGroup.company_name;
    
    // Determine which role to show (default to first if none selected)
    const activeRole = selectedRolePerCompany[companyGroup.company_name] || companyGroup.applicationsList[0];
    const appCount = companyGroup.applicationsList.length;
    const canWithdraw = activeRole.status === 'Received' || activeRole.status === 'Under Review' || activeRole.status === 'Shortlisted';

    return (
      <div key={companyGroup.company_name} role="listitem" className="w-full">
        <div className={`overflow-hidden rounded-lg sm:rounded-xl bg-white shadow-md border border-[#03045E]/20 transition-all duration-200 hover:shadow-lg ${activeRole.status === 'Rejected' ? 'opacity-80' : ''}`}>
          
          {/* Header with fixed height for consistent sizing */}
          <button
            type="button"
            onClick={() => setExpandedCompany(isOpen ? null : companyGroup.company_name)}
            aria-expanded={isOpen}
            aria-controls={`panel-${companyGroup.company_name.replace(/\s+/g, '-')}`}
            aria-label={`${companyGroup.company_name}. ${appCount} application${appCount > 1 ? 's' : ''}. Status: ${activeRole.status}. Click to ${isOpen ? 'hide' : 'show'} details.`}
            className="w-full text-left h-[140px] sm:h-[160px] p-3 sm:p-4 flex flex-col justify-between cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2C7FFF] focus-visible:ring-inset"
          >
            <span className="sr-only">
              Company: {companyGroup.company_name}. You have {appCount} application{appCount > 1 ? 's' : ''} here. 
              Currently viewing: {activeRole.job_title}. Status: {activeRole.status}.
            </span>

            <div className="flex flex-row justify-between items-start gap-2 sm:gap-4 w-full min-w-0">
              <div className="flex-1 min-w-0 flex flex-col">
                <h3 className="text-sm sm:text-2xl font-extrabold text-[#03045E] leading-tight break-words line-clamp-2 w-full">
                  {companyGroup.company_name}
                </h3>
                <p className="text-[10px] sm:text-sm font-extrabold text-[#2C7FFF] mt-0.5 sm:mt-1 break-words line-clamp-1">
                  {activeRole.job_title} {appCount > 1 && `(1 of ${appCount})`}
                </p>
              </div>

              <div className="flex shrink-0 items-start">
                <div
                  tabIndex="0"
                  role="text"
                  aria-label={`Status: ${activeRole.status}`}
                  title={`Status: ${activeRole.status}`}
                  className={`px-2 py-0.5 sm:px-3 sm:py-1.5 text-[10px] sm:text-sm font-extrabold rounded-lg border whitespace-nowrap flex items-center gap-1.5 sm:gap-2 focus:outline-none ${getStatusStyle(activeRole.status)}`}
                  style={getRejectedStyle(activeRole.status)}
                >
                  {activeRole.status}
                  <svg
                    className={`w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                    fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" aria-hidden="true"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            <div>
              <p className="text-[9px] sm:text-xs font-semibold text-[#03045E]/60">
                Applied on {new Date(activeRole.applied_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
          </button>

          {/* Separated slide panel */}
          <div
            id={`panel-${companyGroup.company_name.replace(/\s+/g, '-')}`}
            role="region"
            className={`grid transition-all duration-300 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
          >
            <div className="overflow-hidden">   
              <div className="border-t border-[#03045E]/15 bg-[#f4f4f4] px-3 py-3 sm:px-4 sm:py-4 flex flex-col gap-4">
                
                {/* Role Switcher */}
                {appCount > 1 && (
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] sm:text-xs font-extrabold text-[#03045E]/70 uppercase tracking-widest">
                      Select Role to View
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {companyGroup.applicationsList.map((app) => {
                        const isSelected = activeRole.application_id === app.application_id;
                        return (
                          <button
                            key={app.application_id}
                            onClick={() => setSelectedRolePerCompany(prev => ({ ...prev, [companyGroup.company_name]: app }))}
                            aria-pressed={isSelected}
                            className={`px-3 py-2 text-xs sm:text-sm font-bold rounded-lg border-2 transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2C7FFF] ${
                              isSelected
                                ? 'bg-[#2C7FFF] text-white border-[#2C7FFF]'
                                : 'bg-white text-[#03045E] border-[#03045E]/20 hover:border-[#2C7FFF]'
                            }`}
                          >
                            {app.job_title}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="flex flex-col gap-0.5 flex-1 min-w-0 border-t border-[#03045E]/10 pt-3">
                  <h4 className="text-[9px] sm:text-xs font-extrabold text-[#2C7FFF] uppercase tracking-widest flex items-center gap-1.5 sm:gap-2 focus:outline-none">
                    <svg className="w-3 h-3 sm:w-4 sm:h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path>
                    </svg>
                    {activeRole.employer_message ? 'Message from Employer' : 'Status Update'}
                  </h4>
                  <p className="text-[11px] sm:text-sm text-[#03045E] font-medium whitespace-pre-wrap leading-snug break-words focus:outline-none mt-1">
                    {getStatusMessage(activeRole)}
                  </p>
                </div>

                {canWithdraw && (
                  <div className="pt-3 mt-1 border-t border-[#03045E]/10">
                    <button
                      onClick={(e) => {
                        e.stopPropagation(); 
                        setConfirmWithdraw({ isOpen: true, appId: activeRole.application_id, loading: false });
                      }}
                      aria-label={`Withdraw application for ${activeRole.job_title} at ${companyGroup.company_name}`}
                      className="w-full sm:w-auto px-4 py-3 text-xs font-bold rounded-lg border-2 transition-all cursor-pointer shadow-sm bg-white text-red-600 border-red-500 hover:bg-red-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                    >
                      Withdraw Application
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
    <div className="animate-fadeIn w-full space-y-4 sm:space-y-8 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none'] pb-4">

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-4">
        <div className="min-w-0 w-full">
          <h2 tabIndex="0" className="text-xl sm:text-3xl md:text-4xl font-extrabold text-[#03045E] break-words focus:outline-none">
            My Job Tracker
          </h2>
          <p tabIndex="0" className="text-[#03045e] mt-0.5 sm:mt-1.5 text-[11px] sm:text-sm md:text-base font-semibold focus:outline-none">
            Monitor the status of your applications in real-time.
          </p>
        </div>
        {applications.length > 0 && (
          <div tabIndex="0" role="status" className="flex items-center gap-1.5 px-2.5 py-1 sm:px-4 sm:py-2 rounded-full bg-[#f4f4f4] border border-[#03045E]/20 shrink-0 focus:outline-none">
            <span aria-hidden="true" className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#2C7FFF]" />
            <span aria-hidden="true" className="text-[9px] sm:text-xs font-extrabold uppercase tracking-widest text-[#03045E]">
              {applications.length} application{applications.length !== 1 ? 's' : ''}
            </span>
          </div>
        )}
      </div>

      <div className="flex gap-1 p-1 sm:gap-2 sm:p-2 rounded-lg sm:rounded-xl bg-[#f4f4f4] border border-[#03045E]/15 w-full overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
        {trackingTabs.map(tab => {
          const count = getTabCount(tab);
          return (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`flex-1 min-w-fit px-1.5 py-1.5 sm:px-4 sm:py-2.5 rounded-md sm:rounded-lg font-extrabold text-[9px] min-[380px]:text-[10px] sm:text-sm whitespace-nowrap transition-all flex items-center justify-center gap-1 sm:gap-2 cursor-pointer focus:outline-none focus-visible:ring-4 focus-visible:ring-[#2C7FFF] ${
                filter === tab
                  ? 'bg-[#03045E] text-white shadow-md'
                  : 'text-[#03045E]/70 hover:bg-white hover:text-[#03045E]'
              }`}
            >
              {tab}
              {count > 0 && (
                <span className={`min-w-[16px] h-4 sm:min-w-[20px] sm:h-5 px-1 flex items-center justify-center rounded-full text-[10px] sm:text-xs font-black shrink-0 ${
                  filter === tab ? 'bg-white text-[#03045E]' : 'bg-[#03045E]/10 text-[#03045E]'
                }`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {groupedCompanies.length > 0 ? (
        <>
          {/* Mobile view - single column */}
          <div role="list" className="md:hidden flex flex-col gap-3 w-full">
            {currentCompanies.map(company => renderCard(company))}
          </div>

          {/* Desktop view - 2 column masonry (RESTORED) */}
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
        <div role="status" className="p-5 sm:p-12 rounded-lg sm:rounded-xl border-2 border-dashed border-[#03045E]/30 bg-[#f4f4f4] flex flex-col items-center justify-center text-center min-h-[200px] sm:min-h-[280px]">
          <div className="w-10 h-10 sm:w-16 sm:h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-3 sm:mb-5 border border-[#03045E]/20 text-[#2C7FFF]">
            <svg className="w-5 h-5 sm:w-8 sm:h-8" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"></path>
            </svg>
          </div>
          <h3 className="text-base sm:text-xl font-extrabold text-[#03045E] mb-1.5 sm:mb-2">
            No {filter.toLowerCase()} applications found
          </h3>
          <p className="text-[11px] sm:text-sm font-semibold text-[#03045E]/70 max-w-md leading-relaxed px-2">
            {filter === 'All'
              ? "You haven't submitted any job applications yet. Head over to Smart Matches or Explore Jobs to get started!"
              : `You don't have any applications currently in the "${filter}" state.`}
          </p>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-between items-center gap-3 w-full pt-4 mt-2">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            aria-label="Go to previous page"
            className="px-4 py-2 sm:px-5 sm:py-2.5 rounded-lg font-black text-[10px] sm:text-xs uppercase tracking-wider transition-all cursor-pointer border-2 bg-white text-[#03045E] border-[#03045E]/30 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-4 focus-visible:ring-[#2C7FFF]"
          >
            Previous
          </button>
          <span className="text-[10px] sm:text-xs font-black text-[#03045E]/70">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            aria-label="Go to next page"
            className="px-4 py-2 sm:px-5 sm:py-2.5 rounded-lg font-black text-[10px] sm:text-xs uppercase tracking-wider transition-all cursor-pointer border-2 bg-white text-[#03045E] border-[#03045E]/30 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-4 focus-visible:ring-[#2C7FFF]"
          >
            Next
          </button>
        </div>
      )}

      {/* MODALS */}
      {confirmWithdraw.isOpen && (
        <div className="fixed inset-0 z-[9999999] flex items-center justify-center p-4 backdrop-blur-[1px] animate-in fade-in transition-all duration-300" style={{ backgroundColor: 'rgba(72, 71, 71, 0.6)' }} role="dialog" aria-modal="true" aria-labelledby="confirm-withdraw-title" tabIndex="-1">
          <div className="relative w-full max-w-sm rounded-xl sm:rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 bg-white border-2 border-[#03045E]/30">
            <div aria-hidden="true" className="h-1.5 sm:h-2 w-full bg-[#03045E]" />
            <div className="relative px-6 pt-6 pb-6 flex flex-col items-center text-center">
              <div aria-hidden="true" className="w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center bg-transparent text-[#03045E] mb-4 border-4 border-[#03045E]">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h2 id="confirm-withdraw-title" tabIndex="0" className="text-xl font-black text-[#03045E] mb-2 focus:outline-none">Withdraw Application?</h2>
              <p tabIndex="0" className="text-xs font-bold text-[#03045E]/70 mb-6 focus:outline-none">
                Are you sure you want to withdraw? You will be removed from the employer's candidate list for this job.
              </p>
              <div className="flex w-full gap-3">
                <button 
                  onClick={() => setConfirmWithdraw({ isOpen: false, appId: null, loading: false })} 
                  disabled={confirmWithdraw.loading} 
                  className="flex-1 py-3 rounded-lg font-black text-xs uppercase tracking-wider border-2 bg-transparent text-[#03045E]/70 border-[#03045E]/30 disabled:opacity-50 hover:bg-[#03045E]/5 transition-all focus:outline-none focus-visible:ring-4 focus-visible:ring-[#03045E]"
                >
                  Cancel
                </button>
                <button 
                  onClick={executeWithdraw} 
                  disabled={confirmWithdraw.loading} 
                  className="flex-1 py-3 rounded-lg font-black text-xs uppercase tracking-wider border-2 bg-transparent text-[#03045E] border-[#03045E] disabled:opacity-50 flex items-center justify-center gap-2 hover:bg-[#03045E] hover:text-white transition-all focus:outline-none focus-visible:ring-4 focus-visible:ring-[#03045E]"
                >
                  {confirmWithdraw.loading ? 'Processing...' : 'Yes, Withdraw'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {sweetAlert.isOpen && (
        <div className="fixed inset-0 z-[9999999] flex items-center justify-center p-4 backdrop-blur-[1px] animate-in fade-in transition-all duration-300" style={{ backgroundColor: 'rgba(72, 71, 71, 0.6)' }} role="alertdialog" aria-modal="true" aria-labelledby="sweetalert-title" tabIndex="-1">
          <div className="relative w-full max-w-sm rounded-xl sm:rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 bg-white border-2 border-[#03045E]/30">
            <div aria-hidden="true" className="h-1.5 sm:h-2 w-full bg-[#03045E]" />
            <div className="relative px-6 pt-6 pb-6 flex flex-col items-center text-center">
              <div aria-hidden="true" className="w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center bg-transparent border-4 border-[#03045E] mb-4 text-[#03045E]">
                {sweetAlert.type === 'success' ? (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                ) : (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                )}
              </div>
              <h2 id="sweetalert-title" tabIndex="0" className="text-xl font-black text-[#03045E] mb-2 focus:outline-none">{sweetAlert.title}</h2>
              <p tabIndex="0" className="text-xs font-bold text-[#03045E]/70 mb-6 focus:outline-none">{sweetAlert.text}</p>
              <button 
                onClick={closeSweetAlert} 
                className="w-full py-3 rounded-lg font-black text-xs uppercase tracking-wider bg-transparent border-2 text-[#03045E] border-[#03045E] hover:bg-[#03045E] hover:text-white transition-all focus:outline-none focus-visible:ring-4 focus-visible:ring-[#03045E]"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}