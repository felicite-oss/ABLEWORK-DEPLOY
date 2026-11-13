import React, { useContext, useState, useEffect } from 'react';
import { AccessibilityContext } from '../../context/AccessibilityContext';
import { useColorPalette } from '../../context/ColorPaletteContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const mockChartData = [
  { name: 'Mon', applications: 4 },
  { name: 'Tue', applications: 7 },
  { name: 'Wed', applications: 2 },
  { name: 'Thu', applications: 12 },
  { name: 'Fri', applications: 8 },
  { name: 'Sat', applications: 3 },
  { name: 'Sun', applications: 9 },
];

// NEW MOCK DATA FOR DISABILITY BREAKDOWN
// MOCK DATA FOR DISABILITY BREAKDOWN
const mockDisabilityData = [
  { name: 'Motor & Neuromuscular', value: 30, color: '#2C7FFF' },
  { name: 'Vision Impairments', value: 25, color: '#10B981' },
  { name: 'Hearing & Speech', value: 20, color: '#F59E0B' },
  { name: 'Amputation', value: 10, color: '#8B5CF6' },
  { name: 'Polio', value: 10, color: '#EC4899' },
    { name: 'Deafblindness', value: 5, color: '#6B7280' }, 
];
export default function EmployerOverview({ profile, stats, setActiveTab }) {
  const { mode } = useContext(AccessibilityContext);
  const { paletteKey } = useColorPalette();
  const isContrast = mode && typeof mode === 'string' && mode.toLowerCase().includes('contrast');
  const isDarkMode = mode && typeof mode === 'string' && (mode.toLowerCase().includes('dark') || mode.toLowerCase().includes('comfort'));
  const isDark = isContrast || isDarkMode;
  const isHighContrastOrDarkComfort = paletteKey === 'highContrast' || paletteKey === 'darkComfort';

  const [analyticsExpanded, setAnalyticsExpanded] = useState(false);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') setAnalyticsExpanded(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    if (analyticsExpanded) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [analyticsExpanded]);

  const renderChart = (expanded = false) => (
    <>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0 mb-1">
        <div className="flex items-center gap-2 sm:gap-2.5">
          <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl flex items-center justify-center shadow-sm" style={{ backgroundColor: 'color-mix(in srgb, var(--color-primary, #2C7FFF) 15%, transparent)', border: '1px solid color-mix(in srgb, var(--color-primary, #2C7FFF) 30%, transparent)', color: 'var(--color-primary, #2C7FFF)' }}>
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h3 className={`text-base sm:text-lg font-extrabold ${isDark ? 'text-white' : 'text-[#03045E]'}`}>Application Trends</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-[10px] sm:text-xs font-bold ${isDark ? 'text-white bg-black border-white' : 'text-[#03045E] bg-[#f4f4f4] border-[#03045E]/20'} px-2 sm:px-3 py-0.5 sm:py-1 rounded-full border`}>Weekly Report</span>
          <button
            type="button"
            onClick={() => setAnalyticsExpanded(prev => !prev)}
            aria-label={analyticsExpanded ? 'Exit fullscreen analytics' : 'Expand analytics to fullscreen'}
            title={analyticsExpanded ? 'Exit fullscreen' : 'Expand analytics'}
            className="relative flex items-center gap-2 pl-2.5 pr-3.5 py-2 rounded-full bg-white/95 backdrop-blur-md shadow-[0_4px_20px_rgba(3,4,94,0.15)] border border-[#03045E]/15 cursor-pointer"
          >
           <span className="w-6 h-6 sm:w-7 sm:h-7 rounded-md sm:rounded-lg bg-[#2C7FFF]/10 border border-[#2C7FFF]/30 flex items-center justify-center text-[#2C7FFF] shrink-0">
              {analyticsExpanded ? (
                <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                </svg>
              )}
            </span>
            <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-widest text-[#03045E] whitespace-nowrap">
              {analyticsExpanded ? 'Exit' : 'Expand'}
            </span>
          </button>
        </div>
      </div>
      <p className={`text-[10px] sm:text-sm font-semibold ${isDark ? 'text-gray-300' : 'text-[#03045E]/80'} mb-4 sm:mb-6`}>Volume of candidate applications received over the last 7 days.</p>
      
      <div className={`flex-1 w-full ${expanded ? 'h-[calc(100vh-200px)]' : 'h-full'} min-h-[180px] sm:min-h-[200px]`} role="img" aria-label="Bar chart showing application trends for the last 7 days. The chart displays the volume of candidate applications received over the last week.">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={stats.chartData || mockChartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? '#ffffff' : '#03045E'} strokeOpacity={0.15} />
                     <XAxis 
              dataKey="name" 
              tick={{ fontSize: expanded ? 14 : 10, fill: (isDark || isHighContrastOrDarkComfort) ? '#ffffff' : 'var(--color-text, #03045E)', fontWeight: 'bold' }} 
              axisLine={false} 
              tickLine={false} 
              dy={10} 
            />
            <YAxis 
              tick={{ fontSize: expanded ? 14 : 10, fill: (isDark || isHighContrastOrDarkComfort) ? '#ffffff' : 'var(--color-text, #03045E)', fontWeight: 'bold' }} 
              axisLine={false} 
              tickLine={false} 
            />
            <Tooltip 
              cursor={{ fill: 'var(--color-primary, #2C7FFF)', opacity: 0.1 }}
              contentStyle={{ borderRadius: '16px', border: isDark ? '2px solid #ffffff' : '1px solid rgba(3,4,94,0.1)', boxShadow: '0 10px 30px rgba(3,4,94,0.1)', backgroundColor: isDark ? '#000000' : '#fff', color: isDark ? '#ffffff' : '#03045E', fontWeight: 'bold', fontSize: expanded ? '16px' : '12px' }}
            />
            <Bar 
              dataKey="applications" 
              fill={isDark ? '#ffffff' : 'var(--color-primary, #2C7FFF)'} 
              radius={[8, 8, 0, 0]} 
              barSize={expanded ? 60 : 28} 
              animationDuration={1500} 
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </>
  );

  return (
    <div className="animate-fadeIn max-w-9xl mx-auto pb-6 sm:pb-10 px-1 sm:px-0">
      
      <div className={`flex flex-col md:flex-row justify-between items-start md:items-center gap-3 sm:gap-4 mb-6 sm:mb-8 ${isDark ? 'bg-black border-white' : 'bg-[#f4f4f4]/90 border-[#03045E]/20'} backdrop-blur-md p-4 sm:p-6 rounded-2xl shadow-[0_10px_30px_rgba(3,4,94,0.06)] border`}>
        <div>
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-1 sm:mb-1.5">
            <span className={`text-[10px] sm:text-xs font-extrabold px-2 sm:px-3 py-0.5 sm:py-1 rounded-full uppercase tracking-wider border ${isDark ? 'bg-white/10 text-white border-white/40' : 'border-[color:color-mix(in_srgb,var(--color-primary,#2C7FFF)_30%,transparent)]'}`} style={!isDark ? { backgroundColor: 'color-mix(in srgb, var(--color-primary, #2C7FFF) 15%, transparent)', color: 'var(--color-primary, #2C7FFF)' } : undefined}>Employer Hub</span>
            <span className={`text-[10px] sm:text-xs font-bold ${isDark ? 'text-white bg-black border-white' : 'text-[#03045E] bg-[#f4f4f4] border-[#03045E]/20'} px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full flex items-center gap-1 sm:gap-1.5 border`}>
              <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full animate-pulse" style={{ backgroundColor: 'var(--color-primary, #2C7FFF)' }}></span> Live System
            </span>
          </div>
          <h1 className={`text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-[#03045E]'}`}>Dashboard Overview</h1>
          <p className={`text-xs sm:text-sm font-semibold ${isDark ? 'text-gray-300' : 'text-[#03045E]/80'} mt-0.5`}>Real-time statistics, geofenced recruitment zone, and candidate pipelines for <span className={`font-bold ${isDark ? 'text-white' : 'text-[#03045E]'}`}>{profile.company_name}</span>.</p>
        </div>
      </div>
      
      {/* MAIN GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        
        <div className="lg:col-span-1 grid grid-cols-3 gap-2 sm:gap-4 lg:flex lg:flex-col lg:gap-6">
          
          <button
            type="button"
            onClick={() => setActiveTab && setActiveTab('jobs')}
            aria-label={`Active Postings, ${stats.activeJobs}. Click to view your job listings.`}
            className={`text-left relative overflow-hidden p-2 sm:p-6 rounded-xl sm:rounded-2xl ${isDark ? 'bg-black border-white' : 'bg-[#f4f4f4] border-[#03045E]/20'} shadow-[0_10px_30px_rgba(3,4,94,0.06)] border flex flex-col lg:flex-row items-center justify-between group transition-all duration-300 cursor-pointer`}
          >
            <div className="absolute top-0 right-0 w-16 sm:w-32 h-16 sm:h-32 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform" style={{ background: 'linear-gradient(to bottom right, color-mix(in srgb, var(--color-primary, #2C7FFF) 10%, transparent), transparent)' }}></div>
            <div className="flex flex-col lg:flex-row items-center gap-1.5 sm:gap-4 relative z-10 w-full">
              <div className="w-7 h-7 sm:w-16 sm:h-16 rounded-md sm:rounded-lg flex items-center justify-center shadow-sm group-hover:rotate-6 transition-transform shrink-0" style={{ background: 'linear-gradient(to bottom right, color-mix(in srgb, var(--color-primary, #2C7FFF) 15%, transparent), color-mix(in srgb, var(--color-primary, #2C7FFF) 25%, transparent))', border: '1px solid color-mix(in srgb, var(--color-primary, #2C7FFF) 30%, transparent)', color: 'var(--color-primary, #2C7FFF)' }}>
                <svg className="w-3.5 h-3.5 sm:w-8 sm:h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <div className="text-center lg:text-left flex-1 min-w-0">
                <div className="flex items-center justify-center lg:justify-start gap-1 sm:gap-1.5 mb-0.5 sm:mb-1">
                  <span className="w-1 h-1 sm:w-2 sm:h-2 rounded-full" style={{ backgroundColor: 'var(--color-primary, #2C7FFF)' }}></span>
                  <p className={`text-[7px] sm:text-xs font-bold tracking-wider ${isDark ? 'text-gray-300' : 'text-[#03045E]/80'} uppercase leading-tight truncate`}>Active Postings</p>
                </div>
                <p className={`text-base sm:text-4xl font-black ${isDark ? 'text-white' : 'text-[#03045E]'} tracking-tight`}>{stats.activeJobs}</p>
              </div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab && setActiveTab('applications')}
            aria-label={`Pending Review, ${stats.pendingApps}. Click to view applications.`}
            className={`text-left relative overflow-hidden p-2 sm:p-6 rounded-xl sm:rounded-2xl ${isDark ? 'bg-black border-white' : 'bg-[#f4f4f4] border-[#03045E]/20'} shadow-[0_10px_30px_rgba(3,4,94,0.06)] border flex flex-col lg:flex-row items-center justify-between group transition-all duration-300 cursor-pointer`}
          >
            <div className="absolute top-0 right-0 w-16 sm:w-32 h-16 sm:h-32 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform" style={{ background: 'linear-gradient(to bottom right, color-mix(in srgb, var(--color-primary, #2C7FFF) 10%, transparent), transparent)' }}></div>
            <div className="flex flex-col lg:flex-row items-center gap-1.5 sm:gap-4 relative z-10 w-full">
              <div className="w-7 h-7 sm:w-16 sm:h-16 rounded-md sm:rounded-lg flex items-center justify-center shadow-sm group-hover:rotate-6 transition-transform shrink-0" style={{ background: 'linear-gradient(to bottom right, color-mix(in srgb, var(--color-primary, #2C7FFF) 15%, transparent), color-mix(in srgb, var(--color-primary, #2C7FFF) 25%, transparent))', border: '1px solid color-mix(in srgb, var(--color-primary, #2C7FFF) 30%, transparent)', color: 'var(--color-primary, #2C7FFF)' }}>
                <svg className="w-3.5 h-3.5 sm:w-8 sm:h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="text-center lg:text-left flex-1 min-w-0">
                <div className="flex items-center justify-center lg:justify-start gap-1 sm:gap-1.5 mb-0.5 sm:mb-1">
                  <span className="w-1 h-1 sm:w-2 sm:h-2 rounded-full" style={{ backgroundColor: 'var(--color-primary, #2C7FFF)' }}></span>
                  <p className={`text-[7px] sm:text-xs font-bold tracking-wider ${isDark ? 'text-gray-300' : 'text-[#03045E]/80'} uppercase leading-tight truncate`}>Pending Review</p>
                </div>
                <p className={`text-base sm:text-4xl font-black ${isDark ? 'text-white' : 'text-[#03045E]'} tracking-tight`}>{stats.pendingApps}</p>
              </div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab && setActiveTab('applications')}
            aria-label={`Shortlisted, ${stats.shortlistedApps}. Click to view applications.`}
            className={`text-left relative overflow-hidden p-2 sm:p-6 rounded-xl sm:rounded-2xl ${isDark ? 'bg-black border-white' : 'bg-[#f4f4f4] border-[#03045E]/20'} shadow-[0_10px_30px_rgba(3,4,94,0.06)] border flex flex-col lg:flex-row items-center justify-between group transition-all duration-300 cursor-pointer`}
          >
            <div className="absolute top-0 right-0 w-16 sm:w-32 h-16 sm:h-32 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform" style={{ background: 'linear-gradient(to bottom right, color-mix(in srgb, var(--color-primary, #2C7FFF) 10%, transparent), transparent)' }}></div>
            <div className="flex flex-col lg:flex-row items-center gap-1.5 sm:gap-4 relative z-10 w-full">
              <div className="w-7 h-7 sm:w-16 sm:h-16 rounded-md sm:rounded-lg flex items-center justify-center shadow-sm group-hover:rotate-6 transition-transform shrink-0" style={{ background: 'linear-gradient(to bottom right, color-mix(in srgb, var(--color-primary, #2C7FFF) 15%, transparent), color-mix(in srgb, var(--color-primary, #2C7FFF) 25%, transparent))', border: '1px solid color-mix(in srgb, var(--color-primary, #2C7FFF) 30%, transparent)', color: 'var(--color-primary, #2C7FFF)' }}>
                <svg className="w-3.5 h-3.5 sm:w-8 sm:h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </div>
              <div className="text-center lg:text-left flex-1 min-w-0">
                <div className="flex items-center justify-center lg:justify-start gap-1 sm:gap-1.5 mb-0.5 sm:mb-1">
                  <span className="w-1 h-1 sm:w-2 sm:h-2 rounded-full" style={{ backgroundColor: 'var(--color-primary, #2C7FFF)' }}></span>
                  <p className={`text-[7px] sm:text-xs font-bold tracking-wider ${isDark ? 'text-gray-300' : 'text-[#03045E]/80'} uppercase leading-tight truncate`}>Shortlisted</p>
                </div>
                <p className={`text-base sm:text-4xl font-black ${isDark ? 'text-white' : 'text-[#03045E]'} tracking-tight`}>{stats.shortlistedApps}</p>
              </div>
            </div>
          </button>

        </div>

        <div className="lg:col-span-2">
          <div className={`p-4 sm:p-8 rounded-xl sm:rounded-2xl ${isDark ? 'bg-black border-white' : 'bg-[#f4f4f4] border-[#03045E]/20'} shadow-[0_10px_30px_rgba(3,4,94,0.06)] border flex flex-col h-[380px] sm:h-full min-h-[380px] relative`}>
            {renderChart(false)}
          </div>
        </div>

      </div>

            {/* --- NEW DISABILITY BREAKDOWN CHART SECTION --- */}
      <div className={`mt-4 sm:mt-6 p-4 sm:p-8 rounded-xl sm:rounded-2xl ${isDark ? 'bg-black border-white' : 'bg-[#f4f4f4] border-[#03045E]/20'} shadow-[0_10px_30px_rgba(3,4,94,0.06)] border flex flex-col h-auto`}>
        
        {/* Header */}
        <div className="flex items-center justify-between gap-2 sm:gap-2.5 mb-1 w-full">
          <div className="flex items-center gap-2 sm:gap-2.5">
            <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl flex items-center justify-center shadow-sm" style={{ backgroundColor: 'color-mix(in srgb, var(--color-primary, #2C7FFF) 15%, transparent)', border: '1px solid color-mix(in srgb, var(--color-primary, #2C7FFF) 30%, transparent)', color: 'var(--color-primary, #2C7FFF)' }}>
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
              </svg>
            </div>
            <h3 className={`text-base sm:text-lg font-extrabold ${isDark ? 'text-white' : 'text-[#03045E]'}`}>Applicant Disability Breakdown</h3>
          </div>
          <span className={`text-[10px] sm:text-xs font-bold ${isDark ? 'text-white bg-black border-white' : 'text-[#03045E] bg-[#f4f4f4] border-[#03045E]/20'} px-2 sm:px-3 py-0.5 sm:py-1 rounded-full border whitespace-nowrap`}>Monthly</span>
        </div>
        <p className={`text-[10px] sm:text-sm font-semibold ${isDark ? 'text-gray-300' : 'text-[#03045E]/80'} mb-6`}>Percentage breakdown of applicant demographics for this month.</p>
        
{/* 2-Column Layout for Chart and Details */}
        {(() => {
          const liveDisabilityData = stats?.disabilityData || mockDisabilityData;
          const activePieSlices = liveDisabilityData.filter(d => d.value > 0);
          const hasData = activePieSlices.length > 0;
          const topCategory = liveDisabilityData[0];

          return (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12 items-center w-full">
              
              {/* Left Side: Pie Chart */}
              <div className="w-full h-[360px] sm:h-[450px] relative flex items-center justify-center" role="img" aria-label="Pie chart showing the monthly percentage breakdown of applicant disabilities.">
                {hasData ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={activePieSlices}
                        cx="50%"
                        cy="50%" 
                        outerRadius={165}
                        dataKey="value"
                        stroke={isDark ? '#000000' : '#ffffff'}
                        strokeWidth={3}
                      >
                        {activePieSlices.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color || '#2C7FFF'} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value, name, props) => [`${value}% (${props.payload.count || 0} applicant${props.payload.count === 1 ? '' : 's'})`, name]}
                        contentStyle={{ 
                          borderRadius: '16px', 
                          border: isDark ? '2px solid #ffffff' : '1px solid rgba(3,4,94,0.1)', 
                          boxShadow: '0 10px 30px rgba(3,4,94,0.1)', 
                          backgroundColor: isDark ? '#000000' : '#fff', 
                          color: isDark ? '#ffffff' : '#03045E', 
                          fontWeight: 'bold',
                          fontSize: '14px'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className={`w-64 h-64 sm:w-80 sm:h-80 rounded-full border-4 border-dashed flex flex-col items-center justify-center p-6 text-center ${isDark ? 'border-white/20 text-white/60' : 'border-[#03045E]/20 text-[#03045E]/60'}`}>
                    <svg className="w-10 h-10 mb-2 opacity-50" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                    </svg>
                    <p className="text-xs sm:text-sm font-black uppercase tracking-wider">No Applicant Data Yet</p>
                    <p className="text-[10px] sm:text-xs font-semibold mt-1">Demographics will appear here once candidates apply to your job postings.</p>
                  </div>
                )}
              </div>

              {/* Right Side: Detailed Breakdown & Insight */}
              <div className="flex flex-col gap-5 w-full">
                
                {/* Progress Bars List */}
                <div className="flex flex-col gap-4">
                  {liveDisabilityData.map((item, index) => (
                    <div key={index} className="w-full">
                      <div className="flex justify-between items-center mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: item.color }}></span>
                          <span className={`text-sm font-bold ${isDark ? 'text-white' : 'text-[#03045E]'}`}>{item.name}</span>
                        </div>
                        <span className={`text-sm font-black ${isDark ? 'text-white' : 'text-[#03045E]'}`}>{item.value}%</span>
                      </div>
                      {/* Progress Bar Background */}
                      <div className={`w-full h-2.5 rounded-full overflow-hidden ${isDark ? 'bg-zinc-800' : 'bg-gray-200'}`}>
                        {/* Progress Bar Fill */}
                        <div 
                          className="h-full rounded-full transition-all duration-1000 ease-out"
                          style={{ width: `${item.value}%`, backgroundColor: item.color }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Insight Box */}
                <div className={`mt-2 p-4 rounded-xl border-2 flex items-start gap-3 ${isDark ? 'bg-zinc-900 border-[#2C7FFF]/40' : 'bg-[#f4f4f4] border-[#03045E]'}`}>
                  <div className={`p-2 rounded-lg shrink-0 ${isDark ? 'bg-[#2C7FFF]' : 'bg-[#03045E]'}`}>
                    <svg className="w-5 h-5" fill="none" stroke={isDark ? '#000000' : '#FFFFFF'} strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className={`text-sm font-black ${isDark ? 'text-white' : 'text-[#03045E]'}`}>Key Insight</h4>
                    {hasData ? (
                      <p className={`text-xs font-semibold mt-1 leading-relaxed ${isDark ? 'text-white' : 'text-[#03045E]'}`}>
                        The majority of your applicants identify with <span className={`font-bold underline decoration-2 underline-offset-2 ${isDark ? 'text-white decoration-[#2C7FFF]' : 'text-[#03045E] decoration-[#03045E]'}`}>{topCategory?.name}</span> disabilities ({topCategory?.value}%).
                      </p>
                    ) : (
                      <p className={`text-xs font-semibold mt-1 leading-relaxed ${isDark ? 'text-white/80' : 'text-[#03045E]/80'}`}>
                        No applications received yet. Post an inclusive job opening to start gathering candidate demographic insights!
                      </p>
                    )}
                  </div>
                </div>

              </div>

            </div>
          );
        })()}

     
      </div>

      {analyticsExpanded && (
        <div className="fixed inset-0 z-[9999] bg-white">
          <div className={`w-full h-full p-4 sm:p-8 ${isDark ? 'bg-black' : 'bg-[#f4f4f4]'} flex flex-col`}>
            {renderChart(true)}
          </div>
        </div>
      )}
    </div>
  );
}

export function AccessibilityToolbar() {
  const { mode, setMode } = useContext(AccessibilityContext);
  const [isOpen, setIsOpen] = useState(false);
  const [fontSize, setFontSize] = useState('normal');

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('high-contrast', 'standard');
    if (mode === 'High Contrast') {
      root.classList.add('high-contrast');
    } else {
      root.classList.add('standard');
    }
  }, [mode]);

  const handleFontSizeChange = (size) => {
    setFontSize(size);
    const root = document.documentElement;
    root.classList.remove('font-normal', 'font-large', 'font-xlarge');
    root.classList.add(`font-${size}`);
  };

  const handleThemeChange = (newMode) => {
    setMode(newMode);
  };

  return (
    <div className="fixed bottom-6 left-4 sm:left-6 z-[9999] flex flex-col items-start">
      {isOpen && (
        <div 
        className="mb-3 w-[calc(100vw-2rem)] max-w-72 sm:w-72 bg-white dark:bg-gray-900 border-2 border-blue-500 rounded-2xl shadow-2xl p-4 flex flex-col gap-4 text-gray-800 dark:text-gray-100"
          role="region"
          aria-label="Accessibility Control Panel"
        >
          <div className="flex justify-between items-center border-b pb-2">
            <h3 className="font-bold text-sm tracking-wide uppercase text-blue-600">Accessibility Controls</h3>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-gray-600 font-bold text-lg px-2 cursor-pointer"
              aria-label="Close accessibility menu"
            >
              &times;
            </button>
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-gray-500">Display Theme</span>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleThemeChange('Standard')}
                className={`py-2 text-xs font-bold rounded-lg border cursor-pointer ${
                  mode === 'Standard' ? 'bg-blue-600 text-white border-blue-600' : 'bg-gray-100 text-gray-800 border-gray-300'
                }`}
                aria-label="Standard Mode"
              >
                Standard
              </button>
              <button
                onClick={() => handleThemeChange('High Contrast')}
                className={`py-2 text-xs font-bold rounded-lg border cursor-pointer ${
                  mode === 'High Contrast' ? 'bg-blue-600 text-white border-blue-600' : 'bg-gray-100 text-gray-800 border-gray-300'
                }`}
                aria-label="High Contrast Mode"
              >
                Contrast
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-gray-500">Font Size Adjustment</span>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                onClick={() => handleFontSizeChange('normal')}
                className={`py-1.5 text-xs font-bold rounded-lg border cursor-pointer ${
                  fontSize === 'normal' ? 'bg-blue-600 text-white border-blue-600' : 'bg-gray-100 text-gray-800 border-gray-300'
                }`}
                aria-label="Normal Font Size"
              >
                A
              </button>
              <button
                onClick={() => handleFontSizeChange('large')}
                className={`py-1.5 text-sm font-bold rounded-lg border cursor-pointer ${
                  fontSize === 'large' ? 'bg-blue-600 text-white border-blue-600' : 'bg-gray-100 text-gray-800 border-gray-300'
                }`}
                aria-label="Large Font Size"
              >
                A+
              </button>
              <button
                onClick={() => handleFontSizeChange('xlarge')}
                className={`py-1.5 px-1 text-sm font-bold rounded-lg border cursor-pointer flex items-center justify-center whitespace-nowrap ${
                  fontSize === 'xlarge' ? 'bg-blue-600 text-white border-blue-600' : 'bg-gray-100 text-gray-800 border-gray-300'
                }`}
                aria-label="Extra Large Font Size"
              >
                A++
              </button>
            </div>
          </div>

        </div>
      )}

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-2xl flex items-center justify-center transition-transform hover:scale-110 border-2 border-white cursor-pointer"
        aria-label="Open Accessibility Menu"
        aria-expanded={isOpen}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="12" cy="4" r="2" />
          <path d="M19 13h-2v-3c0-1.1-.9-2-2-2h-3.5c-.3-.6-.9-1-1.5-1h-2c-1.1 0-2 .9-2 2v5c0 1.1.9 2 2 2h2v4h2v-4h1v4h2v-5.5c0-.8-.7-1.5-1.5-1.5z" />
        </svg>
      </button>

    </div>
  );
}