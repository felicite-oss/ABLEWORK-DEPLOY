import { useState, useEffect, useContext, useRef } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Circle, useMap, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { AccessibilityContext } from '../context/AccessibilityContext';
import { useColorPalette } from '../context/ColorPaletteContext';
import lightLogo from '../assets/LIGHT MODE.png';
import darkLogo from '../assets/DARK MODE.png';
import backgroundImg from '../assets/BG.png';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;
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

export default function ApplicantRegister() {
  const { mode } = useContext(AccessibilityContext);
  const { paletteKey, colors } = useColorPalette();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const isContrast = mode && typeof mode === 'string' && mode.toLowerCase().includes('contrast');
  const isDarkMode = mode && typeof mode === 'string' && mode.toLowerCase().includes('dark') && paletteKey !== 'darkComfort' && paletteKey !== 'highContrast';
  const isAccessibilityMode = paletteKey === 'highContrast' || paletteKey === 'darkComfort';
  const isAccessibilityDarkMode = isAccessibilityMode && mode && typeof mode === 'string' && mode.toLowerCase().includes('dark');
  const isDefaultDarkMode = isDarkMode && !isAccessibilityMode;
  const primaryColor = colors?.primary || '#2C7FFF';
  const secondaryColor = colors?.secondary || '#03045E';
  const [firstName, setFirstName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [birthdate, setBirthdate] = useState('');
  const [address, setAddress] = useState('');
  const [lat, setLat] = useState(null);
  const [lng, setLng] = useState(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const [radius, setRadius] = useState(10); 
  const [independence, setIndependence] = useState('');
  const [pwdFile, setPwdFile] = useState(null);
  const [resumeFile, setResumeFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });
  const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [agreedTerms, setAgreedTerms] = useState(false);
  const [agreedPrivacy, setAgreedPrivacy] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const typingTimer = useRef(null);

  const [satelliteView, setSatelliteView] = useState(false);
  const [legendOpen, setLegendOpen] = useState(true);
  const [mapExpanded, setMapExpanded] = useState(false);

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

  const toggleSelection = (item, selectedArray, setSelectedArray) => {
    if (selectedArray.includes(item)) {
      setSelectedArray(selectedArray.filter(i => i !== item));
    } else {
      setSelectedArray([...selectedArray, item]);
    }
  };

const availableDisabilities = [
    // Sensory: Vision
    'Blindness', 'Low Vision', 'Color Blindness',
    // Sensory: Hearing & Speech
    'Deafness', 'Hard of Hearing', 'Muteness', 'Speech Impairment', 
    // Sensory: Combinations
    'Deafblindness', 
    // Physical: Amputations
    'Upper Limb Amputation (Left)', 'Upper Limb Amputation (Right)', 'Upper Limb Amputation (Both)',
    'Lower Limb Amputation (Left)', 'Lower Limb Amputation (Right)', 'Lower Limb Amputation (Both)',
    // Physical: Polio
    'Polio (Upper Limbs)', 'Polio (Lower Limbs)', 'Polio (One Side)',
    // Physical: Motor & Neuromuscular
    'Paraplegia (Lower Body)', 'Hemiplegia (One Side)', 'Quadriplegia (All Limbs)', 
    'Cerebral Palsy', 'Limited Fine Motor Skills'
  ];

  const extendedDisabilities = [
    'Spinal Cord Injury', 'Muscular Dystrophy', 'Spina Bifida', 
    'Dwarfism', 'Scoliosis', 'Multiple Sclerosis', 'Chronic Pain'
  ];

  const [selectedDisabilities, setSelectedDisabilities] = useState([]);
  const [showOtherDisability, setShowOtherDisability] = useState(false);
  const [otherDisability, setOtherDisability] = useState('');

  const handleCustomDisabilityKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (otherDisability.trim() && !selectedDisabilities.includes(otherDisability.trim())) {
        setSelectedDisabilities([...selectedDisabilities, otherDisability.trim()]);
        setOtherDisability('');
      }
    }
  };

  const availableAccommodations = ['Screen Reader', 'Wheelchair Access', 'Sign Language Interpreter', 'Flexible Hours', 'Quiet Workspace', 'Travel Assistant'];
  
  const extendedAccommodations = [
    'Ergonomic Setup', 'Noise-Cancelling Headphones', 'Screen Magnifier', 'Braille Keyboard', 
    'Captioning Services', 'Remote Work', 'Frequent Breaks', 'Service Animal',
    'Adjustable Desk', 'Voice-to-Text Software', 'Large Print Documents', 'Step-Free Access',
   'Walking Assistant', 'Accessible Parking'
  ];
  const [selectedAccommodations, setSelectedAccommodations] = useState([]);
  const [showOtherAccommodation, setShowOtherAccommodation] = useState(false);
  const [otherAccommodation, setOtherAccommodation] = useState('');

const defaultAvailable = [
    'Data Entry', 
    'Customer Service', 
    'Virtual Assistance',
    'Graphic Design', 
    'Social Media Management', 
    'Massage Therapy'
  ];

  const defaultExtended = [
    // Tactile & Therapy (Often pursued by individuals with visual impairments) 
    'Reflexology', 
    'Wellness Therapy', 
    
    // Accessibility & Language
    'Braille Transcription', 
    'Sign Language Instruction', 
    'Translation', 
    
    // Auditory & Voice (Accessible for visual/mobility impairments)
    'Audio Transcription', 
    'Voice-Over Artistry', 
    'Telemarketing', 
    
    // Tech & Development (Highly accessible for hearing/mobility impairments)
    'Web Development', 
    'Software Programming', 
    'UI/UX Design', 
    'QA Testing', 
    'IT Helpdesk', 
    'Database Administration',
    
    // Creative & Digital (Accessible for hearing/mobility impairments)
    'Copywriting', 
    'Video Editing', 
    'Audio Editing', 
    'Visual Arts / Illustration', 
    
    // Administration & Business
    'Bookkeeping', 
    'Project Management', 
    'Scheduling', 
    'Inventory Management', 
    
    // Core Soft Skills
    'Communication', 
    'Problem Solving', 
    'Time Management', 
    'Teamwork'
  ];

  const [availableSkills, setAvailableSkills] = useState(defaultAvailable);
  const [extendedSkills, setExtendedSkills] = useState(defaultExtended);

  const [selectedSkills, setSelectedSkills] = useState([]);
  const [showOtherSkill, setShowOtherSkill] = useState(false);
  const [otherSkill, setOtherSkill] = useState('');

useEffect(() => {
    const fetchPopularSkills = async () => {
      try {
        const response = await fetch('http://localhost:5001/api/skills/popular');
        if (response.ok) {
          const popularSkills = await response.json();
          
          // 1. Lock in the default available skills so they ALWAYS show on screen
          setAvailableSkills(defaultAvailable);
          
          // 2. Combine the database popular skills with your extended list
          const combinedExtended = Array.from(new Set([...popularSkills, ...defaultExtended]));
          
          // 3. Filter out any duplicates that are already showing on screen
          const filteredExtended = combinedExtended.filter(skill => !defaultAvailable.includes(skill));
          
          // 4. Put the rest into the "Other" search dropdown
          setExtendedSkills(filteredExtended);
        }
      } catch (error) {
        console.error("Failed to fetch popular skills:", error);
      }
    };

    fetchPopularSkills();
  }, []); // Remember to keep this empty dependency array!

  const handleCustomSkillKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (otherSkill.trim() && !selectedSkills.includes(otherSkill.trim())) {
        setSelectedSkills([...selectedSkills, otherSkill.trim()]);
        setOtherSkill('');
      }
    }
  };

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser. Please type your address.");
      return;
    }
    setIsDetecting(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setLat(latitude);
        setLng(longitude);
        try {
          const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
          const data = await response.json();

          if (data && data.display_name) {
            setAddress(data.display_name);
          } else {
            setStatusMessage({ type: 'error', text: "Could not pinpoint exact address name. Please type it manually." });
          }
        } catch (error) {
          console.error("Error fetching address:", error);
          setStatusMessage({ type: 'error', text: "Network error fetching address name." });
        } finally {
          setIsDetecting(false);
        }
      },
      (error) => {
        console.error("Geolocation error:", error);
        setStatusMessage({ type: 'error', text: "Location access denied. Please type your address manually." });
        setIsDetecting(false);
      }
    );
  };

const handleAddressType = (e) => {
    const text = e.target.value;
    setAddress(text);

    if (text.length < 3) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }

    if (typingTimer.current) {
      clearTimeout(typingTimer.current);
    }

    typingTimer.current = setTimeout(async () => {
      try {
        const query = encodeURIComponent(text);
        const mapboxToken = import.meta.env.VITE_MAPBOX_API_KEY;
        const res = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${query}.json?country=ph&autocomplete=true&limit=5&access_token=${mapboxToken}`);
        const data = await res.json();
        
        if (data.features && data.features.length > 0) {
          setSuggestions(data.features);
          setShowDropdown(true);
        } else {
          setSuggestions([]);
          setShowDropdown(false);
        }
      } catch (error) {
        console.error("Error fetching Mapbox suggestions:", error);
      }
    }, 400); // Slightly faster 400ms delay since Mapbox can handle it
  };

  const handleSelectSuggestion = (place) => {
    // Mapbox provides a beautifully formatted string automatically
    setAddress(place.place_name); 
    
    // Mapbox returns coordinates as [longitude, latitude]
    if (place.center) {
      setLng(place.center[0]);
      setLat(place.center[1]);
    }
    
    setShowDropdown(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatusMessage({ type: '', text: '' });

    if (!agreedTerms || !agreedPrivacy) {
      setStatusMessage({ type: 'error', text: "You must agree to the Terms and Conditions and Privacy Policy to register." });
      return;
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
        if (!passwordRegex.test(password)) {
          setStatusMessage({ 
            type: 'error', 
            text: "Password must be at least 8 characters long and include an uppercase letter, a lowercase letter, a number, and a special character." 
          });
          return;
        }

    if (password !== confirmPassword) {
      setStatusMessage({ type: 'error', text: 'Passwords do not match. Please check and try again.' });
      return;
    }

    const birthYear = new Date(birthdate).getFullYear();
    const currentYear = new Date().getFullYear();
    if (currentYear - birthYear < 18) {
      setStatusMessage({ type: 'error', text: "You must be 18 years or older to register on AbleWork." });
      return;
    }
    if (!pwdFile) {
      setStatusMessage({ type: 'error', text: "Please upload your PWD ID or Certification." });
      return;
    }
    
    if (!resumeFile) {
      setStatusMessage({ type: 'error', text: "Please upload your Base Resume." });
      return;
    }

    if (pwdFile.size > 5 * 1024 * 1024) {
      setStatusMessage({ type: 'error', text: "File size exceeds the 5MB limit. Please upload a smaller file." });
      return;
    }

    setIsLoading(true);

    const formData = new FormData();
    formData.append('firstName', firstName);
    formData.append('middleName', middleName);
    formData.append('lastName', lastName);
    formData.append('email', email);
    formData.append('phone', phone);
    formData.append('password', password);
    formData.append('birthdate', birthdate);
    formData.append('address', address);
    formData.append('latitude', lat);
    formData.append('longitude', lng);
    formData.append('radius', radius);
    formData.append('independence', independence);
    formData.append('disabilities', JSON.stringify(selectedDisabilities));
    formData.append('accommodations', JSON.stringify(selectedAccommodations));
    formData.append('skills', JSON.stringify(selectedSkills));
    formData.append('pwdDocument', pwdFile);
    formData.append('resume', resumeFile);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    try {
      const response = await fetch('http://localhost:5001/api/auth/register/applicant', {
        method: 'POST',
        body: formData,
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      const data = await response.json();
      if (response.ok) {
        setShowSuccessModal(true);
        setTimeout(() => {
          setShowSuccessModal(false);
          navigate('/login');
        }, 3000);
      } else {
        setStatusMessage({ type: 'error', text: data.message || "Registration failed. Please try again." });
      }
    } catch (error) {
      clearTimeout(timeoutId);
      console.error("Server Error:", error);
      if (error.name === 'AbortError') {
        setStatusMessage({ type: 'error', text: "Request timed out. The server is taking too long to respond." });
      } else {
        setStatusMessage({ type: 'error', text: "Cannot connect to the server. Is your Express backend running?" });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main
      className={`h-[100dvh] flex flex-col ${isContrast ? 'bg-black text-white' : 'bg-[#f4f4f4] text-[#03045E]'} ${isAccessibilityMode ? '[&_svg]:!text-white [&_svg]:!stroke-white' : ''} overflow-hidden relative`}
      role="main"
      aria-label="Applicant Registration Screen"
    >

      <div
        className="fixed top-0 left-0 w-full h-[110vh] md:h-[105vh] bg-no-repeat bg-center bg-[size:600px_auto] md:bg-[size:1100px_auto] md:bg-left pointer-events-none z-0"
        style={{
          backgroundImage: `url(${backgroundImg})`,
        }}
        aria-hidden="true"
      />

      <div className="fixed inset-0 backdrop-blur-[2px] pointer-events-none z-0" aria-hidden="true" />

      <header role="banner" className={`w-full ${isContrast ? 'bg-black border-b-2 border-[#2C7FFF]' : 'bg-white border-b-2 border-[#03045E]/15'} fixed top-0 left-0 z-50 transition-all duration-300 shadow-sm`}>
  <div className="w-full h-14 sm:h-16 pl-3 pr-3 sm:pl-4 sm:pr-4 md:pr-8 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="flex items-center flex-shrink-0 py-1">
              <img
               src={(isAccessibilityMode || isDarkMode) ? darkLogo : lightLogo}
                alt="AbleWork logo"
                role="img"
                aria-label="AbleWork logo"
                tabIndex="0"
                className="h-9 sm:h-12 md:h-14 w-auto object-contain max-h-full"
              />
            </div>
<nav aria-label="Main navigation" className={`hidden md:flex items-center gap-6 text-[0.9375rem] font-medium ${isAccessibilityMode ? '!text-white' : (isContrast ? 'text-white' : 'text-[#03045E]')}`}>
              <Link to="/" aria-label="Home" className={`${isAccessibilityMode ? '!text-white hover:!text-white' : (isContrast ? 'hover:text-blue-400' : 'hover:text-[#03045e]')} transition`}>Home</Link>
              <Link to="/about" aria-label="About Us" className={`${isAccessibilityMode ? '!text-white hover:!text-white' : (isContrast ? 'hover:text-blue-400' : 'hover:text-[#03045e]')} transition`}>About Us</Link>
              <Link to="/policy" aria-label="Policy" className={`${isAccessibilityMode ? '!text-white hover:!text-white' : (isContrast ? 'hover:text-blue-400' : 'hover:text-[#03045e]')} transition`}>Policy</Link>
            </nav>
          </div>
          <div className="hidden md:flex items-center">
            <NavLink
              to="/login"
              aria-label="Log In"
              className={({ isActive }) => 
                `login-btn px-5 py-2 rounded-full bg-transparent ${isAccessibilityDarkMode || isDefaultDarkMode ? '!text-black' : isAccessibilityMode ? '!text-white' : 'text-[#03045E]'} text-sm font-bold border-2 transform duration-200 transition whitespace-nowrap ${
                  isAccessibilityDarkMode || isDefaultDarkMode
                    ? '!text-black !border-black hover:!bg-[#2C7FFF] hover:!text-white hover:!border-[#2C7FFF]'
                    : isContrast 
                      ? 'text-white border-white hover:bg-[#2C7FFF] hover:text-white hover:border-[#2C7FFF]' 
                      : 'text-[#03045E] border-[#03045E] hover:bg-[#2C7FFF] hover:text-[#f4f4f4] hover:border-[#2C7FFF]'
                } ${
                  isActive 
                    ? 'bg-[#2C7FFF] text-white border-[#2C7FFF] underline font-semibold' 
                    : ''
                }`
              }
            >
              Log In
            </NavLink>
          </div>
          <button
            type="button"
            aria-label="Menu"
            aria-expanded={isOpen}
            aria-controls="mobile-menu"
            className={`md:hidden flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-lg border-2 shadow-sm cursor-pointer transition-all duration-200 shrink-0 ${isContrast ? 'bg-zinc-900 text-white border-white/30' : 'bg-white text-[#03045E] border-[#03045E]/20'}`}
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? (
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        <div
          id="mobile-menu"
          className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out border-b-2 ${
            isContrast ? 'bg-black border-[#2C7FFF]' : 'bg-white border-[#03045E]/20'
          } ${
            isOpen ? 'max-h-[500px] opacity-100 shadow-xl' : 'max-h-0 opacity-0'
          }`}
          aria-hidden={!isOpen}
        >
          <div className={`w-full ${isContrast ? 'bg-black' : 'bg-white'}`}>
            <nav aria-label="Mobile navigation" className={`flex flex-col px-2.5 pt-2.5 pb-2.5 gap-2 sm:px-3 sm:pt-3 sm:pb-3 sm:gap-2.5 ${isContrast ? 'text-white' : 'text-[#03045E]'}`}>
              <Link to="/" aria-label="Home" onClick={() => setIsOpen(false)} className="relative flex items-center gap-2.5 text-left pl-3 pr-2.5 py-2.5 rounded-lg font-extrabold transition-all duration-300 cursor-pointer border-2 group overflow-hidden bg-white text-[#03045E] border-[#03045E]/25">
                <div aria-hidden="true" className="p-1.5 rounded-md transition-all duration-300 shrink-0 flex items-center justify-center border-2 bg-[#03045E] text-white border-[#03045E]">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                </div>
                <div aria-hidden="true" className="flex-1 min-w-0">
               <span className="text-[0.8125rem] tracking-wide font-black block leading-tight text-[#03045E] break-words">Home</span>
                </div>
                <svg aria-hidden="true" className="w-3 h-3 shrink-0 transition-transform duration-300 text-[#03045E]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </Link>

              <Link to="/about" aria-label="About Us" onClick={() => setIsOpen(false)} className="relative flex items-center gap-2.5 text-left pl-3 pr-2.5 py-2.5 rounded-lg font-extrabold transition-all duration-300 cursor-pointer border-2 group overflow-hidden bg-white text-[#03045E] border-[#03045E]/25">
                <div aria-hidden="true" className="p-1.5 rounded-md transition-all duration-300 shrink-0 flex items-center justify-center border-2 bg-[#03045E] text-white border-[#03045E]">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div aria-hidden="true" className="flex-1 min-w-0">
                 <span className="text-[0.8125rem] tracking-wide font-black block leading-tight text-[#03045E] break-words">About Us</span>
                </div>
                <svg aria-hidden="true" className="w-3 h-3 shrink-0 transition-transform duration-300 text-[#03045E]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </Link>

              <Link to="/policy" aria-label="Policy" onClick={() => setIsOpen(false)} className="relative flex items-center gap-2.5 text-left pl-3 pr-2.5 py-2.5 rounded-lg font-extrabold transition-all duration-300 cursor-pointer border-2 group overflow-hidden bg-white text-[#03045E] border-[#03045E]/25">
                <div aria-hidden="true" className="p-1.5 rounded-md transition-all duration-300 shrink-0 flex items-center justify-center border-2 bg-[#03045E] text-white border-[#03045E]">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div aria-hidden="true" className="flex-1 min-w-0">
                 <span className="text-[0.8125rem] tracking-wide font-black block leading-tight text-[#03045E] break-words">Policy</span>
                </div>
                <svg aria-hidden="true" className="w-3 h-3 shrink-0 transition-transform duration-300 text-[#03045E]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </Link>

              <div aria-hidden="true" className={`h-px my-0.5 ${isContrast ? 'bg-[#2C7FFF]/30' : 'bg-[#03045E]/15'}`}></div>

              <NavLink to="/login" aria-label="Log In" onClick={() => setIsOpen(false)} className={({ isActive }) => `relative flex items-center gap-2.5 text-left pl-3 pr-2.5 py-2.5 rounded-lg font-extrabold transition-all duration-300 cursor-pointer border-2 group overflow-hidden ${isActive ? 'bg-white text-[#03045E] border-[#03045E] shadow-md' : 'bg-white text-[#03045E] border-[#03045E]/25'}`}>
                {({ isActive }) => (
                  <>
                    {isActive && <span aria-hidden="true" className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#03045E]"></span>}
                    <div aria-hidden="true" className="p-1.5 rounded-md transition-all duration-300 shrink-0 flex items-center justify-center border-2 bg-[#03045E] text-white border-[#03045E]">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                      </svg>
                    </div>
                    <div aria-hidden="true" className="flex-1 min-w-0">
<span className="text-[0.8125rem] tracking-wide font-black block leading-tight text-[#03045E] break-words">Log In</span>
                    </div>
                    <svg aria-hidden="true" className="w-3 h-3 shrink-0 transition-transform duration-300 text-[#03045E]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </>
                )}
              </NavLink>
            </nav>
          </div>
        </div>
      </header>

<div
  className={`flex-1 min-h-0 pt-16 sm:pt-20 flex flex-col items-center justify-center p-3 sm:p-6 md:p-10 w-full box-border relative z-10 transition-all duration-300`}
  role="region"
  aria-label="Applicant registration area"
>

       <div className="w-full max-w-2xl max-h-[85vh] flex flex-col bg-white/95 backdrop-blur-md rounded-lg sm:rounded-xl shadow-2xl border border-[#03045E]/10 overflow-hidden relative z-50 animate-fadeIn md:mt-12 md:mr-4 lg:mr-8">

          <div className="flex-shrink-0 px-4 pt-5 pb-3 sm:px-6 sm:pt-6 sm:pb-4 border-b border-[#03045E]/10 bg-white/90">
            <div className="flex items-center gap-3">
              <Link
                to="/register-select"
                aria-label="Go back to role selection"
                className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-full bg-[#03045E]/10 text-[#03045E] shrink-0"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                </svg>
              </Link>
              <div>
                <h1 tabIndex="0" title="Job Seeker Registration" className="text-xl sm:text-3xl md:text-4xl font-bold text-[#03045E]">
                  Job Seeker Registration
                </h1>
                <p tabIndex="0" title="Build your accessible career profile" className="text-xs sm:text-sm text-[#03045E]/70 mt-0.5">
                  Build your accessible career profile
                </p>
              </div>
            </div>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto px-4 py-5 sm:px-6 sm:py-6 overscroll-contain [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">

            <form onSubmit={handleSubmit} className="flex flex-col gap-7" autoComplete="off">

              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="firstName" tabIndex="0" title="First Name" className="text-xs sm:text-sm font-semibold text-[#03045E] focus:outline-none">First Name <span className="text-[#03045E]">*</span></label>
                  <input 
                    id="firstName" 
                    type="text" 
                    value={firstName} 
                    onChange={(e) => setFirstName(e.target.value)} 
                    placeholder="Enter your First Name" 
                    required 
                    className="w-full p-3 border border-[#03045E]/20 rounded-lg bg-white text-[#03045E] focus:outline-none focus:border-[#2C7FFF] transition" 
                    title="Please enter your legal first name."
                    aria-label="First Name. Please enter your legal first name."
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="middleName" tabIndex="0" title="Middle Name (Optional)" className="text-xs sm:text-sm font-semibold text-[#03045E] focus:outline-none">Middle Name (Optional)</label>
                  <input 
                    id="middleName" 
                    type="text" 
                    value={middleName} 
                    onChange={(e) => setMiddleName(e.target.value)} 
                    placeholder="Enter your Middle Name" 
                    className="w-full p-3 border border-[#03045E]/20 rounded-lg bg-white text-[#03045E] focus:outline-none focus:border-[#2C7FFF] transition" 
                    title="Please enter your middle name if you have one. This is optional."
                    aria-label="Middle Name. Please enter your middle name if you have one. This is optional."
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="lastName" tabIndex="0" title="Last Name" className="text-xs sm:text-sm font-semibold text-[#03045E] focus:outline-none">Last Name <span className="text-[#03045E]">*</span></label>
                  <input 
                    id="lastName" 
                    type="text" 
                    value={lastName} 
                    onChange={(e) => setLastName(e.target.value)} 
                    placeholder="Enter your Last Name" 
                    required 
                    className="w-full p-3 border border-[#03045E]/20 rounded-lg bg-white text-[#03045E] focus:outline-none focus:border-[#2C7FFF] transition" 
                    title="Please enter your legal last name."
                    aria-label="Last Name. Please enter your legal last name."
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="phone" tabIndex="0" title="Phone Number" className="text-xs sm:text-sm font-semibold text-[#03045E] focus:outline-none">Phone Number <span className="text-[#03045E]">*</span></label>
                  <input 
                    id="phone" 
                    type="tel" 
                    value={phone} 
                    onChange={(e) => setPhone(e.target.value)} 
                    placeholder="Enter your Phone Number" 
                    required 
                    className="w-full p-3 border border-[#03045E]/20 rounded-lg bg-white text-[#03045E] focus:outline-none focus:border-[#2C7FFF] transition" 
                    title="Please enter your active contact phone number."
                    aria-label="Phone Number. Please enter your active contact phone number."
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="email" tabIndex="0" title="Email Address" className="text-xs sm:text-sm font-semibold text-[#03045E] focus:outline-none">Email Address <span className="text-[#03045E]">*</span></label>
                  <input 
                    id="email" 
                    type="email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    placeholder="Enter your Email Address" 
                    required 
                    className="w-full p-3 border border-[#03045E]/20 rounded-lg bg-white text-[#03045E] focus:outline-none focus:border-[#2C7FFF] transition" 
                    title="Please enter a valid email address for your account."
                    aria-label="Email Address. Please enter a valid email address for your account."
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="password" tabIndex="0" title="Password" className="text-xs sm:text-sm font-semibold text-[#03045E] focus:outline-none">Password <span className="text-[#03045E]">*</span></label>
                  <div className="relative">
                    <input 
                      id="password" 
                      type={showPassword ? 'text' : 'password'} 
                      value={password} 
                      onChange={(e) => setPassword(e.target.value)} 
                      placeholder="Enter your Password" 
                      required 
                      // Turns the border red instantly if they start typing and the format is wrong
                      className={`w-full p-3 pr-12 border rounded-lg bg-white text-[#03045E] focus:outline-none transition ${password.length > 0 && !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/.test(password) ? '!border-red-500 focus:!border-red-500' : 'border-[#03045E]/20 focus:border-[#2C7FFF]'}`} 
                      title="Please create a secure password with at least 8 characters."
                      aria-label="Password. Please create a secure password with at least 8 characters."
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className={`absolute right-3 top-1/2 -translate-y-1/2 transition cursor-pointer ${isAccessibilityMode ? '!text-white hover:!text-white' : 'text-[#03045E]/50 hover:text-[#2C7FFF]'}`}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? (
                        <svg className={`w-5 h-5 ${isAccessibilityMode ? '!text-white !stroke-white' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                        </svg>
                      ) : (
                        <svg className={`w-5 h-5 ${isAccessibilityMode ? '!text-white !stroke-white' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"></path>
                        </svg>
                      )}
                    </button>
                  </div>
                  {/* Real-time inline error message that disappears once the format is correct */}
                                 {password.length > 0 && !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/.test(password) && (
                    <p tabIndex="0" title="Must be 8+ chars and include an uppercase letter, lowercase letter, number, and special character." aria-label="Must be 8+ chars and include an uppercase letter, lowercase letter, number, and special character." className={`text-xs font-semibold mt-1 ${isDarkMode || isAccessibilityMode ? '!text-red-500' : 'text-red-500'}`} aria-live="polite">
                      Must be 8+ chars and include an uppercase letter, lowercase letter, number, and special character.
                    </p>
                  )}
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="confirmPassword" tabIndex="0" title="Confirm Password" className="text-xs sm:text-sm font-semibold text-[#03045E] focus:outline-none">Confirm Password <span className="text-[#03045E]">*</span></label>
                  <div className="relative">
                    <input 
                      id="confirmPassword" 
                      type={showConfirmPassword ? 'text' : 'password'} 
                      value={confirmPassword} 
                      onChange={(e) => setConfirmPassword(e.target.value)} 
                      placeholder="Confirm your Password" 
                      required 
                      className={`w-full p-3 pr-12 border rounded-lg bg-white text-[#03045E] focus:outline-none transition ${confirmPassword.length > 0 && password !== confirmPassword ? '!border-red-500 focus:!border-red-500' : 'border-[#03045E]/20 focus:border-[#2C7FFF]'}`} 
                      title="Please re-enter your password to confirm it matches."
                      aria-label="Confirm Password. Please re-enter your password to confirm it matches."
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className={`absolute right-3 top-1/2 -translate-y-1/2 transition cursor-pointer ${isAccessibilityMode ? '!text-white hover:!text-white' : 'text-[#03045E]/50 hover:text-[#2C7FFF]'}`}
                      aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                    >
                      {showConfirmPassword ? (
                        <svg className={`w-5 h-5 ${isAccessibilityMode ? '!text-white !stroke-white' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                        </svg>
                      ) : (
                        <svg className={`w-5 h-5 ${isAccessibilityMode ? '!text-white !stroke-white' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"></path>
                        </svg>
                      )}
                    </button>
                  </div>
                  {/* Real-time inline error message for mismatched passwords */}
                                  {confirmPassword.length > 0 && password !== confirmPassword && (
                    <p tabIndex="0" role="alert" aria-label="Passwords do not match." title="Passwords do not match." className={`text-xs font-semibold mt-1 ${isDarkMode || isAccessibilityMode ? '!text-red-500' : 'text-red-500'}`} aria-live="polite">
                      Passwords do not match.
                    </p>
                  )}
                </div>
                
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="birthdate" tabIndex="0" title="Birthdate (Must be 18+)" className="text-xs sm:text-sm font-semibold text-[#03045E] focus:outline-none">Birthdate (Must be 18+) <span className="text-[#03045E]">*</span></label>
                  <div className="relative">
                    <input 
                      id="birthdate" 
                      type="date" 
                      value={birthdate} 
                      onChange={(e) => setBirthdate(e.target.value)} 
                      placeholder="Enter your Birthdate" 
                      required 
                      className="w-full p-3 pr-12 border border-[#03045E]/20 rounded-lg bg-white text-[#03045E] focus:outline-none focus:border-[#2C7FFF] transition [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-0 [&::-webkit-calendar-picker-indicator]:w-12 [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer" 
                      title="Please select your date of birth. You must be at least 18 years old to register."
                      aria-label="Birthdate. Please select your date of birth. You must be at least 18 years old to register."
                    />
                                                   <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <span role="img" aria-label="Calendar icon for selecting birthdate" tabIndex="0" className="peer pointer-events-none block text-[#03045E] focus:text-[#03045e] focus:outline-none focus:ring-2 focus:ring-[#2C7FFF] rounded cursor-default">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                          <line x1="16" y1="2" x2="16" y2="6" />
                          <line x1="8" y1="2" x2="8" y2="6" />
                          <line x1="3" y1="10" x2="21" y2="10" />
                          <circle cx="8" cy="14" r="0.5" fill="currentColor" />
                          <circle cx="12" cy="14" r="0.5" fill="currentColor" />
                          <circle cx="16" cy="14" r="0.5" fill="currentColor" />
                          <circle cx="8" cy="18" r="0.5" fill="currentColor" />
                          <circle cx="12" cy="18" r="0.5" fill="currentColor" />
                          <circle cx="16" cy="18" r="0.5" fill="currentColor" />
                        </svg>
                      </span>
                      <span className="pointer-events-none absolute right-full mr-2 top-1/2 -translate-y-1/2 whitespace-nowrap rounded bg-[#03045E] px-2 py-1 text-[10px] font-semibold text-white opacity-0 transition-opacity peer-focus:opacity-100">
                        Select your birthdate
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <hr aria-hidden="true" className="border-[#03045E]/10" />

              <div className="flex flex-col gap-3 p-5 border border-[#2C7FFF]/30 rounded-lg bg-[var(--color-accentSoft)]">
                <label htmlFor="address" tabIndex="0" title="Residential Address" className="text-lg sm:text-xl font-bold text-[#03045E] focus:outline-none">Residential Address <span className="text-[#03045E]">*</span></label>
                <button 
                  type="button" 
                  onClick={handleDetectLocation} 
                  disabled={isDetecting} 
                  className={`inline-flex items-center justify-center gap-2 bg-[#2C7FFF] ${isAccessibilityDarkMode ? '!text-black' : isAccessibilityMode ? '!text-white' : isDarkMode ? '!text-black' : 'text-white'} px-5 py-2.5 rounded-md text-sm font-semibold shadow-md transition ${isAccessibilityMode || isContrast || isDarkMode ? '' : 'hover:bg-[#03045E]'}`}
                  title="Click to automatically detect and fill your current location."
                  aria-label="Detect My Location. Click to automatically detect and fill your current location."
                >
                  <svg aria-hidden="true" className={`detect-pin-icon w-5 h-5 shrink-0 ${isAccessibilityDarkMode ? '!text-black' : isAccessibilityMode ? '!text-white' : isDarkMode ? '!text-black' : 'text-white'}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className={`${isAccessibilityDarkMode ? '!text-black' : isAccessibilityMode ? '!text-white' : isDarkMode ? '!text-black' : 'text-white'}`}>{isDetecting ? 'Detecting Location...' : 'Detect My Location'}</span>
                </button>

              
                <div className="relative flex flex-col gap-1.5 w-full">
                  <div className="relative w-full mt-2">
                    <input
                      id="address"
                      type="text"
                      value={address}
                      onChange={handleAddressType}
                      placeholder="Enter your Address (e.g. Bacolod City)"
                      required
                      aria-label="Address autocomplete"
                      aria-autocomplete="list"
                      aria-controls="address-suggestions"
                      aria-expanded={showDropdown && suggestions.length > 0}
                      role="combobox"
                      className="w-full p-3 border border-[#03045E]/20 rounded-lg bg-white text-[#03045E] focus:outline-none focus:border-[#2C7FFF] transition"
                    />

                    {showDropdown && suggestions.length > 0 && (
                      <ul
                        id="address-suggestions"
                        role="listbox"
                        aria-label="Address suggestions list"
                        className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto"
                      >
                        {suggestions.map((place, index) => (
                          <li
                            key={index}
                            role="option"
                            aria-selected="false"
                            tabIndex="0"
                            title={place.place_name}
                            aria-label={place.place_name}
                            onClick={() => handleSelectSuggestion(place)}
                            className="p-3 cursor-pointer hover:bg-gray-100 text-[#03045E] text-sm border-b last:border-b-0"
                          >
                            {place.place_name}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>

                <div className="mt-4 flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <label htmlFor="radius" tabIndex="0" title="Max Travel Radius:" className="text-xs sm:text-sm font-semibold text-[#03045E] focus:outline-none">
                      Max Travel Radius:
                    </label>
                   <span tabIndex="0" title="10 km" className={`font-black text-base sm:text-lg px-3 py-1 rounded-lg border shadow-sm ${isAccessibilityMode ? '!text-white !bg-transparent !border-white' : 'text-[#03045E] bg-transparent border-[#03045E]'}`}>{radius} km</span>
                  </div>
                  <input 
                    id="radius" 
                    type="range" 
                    min="1" 
                    max="50" 
                    value={radius} 
                    onChange={(e) => setRadius(Number(e.target.value))} 
                    className="w-full h-2 accent-[#2C7FFF] cursor-pointer" 
                    title="Adjust the slider to set your maximum travel distance for work in kilometers."
                    aria-label="Maximum travel radius slider. Adjust the slider to set your maximum travel distance for work in kilometers."
                  />
                  <p tabIndex="0" title="Jobs beyond this distance will be filtered out automatically." className="text-xs text-[#03045E] focus:outline-none">Jobs beyond this distance will be filtered out automatically.</p>
                </div>

                {lat && lng ? (
                  <div 
                    role="region"
                    aria-label={`Interactive map showing your home location and a ${radius} kilometer travel radius.`}
                    className={mapExpanded
                      ? "fixed inset-0 z-[9999] bg-white rounded-none border-0 mt-0"
                      : "h-48 sm:h-64 w-full mt-4 rounded-md overflow-hidden border border-[#03045E]/20 z-0 relative shadow-inner"
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
                                <span aria-hidden="true" className="w-3 h-3 rounded-full bg-[#03045E] border-2 border-white shadow-sm shrink-0"></span>
                                <span className="flex-1 text-[11px] font-bold text-[#03045E] leading-tight">Your Home Base</span>
                              </div>
                              <div className="flex items-center gap-2.5">
                                <span aria-hidden="true" className="w-3 h-3 rounded-full border-2 border-dashed border-[#03045E]/70 shrink-0"></span>
                                <span className="flex-1 text-[11px] font-bold text-[#03045E] leading-tight">Search Radius</span>
                                <span aria-hidden="true" className="text-[10px] font-black text-[#03045E]/70 bg-[#f4f4f4] border border-[#03045E]/15 px-1.5 py-0.5 rounded-full">
                                  {radius} km
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <MapContainer center={[lat, lng]} zoom={11} scrollWheelZoom={true} style={{ height: '100%', width: '100%', zIndex: 0 }}>
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
                      <Marker position={[lat, lng]}>
                        <Popup>
                          <div className="p-0 min-w-[220px] rounded-xl overflow-hidden bg-white shadow-xl">
                            <div aria-hidden="true" className="h-1.5 w-full bg-[#03045E]"></div>
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
                                Jobs within {radius} km of this address are shown on the map.
                              </p>
                            </div>
                          </div>
                        </Popup>
                      </Marker>
                      <Circle center={[lat, lng]} radius={radius * 1000} pathOptions={{ color: '#2C7FFF', fillColor: '#2C7FFF', fillOpacity: 0.2, weight: 2 }} />
                      <MapRecenter lat={lat} lng={lng} />
                      <MapInvalidator trigger={mapExpanded} />
                    </MapContainer>
                  </div>
                ) : (
                  <div className={`h-36 sm:h-40 w-full mt-4 rounded-md border-2 border-dashed ${isAccessibilityDarkMode ? 'border-[#03045E]/20 bg-white/50 text-black' : 'border-[#03045E]/20 bg-white/50 text-[#03045E]/50'} flex flex-col items-center justify-center`}>
                    <svg aria-hidden="true" className={`w-8 h-8 mb-2 ${isAccessibilityDarkMode ? 'text-black' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                    <span tabIndex="0" title="Click 'Detect My Location' to view your travel zone." className={`text-xs sm:text-sm font-semibold focus:outline-none ${isAccessibilityDarkMode ? 'text-black' : ''}`}>Click 'Detect My Location' to view your travel zone.</span>
                  </div>
                )}
              </div>

              <hr aria-hidden="true" className="border-[#03045E]/10" />

              <fieldset className="flex flex-col gap-3">
                <legend tabIndex="0" title="Physical &amp; Sensory Profile (Work-Enabled)" className="text-xs sm:text-sm font-bold text-[#03045E] focus:outline-none">Physical &amp; Sensory Profile (Work-Enabled) <span className="text-[#03045E]">*</span></legend>
                <p tabIndex="0" title="Select applicable physical or sensory categories for tailored job accommodation matching." className="text-[11px] sm:text-xs text-[#03045E] focus:outline-none">Select applicable physical or sensory categories for tailored job accommodation matching.</p>

                {selectedDisabilities.length > 0 && (
                  <div className="flex flex-wrap gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <span className="w-full text-xs font-bold text-gray-500 uppercase tracking-wider">Selected Profile:</span>
                    {selectedDisabilities.map(disability => (
                      <span key={disability} className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#03045E]/15 text-[#03045E] text-[10px] sm:text-xs font-bold rounded-md shadow-sm border border-[#03045E]/30">
                        {disability}
                        <button 
                          type="button" 
                          onClick={() => setSelectedDisabilities(selectedDisabilities.filter(d => d !== disability))}
                          className="hover:text-red-500 font-bold ml-0.5"
                          title={`Remove ${disability}`}
                          aria-label={`Remove ${disability} from selected profile`}
                        >
                          ✕
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex flex-wrap gap-2">
                  {availableDisabilities.map((disability) => (
                    <button
                      type="button"
                      key={disability}
                      onClick={() => toggleSelection(disability, selectedDisabilities, setSelectedDisabilities)}
                      className={`px-3 py-1.5 sm:px-3.5 sm:py-1.5 rounded-lg text-[10px] sm:text-xs font-semibold border transition ${
                        selectedDisabilities.includes(disability)
                          ? 'bg-[#03045E] text-white border-[#03045E]'
                          : 'bg-white text-[#03045E] border-[#03045E]/30 hover:border-[#2C7FFF]'
                      }`}
                      title={`Click to select or deselect ${disability}`}
                      aria-label={`Select ${disability} as a physical or sensory condition`}
                      aria-pressed={selectedDisabilities.includes(disability)}
                    >
                      {disability} {selectedDisabilities.includes(disability) ? '✓' : '+'}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setShowOtherDisability(!showOtherDisability)}
                    className={`px-3 py-1.5 sm:px-3.5 sm:py-1.5 rounded-lg text-[10px] sm:text-xs font-semibold border transition ${
                      showOtherDisability
                        ? 'bg-[#03045E] text-white border-[#03045E]'
                        : 'bg-white text-[#03045E] border-[#03045E]/30 hover:border-[#2C7FFF]'
                    }`}
                    title="Click to type an unlisted physical or sensory condition"
                    aria-label="Add other physical or sensory condition"
                    aria-expanded={showOtherDisability}
                  >
                    Other {showOtherDisability ? '✓' : '+'}
                  </button>
                </div>

                {showOtherDisability && (
                  <div className="flex flex-col gap-2 mt-1">
                    <input
                      type="text"
                      value={otherDisability}
                      onChange={(e) => setOtherDisability(e.target.value)}
                      onKeyDown={handleCustomDisabilityKeyDown}
                      placeholder="Type custom condition and press Enter (or pick below)..."
                      className="w-full p-3 border border-[#03045E]/20 rounded-lg bg-white text-[#03045E]"
                      title="Type a custom physical or sensory condition and press Enter."
                      aria-label="Custom condition input. Type a custom physical or sensory condition and press Enter to add it."
                    />
                    {otherDisability.length > 0 && (
                      <div className="flex flex-wrap gap-2 animate-fadeIn">
                        {extendedDisabilities
                          .filter(d => d.toLowerCase().includes(otherDisability.toLowerCase()) && !selectedDisabilities.includes(d))
                          .slice(0, 6)
                          .map(suggestion => (
                            <button
                              key={suggestion}
                              type="button"
                              onClick={() => {
                                toggleSelection(suggestion, selectedDisabilities, setSelectedDisabilities);
                                setOtherDisability(''); 
                              }}
                              className={`suggestion-btn px-3 py-1.5 bg-[#2C7FFF]/10 ${isDarkMode ? 'text-white' : 'text-[#03045E]'} text-[10px] sm:text-xs font-bold rounded-md border border-[#2C7FFF]/20`}
                              title={`Click to add ${suggestion}`}
                              aria-label={`Add suggested condition ${suggestion}`}
                            >
                              + {suggestion}
                            </button>
                          ))}
                      </div>
                    )}
                  </div>
                )}
              </fieldset>

              <fieldset className="flex flex-col gap-3">
                <legend tabIndex="0" title="Workplace Independence" className="text-xs sm:text-sm font-bold text-[#03045E] focus:outline-none">Workplace Independence <span className="text-[#03045E]">*</span></legend>
                <div className="flex flex-wrap gap-2">
                  {['Independent', 'Requires Assistance'].map((option) => (
                    <button
                      type="button"
                      key={option}
                      onClick={() => setIndependence(option)}
                      className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-[10px] sm:text-xs font-semibold border transition ${
                        independence === option
                          ? 'bg-[#03045E] text-white border-[#03045E]'
                          : 'bg-white text-[#03045E] border-[#03045E]/30 hover:border-[#2C7FFF]'
                      }`}
                      title={`Select if your workplace independence level is ${option}`}
                      aria-label={`Select workplace independence level: ${option}`}
                      aria-pressed={independence === option}
                    >
                      {option} {independence === option ? '✓' : ''}
                    </button>
                  ))}
                </div>
              </fieldset>

              <fieldset className="flex flex-col gap-3">
                <legend tabIndex="0" title="Accommodations (Optional)" className="text-xs sm:text-sm font-bold text-[#03045E] focus:outline-none"> Accommodations <span className="text-[#03045E] font-normal ml-1">(Optional)</span></legend>
                <div className="flex flex-wrap gap-2">
                  {availableAccommodations.map((acc) => (
                    <button
                      type="button"
                      key={acc}
                      onClick={() => toggleSelection(acc, selectedAccommodations, setSelectedAccommodations)}
                      className={`px-3 py-1.5 sm:px-3.5 sm:py-1.5 rounded-lg text-[10px] sm:text-xs font-semibold border transition ${
                        selectedAccommodations.includes(acc)
                          ? 'bg-[#03045E] text-white border-[#03045E]'
                          : 'bg-white text-[#03045E] border-[#03045E]/30 hover:border-[#2C7FFF]'
                      }`}
                      title={`Click to select or deselect ${acc}`}
                      aria-label={`Select ${acc} as a required workplace accommodation`}
                      aria-pressed={selectedAccommodations.includes(acc)}
                    >
                      {acc} {selectedAccommodations.includes(acc) ? '✓' : '+'}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setShowOtherAccommodation(!showOtherAccommodation)}
                    className={`px-3 py-1.5 sm:px-3.5 sm:py-1.5 rounded-lg text-[10px] sm:text-xs font-semibold border transition ${
                      showOtherAccommodation
                        ? 'bg-[#03045E] text-white border-[#03045E]'
                        : 'bg-white text-[#03045E] border-[#03045E]/30 hover:border-[#2C7FFF]'
                    }`}
                    title="Click to type an unlisted workplace accommodation"
                    aria-label="Add other workplace accommodation"
                    aria-expanded={showOtherAccommodation}
                  >
                    Other {showOtherAccommodation ? '✓' : '+'}
                  </button>
                </div>

                {showOtherAccommodation && (
                  <div className="flex flex-col gap-2 mt-1">
                    <input
                      type="text"
                      value={otherAccommodation}
                      onChange={(e) => setOtherAccommodation(e.target.value)}
                      placeholder="Type custom accommodation and press Enter..."
                      className="w-full p-3 border border-[#03045E]/20 rounded-lg bg-white text-[#03045E]"
                      title="Type a custom workplace accommodation and press Enter."
                      aria-label="Custom accommodation input. Type a custom workplace accommodation and press Enter to add it."
                    />
                    {otherAccommodation.length > 0 && (
                      <div className="flex flex-wrap gap-2 animate-fadeIn">
                        {extendedAccommodations
                          .filter(a => a.toLowerCase().includes(otherAccommodation.toLowerCase()) && !selectedAccommodations.includes(a))
                          .slice(0, 6)
                          .map(suggestion => (
                            <button
                              key={suggestion}
                              type="button"
                              onClick={() => {
                                toggleSelection(suggestion, selectedAccommodations, setSelectedAccommodations);
                                setOtherAccommodation(''); 
                              }}
                              className={`suggestion-btn px-3 py-1.5 bg-[#2C7FFF]/10 ${isDarkMode ? 'text-white' : 'text-[#03045E]'} text-[10px] sm:text-xs font-bold rounded-md border border-[#2C7FFF]/20`}
                              title={`Click to add ${suggestion}`}
                              aria-label={`Add suggested accommodation ${suggestion}`}
                            >
                              + {suggestion}
                            </button>
                          ))}
                      </div>
                    )}
                  </div>
                )}
              </fieldset>

              <fieldset className="flex flex-col gap-3">
                <legend tabIndex="0" title="Your Skills" className="text-xs sm:text-sm font-bold text-[#03045E] focus:outline-none">Your Skills <span className="text-[#03045E]">*</span></legend>

                {selectedSkills.length > 0 && (
                  <div className="flex flex-wrap gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <span className="w-full text-xs font-bold text-gray-500 uppercase tracking-wider">Selected Skills:</span>
                    {selectedSkills.map(skill => (
                      <span key={skill} className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#03045E]/15 text-[#03045E] text-[10px] sm:text-xs font-bold rounded-md shadow-sm border border-[#03045E]/30">
                        {skill}
                        <button 
                          type="button" 
                          onClick={() => setSelectedSkills(selectedSkills.filter(s => s !== skill))}
                          className="hover:text-red-500 font-bold ml-0.5"
                          title={`Remove ${skill}`}
                          aria-label={`Remove ${skill} from selected skills`}
                        >
                          ✕
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex flex-wrap gap-2">
                  {availableSkills.map((skill) => (
                    <button
                      type="button"
                      key={skill}
                      onClick={() => toggleSelection(skill, selectedSkills, setSelectedSkills)}
                      className={`px-3 py-1.5 sm:px-3.5 sm:py-1.5 rounded-lg text-[10px] sm:text-xs font-semibold border transition ${
                        selectedSkills.includes(skill)
                          ? 'bg-[#03045E] text-white border-[#03045E]'
                          : 'bg-white text-[#03045E] border-[#03045E]/30 hover:border-[#2C7FFF]'
                      }`}
                      title={`Click to select or deselect ${skill}`}
                      aria-label={`Select ${skill} as a professional skill`}
                      aria-pressed={selectedSkills.includes(skill)}
                    >
                      {skill} {selectedSkills.includes(skill) ? '✓' : '+'}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setShowOtherSkill(!showOtherSkill)}
                    className={`px-3 py-1.5 sm:px-3.5 sm:py-1.5 rounded-lg text-[10px] sm:text-xs font-semibold border transition ${
                      showOtherSkill
                        ? 'bg-[#03045E] text-white border-[#03045E]'
                        : 'bg-white text-[#03045E] border-[#03045E]/30 hover:border-[#2C7FFF]'
                    }`}
                    title="Click to type an unlisted professional skill"
                    aria-label="Add other professional skill"
                    aria-expanded={showOtherSkill}
                  >
                    Other {showOtherSkill ? '✓' : '+'}
                  </button>
                </div>

                {showOtherSkill && (
                  <div className="flex flex-col gap-2 mt-1">
                    <input
                      type="text"
                      value={otherSkill}
                      onChange={(e) => setOtherSkill(e.target.value)}
                      onKeyDown={handleCustomSkillKeyDown}
                      placeholder="Type custom skill and press Enter (or pick below)..."
                      className="w-full p-3 border border-[#03045E]/20 rounded-lg bg-white text-[#03045E]"
                      title="Type a custom professional skill and press Enter."
                      aria-label="Custom skill input. Type a custom professional skill and press Enter to add it."
                    />
                    {otherSkill.length > 0 && (
                      <div className="flex flex-wrap gap-2 animate-fadeIn">
                        {extendedSkills
                          .filter(s => s.toLowerCase().includes(otherSkill.toLowerCase()) && !selectedSkills.includes(s))
                          .slice(0, 6)
                          .map(suggestion => (
                            <button
                              key={suggestion}
                              type="button"
                              onClick={() => {
                                toggleSelection(suggestion, selectedSkills, setSelectedSkills);
                                setOtherSkill(''); 
                              }}
                              className={`suggestion-btn px-3 py-1.5 bg-[#2C7FFF]/10 ${isDarkMode ? 'text-white' : 'text-[#03045E]'} text-[10px] sm:text-xs font-bold rounded-md border border-[#2C7FFF]/20`}
                              title={`Click to add ${suggestion}`}
                              aria-label={`Add suggested skill ${suggestion}`}
                            >
                              + {suggestion}
                            </button>
                          ))}
                      </div>
                    )}
                  </div>
                )}
              </fieldset>

              <hr aria-hidden="true" className="border-[#03045E]/10" />

              <div className="flex flex-col sm:flex-row gap-4 w-full">
                <div className="flex-1 p-4 rounded-md border-2 border-dashed border-[#03045E]/20 bg-[#f4f4f4]/50 min-w-0">
                  <label htmlFor="pwdId" tabIndex="0" title="Upload PWD ID" className="block text-xs sm:text-sm font-bold text-[#03045E] mb-1 focus:outline-none">Upload PWD ID <span className="text-red-500">*</span></label>
                  <input
                    id="pwdId"
                    type="file"
                    accept=".jpg,.jpeg,.png"
                    onChange={(e) => setPwdFile(e.target.files[0])}
                    className={`w-full text-xs sm:text-sm ${isAccessibilityMode || isContrast || isDarkMode ? 'text-black' : 'text-[#03045E]'} file:mr-2 file:py-1.5 file:px-3 file:rounded-md file:border-2 file:border-[var(--color-border)] file:bg-white file:text-xs file:font-bold cursor-pointer`}
                    style={{ color: primaryColor }}
                    required
                    title="Please upload a clear image of your PWD ID."
                    aria-label="PWD ID document upload."
                  />
                  <p tabIndex="0" className="text-[10px] text-[#03045E]/70 mt-2 font-semibold focus:outline-none">
                    Supported: .jpg, .jpeg, .png (Max: 5MB)
                  </p>
                </div>

                <div className="flex-1 p-4 rounded-md border-2 border-dashed border-[#03045E]/20 bg-[#f4f4f4]/50 min-w-0">
                  <label htmlFor="resumeFile" tabIndex="0" title="Upload Resume" className="block text-xs sm:text-sm font-bold text-[#03045E] mb-1 focus:outline-none">Base Resume <span className="text-red-500">*</span></label>
                  <input
                    id="resumeFile"
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => setResumeFile(e.target.files[0])}
                    className={`w-full text-xs sm:text-sm ${isAccessibilityMode || isContrast || isDarkMode ? 'text-black' : 'text-[#03045E]'} file:mr-2 file:py-1.5 file:px-3 file:rounded-md file:border-2 file:border-[var(--color-border)] file:bg-white file:text-xs file:font-bold cursor-pointer`}
                    style={{ color: primaryColor }}
                    required
                    title="Please upload your Base Resume."
                    aria-label="Resume document upload."
                  />
                  <p tabIndex="0" className="text-[10px] text-[#03045E]/70 mt-2 font-semibold focus:outline-none">
                    Supported: .pdf, .docx
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-3 mt-2 mb-2">
                <label className="flex items-start gap-3 cursor-pointer select-none">
                  <input 
                    type="checkbox" 
                    checked={agreedTerms} 
                    onChange={(e) => setAgreedTerms(e.target.checked)}
                    className="mt-0.5 w-4 h-4 accent-[#2C7FFF] rounded cursor-pointer shrink-0"
                    required 
                    title="Check this box to agree to the Terms and Conditions."
                    aria-label="Terms and Conditions agreement checkbox. Check to agree."
                  />
                  <span tabIndex="0" title="I have read and agree to the ABLEWORK Terms and Conditions." className="text-[10px] sm:text-xs font-bold text-[#03045E] leading-tight focus:outline-none">
                    I have read and agree to the <Link to="/terms" target="_blank" className="text-[#2C7FFF] underline hover:text-[#03045E]" aria-label="Open ABLEWORK Terms and Conditions in a new tab">ABLEWORK Terms and Conditions</Link>.
                  </span>
                </label>

                <label className="flex items-start gap-3 cursor-pointer select-none">
                  <input 
                    type="checkbox" 
                    checked={agreedPrivacy} 
                    onChange={(e) => setAgreedPrivacy(e.target.checked)}
                    className="mt-0.5 w-4 h-4 accent-[#2C7FFF] rounded cursor-pointer shrink-0"
                    required 
                    title="Check this box to agree to the Privacy Policy."
                    aria-label="Privacy Policy agreement checkbox. Check to agree."
                  />
                  <span tabIndex="0" title="I have read and understood the ABLEWORK Privacy Policy and consent to the collection and processing of my personal information for employment assistance purposes." className="text-[10px] sm:text-xs font-bold text-[#03045E] leading-tight focus:outline-none">
                    I have read and understood the <Link to="/policy" target="_blank" className="text-[#2C7FFF] underline hover:text-[#03045E]" aria-label="Open ABLEWORK Privacy Policy in a new tab">ABLEWORK Privacy Policy</Link> and consent to the collection and processing of my personal information for employment assistance purposes.
                  </span>
                </label>
              </div>

              {statusMessage.text && (
                <div
                  role="alert"
                  aria-live="assertive"
                  className={`p-4 rounded-md font-bold text-center border-2 ${
                    statusMessage.type === 'success'
                      ? 'bg-green-100 text-green-800 border-green-400'
                      : isDarkMode || isAccessibilityMode
                        ? 'bg-black !text-red-500 !border-red-500'
                        : 'bg-white text-red-600 border-red-600'
                  }`}
                >
                  {statusMessage.text}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className={`submit-register-btn mt-1 py-3 sm:py-3.5 bg-[#03045E] hover:bg-[#2C7FFF] ${isAccessibilityDarkMode ? '!text-black' : isAccessibilityMode ? '!text-white' : isDarkMode ? '!text-black' : 'text-white'} text-sm sm:text-base font-semibold rounded-lg shadow-md transition disabled:opacity-50`}
                title="Submit your registration"
                aria-label="Complete Registration button. Click to submit your profile."
              >
                {isLoading ? 'Submitting...' : 'Complete Registration'}
              </button>
            </form>

            <p className={`mt-6 text-center text-xs sm:text-sm ${isAccessibilityMode ? '!text-white' : 'text-[#03045E]/80'}`}>
              <Link to="/register-select" className={`font-bold ${isAccessibilityMode ? '!text-white hover:!text-white underline' : 'text-[#2C7FFF] hover:underline'}`} aria-label="Go back to role selection screen">
                ← Back to Role Selection
              </Link>
            </p>
          </div>
        </div>
      </div>

      {showSuccessModal && (
        <div
          className="fixed inset-0 z-[9999999] flex items-center justify-center p-4 backdrop-blur-[1px] animate-in fade-in transition-all duration-300"
          style={{ backgroundColor: (isContrast || isDarkMode) ? 'rgba(0, 0, 0, 0.75)' : 'rgba(72, 71, 71, 0.6)', filter: 'none' }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="success-title"
          aria-describedby="success-desc"
          aria-live="assertive"
          tabIndex="-1"
        >
          <div className={`relative w-full max-w-md rounded-lg sm:rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 ${(isContrast || isDarkMode) ? 'bg-black border-2 border-white' : 'bg-white border-2 border-[#2C7FFF]'}`}>
            <div aria-hidden="true" className="h-2 w-full bg-[#2C7FFF]" />

            <div className="relative px-5 pt-8 pb-6 sm:px-8 sm:pt-10 sm:pb-8 flex flex-col items-center text-center">
              <div aria-hidden="true" className="relative mb-4 sm:mb-5">
                <div className={`w-16 h-16 sm:w-24 sm:h-24 rounded-full flex items-center justify-center ${(isContrast || isDarkMode) ? 'bg-transparent border-4 border-white' : 'bg-transparent border-4 border-[#2C7FFF]'}`}>
                  <svg className={`w-8 h-8 sm:w-12 sm:h-12 ${(isContrast || isDarkMode) ? 'text-white' : 'text-[#2C7FFF]'}`} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div className={`absolute -top-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-[10px] sm:text-xs font-bold ${(isContrast || isDarkMode) ? 'bg-white text-black' : 'bg-[#03045E] text-white'}`}>✓</div>
              </div>

              <span aria-hidden="true" className={`inline-flex items-center gap-1 sm:gap-1.5 px-3 py-1 sm:px-4 sm:py-1.5 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-widest mb-3 sm:mb-4 border-2 ${(isContrast || isDarkMode) ? 'text-white bg-transparent border-white' : 'text-[#2C7FFF] bg-transparent border-[#2C7FFF]'}`}>
                <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-[#10B981]"></span>
                Success
              </span>

              <h2 id="success-title" className={`text-xl sm:text-3xl font-black tracking-tight mb-1.5 sm:mb-2 ${(isContrast || isDarkMode) ? 'text-white' : 'text-[#03045E]'}`}>
                You're all set!
              </h2>
              <p id="success-desc" className={`text-xs sm:text-sm font-bold leading-relaxed mb-6 sm:mb-8 max-w-xs ${(isContrast || isDarkMode) ? 'text-white/80' : 'text-[#03045E]/80'}`}>
                Registration completed successfully. Taking you to Log In…
              </p>

              <div aria-hidden="true" className="flex items-center gap-1 sm:gap-1.5">
                <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#2C7FFF] animate-pulse" />
                <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#2C7FFF] animate-pulse [animation-delay:150ms]" />
                <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#2C7FFF] animate-pulse [animation-delay:300ms]" />
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}