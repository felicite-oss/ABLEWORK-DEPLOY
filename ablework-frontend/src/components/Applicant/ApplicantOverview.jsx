import React, { useEffect, useContext, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import { AccessibilityContext } from '../../context/AccessibilityContext';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return null;
  const R = 6371; 
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
      Math.sin(dLon / 2) * Math.sin(dLon / 2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); 
  return R * c;
}

const MatchJobIcon = L.divIcon({
  className: 'custom-job-icon',
  html: `<div style="background-color: #10B981; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10]
});

const OtherJobIcon = L.divIcon({
  className: 'custom-job-icon',
  html: `<div style="background-color: #2C7FFF; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10]
});

function MapRecenter({ lat, lng }) {
  const map = useMap();
  useEffect(() => {
    if (lat && lng) {
      map.setView([lat, lng], map.getZoom());
    }
  }, [lat, lng, map]);
  return null;
}

function MapInvalidator({ trigger }) {
  const map = useMap();
  useEffect(() => {
    const timer = setTimeout(() => map.invalidateSize(), 300);
    return () => clearTimeout(timer);
  }, [trigger, map]);
  return null;
}

export default function ApplicantOverview({ profile, matchesCount, matches = [], jobs = [], applications = [], setActiveTab, setJobFromMap }) {
  const { mode } = useContext(AccessibilityContext);
  const isDarkMode = mode && typeof mode === 'string' && (mode.toLowerCase().includes('dark') || mode.toLowerCase().includes('comfort'));
  const isContrast = mode && typeof mode === 'string' && mode.toLowerCase().includes('contrast');

  const [legendOpen, setLegendOpen] = useState(true);
  const [mapExpanded, setMapExpanded] = useState(false);
  const [satelliteView, setSatelliteView] = useState(false);
  const [expandedApp, setExpandedApp] = useState(null);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') setMapExpanded(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    if (mapExpanded) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mapExpanded]);

  const calculateProfileStrength = () => {
    let score = 50; 
    if (profile.skills && profile.skills.length > 0) score += 20;
    if (profile.accommodations && profile.accommodations.length > 0) score += 15;
    if (profile.pwd_document_path) score += 15;
    return score;
  };

  const profileStrength = calculateProfileStrength();
  const recentApps = applications.slice(0, 4);
  const radiusKm = profile.radius ? Number(profile.radius) : 10;
  const userLat = profile.latitude ? Number(profile.latitude) : null;
  const userLng = profile.longitude ? Number(profile.longitude) : null;
  const jobListToMap = jobs && jobs.length > 0 ? jobs : matches;

  const nearbyJobs = jobListToMap.filter(job => {
    if (!job.latitude || !job.longitude || !userLat || !userLng) return false;
    const dist = getDistanceFromLatLonInKm(userLat, userLng, Number(job.latitude), Number(job.longitude));
    return dist !== null && dist <= radiusKm;
  });

  const nearbyMatchCount = nearbyJobs.filter(job =>
    matches.some(match => match.id === job.id)
  ).length;
  const nearbyOtherCount = nearbyJobs.length - nearbyMatchCount;

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Under Review':
        return 'bg-[#2C7FFF]/10 text-[#2C7FFF] border-[#2C7FFF]/30';
      case 'Shortlisted':
        return 'bg-[#2C7FFF]/10 text-[#2C7FFF] border-[#2C7FFF]/30';
      case 'Hired':
        return 'bg-[#2C7FFF]/10 text-[#2C7FFF] border-[#2C7FFF]/30';
      case 'Rejected':
        return 'opacity-90';
      default:
        return 'bg-[#f4f4f4] text-[#03045E] border-[#03045E]/20';
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

  const getStatusMessage = (app) => {
    if (app.employer_message) return app.employer_message;
    switch (app.status) {
      case 'Shortlisted':
        return 'Employer may contact you soon';
      case 'Under Review':
        return 'Employer is viewing your profile';
      case 'Hired':
        return 'Congratulations on the new job!';
      case 'Rejected':
        return 'Unfortunately, your application was not selected.';
      default:
        return 'Application submitted.';
    }
  };

  return (
    <main role="main" aria-label="Applicant Dashboard Overview" className="animate-fadeIn w-full flex flex-col gap-6 sm:gap-9 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none'] pb-10">
      
      {/*header*/}
      <section role="region" aria-label={`Welcome back ${profile.firstname}. Here is a quick snapshot of your job search progress today.`} className="relative z-20 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-4">
        <div>
          <h2 tabIndex="0" title={`Welcome back, ${profile.firstname}!`} aria-label={`Welcome back, ${profile.firstname}!`} className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#03045E] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2C7FFF] focus-visible:ring-offset-2 rounded">
            Welcome back, {profile.firstname}!
          </h2>
          <p tabIndex="0" title="Here is a quick snapshot of your job search progress today." aria-label="Here is a quick snapshot of your job search progress today." className="text-[#03045E] mt-1 sm:mt-1.5 text-xs sm:text-sm md:text-base font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2C7FFF] focus-visible:ring-offset-2 rounded">
            Here is a quick snapshot of your job search progress today.
          </p>
        </div>
      </section>
      
      <section role="region" aria-label="Quick stats overview" className="grid grid-cols-3 gap-2 sm:gap-8">
        
     
        <div 
          role="button"
          tabIndex={0}
          aria-label={`Profile Strength, ${profileStrength} percent. Click to view your profile.`}
          onClick={() => setActiveTab('profile')}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setActiveTab('profile'); } }}
          className="relative overflow-hidden p-2.5 sm:p-8 rounded-xl sm:rounded-2xl bg-white shadow-md border border-[#03045E]/20 flex flex-col justify-between cursor-pointer hover:border-[#2C7FFF] hover:shadow-xl transition-all duration-200"
        >
          <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-0.5 sm:gap-0 mb-1.5 sm:mb-6">
              <span className="text-[8px] sm:text-xs font-extrabold uppercase tracking-widest text-[#03045E] leading-tight">Profile Strength</span>
              <span className="text-sm sm:text-3xl font-extrabold text-[#03045E]">{profileStrength}%</span>
            </div>
            <div className="w-full bg-[#f4f4f4] rounded-full h-1.5 sm:h-3 overflow-hidden mb-1.5 sm:mb-4 border border-[#03045E]/20">
              <div 
                className="h-full rounded-full transition-all duration-1000 ease-out bg-[#2C7FFF]" 
                style={{ width: `${profileStrength}%` }}
              ></div>
            </div>
            <div className="min-h-[20px] sm:min-h-[24px] flex items-center">
              {profileStrength < 100 ? (
                <p className="text-[7px] sm:text-xs text-[#03045E] font-bold leading-tight">Update your skills and accommodations to reach 100%.</p>
              ) : (
                <p className="text-[7px] sm:text-xs text-[#03045E] font-extrabold flex items-center gap-1 sm:gap-1.5 bg-[#f4f4f4] py-0.5 px-1.5 sm:py-1.5 sm:px-3 rounded-full w-fit border border-[#03045E]/30">
                  <svg aria-hidden="true" className="w-2 h-2 sm:w-4 sm:h-4 text-[#2C7FFF]" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path></svg>
                  Profile fully optimized!
                </p>
              )}
            </div>
          </div>
        </div>

        {/*smart matches*/}
        <div 
          role="button"
          tabIndex={0}
          aria-label={`Smart Matches, ${matchesCount} matching jobs. Click to explore jobs.`}
          onClick={() => setActiveTab('explore-jobs')}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setActiveTab('explore-jobs'); } }}
          className="p-2.5 sm:p-8 rounded-xl sm:rounded-2xl bg-white shadow-md border border-[#03045E]/20 flex flex-col sm:flex-row items-start sm:items-center gap-1 sm:gap-6 cursor-pointer hover:border-[#2C7FFF] hover:shadow-xl transition-all duration-200"
        >
          <div aria-hidden="true" className="w-6 h-6 sm:w-16 sm:h-16 rounded-lg sm:rounded-xl bg-[#f4f4f4] flex items-center justify-center text-[#2C7FFF] shrink-0 border border-[#03045E]/20">
            <svg aria-hidden="true" className="w-3.5 h-3.5 sm:w-8 sm:h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
            </svg>
          </div>
          <div className="flex flex-col justify-center">
            <span className="text-[8px] sm:text-xs font-extrabold uppercase tracking-widest text-[#03045E] mb-0 sm:mb-1 leading-tight">Smart Matches</span>
            <span className="text-sm sm:text-4xl font-black text-[#03045E] tracking-tight">{matchesCount}</span>
          </div>
        </div>

        {/* total applications */}
        <div 
          role="button"
          tabIndex={0}
          aria-label={`Total Applications, ${applications.length} applications. Click to view job tracker.`}
          onClick={() => setActiveTab('tracker')}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setActiveTab('tracker'); } }}
          className="p-2.5 sm:p-8 rounded-xl sm:rounded-2xl bg-white shadow-md border border-[#03045E]/20 flex flex-col sm:flex-row items-start sm:items-center gap-1 sm:gap-6 cursor-pointer hover:border-[#2C7FFF] hover:shadow-xl transition-all duration-200"
        >
          <div aria-hidden="true" className="w-6 h-6 sm:w-16 sm:h-16 rounded-lg sm:rounded-xl bg-[#f4f4f4] flex items-center justify-center text-[#2C7FFF] shrink-0 border border-[#03045E]/20">
            <svg aria-hidden="true" className="w-3.5 h-3.5 sm:w-8 sm:h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path>
            </svg>
          </div>
          <div className="flex flex-col justify-center">
            <span className="text-[8px] sm:text-xs font-extrabold uppercase tracking-widest text-[#03045E] mb-0 sm:mb-1 leading-tight">Applications</span>
            <span className="text-sm sm:text-4xl font-black text-[#03045E] tracking-tight">{applications.length}</span>
          </div>
        </div>

      </section>

      {/* Map Container - Adjusted Padding & Flex for Mobile */}
      <section aria-label="Job Discovery Map section" className="p-4 sm:p-8 rounded-2xl sm:rounded-3xl bg-white shadow-md border border-[#03045E]/20 flex flex-col">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-4 sm:mb-6 gap-3 sm:gap-0">
          <div>
            <button 
              type="button"
              onClick={() => setActiveTab('explore-jobs')}
              aria-label="View Job Discovery Map"
              className="flex flex-col items-start gap-2 w-fit group text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2C7FFF] focus-visible:ring-offset-2 rounded-lg p-1 -m-1"
            >
              <span aria-hidden="true" className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase border-2 transition-all group-hover:opacity-80 bg-[#2C7FFF]/15 border-[#2C7FFF]/30 text-[#2C7FFF]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#2C7FFF] animate-ping mr-1.5"></span>
                LIVE RADAR
              </span>
              <h3 className="text-lg sm:text-xl font-extrabold text-[#03045E] transition-all group-hover:text-[#03045e]">
                Job Discovery Map
              </h3>
            </button>
          </div>
        </div>

        {userLat && userLng ? (
          <div 
            role="region"
            aria-label={`Interactive job discovery map showing jobs within ${radiusKm} kilometers of your home location.`}
            className={mapExpanded
            ? "fixed inset-0 z-[9999] bg-white rounded-none border-0"
            : "h-[300px] sm:h-[400px] w-full rounded-xl sm:rounded-2xl overflow-hidden border border-[#03045E]/20 z-0 relative shadow-inner"
          }>
            <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-[1000] flex flex-col gap-2">
              <button
                type="button"
                onClick={() => setMapExpanded(prev => !prev)}
                aria-label={mapExpanded ? 'Exit fullscreen map' : 'Expand map to fullscreen'}
                title={mapExpanded ? 'Exit fullscreen' : 'Expand map'}
                className="relative flex items-center gap-1.5 pl-1.5 pr-2.5 py-1.5 rounded-full bg-white/95 backdrop-blur-md shadow-[0_4px_20px_rgba(3,4,94,0.15)] border border-[#03045E]/15 cursor-pointer"
              >
                <span aria-hidden="true" className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-[#2C7FFF]/10 border border-[#2C7FFF]/30 flex items-center justify-center text-[#2C7FFF] shrink-0">
                  {mapExpanded ? (
                    <svg aria-hidden="true" className="w-2.5 h-2.5 sm:w-3 sm:h-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  ) : (
                    <svg aria-hidden="true" className="w-2.5 h-2.5 sm:w-3 sm:h-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                    </svg>
                  )}
                </span>
                <span aria-hidden="true" className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-[#03045E] whitespace-nowrap">
                  {mapExpanded ? 'Exit' : 'Expand'}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setSatelliteView(prev => !prev)}
                aria-label={satelliteView ? 'Switch to street view' : 'Switch to satellite view'}
                title={satelliteView ? 'Street view' : 'Satellite view'}
                className="relative flex items-center gap-1.5 pl-1.5 pr-2.5 py-1.5 rounded-full bg-white/95 backdrop-blur-md shadow-[0_4px_20px_rgba(3,4,94,0.15)] border border-[#03045E]/15 cursor-pointer"
              >
                <span aria-hidden="true" className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-[#2C7FFF]/10 border border-[#2C7FFF]/30 flex items-center justify-center text-[#2C7FFF] shrink-0">
                  {satelliteView ? (
                    <svg aria-hidden="true" className="w-2.5 h-2.5 sm:w-3 sm:h-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                    </svg>
                  ) : (
                    <svg aria-hidden="true" className="w-2.5 h-2.5 sm:w-3 sm:h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )}
                </span>
                <span aria-hidden="true" className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-[#03045E] whitespace-nowrap">
                  {satelliteView ? 'Street' : 'Satellite'}
                </span>
              </button>
            </div>

            {mapExpanded && (
              <div aria-hidden="true" className="absolute top-3 left-16 sm:top-4 sm:left-20 z-[1000] bg-white/95 backdrop-blur-sm px-3 py-2 rounded-xl shadow-lg border border-[#03045E]/20">
                <p className="text-[11px] font-black uppercase tracking-widest text-[#03045E] m-0">Job Discovery Map</p>
              </div>
            )}

            <div className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4 z-[1000]">
              <div className="w-[200px] sm:w-[228px] bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-[#03045E]/20 overflow-hidden">
                <button
                  type="button"
                  onClick={() => setLegendOpen(open => !open)}
                  aria-expanded={legendOpen}
                  aria-controls="map-legend-panel"
                  aria-label={legendOpen ? 'Collapse map legend' : 'Expand map legend'}
                  className="w-full flex items-center gap-2 px-3 py-2.5 cursor-pointer"
                >
                  <span aria-hidden="true" className="w-6 h-6 rounded-lg bg-[#f4f4f4] border border-[#03045E]/20 flex items-center justify-center text-[#2C7FFF] shrink-0">
                    <svg aria-hidden="true" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                    </svg>
                  </span>
                  <span className="flex-1 text-left text-[10px] sm:text-[11px] font-black uppercase tracking-widest text-[#03045E]">
                    Map Legend
                  </span>
                  <svg
                    aria-hidden="true"
                    className={`w-3.5 h-3.5 text-[#03045E] transition-transform duration-300 ${legendOpen ? 'rotate-180' : ''}`}
                    fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                <div className={`grid transition-all duration-300 ease-out ${legendOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                  <div className="overflow-hidden">
                    <div id="map-legend-panel" role="region" aria-label="Map legend details" className="px-3 pb-3 flex flex-col gap-2">
                      <div aria-hidden="true" className="h-px w-full bg-[#03045E]/10 mb-0.5"></div>

                      <div className="flex items-center gap-2.5">
                        <span aria-hidden="true" className="w-3 h-3 rounded-full bg-[#10B981] border-2 border-white shadow-sm shrink-0"></span>
                        <span className="flex-1 text-[11px] font-bold text-[#03045E] leading-tight">Smart Matches</span>
                        <span aria-hidden="true" className="text-[10px] font-black text-[#10B981] bg-[#10B981]/10 px-1.5 py-0.5 rounded-full min-w-[22px] text-center">
                          {nearbyMatchCount}
                        </span>
                      </div>

                      <div className="flex items-center gap-2.5">
                        <span aria-hidden="true" className="w-3 h-3 rounded-full bg-[#2C7FFF] border-2 border-white shadow-sm shrink-0"></span>
                        <span className="flex-1 text-[11px] font-bold text-[#03045E] leading-tight">Other Opportunities</span>
                        <span aria-hidden="true" className="text-[10px] font-black text-[#2C7FFF] bg-[#2C7FFF]/10 px-1.5 py-0.5 rounded-full min-w-[22px] text-center">
                          {nearbyOtherCount}
                        </span>
                      </div>

                      <div className="flex items-center gap-2.5">
                        <span aria-hidden="true" className="w-3 h-3 rounded-full bg-[#03045E] border-2 border-white shadow-sm shrink-0"></span>
                        <span className="flex-1 text-[11px] font-bold text-[#03045E] leading-tight">Your Home Base</span>
                      </div>

                      <div className="flex items-center gap-2.5">
                        <span aria-hidden="true" className="w-3 h-3 rounded-full border-2 border-dashed border-[#03045E]/70 shrink-0"></span>
                        <span className="flex-1 text-[11px] font-bold text-[#03045E] leading-tight">Search Radius</span>
                        <span aria-hidden="true" className="text-[10px] font-black text-[#03045E]/70 bg-[#f4f4f4] border border-[#03045E]/15 px-1.5 py-0.5 rounded-full">
                          {radiusKm} km
                        </span>
                      </div>

                      {nearbyJobs.length === 0 && (
                        <p className="text-[10px] font-semibold text-[#03045E]/60 leading-snug pt-0.5">
                          No jobs found inside your radius yet.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <MapContainer center={[userLat, userLng]} zoom={12} scrollWheelZoom={true} style={{ height: '100%', width: '100%', zIndex: 0 }}>
              {satelliteView ? (
                <TileLayer
                  attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
                  url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                />
              ) : (
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
              )}
              
              <Marker position={[userLat, userLng]}>
                <Popup eventHandlers={{ add: (e) => { if (e.target._container) e.target._container.setAttribute('tabindex', '-1'); setTimeout(() => { const el = e.target._contentNode?.firstElementChild; if (el) el.focus(); }, 100); if (e.target._closeButton) e.target._closeButton.setAttribute('aria-label', 'Close'); } }}>
                  <div className="p-0 min-w-[220px] rounded-xl overflow-hidden bg-white shadow-xl outline-none" tabIndex={0}>
                    <div className="px-4 pt-3.5 pb-3">
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-white shadow-sm bg-[#03045E]">
                          <svg aria-hidden="true" className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2a7 7 0 00-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 00-7-7zm0 9.5a2.5 2.5 0 110-5 2.5 2.5 0 010 5z" /></svg>
                          Home Base
                        </span>
                        <span aria-hidden="true" className="w-2 h-2 rounded-full bg-[#03045E] animate-pulse"></span>
                      </div>
                      <h4 className="font-black text-[15px] text-[#03045E] leading-tight m-0 mb-1">Your Home Location</h4>
                      <p className="text-xs font-bold text-[#03045E]/70 m-0 leading-relaxed">
                        Jobs within {radiusKm} km of this address are shown on the map.
                      </p>
                    </div>
                  </div>
                </Popup>
              </Marker>

              <Circle 
                center={[userLat, userLng]} 
                radius={radiusKm * 1000} 
                pathOptions={{ color: '#03045E', fillColor: '#03045E', fillOpacity: 0.05, weight: 1.5, dashArray: '5, 5' }} 
              />

              {nearbyJobs.map((job) => {
                const isMatch = matches.some(match => match.id === job.id);

                return (
                  <Marker 
                    key={job.id} 
                    position={[Number(job.latitude), Number(job.longitude)]}
                    icon={isMatch ? MatchJobIcon : OtherJobIcon}
                               >
                    <Popup eventHandlers={{ add: (e) => { if (e.target._container) e.target._container.setAttribute('tabindex', '-1'); setTimeout(() => { const el = e.target._contentNode?.firstElementChild; if (el) el.focus(); }, 100); if (e.target._closeButton) e.target._closeButton.setAttribute('aria-label', 'Close'); } }}>
                      <div className="p-0 min-w-[240px] rounded-xl overflow-hidden bg-white shadow-xl outline-none" tabIndex={0}>
                        <div aria-hidden="true" className="h-1.5 w-full" style={{ backgroundColor: isMatch ? '#10B981' : '#2C7FFF' }}></div>

                        <div className="px-4 pt-3.5 pb-3">
                          <div className="flex items-center justify-between gap-2 mb-3">
                            <span
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-white shadow-sm"
                              style={{ backgroundColor: isMatch ? '#10B981' : '#2C7FFF' }}
                            >
                              {isMatch ? (
                                <svg aria-hidden="true" className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l2.9 6.9L22 10l-5.5 4.8L18.2 22 12 18.3 5.8 22l1.7-7.2L2 10l7.1-1.1L12 2z" /></svg>
                              ) : (
                                <svg aria-hidden="true" className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2a7 7 0 00-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 00-7-7zm0 9.5a2.5 2.5 0 110-5 2.5 2.5 0 010 5z" /></svg>
                              )}
                              {isMatch ? 'Smart Match' : 'Opportunity'}
                            </span>
                            <span aria-hidden="true" className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: isMatch ? '#10B981' : '#2C7FFF' }}></span>
                          </div>

                          <h4 className="font-black text-[15px] text-[#03045E] leading-tight m-0 mb-1">{job.job_title}</h4>

                          <div className="flex items-center gap-1.5 mb-3">
                            <svg aria-hidden="true" className="w-3.5 h-3.5 text-[#2C7FFF] shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M3 21h18M5 21V7l7-4 7 4v14M9 9h.01M9 12h.01M9 15h.01M9 18h.01M15 9h.01M15 12h.01M15 15h.01M15 18h.01" />
                            </svg>
                            <p className="text-xs font-bold text-[#03045E]/70 m-0 truncate">{job.company_name}</p>
                          </div>

                          <button
                            onClick={() => {
                              setJobFromMap(job); // 1. Save the clicked job
                              setActiveTab('explore-jobs'); // 2. Switch the tab
                            }}
                            aria-label={`View job details for ${job.job_title} at ${job.company_name}`}
                            className="w-full py-2.5 text-white text-xs font-black rounded-lg cursor-pointer flex items-center justify-center gap-2 shadow-md"
                            style={{ backgroundColor: isMatch ? '#10B981' : '#2C7FFF' }}
                          >
                            View Job Details
                            <svg aria-hidden="true" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}
              <MapRecenter lat={userLat} lng={userLng} />
              <MapInvalidator trigger={mapExpanded} />
            </MapContainer>
          </div>
        ) : (
          <div role="region" aria-label="Map unavailable" className="h-[300px] sm:h-[400px] w-full rounded-xl sm:rounded-2xl border-2 border-dashed border-[#03045E]/30 bg-[#f4f4f4] flex flex-col items-center justify-center text-center p-4 sm:p-6">
            <div aria-hidden="true" className="w-12 h-12 sm:w-16 sm:h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-3 sm:mb-4 border border-[#03045E]/20 text-[#2C7FFF]">
              <svg aria-hidden="true" className="w-6 h-6 sm:w-8 sm:h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
            </div>
            <p className="text-base sm:text-lg font-extrabold text-[#03045E]">Map Unavailable</p>
            <p className="text-xs sm:text-sm font-semibold text-[#03045E]/70 mt-1 max-w-xs sm:max-w-sm">
              Please update your home address in your profile settings to enable the Job Discovery Map.
            </p>
            <button onClick={() => setActiveTab('settings')} aria-label="Update your location in profile settings" className="mt-4 px-4 py-2 sm:px-5 sm:py-2.5 bg-[#2C7FFF] text-white font-bold text-xs sm:text-sm rounded-lg transition-colors shadow-sm cursor-pointer">
              Update Location
            </button>
          </div>
        )}
      </section>


      <section role="region" aria-label="Recent applications and smart engine section" className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
        
        {/* Recent Applications - Adjusted padding & list layout for mobile */}
        <section aria-label="Recent Applications section" className="p-4 sm:p-8 rounded-2xl sm:rounded-3xl bg-white shadow-md border border-[#03045E]/20 flex flex-col min-h-[350px] sm:min-h-[420px]">
          <div className="flex justify-between items-end mb-4 sm:mb-6">
            <button 
              type="button"
              onClick={() => setActiveTab('tracker')}
              aria-label="View all applications"
              className="flex flex-col items-start gap-2 w-fit group text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2C7FFF] focus-visible:ring-offset-2 rounded-lg p-1 -m-1"
            >
              <h3 tabIndex="0" aria-label="Recent Applications" className="text-lg sm:text-xl font-extrabold text-[#03045E] transition-all group-hover:text-[#03045e] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2C7FFF] focus-visible:ring-offset-2 rounded w-fit">
                Recent Applications
              </h3>
              <p tabIndex="0" aria-label="Track your latest moves." className="text-xs sm:text-sm font-semibold text-[#03045E] transition-all group-hover:text-[#03045e] mt-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2C7FFF] focus-visible:ring-offset-2 rounded w-fit">
                Track your latest moves.
              </p>
            </button>
            <button onClick={() => setActiveTab('tracker')} aria-label="View all applications" className="text-xs sm:text-sm font-extrabold text-[#2C7FFF] flex items-center gap-1 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2C7FFF] focus-visible:ring-offset-2 rounded p-1">
              View All 
              <svg aria-hidden="true" className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"></path></svg>
            </button>
          </div>
          
          <div role="list" className="flex-1 flex flex-col gap-3 sm:gap-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
            {recentApps.length > 0 ? (
              recentApps.map((app) => (
                <div 
                  key={app.application_id} 
                  role="listitem"
                  tabIndex={0}
                  className="p-3 sm:p-4 rounded-lg sm:rounded-xl border border-[#03045E]/20 bg-[#f4f4f4] flex flex-col gap-2.5"
                >
                  <span className="sr-only">
                    Application for {app.job_title} at {app.company_name}. Status: {app.status}. Applied on: {new Date(app.applied_at).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}.
                    {app.employer_message ? ` Message from Employer: ${app.employer_message}` : ''}
                  </span>
                  <div aria-hidden="true" className="flex justify-between items-center w-full">
                    <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white shadow-sm flex items-center justify-center border border-[#03045E]/20 text-[#2C7FFF] font-extrabold text-sm sm:text-lg shrink-0">
                        {app.company_name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <p className="font-extrabold text-[#03045E] text-sm sm:text-base leading-tight truncate">{app.job_title}</p>
                        <p className="text-[10px] sm:text-xs font-bold text-[#03045E] mt-0.5 truncate">{app.company_name}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1 sm:gap-1.5 shrink-0 ml-2">
                      <button
                        onClick={() => setExpandedApp(expandedApp === app.application_id ? null : app.application_id)}
                        className={`text-[9px] sm:text-[11px] font-extrabold px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg border whitespace-nowrap cursor-pointer transition-all flex items-center gap-1.5 ${getStatusStyle(app.status)}`}
                        style={getRejectedStyle(app.status)}
                      >
                        {app.status}
                        <svg className={`w-2.5 h-2.5 sm:w-3 sm:h-3 transition-transform ${expandedApp === app.application_id ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"></path>
                        </svg>
                      </button>
                      <p className="text-[9px] sm:text-[10px] font-bold text-[#03045E] uppercase tracking-wider">
                        {new Date(app.applied_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                  </div>

                  {expandedApp === app.application_id && (
                    <div className="mt-1 bg-white p-3 sm:p-4 rounded-md sm:rounded-lg border border-[#03045E]/15 flex flex-col gap-1.5 animate-fadeIn">
                      <h4 tabIndex="0" aria-label={app.employer_message ? 'Message from Employer' : 'Status Update'} className="text-[9px] sm:text-xs font-extrabold text-[#2C7FFF] uppercase tracking-widest flex items-center gap-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2C7FFF] focus-visible:ring-offset-2 rounded w-fit">
                        <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path>
                        </svg>
                        {app.employer_message ? 'Message from Employer' : 'Status Update'}
                      </h4>
                      <p tabIndex="0" aria-label={getStatusMessage(app)} className="text-[11px] sm:text-sm text-[#03045E] font-medium whitespace-pre-wrap leading-relaxed break-words focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2C7FFF] focus-visible:ring-offset-2 rounded p-1 -m-1">
                        {getStatusMessage(app)}
                      </p>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="h-full flex flex-col items-center justify-center border-2 border-dashed border-[#03045E]/30 rounded-2xl p-6 sm:p-8 bg-[#f4f4f4] text-center">
                <div aria-hidden="true" className="w-12 h-12 sm:w-16 sm:h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-3 sm:mb-4 border border-[#03045E]/20">
                  <svg aria-hidden="true" className="w-6 h-6 sm:w-8 sm:h-8 text-[#03045E]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
                </div>
                <p className="text-sm sm:text-base font-bold text-[#03045E]">No applications yet.</p>
                <p className="text-[10px] sm:text-xs font-semibold text-[#03045E] mt-1 max-w-[200px]">Start exploring jobs to see your activity here.</p>
              </div>
            )}
          </div>
        </section>


        <div className="flex flex-col gap-6 sm:gap-8">
          
          {/* Smart Engine Card - Adjusted Padding & Fonts */}
          <section aria-label="Smart Engine section" className="p-5 sm:p-8 rounded-2xl sm:rounded-3xl bg-white shadow-md border border-[#03045E]/20 flex flex-col justify-center">
                                   <div 
              tabIndex="0"
              role="text"
              onClick={() => setActiveTab('explore-jobs')}
              aria-label="Smart Engine"
              title="Smart Engine"
              className="flex flex-col items-start gap-2 w-fit group text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2C7FFF] focus-visible:ring-offset-2 rounded-lg p-1 -m-1 mb-3 sm:mb-4 cursor-pointer"
            >
              <span aria-hidden="true" className="inline-block px-2.5 sm:px-3 py-1 bg-[#f4f4f4] border border-[#03045E]/20 rounded-full text-[9px] sm:text-[10px] font-extrabold uppercase tracking-widest text-[#2C7FFF] w-fit">Smart Engine</span>
            </div>
                  <div 
              tabIndex="0"
              role="text"
              onClick={() => setActiveTab('explore-jobs')}
              aria-label="Find Your Perfect Fit"
              title="Find Your Perfect Fit"
              className="flex flex-col items-start gap-2 w-fit group text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2C7FFF] focus-visible:ring-offset-2 rounded-lg p-1 -m-1 mb-1.5 sm:mb-2 cursor-pointer"
            >
              <h3 className="text-xl sm:text-2xl font-black text-[#03045E] transition-all group-hover:text-[#03045e] leading-tight">
                Find Your Perfect Fit
              </h3>
            </div>
            <div 
              tabIndex="0"
              role="text"
              onClick={() => setActiveTab('explore-jobs')}
              aria-label="We've analyzed your skills and travel radius to pinpoint jobs tailored exactly for you."
              title="We've analyzed your skills and travel radius to pinpoint jobs tailored exactly for you."
              className="flex flex-col items-start gap-2 w-fit group text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2C7FFF] focus-visible:ring-offset-2 rounded-lg p-1 -m-1 mb-4 sm:mb-6 cursor-pointer"
            >
              <p className="text-xs sm:text-sm font-semibold text-[#03045E] transition-all group-hover:text-[#03045e] max-w-[95%] sm:max-w-[90%] leading-relaxed">
                We've analyzed your skills and travel radius to pinpoint jobs tailored exactly for you.
              </p>
            </div>
            <button onClick={() => setActiveTab('explore-jobs')} aria-label="View your job matches" className={`flex items-center justify-center gap-2 w-full px-4 sm:px-6 py-3 sm:py-3.5 bg-white border-2 border-[#2C7FFF] font-extrabold text-xs sm:text-sm rounded-lg shadow-sm cursor-pointer text-[#03045E]`}>
              View Your Matches
              <svg aria-hidden="true" className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
            </button>
          </section>

        </div>

      </section>
    </main>
  );    
}