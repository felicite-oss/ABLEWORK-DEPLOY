import React, { useState, useContext, useEffect } from 'react';
import { AccessibilityContext } from '../../context/AccessibilityContext';
import { useColorPalette } from '../../context/ColorPaletteContext';
import API_BASE_URL from '../../api/api';

export default function EmployerPostJob({ profile, refreshData, setActiveTab }) {
  const { mode } = useContext(AccessibilityContext);
  const { paletteKey } = useColorPalette();
  const isContrast = mode && typeof mode === 'string' && mode.toLowerCase().includes('contrast');
  const isDarkMode = mode && typeof mode === 'string' && (mode.toLowerCase().includes('dark') || mode.toLowerCase().includes('comfort'));
  const isDark = isContrast || isDarkMode;
  const isHighContrastOrDarkComfort = paletteKey === 'highContrast' || paletteKey === 'darkComfort';
  const [jobTitle, setJobTitle] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [currentSkill, setCurrentSkill] = useState(''); 
  const [selectedAccommodations, setSelectedAccommodations] = useState([]);
  const [currentAccommodation, setCurrentAccommodation] = useState('');
  const [currency, setCurrency] = useState('PHP');
  const [salaryRange, setSalaryRange] = useState('');
  const [salaryError, setSalaryError] = useState('');
  const [maxApplications, setMaxApplications] = useState(50);
  const [selectedBenefits, setSelectedBenefits] = useState([]);
  const [currentBenefit, setCurrentBenefit] = useState('');
  const [selectedDisabilities, setSelectedDisabilities] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ type: '', text: '' }); 
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [publishedJobTitle, setPublishedJobTitle] = useState('');
  const [expandedCategory, setExpandedCategory] = useState(null);
  const isDeactivated = profile?.account_status === 'Deactivated' || profile?.status === 'Deactivated';
  const isVerified = profile?.verification_status === 'Approved';

  useEffect(() => {
    if (salaryRange.trim() === '') {
      setSalaryError('');
    } else if (!salaryRange.includes('-')) {
      setSalaryError('Requires a hyphen separator (e.g., 20,000 - 30,000)');
    } else {
      const parts = salaryRange.split('-');
      const hasNumberLeft = /\d/.test(parts[0]);
      const hasNumberRight = /\d/.test(parts[1]);

      if (!hasNumberLeft || !hasNumberRight) {
        setSalaryError('Requires amounts on both sides of the hyphen');
      } else {
        setSalaryError('');
      }
    }
  }, [salaryRange]);

const disabilityCategories = {
    "Vision Impairments": ['Total Blindness','Partially Blind' ,'Low Vision', 'Color Blindness'],
    "Hearing & Speech": ['Deafness', 'Hard of Hearing', 'Muteness', 'Speech Impairment'],
    "Combinations": ['Deafblindness'],
    "Amputation": [
      'Upper Limb Amputation (Left)', 'Upper Limb Amputation (Right)', 'Upper Limb Amputation (Both)', 
      'Lower Limb Amputation (Left)', 'Lower Limb Amputation (Right)', 'Lower Limb Amputation (Both)'
    ],
    "Polio": ['Polio (Upper Limbs)', 'Polio (Lower Limbs)', 'Polio (One Side)'],
    "Motor & Neuromuscular": [
      'Paraplegia (Lower Body)', 'Hemiplegia (One Side)', 'Quadriplegia (All Limbs)', 
      'Cerebral Palsy', 'Limited Fine Motor Skills', 'Spinal Cord Injury', 
      'Muscular Dystrophy', 'Spina Bifida', 'Dwarfism', 'Scoliosis', 'Multiple Sclerosis', 'Chronic Pain'
    ]
  };

const skillSuggestions = [
    'Data Entry', 'Customer Service', 'Virtual Assistance', 'Graphic Design', 'Social Media Management', 'Microsoft Office',
    'Massage Therapy', 'Reflexology', 'Wellness Therapy', 'Braille Transcription', 'Sign Language Instruction', 'Translation',
    'Audio Transcription', 'Voice-Over Artistry', 'Telemarketing', 'Web Development', 'Software Programming', 'UI/UX Design',
    'QA Testing', 'IT Helpdesk', 'Database Administration', 'Copywriting', 'Video Editing', 'Audio Editing',
    'Visual Arts / Illustration', 'Bookkeeping', 'Project Management', 'Scheduling', 'Inventory Management',
    'Communication', 'Problem Solving', 'Time Management', 'Teamwork'
  ];

const accommodationSuggestions = [
    'Screen Reader', 'Wheelchair Access', 'Sign Language Interpreter', 'Flexible Hours', 'Quiet Workspace',
    'Ergonomic Setup', 'Noise-Cancelling Headphones', 'Screen Magnifier', 'Braille Keyboard', 'Captioning Services',
    'Remote Work', 'Frequent Breaks', 'Service Animal', 'Adjustable Desk', 'Voice-to-Text Software',
    'Large Print Documents', 'Step-Free Access', 'Travel Assistant', 'Walking Assistant', 'Accessible Parking'
  ];

  const salaryOptionsPHP = [
    'Undisclosed / Negotiable',
    'Below ₱15,000 / month',
    '₱15,000 - ₱25,000 / month (Entry Level)',
    '₱25,000 - ₱40,000 / month (Specialist)',
    '₱40,000 - ₱70,000 / month (Mid-Level)',
    '₱70,000 - ₱100,000 / month (Managerial)',
    '₱100,000+ / month (Executive)'
  ];

  const salaryOptionsUSD = [
    'Undisclosed / Negotiable',
    'Below $500 / month',
    '$500 - $1,000 / month (Entry Level)',
    '$1,000 - $2,000 / month (Specialist)',
    '$2,000 - $4,000 / month (Mid-Level)',
    '$4,000+ / month (Executive/Senior)'
  ];

  const doleMandatedBenefits = [
    '13th Month Pay', 'SSS Contribution', 'PhilHealth', 'Pag-IBIG Fund',
    'Service Incentive Leave (SIL)', 'Maternity / Paternity Leave', 'Night Shift Differential'
  ];

  const standardBenefits = [
    'HMO / Health Insurance', 'Paid Vacation Leave', 'Paid Sick Leave',
    'Performance Bonus', '14th Month Pay', 'Flexible Working Hours', 'Equipment Provided'
  ];

  const toggleSelection = (item, selectedArray, setSelectedArray) => {
    if (selectedArray.includes(item)) {
      setSelectedArray(selectedArray.filter(i => i !== item));
    } else {
      setSelectedArray([...selectedArray, item]);
    }
  };

  const handleSkillKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addSkill(currentSkill);
    }
  };

  const addSkill = (skill) => {
    const trimmed = skill.trim();
    if (trimmed && !selectedSkills.some(s => s.toLowerCase() === trimmed.toLowerCase())) {
      setSelectedSkills([...selectedSkills, trimmed]);
      setCurrentSkill('');
    }
  };

  const removeSkill = (skillToRemove) => {
    setSelectedSkills(selectedSkills.filter(skill => skill !== skillToRemove));
  };

  const activeSkillQuery = currentSkill.trim().toLowerCase();
  const filteredSkills = activeSkillQuery === '' ? [] : skillSuggestions.filter(s => 
    s.toLowerCase().includes(activeSkillQuery) && !selectedSkills.some(selected => selected.toLowerCase() === s.toLowerCase())
  );

  const handleAccommodationKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addAccommodation(currentAccommodation);
    }
  };

  const addAccommodation = (acc) => {
    const trimmed = acc.trim();
    if (trimmed && !selectedAccommodations.some(a => a.toLowerCase() === trimmed.toLowerCase())) {
      setSelectedAccommodations([...selectedAccommodations, trimmed]);
      setCurrentAccommodation('');
    }
  };

  const removeAccommodation = (accToRemove) => {
    setSelectedAccommodations(selectedAccommodations.filter(acc => acc !== accToRemove));
  };

  const activeAccQuery = currentAccommodation.trim().toLowerCase();
  const filteredAccommodations = activeAccQuery === '' ? [] : accommodationSuggestions.filter(a => 
    a.toLowerCase().includes(activeAccQuery) && !selectedAccommodations.some(selected => selected.toLowerCase() === a.toLowerCase())
  );

  const handleBenefitKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addBenefit(currentBenefit);
    }
  };

  const addBenefit = (benefit) => {
    const trimmed = benefit.trim();
    if (trimmed && !selectedBenefits.some(b => b.toLowerCase() === trimmed.toLowerCase())) {
      setSelectedBenefits([...selectedBenefits, trimmed]);
      setCurrentBenefit('');
    }
  };

  const removeBenefit = (benefitToRemove) => {
    setSelectedBenefits(selectedBenefits.filter(b => b !== benefitToRemove));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatusMessage({ type: '', text: '' });

    if (selectedDisabilities.length === 0) {
      return setStatusMessage({ type: 'error', text: 'Please select at least one accepted disability.' });
    }
    
    if (selectedSkills.length === 0) {
      return setStatusMessage({ type: 'error', text: 'Please add at least one required skill.' });
    }

    setIsLoading(true);

    const payload = {
      employer_id: profile.user_id,
      company_name: profile.company_name,
      job_title: jobTitle,
      job_description: jobDescription,
      required_skills: selectedSkills,
      provided_accommodations: selectedAccommodations, 
      accepted_disabilities: selectedDisabilities, 
      salary_range: salaryRange,
      benefits: selectedBenefits,
      max_applications: maxApplications,
      latitude: profile.latitude,
      longitude: profile.longitude,
      status: 'Active'
    };

    try {
      const response = await fetch(`${API_BASE_URL}/api/jobs/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        setPublishedJobTitle(jobTitle);
        setStatusMessage({ type: 'success', text: 'Job posted successfully! Redirecting to dashboard...' });
        setJobTitle('');
        setJobDescription('');
        setSelectedSkills([]);
        setCurrentSkill('');
        setSelectedAccommodations([]);
        setCurrentAccommodation('');
        setSelectedDisabilities([]);
        setSalaryRange('');
        setSalaryError('');
        setSelectedBenefits([]);
        setCurrentBenefit('');
        
        setShowSuccessAlert(true);
        await refreshData();
        setTimeout(() => {
          setShowSuccessAlert(false);
          setActiveTab('overview');
        }, 3500);
      } else {
        setStatusMessage({ type: 'error', text: data.message || 'Failed to post job.' });
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Server Error:", error);
      setStatusMessage({ type: 'error', text: 'Cannot connect to the server.' });
      setIsLoading(false);
    }
  };

  const pageText = isDark ? 'text-white' : 'text-[#03045E]';
  const muted = isDark ? 'text-white/70' : 'text-[#03045E]/70';
  const cardBg = isDark ? 'bg-black border-white' : 'bg-white border-gray-200';
  const softBg = isDark ? 'bg-black border-white' : 'bg-white border-gray-200';
  
  // Radius adjusted: inputs now use rounded-lg / rounded-md
  const inputCls = isContrast
    ? 'w-full p-2.5 sm:p-4 border-2 border-white rounded-lg bg-black text-white font-semibold placeholder:text-gray-400 focus:outline-none focus:border-white transition-all text-sm sm:text-base'
    : isDarkMode
      ? 'w-full p-2.5 sm:p-4 border-2 border-white rounded-lg bg-black text-white font-semibold placeholder:text-gray-400 focus:outline-none focus:border-white transition-all text-sm sm:text-base'
      : 'w-full p-2.5 sm:p-4 border-2 border-gray-200 rounded-lg bg-white text-[#03045E] font-semibold placeholder:text-gray-400 focus:outline-none focus:border-gray-200 transition-all text-sm sm:text-base';
      
  const inputSmCls = isContrast
    ? 'w-full p-2 sm:p-3 border-2 border-white rounded-md bg-black text-white font-semibold placeholder:text-gray-400 focus:outline-none focus:border-white transition-all text-xs sm:text-sm'
    : isDarkMode
      ? 'w-full p-2 sm:p-3 border-2 border-white rounded-md bg-black text-white font-semibold placeholder:text-gray-400 focus:outline-none focus:border-white transition-all text-xs sm:text-sm'
      : 'w-full p-2 sm:p-3 border-2 border-gray-200 rounded-md bg-white text-[#03045E] font-semibold placeholder:text-gray-400 focus:outline-none focus:border-gray-200 transition-all text-xs sm:text-sm';
      
  const chipContainer = isDark
    ? 'flex flex-wrap gap-1.5 sm:gap-2 mt-2 p-2 sm:p-3 bg-black rounded-lg border-2 border-white'
    : 'flex flex-wrap gap-1.5 sm:gap-2 mt-2 p-2 sm:p-3 bg-white rounded-lg border-2 border-gray-200';
    
  const suggestionBtn = isDark
    ? 'px-2 sm:px-3 py-1 text-[10px] sm:text-xs font-bold rounded-full border-2 bg-black text-white border-white'
    : 'px-2 sm:px-3 py-1 text-[10px] sm:text-xs font-bold rounded-full border-2 bg-white text-[#03045E] border-gray-200';
    
  const divider = isDark ? 'border-white' : 'border-gray-200';

  return (
    <div className="animate-fadeIn max-w-9xl mx-auto pb-6 sm:pb-10 px-1 sm:px-0">
      
      {/* Header Container (Outer) */}
      <div className={`flex flex-col md:flex-row justify-between items-start md:items-center gap-3 sm:gap-4 mb-6 sm:mb-8 backdrop-blur-md p-4 sm:p-6 rounded-2xl shadow-[0_10px_30px_rgba(3,4,94,0.06)] border-2 ${cardBg}`}>
        <div>
          <div className="flex items-center gap-1.5 sm:gap-2 mb-1 sm:mb-1.5 flex-wrap">
            <span className={`text-[10px] sm:text-xs font-extrabold px-2 sm:px-3 py-0.5 sm:py-1 rounded-full uppercase tracking-wider border-2 ${isDark ? 'bg-black text-white border-white' : 'bg-white text-[#2C7FFF] border-gray-200'}`}>Job Management</span>
            <span className={`text-[10px] sm:text-xs font-bold px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full flex items-center gap-1 sm:gap-1.5 border-2 ${isDark ? 'bg-black text-white border-white' : 'bg-white text-[#03045E] border-gray-200'}`}>
              <span className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full animate-pulse ${isDark ? 'bg-white' : 'bg-[#2C7FFF]'}`}></span> Smart Engine Enabled
            </span>
          </div>
          <h1 className={`text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight ${pageText}`}>Create a Job Posting</h1>
          <p className={`text-xs sm:text-sm font-semibold mt-0.5 ${muted}`}>
            Publish targeted opportunities with guaranteed accommodations for <span className={`font-bold ${pageText}`}>{profile.company_name}</span>.
          </p>
        </div>
      </div>

      {statusMessage.text && (
        <div className={`p-3 sm:p-4 mb-4 sm:mb-6 rounded-xl font-bold text-center border-2 text-sm sm:text-base ${
          statusMessage.type === 'success'
            ? (isDark ? 'bg-black text-white border-white' : 'bg-white text-[#2C7FFF] border-gray-200')
            : (isDark ? 'bg-black text-white border-white' : 'bg-white text-[#03045E] border-gray-200')
        }`}>
          {statusMessage.text}
        </div>
      )}

      {/* VERIFICATION REQUIRED LOCK SCREEN */}
      {!isVerified ? (
        <div className={`relative p-8 md:p-16 rounded-2xl border-2 flex flex-col items-center text-center overflow-hidden shadow-sm ${cardBg}`}>
          <div className={`absolute -top-12 -right-12 w-40 h-40 rounded-full opacity-50 pointer-events-none ${isDark ? 'bg-white/10' : 'bg-[#2C7FFF]/10'}`}></div>
          <div className={`absolute -bottom-10 -left-10 w-32 h-32 rounded-full opacity-50 pointer-events-none ${isDark ? 'bg-white/10' : 'bg-[#2C7FFF]/10'}`}></div>
          
          {/* Inner Icon Box */}
          <div className={`relative w-20 h-20 md:w-24 md:h-24 rounded-xl flex items-center justify-center mb-6 shadow-sm border-2 ${isDark ? 'bg-white text-black border-white' : 'bg-[#03045E] text-white border-[#03045E]'}`}>
            <svg className="w-10 h-10 md:w-12 md:h-12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <div className={`absolute -top-2 -right-2 w-6 h-6 md:w-8 md:h-8 rounded-full border-4 flex items-center justify-center font-black text-xs shadow-md ${isDark ? 'bg-black border-white text-white' : 'bg-white border-[#03045E] text-[#03045E]'}`}>
              !
            </div>
          </div>
          
          <h2 className={`text-2xl md:text-3xl font-black tracking-tight mb-3 ${pageText}`}>
            Verification Required
          </h2>
          
          <p className={`text-sm md:text-base font-bold max-w-lg leading-relaxed mb-6 ${muted}`}>
            Your employer account is currently <span className="uppercase tracking-widest font-black underline underline-offset-4 decoration-2">{(profile?.verification_status || 'Pending')}</span>. 
            You must wait for an administrator to approve your business permit before you can publish job opportunities.
          </p>

          <button 
            onClick={() => setActiveTab('settings')}
            className={`px-6 py-3 font-black text-sm uppercase tracking-wider rounded-lg border-2 transition-all cursor-pointer ${
              isHighContrastOrDarkComfort
                ? 'bg-[#2C7FFF] !text-white border-[#2C7FFF] hover:bg-white hover:text-[#2C7FFF]'
                : (isDark
                  ? 'bg-white text-black border-white hover:bg-black hover:text-white'
                  : 'bg-[#03045E] text-white border-[#03045E] hover:bg-[#2C7FFF] hover:border-[#2C7FFF]')
            }`}
          >
            Check Verification Status
          </button>
        </div>
      ) : (
      <form onSubmit={handleSubmit} className={`p-4 sm:p-8 rounded-2xl shadow-sm border-2 flex flex-col gap-6 sm:gap-8 ${cardBg}`}>
        
        <div className="flex flex-col gap-3 sm:gap-4">
          <div className="flex flex-col gap-1.5 sm:gap-2">
            <label className={`text-xs sm:text-sm font-extrabold flex items-center gap-1.5 sm:gap-2 uppercase tracking-wider ${pageText}`}>
              <svg className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isDark ? 'text-white' : 'text-[#2C7FFF]'}`} fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
              Job Title <span className={isDark ? 'text-white' : 'text-red-500'}>*</span>
            </label>
            <input 
              type="text" value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} required
              placeholder="e.g. Remote Data Specialist"
              className={inputCls}
            />
          </div>

          <div className="flex flex-col gap-1.5 sm:gap-2">
            <label className={`text-xs sm:text-sm font-extrabold flex items-center gap-1.5 sm:gap-2 uppercase tracking-wider ${pageText}`}>
              <svg className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isDark ? 'text-white' : 'text-[#2C7FFF]'}`} fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h7"></path></svg>
              Full Job Description <span className={isDark ? 'text-white' : 'text-red-500'}>*</span>
            </label>
            <textarea 
              value={jobDescription} onChange={(e) => setJobDescription(e.target.value)} required rows="5"
              placeholder="Describe the role responsibilities and expectations..."
              className={`${inputCls} resize-none`}
            ></textarea>
          </div>
        </div>


          {/* NEW MAX APPLICATIONS FIELD */}
          <div className="flex flex-col gap-1.5 sm:gap-2">
            <label className={`text-xs sm:text-sm font-extrabold flex items-center gap-1.5 sm:gap-2 uppercase tracking-wider ${pageText}`}>
              <svg className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isDark ? 'text-white' : 'text-[#2C7FFF]'}`} fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
              Maximum Applications Allowed
            </label>
            <p className={`text-[10px] sm:text-xs font-semibold mb-1 ${muted}`}>
              The job will automatically stop accepting resumes once this number is reached (Max: 50).
            </p>
            <input 
              type="number" 
              min="1" 
              max="50"
              value={maxApplications} 
              onChange={(e) => {
                let val = parseInt(e.target.value) || 1;
                // Instantly forces the number back to 50 if they try to type 51 or higher
                if (val > 50) val = 50; 
                setMaxApplications(val);
              }} 
              required
              className={inputSmCls}
            />
          </div>

        <hr className={divider} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          

{/* SALARY & CURRENCY DROPDOWN */}
          <div className="flex flex-col gap-2 sm:gap-3">
            <label className={`text-xs sm:text-sm font-extrabold uppercase tracking-wider ${pageText}`}>
              Salary Range
            </label>
            <p className={`text-[10px] sm:text-xs font-semibold mb-1 ${muted}`}>Select currency and applicable income bracket.</p>
            
            <div className="flex gap-2">
              <select
                value={currency}
                onChange={(e) => {
                  setCurrency(e.target.value);
                  setSalaryRange(''); // Resets the bracket if they switch currencies
                }}
                className={`w-24 p-2 sm:p-3 border-2 rounded-md font-bold focus:outline-none transition-all text-xs sm:text-sm cursor-pointer appearance-none text-center ${
                  isContrast || isDarkMode
                    ? 'border-white bg-black text-white focus:border-white'
                    : 'border-gray-200 bg-[#f4f4f4] text-[#03045E] focus:border-gray-200'
                }`}
              >
                <option value="PHP">PHP ₱</option>
                <option value="USD">USD $</option>
              </select>

              <select
                value={salaryRange}
                onChange={(e) => setSalaryRange(e.target.value)}
                className={`flex-1 p-2 sm:p-3 border-2 rounded-md font-semibold focus:outline-none transition-all text-xs sm:text-sm cursor-pointer appearance-none ${
                  isContrast || isDarkMode
                    ? 'border-white bg-black text-white focus:border-white'
                    : 'border-gray-200 bg-white text-[#03045E] focus:border-gray-200'
                }`}
              >
                <option value="" disabled>Select a salary bracket...</option>
                {(currency === 'PHP' ? salaryOptionsPHP : salaryOptionsUSD).map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
          </div>

          {/* DOLE & COMPANY BENEFITS DROPDOWN */}
          <div className="flex flex-col gap-2 sm:gap-3">
            <label className={`text-xs sm:text-sm font-extrabold uppercase tracking-wider ${pageText}`}>
              Benefits Package
            </label>
            <p className={`text-[10px] sm:text-xs font-semibold mb-1 ${muted}`}>Select DOLE-mandated and company-initiated benefits.</p>
            
            <select
              value=""
              onChange={(e) => {
                const val = e.target.value;
                if (val && !selectedBenefits.includes(val)) {
                  setSelectedBenefits([...selectedBenefits, val]);
                }
              }}
              className={`w-full p-2 sm:p-3 border-2 rounded-md font-semibold focus:outline-none transition-all text-xs sm:text-sm cursor-pointer appearance-none ${
                isContrast || isDarkMode
                  ? 'border-white bg-black text-white focus:border-white'
                  : 'border-gray-200 bg-white text-[#03045E] focus:border-gray-200'
              }`}
            >
              <option value="" disabled>+ Add a benefit...</option>
              
              <optgroup label="DOLE-Mandated (Labor Code)">
                {doleMandatedBenefits
                  .filter(b => !selectedBenefits.includes(b))
                  .map(benefit => (
                    <option key={benefit} value={benefit}>{benefit}</option>
                  ))}
              </optgroup>
              
              <optgroup label="Company Perks">
                {standardBenefits
                  .filter(b => !selectedBenefits.includes(b))
                  .map(benefit => (
                    <option key={benefit} value={benefit}>{benefit}</option>
                  ))}
              </optgroup>
            </select>

            {/* Selected Benefits Chips */}
            {selectedBenefits.length > 0 && (
              <div className={chipContainer}>
                {selectedBenefits.map(benefit => (
                  <span key={benefit} className={`inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-xs font-bold rounded-md border-2 ${isDark ? 'bg-black text-white border-white' : 'bg-white text-[#03045E] border-gray-200'}`}>
                    {benefit} 
                    <button 
                      type="button" 
                      onClick={() => setSelectedBenefits(selectedBenefits.filter(b => b !== benefit))} 
                      className={`font-bold ml-0.5 transition ${isDark ? 'text-white hover:text-red-500' : 'text-[#03045E] hover:text-red-500'}`}
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        <hr className={divider} />

               <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 items-start">
          <div className="flex flex-col gap-2 sm:gap-3">
            <label className={`text-xs sm:text-sm font-extrabold uppercase tracking-wider ${pageText}`}>
              Required Skills <span className={isDark ? 'text-white' : 'text-red-500'}>*</span>
            </label>
            <p className={`text-[10px] sm:text-xs font-semibold mb-1 ${muted}`}>Type a skill and press <strong>Enter</strong> to add it.</p>
            <input
              type="text" value={currentSkill} onChange={(e) => setCurrentSkill(e.target.value)} onKeyDown={handleSkillKeyDown}
              placeholder="e.g. Python, Graphic Design..."
              className={inputSmCls}
            />
            {filteredSkills.length > 0 && (
              <div className="flex flex-wrap gap-1.5 sm:gap-2 mt-1">
                {filteredSkills.map(suggestion => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => addSkill(suggestion)}
                    className={suggestionBtn}
                  >
                    + {suggestion}
                  </button>
                ))}
              </div>
            )}
            {selectedSkills.length > 0 && (
                           <div className={`${chipContainer} flex-col`}>
                {selectedSkills.map(skill => (
                  <span key={skill} className={`inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-xs font-bold rounded-md border-2 ${isDark ? 'bg-black text-white border-white' : 'bg-white text-[#03045E] border-gray-200'}`}>
                    {skill} <button type="button" onClick={() => removeSkill(skill)} className={`font-bold ml-0.5 transition ${isDark ? 'text-white hover:text-red-500' : 'text-[#03045E] hover:text-red-500'}`}>✕</button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2 sm:gap-3">
            <label className={`text-xs sm:text-sm font-extrabold uppercase tracking-wider ${pageText}`}>
              Guaranteed Accommodations
            </label>
            <p className={`text-[10px] sm:text-xs font-semibold mb-1 ${muted}`}>Type an accommodation and press <strong>Enter</strong> to add it.</p>
            <input
              type="text" value={currentAccommodation} onChange={(e) => setCurrentAccommodation(e.target.value)} onKeyDown={handleAccommodationKeyDown}
              placeholder="e.g. Wheelchair Access, Screen Reader..."
              className={inputSmCls}
            />
            {filteredAccommodations.length > 0 && (
              <div className="flex flex-wrap gap-1.5 sm:gap-2 mt-1">
                {filteredAccommodations.map(suggestion => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => addAccommodation(suggestion)}
                    className={suggestionBtn}
                  >
                    + {suggestion}
                  </button>
                ))}
              </div>
            )}
            {selectedAccommodations.length > 0 && (
              <div className={chipContainer}>
                {selectedAccommodations.map(acc => (
                  <span key={acc} className={`inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-xs font-bold rounded-md border-2 ${isDark ? 'bg-black text-white border-white' : 'bg-white text-[#03045E] border-gray-200'}`}>
                    {acc} <button type="button" onClick={() => removeAccommodation(acc)} className={`font-bold ml-0.5 transition ${isDark ? 'text-white hover:text-red-500' : 'text-[#03045E] hover:text-red-500'}`}>✕</button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        <hr className={divider} />

{/* Disability Section Container (Expandable UI) */}
        <div className={`flex flex-col gap-3 sm:gap-4 p-3 sm:p-5 rounded-xl border-2 ${softBg}`}>
          <div>
            <label className={`text-xs sm:text-sm font-extrabold flex items-center gap-1.5 sm:gap-2 uppercase tracking-wider ${pageText}`}>
              <svg className={`w-4 h-4 sm:w-5 sm:h-5 ${isDark ? 'text-white' : 'text-[#2C7FFF]'}`} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              Accepted Disabilities <span className={isDark ? 'text-white' : 'text-red-500'}>*</span>
            </label>
            <p className={`text-[10px] sm:text-xs font-semibold mt-1 ${muted}`}>Select a category below to reveal and choose specific conditions this workplace is fully equipped to support.</p>
          </div>

          {/* Show Currently Selected Disabilities so they don't get lost when categories switch */}
          {selectedDisabilities.length > 0 && (
            <div className={chipContainer}>
              <span className={`w-full text-[10px] font-black uppercase tracking-wider ${muted}`}>Currently Selected:</span>
              {selectedDisabilities.map(disability => (
                <span key={disability} className={`inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-xs font-bold rounded-md border-2 ${isDark ? 'bg-black text-white border-white' : 'bg-white text-[#03045E] border-gray-200'}`}>
                  {disability}
                  <button type="button" onClick={() => toggleSelection(disability, selectedDisabilities, setSelectedDisabilities)} className={`font-bold ml-0.5 transition ${isDark ? 'text-white hover:text-red-500' : 'text-[#03045E] hover:text-red-500'}`}>✕</button>
                </span>
              ))}
            </div>
          )}
          
                 {/* Main Category Buttons */}
          <div className="flex flex-wrap gap-2 mt-1">
            {Object.keys(disabilityCategories).map(category => {
              const isActive = expandedCategory === category;
              return (
                <button
                  type="button"
                  key={category}
                  onClick={() => setExpandedCategory(isActive ? null : category)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-[10px] sm:text-xs font-bold border-2 transition-colors ${
                    isActive
                      ? (isDark ? 'bg-white text-black border-white' : 'bg-[#03045E] text-white border-[#03045E]')
                      : (isDark ? 'bg-black text-white border-white/50 hover:border-white' : 'bg-white text-[#03045E] border-gray-200 hover:border-[#03045E]')
                  }`}
                >
                  {category} 
                  <svg 
                    className={`w-3 h-3 shrink-0 transition-transform duration-300 ${isActive ? 'rotate-0' : '-rotate-90'}`} 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="3" 
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              );
            })}
          </div>

          {/* Expanded Specific Options Box */}
          {expandedCategory && (
            <div className={`p-3 sm:p-4 rounded-xl border-2 animate-fadeIn ${isDark ? 'border-white/30 bg-white/5' : 'border-[#03045E]/15 bg-[#f4f4f4]'}`}>
              <p className={`text-[10px] font-black uppercase tracking-wider mb-2 sm:mb-3 ${pageText}`}>Specific Conditions under {expandedCategory}:</p>
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {disabilityCategories[expandedCategory].map(disability => {
                  const isSelected = selectedDisabilities.includes(disability);
                  return (
                    <button
                      type="button"
                      key={disability}
                      onClick={() => toggleSelection(disability, selectedDisabilities, setSelectedDisabilities)}
                      className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-[10px] sm:text-xs font-bold border-2 transition-colors ${
                        isSelected
                          ? (isDark ? 'bg-white text-black border-white' : 'bg-[#2C7FFF] text-white border-[#2C7FFF]')
                          : (isDark ? 'bg-black text-white border-white' : 'bg-white text-[#03045E] border-[#03045E]/20 hover:border-[#2C7FFF]')
                      }`}
                    >
                      {disability} {isSelected ? '✓' : '+'}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading || isDeactivated}
          className={`w-full py-3 sm:py-4 text-sm sm:text-base font-extrabold rounded-xl shadow-md transition-all mt-2 flex justify-center items-center gap-1.5 sm:gap-2 border-2 ${
            isDeactivated
              ? 'bg-gray-300 text-gray-500 border-gray-300 cursor-not-allowed opacity-70'
              : (isHighContrastOrDarkComfort
                ? 'bg-[#2C7FFF] !text-white border-[#2C7FFF] hover:bg-white hover:text-[#2C7FFF] cursor-pointer'
                : (isDark
                  ? 'bg-white text-black border-white hover:bg-black hover:text-white cursor-pointer'
                  : 'bg-[#03045E] text-white border-gray-200 hover:bg-[#2C7FFF] hover:border-[#2C7FFF] cursor-pointer'))
          }`}
        >
          {isDeactivated ? (
             <span className="flex items-center gap-2">
               <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>
               Account Deactivated
             </span>
          ) : isLoading ? (
             'Publishing Job...'
          ) : (
             <>
               Publish Job Posting
               <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
             </>
          )}
        </button>
      </form>
      )}

      {showSuccessAlert && (
        <div
          className="fixed inset-0 z-[9999999] flex items-center justify-center p-4 backdrop-blur-[1px] animate-in fade-in transition-all duration-300"
          style={{ backgroundColor: (isContrast || isDarkMode) ? 'rgba(0, 0, 0, 0.75)' : 'rgba(72, 71, 71, 0.6)', filter: 'none' }}
        >
          <div className={`relative w-full max-w-sm rounded-2xl border-2 overflow-hidden ${isDark ? 'bg-black border-white' : 'bg-[#F4F4F4] border-[#2C7FFF]'}`}>
            <div className={`h-2 w-full ${isDark ? 'bg-white' : 'bg-[#2C7FFF]'}`} />

            <div className="px-6 sm:px-8 pt-8 sm:pt-10 pb-6 sm:pb-8 flex flex-col items-center text-center">
              <div className="relative mb-4 sm:mb-6">
                <div className={`absolute inset-0 rounded-full animate-ping ${isDark ? 'bg-white/20' : 'bg-[#2C7FFF]/20'}`} />
                <div className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center ${isDark ? 'bg-white/20' : 'bg-[#2C7FFF]/15'}`}>
                  <div className={`w-10 h-10 sm:w-14 sm:h-14 rounded-full flex items-center justify-center ${isDark ? 'bg-white' : 'bg-[#2C7FFF]'}`}>
                    <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="none" stroke="#ffffff" strokeWidth="3" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
                <div className={`absolute -top-1 -right-1 w-5 h-5 sm:w-7 sm:h-7 rounded-full flex items-center justify-center border-2 ${isDark ? 'bg-white border-black' : 'bg-[#03045E] border-[#F4F4F4]'}`}>
                  <svg className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 text-white" fill="none" stroke="#ffffff" strokeWidth="3" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.196-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                </div>
              </div>

              <span className={`inline-block px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-widest mb-2 sm:mb-3 border-2 ${isDark ? 'text-white bg-black border-white' : 'text-[#03045E] bg-white border-[#2C7FFF]'}`}>
                Job Posted
              </span>

              <h2 className={`text-xl sm:text-2xl font-black tracking-tight mb-1.5 sm:mb-2 ${pageText}`}>
                Posting is Live!
              </h2>
              <p className={`text-xs sm:text-sm font-semibold leading-relaxed mb-4 sm:mb-5 max-w-xs ${muted}`}>
                <span className={`font-black ${isDark ? 'text-white' : 'text-[#2C7FFF]'}`}>"{publishedJobTitle}"</span> has been published successfully and is now visible to matching candidates.
              </p>

              {/* Inner Status Box */}
              <div className={`w-full rounded-xl p-3 sm:p-4 border-2 mb-4 sm:mb-6 ${isDark ? 'bg-black border-white' : 'bg-white border-[#2C7FFF]'}`}>
                <div className="flex items-center justify-between">
                  <span className={`text-[9px] sm:text-[10px] font-black uppercase tracking-wider ${isDark ? 'text-white/60' : 'text-[#03045E]/60'}`}>Status</span>
                  <span className={`text-[9px] sm:text-[10px] font-black uppercase tracking-wider ${isDark ? 'text-white' : 'text-[#2C7FFF]'}`}>Active</span>
                </div>
                <div className={`h-px my-2 sm:my-3 ${isDark ? 'bg-white/40' : 'bg-[#03045E]/15'}`}></div>
                <div className="flex items-center justify-between">
                  <span className={`text-[9px] sm:text-[10px] font-black uppercase tracking-wider ${isDark ? 'text-white/60' : 'text-[#03045E]/60'}`}>Posted</span>
                  <span className={`text-[9px] sm:text-[10px] font-black uppercase tracking-wider ${pageText}`}>
                    {new Date().toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 mb-3 sm:mb-4">
                <span className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full animate-bounce ${isDark ? 'bg-white' : 'bg-[#2C7FFF]'}`} />
                <span className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full animate-bounce ${isDark ? 'bg-white' : 'bg-[#2C7FFF]'}`} style={{ animationDelay: '150ms' }} />
                <span className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full animate-bounce ${isDark ? 'bg-white' : 'bg-[#2C7FFF]'}`} style={{ animationDelay: '300ms' }} />
              </div>

              <p className={`text-[10px] sm:text-xs font-bold ${isDark ? 'text-white/50' : 'text-[#03045E]/50'}`}>
                Redirecting you to dashboard...
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}