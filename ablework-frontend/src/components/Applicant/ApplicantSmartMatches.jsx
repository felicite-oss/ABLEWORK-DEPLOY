import React, { useState } from 'react';

const safeParse = (data) => {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  let parsed = data;
  while (typeof parsed === 'string' && (parsed.startsWith('[') || parsed.startsWith('"'))) {
    try { parsed = JSON.parse(parsed); } catch (e) { break; }
  }
  if (Array.isArray(parsed)) return parsed;
  if (typeof parsed === 'string') {
    const cleaned = parsed.replace(/[\[\]"\\]/g, ''); 
    return cleaned.split(',').map(item => item.trim()).filter(item => item);
  }
  return [];
};

const getDistanceBadgeStyles = (km) => {
  const distance = Number(km);
  if (isNaN(distance)) return { backgroundColor: 'rgba(44,127,255,0.15)', color: '#03045E', borderColor: 'rgba(44,127,255,0.4)' };
  
  if (distance <= 5) {
    return { backgroundColor: 'rgba(16,185,129,0.15)', color: '#065F46', borderColor: 'rgba(16,185,129,0.5)' };
  } else if (distance <= 15) {
    return { backgroundColor: 'rgba(44,127,255,0.15)', color: '#03045E', borderColor: 'rgba(44,127,255,0.5)' };
  } else {
    return { backgroundColor: 'rgba(245,158,11,0.15)', color: '#92400E', borderColor: 'rgba(245,158,11,0.5)' };
  }
};

export default function ApplicantSmartMatches({ profile, matches, applications = [], refreshData }) {
  const [applyingTo, setApplyingTo] = useState(null);
  const [selectedJob, setSelectedJob] = useState(null);
  
  const [modalView, setModalView] = useState('details'); 
  const [resumeFile, setResumeFile] = useState(null);
  const [coverLetter, setCoverLetter] = useState('');

  const submitApplication = async (e) => {
    e.preventDefault();
    if (!resumeFile) {
        alert("Please upload your resume.");
        return;
    }

    setApplyingTo(selectedJob.id);

    const formData = new FormData();
    formData.append('applicant_id', profile.user_id);
    formData.append('job_id', selectedJob.id);
    formData.append('resume', resumeFile);
    formData.append('cover_letter', coverLetter);

    try {
      const res = await fetch('http://localhost:5001/api/applications/apply', {
        method: 'POST',
        body: formData 
      });
      
      const data = await res.json();
      if (res.ok) {
        alert("Application submitted successfully!");
        refreshData(); 
        closeModal();
      } else {
        alert(data.message || "Failed to apply.");
      }
    } catch (err) {
      alert("Server error while applying.");
    } finally {
      setApplyingTo(null);
    }
  };

  const getMatchColor = (percentage) => {
    if (percentage >= 80) return 'bg-[#2C7FFF]/15 text-[#03045E] border-[#2C7FFF]';
    if (percentage >= 50) return 'bg-[#2C7FFF]/10 text-[#03045E] border-[#03045E]/40';
    return 'bg-[#f4f4f4] text-[#03045E] border-[#03045E]/20';
  };

  const openModal = (job) => {
    setSelectedJob(job);
    setModalView('details');
    setResumeFile(null);
    setCoverLetter('');
  };

  const openApplyModal = (job) => {
    setSelectedJob(job);
    setResumeFile(null);
    setCoverLetter('');
    const isVerified = profile.verification_status === 'Approved';
    setModalView(isVerified ? 'form' : 'unverified'); 
  };

  const closeModal = () => {
    setSelectedJob(null);
    setModalView('details');
    setResumeFile(null);
    setCoverLetter('');
  };

  const isSelectedJobApplied = applications.some(app => app.job_id === selectedJob?.id);

  const applicantSkills = profile.skills ? (typeof profile.skills === 'string' ? safeParse(profile.skills) : profile.skills).map(s => s.toLowerCase()) : [];
  const applicantAccoms = profile.accommodations ? (typeof profile.accommodations === 'string' ? safeParse(profile.accommodations) : profile.accommodations).map(a => a.toLowerCase()) : [];
  const applicantDisabilities = profile.disability_type ? (typeof profile.disability_type === 'string' ? safeParse(profile.disability_type) : [profile.disability_type]).map(d => d.toLowerCase()) : [];

  return (
    <div className="animate-fadeIn w-full space-y-8 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none'] pb-10">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl sm:text-4xl font-black text-[#03045E]">
            Smart Matches
          </h2>
          <p className="text-[#03045E] mt-1.5 text-sm sm:text-base font-bold">
            Jobs filtered to your accommodations, skills, and travel radius.
          </p>
        </div>
        {matches && matches.length > 0 && (
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white border-2 border-[#03045E]/30 shadow-sm">
            <span className="w-2.5 h-2.5 rounded-full animate-pulse" style={{ backgroundColor: '#10B981' }} />
            <span className="text-xs font-black uppercase tracking-widest text-[#03045E]">
              {matches.length} match{matches.length !== 1 ? 'es' : ''} found
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-6 sm:gap-8">
        {matches && matches.length > 0 ? (
          matches.map(job => {
            const hasApplied = applications.some(app => app.job_id === job.id);

            return (
              <div
                key={job.id}
                className={`p-6 sm:p-8 rounded-[2rem] bg-white shadow-md border-2 border-[#03045E]/25 transition-all duration-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 ${hasApplied ? 'bg-[#f4f4f4] border-[#03045E]/20' : ''}`}
              >
                <div className="flex-1 w-full min-w-0">
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className={`px-3.5 py-1.5 text-xs font-black rounded-full border-2 flex items-center gap-1.5 uppercase tracking-wide ${getMatchColor(job.match_percentage)} w-fit shadow-xs`}>
                      <svg className="w-3.5 h-3.5 text-[#03045E]" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2.5" fill="none"/>
                        <circle cx="12" cy="12" r="6" stroke="currentColor" strokeWidth="2.5" fill="none"/>
                        <circle cx="12" cy="12" r="2" fill="currentColor"/>
                      </svg>
                      {job.match_percentage}% Overall Match
                    </span>
                    {job.distance_km && (
                      <span
                        style={getDistanceBadgeStyles(job.distance_km)}
                        className="px-3.5 py-1.5 border-2 text-xs font-black rounded-full flex items-center gap-1.5 uppercase tracking-wide w-fit"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                        </svg>
                        {job.distance_km} km away
                      </span>
                    )}
                    {hasApplied && (
                      <span className="px-3.5 py-1.5 bg-[#f4f4f4] text-[#03045E] border-2 border-[#03045E]/30 text-xs font-black rounded-full uppercase tracking-wide w-fit">
                        ✓ Applied
                      </span>
                    )}
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-[#03045E] leading-tight">{job.job_title}</h2>
                  <p className="text-base font-black text-[#2C7FFF] mt-1 mb-3">{job.company_name}</p>
                  <p className="text-[#03045E] text-sm font-semibold line-clamp-2 leading-relaxed">{job.job_description}</p>
                </div>

                <div className="shrink-0 w-full md:w-auto flex flex-row gap-3">
                  <button 
                    onClick={() => openModal(job)}
                    className="flex-1 md:flex-none px-6 py-3.5 bg-white border-2 border-[#03045E] text-[#03045E] font-black text-sm rounded-xl hover:bg-[#2C7FFF]/10 hover:border-[#2C7FFF] transition-all duration-200 whitespace-nowrap cursor-pointer shadow-sm"
                  >
                    View Details
                  </button>
                  <button 
                    onClick={() => openApplyModal(job)}
                    disabled={hasApplied}
                    className={`flex-1 md:flex-none px-6 py-3.5 font-black text-sm rounded-xl transition-all duration-200 whitespace-nowrap cursor-pointer border-2 ${
                      hasApplied 
                        ? 'bg-[#f4f4f4] text-[#03045E]/50 border-[#03045E]/20 cursor-not-allowed' 
                        : 'bg-[#03045E] text-[#03045E] hover:bg-[#2C7FFF]/10 hover:text-[#03045E] hover:border-[#2C7FFF] border-[#03045E]'
                    }`}
                  >
                    {hasApplied ? '✓ Applied' : 'Apply Now'}
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="p-8 sm:p-12 rounded-[2rem] border-2 border-dashed border-[#03045E]/40 bg-white flex flex-col items-center justify-center text-center min-h-[280px]">
            <div className="w-16 h-16 bg-[#2C7FFF]/15 rounded-full flex items-center justify-center shadow-sm mb-5 border-2 border-[#03045E]/30 text-[#03045E]">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
            </div>
            <h3 className="text-xl font-black text-[#03045E] mb-2">No exact matches right now</h3>
            <p className="text-sm font-bold text-[#03045E] max-w-md leading-relaxed">
              Try expanding your travel radius in profile settings, or browse Explore All Jobs for more openings outside your smart filters.
            </p>
          </div>
        )}
      </div>

      {selectedJob && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md animate-fadeIn"
          style={{ backgroundColor: 'rgba(255, 255, 255, 0.6)', filter: 'none' }}
        >
          <div className="bg-white p-4 sm:p-5 rounded-[2rem] max-w-4xl w-full max-h-[90vh] overflow-y-auto relative shadow-2xl border-2 border-[#03045E]/30 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
            
            <button
              onClick={closeModal}
              className="absolute top-5 right-5 w-10 h-10 bg-[#03045E] border-2 border-[#03045E] text-[#f4f4f4] rounded-full flex items-center justify-center font-black transition cursor-pointer hover:bg-[#2C7FFF] hover:border-[#2C7FFF] hover:text-[#f4f4f4]"
            >
              ✕
            </button>

            {modalView === 'details' ? (
              <div className="animate-fadeIn">
                <div className="pr-12 mb-6">
                  <h2 className="text-2xl sm:text-3xl font-black text-[#03045E]">{selectedJob.job_title}</h2>
                  <p className="text-lg sm:text-xl font-black text-[#2C7FFF] mt-1 border-b-2 border-[#03045E]/15 pb-6">{selectedJob.company_name}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="md:col-span-2 flex flex-col gap-8">
                    
                    {selectedJob.latitude && selectedJob.longitude && (
                      <div>
                        <div className="flex flex-wrap gap-2 mb-4">
                          <span className={`px-3.5 py-1.5 text-xs font-black rounded-full border-2 flex items-center gap-1.5 uppercase tracking-wide ${getMatchColor(selectedJob.match_percentage)} w-fit shadow-xs`}>
                            <svg className="w-3.5 h-3.5 text-[#03045E]" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2.5" fill="none"/>
                              <circle cx="12" cy="12" r="6" stroke="currentColor" strokeWidth="2.5" fill="none"/>
                              <circle cx="12" cy="12" r="2" fill="currentColor"/>
                            </svg>
                            {selectedJob.match_percentage}% Overall Match
                          </span>
                          {selectedJob.distance_km && (
                            <span
                              style={getDistanceBadgeStyles(selectedJob.distance_km)}
                              className="px-3.5 py-1.5 border-2 text-xs font-black rounded-full flex items-center gap-1.5 uppercase tracking-wide w-fit"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                              </svg>
                              {selectedJob.distance_km} km away
                            </span>
                          )}
                        </div>
                        <h3 className="text-xs font-black text-[#03045E]/70 uppercase tracking-widest mb-3">Job Location</h3>
                        <div className="w-full h-48 rounded-[1.25rem] overflow-hidden border-2 border-[#03045E]/20 shadow-sm relative">
                          <iframe
                            title="Job Location Map"
                            width="100%"
                            height="100%"
                            frameBorder="0"
                            scrolling="no"
                            marginHeight="0"
                            marginWidth="0"
                            src={`https://www.openstreetmap.org/export/embed.html?bbox=${Number(selectedJob.longitude) - 0.005},${Number(selectedJob.latitude) - 0.005},${Number(selectedJob.longitude) + 0.005},${Number(selectedJob.latitude) + 0.005}&layer=mapnik&marker=${selectedJob.latitude},${selectedJob.longitude}`}
                            className="absolute inset-0"
                          ></iframe>
                        </div>
                      </div>
                    )}

                    <div>
                      <h3 className="text-xs font-black text-[#03045E]/70 uppercase tracking-widest mb-3">Job Description</h3>
                      <p className="text-[#03045E] font-bold whitespace-pre-wrap leading-relaxed">{selectedJob.job_description}</p>
                    </div>
                    
                    <div>
                      <h3 className="text-xs font-black text-[#03045E]/70 uppercase tracking-widest mb-3">Skill Comparison</h3>
                      <div className="flex flex-wrap gap-2">
                        {safeParse(selectedJob.required_skills).map((skill, i) => {
                          const hasSkill = applicantSkills.includes(skill.toLowerCase());
                          return (
                            <span key={i} className={`px-3 py-1.5 text-sm font-black rounded-xl border-2 flex items-center gap-1.5 ${hasSkill ? 'bg-[#2C7FFF]/15 text-[#03045E] border-[#2C7FFF]' : 'bg-[#f4f4f4] text-[#03045E]/70 border-[#03045E]/20'}`}>
                              {hasSkill && <svg className="w-3.5 h-3.5 text-[#03045E]" fill="none" stroke="currentColor" strokeWidth="3.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path></svg>}
                              {!hasSkill && <span className="text-[#03045E]/50 font-extrabold">✕</span>}
                              {skill}
                            </span>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-xs font-black text-[#03045E]/70 uppercase tracking-widest mb-3">Accommodations Comparison</h3>
                      <div className="flex flex-wrap gap-2">
                        {safeParse(selectedJob.provided_accommodations).map((acc, i) => {
                          const hasAcc = applicantAccoms.includes(acc.toLowerCase());
                          return (
                            <span key={i} className={`px-3 py-1.5 text-sm font-black rounded-xl border-2 flex items-center gap-1.5 ${hasAcc ? 'bg-[#2C7FFF]/15 text-[#03045E] border-[#2C7FFF]' : 'bg-[#f4f4f4] text-[#03045E]/70 border-[#03045E]/20'}`}>
                              {hasAcc && <svg className="w-3.5 h-3.5 text-[#03045E]" fill="none" stroke="currentColor" strokeWidth="3.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path></svg>}
                              {!hasAcc && <span className="text-[#03045E]/50 font-extrabold">✕</span>}
                              {acc}
                            </span>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-xs font-black text-[#03045E]/70 uppercase tracking-widest mb-3">Accepted Disabilities Comparison</h3>
                      <div className="flex flex-wrap gap-2">
                        {safeParse(selectedJob.accepted_disabilities).length > 0 ? (
                          safeParse(selectedJob.accepted_disabilities).map((disability, i) => {
                            const isSupported = applicantDisabilities.some(d => d.includes(disability.toLowerCase()));
                            return (
                              <span key={i} className={`px-3 py-1.5 text-sm font-black rounded-xl border-2 flex items-center gap-1.5 ${isSupported ? 'bg-[#2C7FFF]/15 text-[#03045E] border-[#2C7FFF]' : 'bg-[#f4f4f4] text-[#03045E]/70 border-[#03045E]/20'}`}>
                                {isSupported && <svg className="w-3.5 h-3.5 text-[#03045E]" fill="none" stroke="currentColor" strokeWidth="3.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path></svg>}
                                {!isSupported && <span className="text-[#03045E]/50 font-extrabold">✕</span>}
                                {disability}
                              </span>
                            );
                          })
                        ) : (
                          <span className="text-sm font-bold text-[#03045E]/60 italic">None specified for this posting</span>
                        )}
                      </div>
                    </div>

                  </div>

                  <div className="flex flex-col gap-6 bg-[#f4f4f4] p-6 rounded-[1.5rem] border-2 border-[#03045E]/20 h-fit">
                    <div>
                      <h3 className="text-xs font-black text-[#03045E]/70 uppercase tracking-widest mb-1">Salary Range</h3>
                      <p className="font-black text-[#03045E] text-lg">{selectedJob.salary_range || 'Not specified'}</p>
                    </div>
                    
                    <div>
                      <h3 className="text-xs font-black text-[#03045E]/70 uppercase tracking-widest mb-1">Benefits</h3>
                      <p className="text-sm text-[#03045E] font-bold leading-relaxed">
                        {safeParse(selectedJob.benefits).join(' • ') || 'Not specified'}
                      </p>
                    </div>

                    <div className="pt-4 border-t-2 border-[#03045E]/15">
                      <h3 className="text-xs font-black text-[#03045E]/70 uppercase tracking-widest mb-3">Contact Info</h3>
                      <div className="flex flex-col gap-3">
                        <div className="flex items-center gap-2.5 text-sm text-[#03045E] font-bold break-all">
                          <svg className="w-4 h-4 shrink-0 text-[#2C7FFF]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                          {selectedJob.contact_email || selectedJob.email || 'Not provided'}
                        </div>
                        <div className="flex items-center gap-2.5 text-sm text-[#03045E] font-bold">
                          <svg className="w-4 h-4 shrink-0 text-[#2C7FFF]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                          {selectedJob.contact_number || selectedJob.phone || 'Not provided'}
                        </div>
                        
                        <div className="flex items-start gap-2.5 text-sm text-[#03045E] font-bold">
                          <svg className="w-4 h-4 shrink-0 text-[#2C7FFF] mt-0.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                          </svg>
                          <span className="leading-tight">
                            {selectedJob.workplace_address || selectedJob.company_address || selectedJob.address || selectedJob.location || 'Address not provided'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-2 pt-6 border-t-2 border-[#03045E]/15">
                      <button 
                        onClick={() => openApplyModal(selectedJob)}
                        disabled={isSelectedJobApplied}
                        className={`py-4 px-6 font-black text-sm rounded-xl transition w-full shadow-sm cursor-pointer border-2 ${
                          isSelectedJobApplied 
                            ? 'bg-[#f4f4f4] text-[#03045E]/50 border-[#03045E]/20 cursor-not-allowed' 
                            : 'bg-[#2C7FFF] text-[#03045E] hover:bg-[#2C7FFF]/15 hover:text-[#03045E] hover:border-[#2C7FFF] border-[#2C7FFF]'
                        }`}
                      >
                        {isSelectedJobApplied ? '✓ Already Applied' : 'Apply Now'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : modalView === 'unverified' ? (
              <div className="animate-fadeIn max-w-lg mx-auto text-center py-8">
                <div className="w-20 h-20 bg-[#2C7FFF]/15 text-[#03045E] rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-[#2C7FFF]/40">
                  <svg className="w-10 h-10 text-[#03045E]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                </div>
                <h2 className="text-2xl font-black text-[#03045E] mb-3">Verification Pending</h2>
                <p className="text-[#03045E] font-bold mb-8 leading-relaxed">
                  Your PWD ID is currently being reviewed by our admin. Once your account is fully verified, this security lock will be removed and you can start applying to jobs!
                </p>
                <button 
                  onClick={() => setModalView('details')} 
                  className="py-3.5 px-6 bg-[#2C7FFF] text-white font-black text-sm rounded-xl hover:bg-[#2C7FFF]/15 hover:text-[#03045E] hover:border-[#2C7FFF] border-2 border-[#2C7FFF] transition shadow-sm w-full cursor-pointer"
                >
                  Back to Job Details
                </button>
              </div>
            ) : (
              <div className="animate-fadeIn w-full">
                <button onClick={() => setModalView('details')} className="text-sm font-black text-[#2C7FFF] hover:underline mb-6 block cursor-pointer">← Back to Job Details</button>
                <h2 className="text-2xl sm:text-3xl font-black text-[#03045E] mb-2">Submit Application</h2>
                <p className="text-[#03045E] mb-8 font-bold">Applying for <span className="font-black text-[#2C7FFF]">{selectedJob.job_title}</span> at {selectedJob.company_name}</p>
                <form onSubmit={submitApplication} className="flex flex-col gap-6">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-black text-[#03045E]">Upload Resume / CV <span className="text-[#2C7FFF]">*</span></label>
                    <div className="border-2 border-dashed border-[#03045E]/30 p-6 rounded-[1.5rem] bg-[#f4f4f4] flex flex-col items-center justify-center text-center">
                      <div className="w-12 h-12 mb-3 text-[#2C7FFF] flex items-center justify-center">
                        <svg className="w-10 h-10" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                        </svg>
                      </div>
                      <input type="file" accept=".pdf,.doc,.docx" required onChange={(e) => setResumeFile(e.target.files[0])} className="text-sm text-[#03045E] font-bold file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-2 file:border-[#2C7FFF] file:text-sm file:font-black file:bg-[#2C7FFF]/20 file:text-[#2c7fff] hover:file:bg-[#2C7FFF] hover:file:text-white cursor-pointer"/>
                      <p className="text-xs text-[#03045E]/70 mt-3 font-bold">Supported formats: PDF, DOCX (Max 5MB)</p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-black text-[#03045E]">Pitch / Cover Letter <span className="text-[#03045E]/80 font-bold">(Optional)</span></label>
                    <textarea rows="4" value={coverLetter} onChange={(e) => setCoverLetter(e.target.value)} placeholder="Briefly explain why you are a great fit for this role..." className="p-4 border-2 border-[#03045E]/30 rounded-[1.25rem] bg-white text-[#03045E] focus:border-[#2C7FFF] outline-none resize-none font-bold"></textarea>
                  </div>
                  <div className="mt-4 pt-6 border-t-2 border-[#03045E]/15">
                    <button 
                      type="submit" 
                      disabled={applyingTo === selectedJob.id} 
                      className="py-4 px-4 bg-[#2C7FFF] text-white font-black text-sm rounded-xl transition w-full shadow-sm disabled:bg-[#2C7FFF]/50 border-2 border-[#2C7FFF] cursor-pointer"
                    >
                      {applyingTo === selectedJob.id ? 'Uploading & Submitting...' : 'Submit Application'}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}