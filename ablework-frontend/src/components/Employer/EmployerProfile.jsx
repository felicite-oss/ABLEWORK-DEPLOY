import React, { useState, useContext, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { AccessibilityContext } from '../../context/AccessibilityContext';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import API_BASE_URL from '../api/api';

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

export default function EmployerSettings({ profile, refreshData }) {
  const { mode } = useContext(AccessibilityContext);
  const isContrast = mode && typeof mode === 'string' && mode.toLowerCase().includes('contrast');
  const isDarkMode = mode && typeof mode === 'string' && (mode.toLowerCase().includes('dark') || mode.toLowerCase().includes('comfort'));
  const isDark = isContrast || isDarkMode;

  const [formData, setFormData] = useState({
    company_name: profile?.company_name || '',
    company_description: profile?.company_description || '',
    industry: profile?.industry || '',
    email: profile?.email || '',
    latitude: profile?.latitude || '',
    longitude: profile?.longitude || '',
    company_logo: profile?.company_logo || ''
  });
  
  const [logoPreview, setLogoPreview] = useState(profile?.company_logo ? `${API_BASE_URL}${profile.company_logo}` : null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [showAlert, setShowAlert] = useState(false);
  const [alertConfig, setAlertConfig] = useState({ pill: '', title: '', subtitle: '' });

  const [showLocationAlert, setShowLocationAlert] = useState(false);
  const [locationStage, setLocationStage] = useState('processing');
  const [locationMessage, setLocationMessage] = useState('');
  const [locationCoords, setLocationCoords] = useState({ lat: '', lng: '' });

  const fileInputRef = useRef(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tempImagePreview, setTempImagePreview] = useState('');
  
  const [profilePicFile, setProfilePicFile] = useState(null);
  
  const [isUpdatingPicture, setIsUpdatingPicture] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState({ isOpen: false, message: '' });

  const [mapExpanded, setMapExpanded] = useState(false);
  const [satelliteView, setSatelliteView] = useState(false);
  const [legendOpen, setLegendOpen] = useState(true);

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

  const pageBg = isDark ? 'bg-black' : 'bg-[#F4F4F4]';
  const pageText = isDark ? 'text-white' : 'text-[#03045E]';
  const cardBg = isDark ? 'bg-black border-white' : 'bg-white border-gray-200';
  const softBg = isDark ? 'bg-black border-white/40' : 'bg-[#F4F4F4] border-gray-200';
  const innerBorder = isDark ? 'border-white/40' : 'border-gray-200';
  const muted = isDark ? 'text-white/70' : 'text-[#03045E]/70';
  const subtle = isDark ? 'text-white/60' : 'text-[#03045E]/60';
  const labelText = isDark ? 'text-white' : 'text-[#03045E]';
  const inputBg = isDark
    ? 'bg-black border-white text-white placeholder-white/40 focus:border-white'
    : 'bg-white border-gray-200 text-[#03045E] placeholder-[#03045E]/40 focus:border-gray-200';
  const readOnlyInput = isDark
    ? 'bg-black border-white/40 text-white/70'
    : 'bg-[#F4F4F4] border-gray-200 text-[#03045E]/70';
  const topBar = isDark ? 'bg-white' : 'bg-[#2C7FFF]';

  const triggerAlert = (pill, title, subtitle) => {
    setAlertConfig({ pill, title, subtitle });
    setShowAlert(true);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePicFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setTempImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleConfirmChangePicture = async () => {
    if (!tempImagePreview || !profilePicFile) return;
    
    setIsUpdatingPicture(true);

    const submitData = new FormData();
    submitData.append('company_name', formData.company_name);
    submitData.append('company_description', formData.company_description);
    submitData.append('industry', formData.industry);
    submitData.append('email', formData.email);
    submitData.append('latitude', formData.latitude);
    submitData.append('longitude', formData.longitude);
    submitData.append('company_logo', profilePicFile);

    try {
      const res = await fetch(`${API_BASE_URL}/api/employer/${profile.user_id}/settings`, {
        method: 'PUT',
        body: submitData 
      });

      if (res.ok) {
        const responseData = await res.json();
        
        const newLogoUrl = responseData.logo_url ? `${API_BASE_URL}${responseData.logo_url}` : tempImagePreview;
        setLogoPreview(newLogoUrl);
        setFormData(prev => ({ ...prev, company_logo: responseData.logo_url }));
        
        setIsUpdatingPicture(false);
        setIsModalOpen(false);
        setProfilePicFile(null);
        refreshData();
        setSaveSuccess({ isOpen: true, message: 'Your company logo has been successfully updated.' });
      } else {
        setIsUpdatingPicture(false);
        alert("Failed to upload logo.");
      }
    } catch (err) {
      setIsUpdatingPicture(false);
      alert("Server error while uploading logo.");
    }
  };

  const handleCancelChangePicture = () => {
    setTempImagePreview('');
    setProfilePicFile(null);
    setIsModalOpen(false);
  };

  const handleDetectLocation = () => {
    setLocationMessage('');
    setLocationCoords({ lat: '', lng: '' });
    setLocationStage('processing');
    setShowLocationAlert(true);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setTimeout(() => {
            setFormData({
              ...formData,
              latitude: position.coords.latitude,
              longitude: position.coords.longitude
            });
            setLocationCoords({
              lat: position.coords.latitude.toFixed(6),
              lng: position.coords.longitude.toFixed(6)
            });
            setLocationStage('success');
          }, 1400);
        },
        (error) => {
          setTimeout(() => {
            setLocationMessage("Could not detect location. Please ensure location services are enabled.");
            setLocationStage('error');
          }, 1200);
        }
      );
    } else {
      setTimeout(() => {
        setLocationMessage("Geolocation is not supported by your browser.");
        setLocationStage('error');
      }, 900);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const submitData = new FormData();
    submitData.append('company_name', formData.company_name);
    submitData.append('company_description', formData.company_description);
    submitData.append('industry', formData.industry);
    submitData.append('email', formData.email);
    submitData.append('latitude', formData.latitude);
    submitData.append('longitude', formData.longitude);
    
    if (profilePicFile) {
      submitData.append('company_logo', profilePicFile);
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/employer/${profile.user_id}/settings`, {
        method: 'PUT',
        body: submitData 
      });

      if (res.ok) {
        refreshData();
        setSaveSuccess({ isOpen: true, message: 'Your company profile has been updated successfully. All changes are now live.' });
      } else {
        alert("Failed to update profile.");
      }
    } catch (err) {
      alert("Server error while saving settings.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderMapInner = () => (
    <>
      <div className="absolute top-2 right-2 sm:top-3 sm:right-3 z-[1000] flex flex-col gap-1.5">
        <button
          type="button"
          onClick={() => setMapExpanded(prev => !prev)}
          aria-label={mapExpanded ? 'Exit fullscreen map' : 'Expand map to fullscreen'}
          title={mapExpanded ? 'Exit fullscreen' : 'Expand map'}
          className="relative flex items-center gap-1 pl-1.5 pr-2 py-1 rounded-full bg-white/95 backdrop-blur-md shadow-[0_2px_10px_rgba(3,4,94,0.12)] border border-[#03045E]/15 cursor-pointer"
        >
          <span className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-[#2C7FFF]/10 border border-[#2C7FFF]/30 flex items-center justify-center text-[#2C7FFF] shrink-0">
            {mapExpanded ? (
              <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              </svg>
            )}
          </span>
          <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-wider text-[#03045E] whitespace-nowrap">
            {mapExpanded ? 'Exit' : 'Expand'}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setSatelliteView(prev => !prev)}
          aria-label={satelliteView ? 'Switch to street view' : 'Switch to satellite view'}
          title={satelliteView ? 'Street view' : 'Satellite view'}
          className="relative flex items-center gap-1 pl-1.5 pr-2 py-1 rounded-full bg-white/95 backdrop-blur-md shadow-[0_2px_10px_rgba(3,4,94,0.12)] border border-[#03045E]/15 cursor-pointer"
        >
          <span className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-[#2C7FFF]/10 border border-[#2C7FFF]/30 flex items-center justify-center text-[#2C7FFF] shrink-0">
            {satelliteView ? (
              <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
            ) : (
              <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
          </span>
          <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-wider text-[#03045E] whitespace-nowrap">
            {satelliteView ? 'Street' : 'Satellite'}
          </span>
        </button>
      </div>

      {mapExpanded && (
        <div className="absolute top-3 left-16 sm:top-4 sm:left-20 z-[1000] bg-white/95 backdrop-blur-sm px-3 py-2 rounded-xl shadow-lg border border-[#03045E]/20">
          <p className="text-[11px] font-black uppercase tracking-widest text-[#03045E] m-0">Office Location</p>
        </div>
      )}

      <div className="absolute bottom-2 left-2 sm:bottom-3 sm:left-3 z-[1000]">
        <div className="w-[145px] sm:w-[160px] bg-white/95 backdrop-blur-sm rounded-xl shadow-md border border-[#03045E]/20 overflow-hidden">
          <button
            type="button"
            onClick={() => setLegendOpen(open => !open)}
            aria-expanded={legendOpen}
            aria-controls="employer-map-legend-panel"
            className="w-full flex items-center gap-1.5 px-2 py-1.5 cursor-pointer"
          >
            <span className="w-4 h-4 sm:w-5 sm:h-5 rounded-md bg-[#f4f4f4] border border-[#03045E]/20 flex items-center justify-center text-[#2C7FFF] shrink-0">
              <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
            </span>
            <span className="flex-1 text-left text-[8px] sm:text-[9px] font-black uppercase tracking-wider text-[#03045E]">
              Map Legend
            </span>
            <svg
              className={`w-2.5 h-2.5 sm:w-3 sm:h-3 text-[#03045E] transition-transform duration-300 ${legendOpen ? 'rotate-180' : ''}`}
              fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          <div className={`grid transition-all duration-300 ease-out ${legendOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
            <div className="overflow-hidden">
              <div id="employer-map-legend-panel" className="px-2 pb-2 flex flex-col gap-1.5">
                <div className="h-px w-full bg-[#03045E]/10 mb-0.5"></div>

                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#03045E] border-2 border-white shadow-sm shrink-0"></span>
                  <span className="flex-1 text-[9px] font-bold text-[#03045E] leading-tight">Office Location</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#2C7FFF] border-2 border-white shadow-sm shrink-0"></span>
                  <span className="flex-1 text-[9px] font-bold text-[#03045E] leading-tight">Company Base</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <MapContainer 
        center={[Number(formData.latitude), Number(formData.longitude)]} 
        zoom={14} 
        scrollWheelZoom={false} 
        style={{ height: '100%', width: '100%', zIndex: 0 }}
      >
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
        
        <Marker position={[Number(formData.latitude), Number(formData.longitude)]}>
          <Popup>
            <div className="p-0 min-w-[220px] rounded-2xl overflow-hidden bg-white shadow-xl">
              <div className="h-1.5 w-full bg-[#03045E]"></div>
              <div className="px-4 pt-3.5 pb-3">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-white shadow-sm bg-[#03045E]">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2a7 7 0 00-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 00-7-7zm0 9.5a2.5 2.5 0 110-5 2.5 2.5 0 010 5z" /></svg>
                    Office Base
                  </span>
                  <span className="w-2 h-2 rounded-full bg-[#03045E] animate-pulse"></span>
                </div>
                <h4 className="font-black text-[15px] text-[#03045E] leading-tight m-0 mb-1">Company Location</h4>
                <p className="text-xs font-bold text-[#03045E]/70 m-0 leading-relaxed">
                  {formData.company_name || 'Your office location'}
                </p>
              </div>
            </div>
          </Popup>
        </Marker>
        <MapRecenter lat={Number(formData.latitude)} lng={Number(formData.longitude)} />
        <MapInvalidator trigger={mapExpanded} />
      </MapContainer>
    </>
  );

  return (
    <div className="animate-fadeIn max-w-9xl mx-auto pb-6 sm:pb-10 px-1 sm:px-0">
      {!isDark && (
        <style>{`
          .employer-choose-file-input {
            display: block;
            width: 100%;
          }
          .employer-choose-file-input::file-selector-button {
            display: block;
            width: fit-content;
            margin-bottom: 0.5rem;
            padding: 0.5rem 1rem;
            border-radius: 0.75rem;
            font-size: 0.75rem;
            font-weight: 700;
            transition: all 0.2s;
            cursor: pointer;
            background-color: var(--color-primary, #2C7FFF);
            color: #ffffff;
            border: 2px solid var(--color-primary, #2C7FFF);
          }
          .employer-choose-file-input::file-selector-button:hover {
            opacity: 0.85;
          }
          @media (min-width: 640px) {
            .employer-choose-file-input {
              display: inline-block;
              width: auto;
            }
            .employer-choose-file-input::file-selector-button {
              display: inline-block;
              width: auto;
              margin-bottom: 0;
              margin-right: 0.75rem;
            }
          }
        `}</style>
      )}
       
        <div className={`mb-6 sm:mb-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 sm:gap-6 p-4 sm:p-8 rounded-xl sm:rounded-2xl shadow-[0_10px_30px_rgba(3,4,94,0.06)] border-2 ${cardBg}`}>
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 w-full">
            <div className="relative group shrink-0">
              <div className={`w-20 h-20 sm:w-28 sm:h-28 rounded-full overflow-hidden border-4 shadow-md flex items-center justify-center ${isDark ? 'border-white bg-black' : 'border-white bg-white'}`}>
                {logoPreview ? (
                  <img src={logoPreview} alt="Company Logo" className="w-full h-full object-cover" />
                ) : (
                  <svg className={`w-10 h-10 sm:w-12 sm:h-12 ${isDark ? 'text-white/40' : 'text-[#03045E]/40'}`} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                )}
              </div>
              <button
                type="button"
                onClick={() => {
                  setTempImagePreview(logoPreview || '');
                  setIsModalOpen(true);
                }}
                className="absolute bottom-0 right-0 p-2 sm:p-2.5 bg-[#2C7FFF] text-white rounded-full shadow-lg cursor-pointer border-2 border-white"
                title="Change Company Logo"
              >
                <svg className="w-3 h-3 sm:w-4 sm:h-4" style={{ color: isDark ? '#000000' : '#ffffff' }} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </button>
            </div>

            <div className="text-center sm:text-left">
              <h1 className={`text-xl sm:text-3xl font-extrabold tracking-tight ${pageText}`}>
                {profile?.company_name || 'Company Profile'}
              </h1>
              <p className={`text-xs sm:text-sm font-semibold mt-1 ${muted}`}>
                Manage your corporate identity, branding, and geofencing coordinates
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8 items-stretch">
          
          <div className={`flex flex-col justify-between gap-4 sm:gap-6 p-4 sm:p-8 rounded-xl sm:rounded-2xl shadow-xl border-2 relative overflow-hidden ${cardBg}`}>
            <div className={`absolute top-0 left-0 right-0 h-1.5 sm:h-2 ${topBar}`}></div>
            
            <div className="flex flex-col gap-4 sm:gap-6 relative z-10">
              <div className={`flex items-center justify-between border-b-2 pb-3 sm:pb-4 ${innerBorder}`}>
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className={`p-2 sm:p-2.5 rounded-lg sm:rounded-xl ${isDark ? 'bg-white/10 text-white' : 'bg-[#2C7FFF]/10 text-[#2C7FFF]'}`}>
                    <svg className="w-4 h-4 sm:w-6 sm:h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <h2 className={`text-base sm:text-xl font-bold ${labelText}`}>Business Details</h2>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className={`text-[10px] sm:text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${labelText}`}>
                  <svg className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isDark ? 'text-white' : 'text-[#2C7FFF]'}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Company Name
                </label>
                <input 
                  type="text" 
                  name="company_name" 
                  value={formData.company_name} 
                  onChange={handleChange} 
                  required 
                  className={`p-2.5 sm:p-3.5 border-2 rounded-lg sm:rounded-xl outline-none transition font-medium text-sm sm:text-base ${inputBg}`} 
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className={`text-[10px] sm:text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${labelText}`}>
                  <svg className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isDark ? 'text-white' : 'text-[#2C7FFF]'}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Contact Email
                </label>
                <input 
                  type="email" 
                  name="email" 
                  value={formData.email} 
                  onChange={handleChange} 
                  required 
                  className={`p-2.5 sm:p-3.5 border-2 rounded-lg sm:rounded-xl outline-none transition font-medium text-sm sm:text-base ${inputBg}`} 
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className={`text-[10px] sm:text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${labelText}`}>
                  <svg className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isDark ? 'text-white' : 'text-[#2C7FFF]'}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  Industry
                </label>
                <input 
                  type="text" 
                  name="industry" 
                  value={formData.industry} 
                  onChange={handleChange} 
                  required 
                  className={`p-2.5 sm:p-3.5 border-2 rounded-lg sm:rounded-xl outline-none transition font-medium text-sm sm:text-base ${inputBg}`} 
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className={`text-[10px] sm:text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${labelText}`}>
                  <svg className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isDark ? 'text-white' : 'text-[#2C7FFF]'}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h7" />
                  </svg>
                  Company Description
                </label>
                <textarea 
                  name="company_description" 
                  rows="4" 
                  value={formData.company_description} 
                  onChange={handleChange} 
                  required 
                  className={`p-2.5 sm:p-3.5 border-2 rounded-lg sm:rounded-xl resize-none outline-none transition font-medium text-sm sm:text-base ${inputBg}`}
                ></textarea>
              </div>
            </div>
            
            <div></div>
          </div>

          <div className={`flex flex-col justify-between gap-4 sm:gap-6 p-4 sm:p-8 rounded-xl sm:rounded-2xl shadow-xl border-2 relative overflow-hidden ${cardBg}`}>
            <div className={`absolute top-0 left-0 right-0 h-1.5 sm:h-2 ${topBar}`}></div>
            
            <div className="flex flex-col gap-4 sm:gap-6 relative z-10">
              <div className={`flex items-center justify-between border-b-2 pb-3 sm:pb-4 ${innerBorder}`}>
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className={`p-2 sm:p-2.5 rounded-lg sm:rounded-xl ${isDark ? 'bg-white/10 text-white' : 'bg-[#2C7FFF]/10 text-[#2C7FFF]'}`}>
                    <svg className="w-4 h-4 sm:w-6 sm:h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <h2 className={`text-base sm:text-xl font-bold ${labelText}`}>Geofencing Location</h2>
                </div>
              </div>
              
              <p className={`text-[10px] sm:text-xs font-medium leading-relaxed p-3 sm:p-4 rounded-lg sm:rounded-xl border-2 ${softBg} ${muted}`}>
                If your office moves, update your coordinates. The Smart Engine relies on these precise points to connect you with candidates within a safe travel radius.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <div className="flex-1 flex flex-col gap-1.5">
                  <label className={`text-[10px] sm:text-xs font-bold uppercase tracking-wider ${labelText}`}>Latitude</label>
                  <input 
                    type="text" 
                    name="latitude" 
                    value={formData.latitude} 
                    readOnly 
                    className={`p-2.5 sm:p-3.5 border-2 rounded-lg sm:rounded-xl outline-none font-mono text-[10px] sm:text-xs cursor-not-allowed ${readOnlyInput}`} 
                  />
                </div>
                <div className="flex-1 flex flex-col gap-1.5">
                  <label className={`text-[10px] sm:text-xs font-bold uppercase tracking-wider ${labelText}`}>Longitude</label>
                  <input 
                    type="text" 
                    name="longitude" 
                    value={formData.longitude} 
                    readOnly 
                    className={`p-2.5 sm:p-3.5 border-2 rounded-lg sm:rounded-xl outline-none font-mono text-[10px] sm:text-xs cursor-not-allowed ${readOnlyInput}`} 
                  />
                </div>
              </div>

              <button 
                type="button" 
                onClick={handleDetectLocation} 
                className={`py-3 sm:py-3.5 font-bold rounded-lg sm:rounded-xl border-2 flex items-center justify-center gap-2 sm:gap-2.5 text-xs sm:text-sm cursor-pointer ${isDark ? 'bg-black text-white border-white' : 'bg-white text-[#03045E] border-gray-200'}`}
              >
                <svg className={`w-4 h-4 sm:w-5 sm:h-5 ${isDark ? 'text-white' : 'text-[#03045E]'}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Detect Current Office Location
              </button>

              {formData.latitude && formData.longitude && (
                !mapExpanded ? (
                  <div className={`rounded-lg sm:rounded-xl overflow-hidden border-2 h-[160px] sm:h-[220px] relative shadow-inner z-0 ${isDark ? 'border-white/40' : 'border-gray-200'}`}>
                    {renderMapInner()}
                  </div>
                ) : (
                  createPortal(
                    <div className="fixed inset-0 z-[9999] bg-white">
                      {renderMapInner()}
                    </div>,
                    document.body
                  )
                )
              )}
            </div>

            <div className="pt-2 flex flex-col relative z-10">
                             <button 
                type="submit" 
                disabled={isSubmitting} 
                className={`py-3 sm:py-4 font-bold rounded-lg sm:rounded-xl transition-all duration-300 shadow-lg w-full flex items-center justify-center gap-2 text-xs sm:text-sm tracking-wide disabled:opacity-50 cursor-pointer border-2 ${isDark ? 'bg-[#2C7FFF] border-[#2C7FFF]' : 'bg-[#03045E] text-white border-[#03045E] hover:bg-[#2C7FFF] hover:border-[#2C7FFF]'}`}
              >
                {isSubmitting ? (
                  <>
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" fill="none" viewBox="0 0 24 24" style={isContrast ? { stroke: '#ffffff', color: '#ffffff' } : { stroke: '#000000', color: '#000000' }}>
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span style={isContrast ? { color: '#ffffff' } : (isDarkMode ? { color: '#000000' } : { color: '#ffffff' })}>Saving Changes...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke={isContrast ? '#ffffff' : (isDarkMode ? '#000000' : '#ffffff')} strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    <span style={isContrast ? { color: '#ffffff' } : (isDarkMode ? { color: '#000000' } : { color: '#ffffff' })}>Save Profile Settings</span>
                  </>
                )}
              </button>
            </div>
          </div>

        </form>

      {isModalOpen && (
        <div
          className="fixed inset-0 z-[9999999] flex items-center justify-center p-4 backdrop-blur-[1spx] animate-in fade-in transition-all duration-300"
          style={{ backgroundColor: (isContrast || isDarkMode) ? 'rgba(0, 0, 0, 0.75)' : 'rgba(72, 71, 71, 0.6)', filter: 'none' }}
        >
          <div className={`relative w-full max-w-md rounded-xl sm:rounded-2xl shadow-[0_25px_60px_rgba(3,4,94,0.25)] overflow-hidden animate-in zoom-in-95 duration-300 ${isDark ? 'bg-black' : 'bg-white'}`}>
            <div className={`absolute -top-20 -right-20 w-56 h-56 rounded-full ${isDark ? 'bg-white/10' : 'bg-[#2C7FFF]/10'}`}></div>

            <div className={`relative h-1.5 w-full ${isDark ? 'bg-white' : 'bg-[#2C7FFF]'}`}></div>

            <div className="relative px-5 sm:px-8 pt-6 sm:pt-8 pb-6 sm:pb-8 flex flex-col items-center text-center">
              <div className="relative mb-4 sm:mb-5">
                <div className={`absolute inset-0 rounded-xl rotate-6 ${isDark ? 'bg-white/20' : 'bg-[#2C7FFF]/20'}`}></div>
                                <div className={`relative w-12 h-12 sm:w-14 sm:h-14 rounded-xl shadow-lg flex items-center justify-center -rotate-3 ${isDark ? 'bg-[#2C7FFF]' : 'bg-[#2C7FFF]'}`}>
                                  <svg className="w-6 h-6 sm:w-7 sm:h-7" fill="none" stroke={isDark ? (isContrast ? '#ffffff' : '#000000') : '#ffffff'} strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </div>
              </div>

              <span className={`inline-flex items-center gap-1.5 text-[9px] sm:text-[10px] font-black uppercase tracking-[0.18em] px-2.5 sm:px-3 py-1 rounded-full mb-3 ${isDark ? 'text-white bg-white/10' : 'text-[#2C7FFF] bg-[#2C7FFF]/10'}`}>
                <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${isDark ? 'bg-white' : 'bg-[#2C7FFF]'}`}></span>
                Company Logo
              </span>

              <h3 className={`text-xl sm:text-2xl font-black tracking-tight mb-2 ${pageText}`}>Update Your Logo</h3>
              <p className={`text-[10px] sm:text-xs font-semibold mb-4 sm:mb-6 max-w-xs ${muted}`}>Choose a new image to refresh your company branding.</p>

              <div className="relative mb-4 sm:mb-6">
                <div className={`absolute inset-0 rounded-full blur-xl ${isDark ? 'bg-white/15' : 'bg-[#2C7FFF]/15'}`}></div>
                <div className={`relative w-24 h-24 sm:w-32 sm:h-32 rounded-full overflow-hidden border-4 shadow-xl flex items-center justify-center ${isDark ? 'border-white ring-4 ring-white/30 bg-black' : 'border-white ring-4 ring-[#2C7FFF]/30 bg-gray-100'}`}>
                  {tempImagePreview ? (
                    <img src={tempImagePreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <svg className={`w-10 h-10 sm:w-14 sm:h-14 ${isDark ? 'text-white/40' : 'text-gray-400'}`} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  )}
                </div>
                                <span className={`absolute -bottom-1 -right-1 w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center border-3 border-white shadow-lg ${isDark ? 'bg-[#2C7FFF]' : 'bg-[#2C7FFF]'}`}>
                  <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke={isDark && !isContrast ? '#000000' : '#ffffff'} strokeWidth="3" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                </span>
              </div>

              <input type="file" ref={fileInputRef} onChange={handleFileSelect} accept="image/*" className="hidden" />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className={`group w-full px-4 sm:px-6 py-2.5 sm:py-3 border-2 border-dashed font-extrabold text-[10px] sm:text-xs rounded-lg sm:rounded-xl transition-all mb-4 sm:mb-5 cursor-pointer flex items-center justify-center gap-2 ${isDark ? 'border-white/40 text-white' : 'border-[#03045E]/30 text-[#03045E] bg-[#f4f4f4]'}`}
              >
                <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                   </svg>
                <span>Browse Image File</span>
              </button>

              <div className="flex items-center gap-2 sm:gap-3 w-full">
                <button
                  type="button"
                  disabled={isUpdatingPicture}
                  onClick={handleCancelChangePicture}
                  className={`flex-1 py-2.5 sm:py-3.5 font-extrabold text-xs sm:text-sm rounded-lg sm:rounded-xl transition-all cursor-pointer disabled:opacity-50 border-2 ${isDark ? 'bg-black text-white border-white' : 'bg-gray-100 text-gray-700 border-transparent hover:bg-gray-200 hover:border-gray-300'}`}
                >
                  Cancel
                </button>
                                <button
                  type="button"
                  disabled={isUpdatingPicture}
                  onClick={handleConfirmChangePicture}
                  className={`flex-1 py-2.5 sm:py-3.5 font-extrabold text-xs sm:text-sm rounded-lg sm:rounded-xl cursor-pointer shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 ${isDark ? 'bg-[#2C7FFF] border-2 border-[#2C7FFF] !text-white' : 'bg-[#2C7FFF] text-white'}`}
                >
                  {isUpdatingPicture ? (
                    <>
                      <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin" fill="none" viewBox="0 0 24 24" style={isDark ? { color: isContrast ? '#ffffff' : '#000000', stroke: isContrast ? '#ffffff' : '#000000' } : undefined}>
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                      </svg>
                      <span style={{ color: isDark ? (isContrast ? '#ffffff' : '#000000') : '#ffffff' }}>Updating...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke={isDark ? (isContrast ? '#ffffff' : '#000000') : '#ffffff'} strokeWidth="2.5" viewBox="0 0 24 24" style={isDark ? { stroke: isContrast ? '#ffffff' : '#000000', color: isContrast ? '#ffffff' : '#000000' } : undefined}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      <span style={{ color: isDark ? (isContrast ? '#ffffff' : '#000000') : '#ffffff' }}>Save Logo</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showLocationAlert && (
        <div
          className="fixed inset-0 z-[9999999] flex items-center justify-center p-4 backdrop-blur-[1spx] animate-in fade-in transition-all duration-300"
          style={{ backgroundColor: (isContrast || isDarkMode) ? 'rgba(0, 0, 0, 0.75)' : 'rgba(72, 71, 71, 0.6)', filter: 'none' }}
        >
          <div className={`relative w-full max-w-sm rounded-xl sm:rounded-2xl border-2 overflow-hidden animate-in zoom-in-95 duration-300 ${isDark ? 'bg-black border-white' : 'bg-[#F4F4F4] border-gray-200'}`}>
            <div className={`absolute top-0 left-0 right-0 h-1.5 sm:h-2 ${topBar}`}></div>
            <div className="px-5 sm:px-8 pt-6 sm:pt-10 pb-6 sm:pb-8 flex flex-col items-center text-center">
              <div className="relative mb-4 sm:mb-6">
                {locationStage === 'processing' && (
                  <>
                    <div className="absolute inset-0 rounded-full bg-[#2C7FFF]/20 animate-ping" />
                    <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#2C7FFF]/15 flex items-center justify-center">
                      <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-full bg-[#2C7FFF] flex items-center justify-center">
                        <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      </div>
                    </div>
                  </>
                )}
                {locationStage === 'success' && (
                  <>
                    <div className="absolute inset-0 rounded-full bg-[#2C7FFF]/20 animate-ping" />
                    <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#2C7FFF]/15 flex items-center justify-center">
                      <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-full bg-[#2C7FFF] flex items-center justify-center">
                        <svg className="w-6 h-6 sm:w-8 sm:h-8" fill="none" stroke={isDark ? '#000000' : '#ffffff'} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    </div>
                  </>
                )}
                {locationStage === 'error' && (
                  <>
                    <div className="absolute inset-0 rounded-full bg-red-500/20 animate-ping" />
                    <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-red-500/15 flex items-center justify-center">
                      <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-full bg-red-500 flex items-center justify-center">
                        <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </div>
                    </div>
                  </>
                )}
              </div>

              <span className={`inline-block px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-widest mb-3 border-2 ${isDark ? 'text-white bg-black border-[#2C7FFF]' : 'text-[#03045E] bg-white border-[#2C7FFF]'}`}>
                {locationStage === 'processing' ? 'Detecting' : locationStage === 'success' ? 'Location Detected' : 'Location Error'}
              </span>

              <h2 className={`text-xl sm:text-2xl font-black tracking-tight mb-2 ${pageText}`}>
                {locationStage === 'processing' ? 'Detecting Location...' : locationStage === 'success' ? 'Location Detected!' : 'Location Unavailable'}
              </h2>
              <p className={`text-xs sm:text-sm font-bold leading-relaxed mb-4 sm:mb-6 max-w-xs ${muted}`}>
                {locationStage === 'processing' ? 'Please wait while we detect your current office location.' : locationStage === 'success' ? 'Your office coordinates have been updated successfully.' : locationMessage}
              </p>

              {locationStage === 'success' && (
                <div className={`w-full rounded-lg sm:rounded-xl p-3 sm:p-4 border-2 mb-4 sm:mb-6 text-left ${isDark ? 'bg-black border-white/40' : 'bg-white border-gray-200'}`}>
                  <div className="flex justify-between items-center mb-2 sm:mb-3">
                    <span className={`text-[10px] sm:text-[11px] font-black uppercase tracking-wider ${muted}`}>Latitude</span>
                    <span className="text-xs sm:text-sm font-black text-[#2C7FFF]">{locationCoords.lat}</span>
                  </div>
                  <div className={`h-px mb-2 sm:mb-3 ${isDark ? 'bg-white/20' : 'bg-[#03045E]/10'}`}></div>
                  <div className="flex justify-between items-center">
                    <span className={`text-[10px] sm:text-[11px] font-black uppercase tracking-wider ${muted}`}>Longitude</span>
                    <span className="text-xs sm:text-sm font-black text-[#2C7FFF]">{locationCoords.lng}</span>
                  </div>
                </div>
              )}

              {locationStage !== 'processing' && (
                <button
                  onClick={() => setShowLocationAlert(false)}
                  className={`w-full py-3 sm:py-3.5 rounded-lg sm:rounded-xl font-black text-xs sm:text-sm uppercase tracking-wider transition cursor-pointer border-2 ${isDark ? 'bg-[#2C7FFF] text-black border-[#2C7FFF] hover:bg-white' : 'bg-[#03045E] text-white border-[#03045E] hover:bg-[#2C7FFF] hover:border-[#2C7FFF]'}`}
                >
                  <span style={{ color: '#ffffff' }}>{locationStage === 'error' ? 'Try Again' : 'Got it'}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {saveSuccess.isOpen && (
        <div
          className="fixed inset-0 z-[9999999] flex items-center justify-center p-4 backdrop-blur-[1px] animate-in fade-in transition-all duration-300"
          style={{ backgroundColor: (isContrast || isDarkMode) ? 'rgba(0, 0, 0, 0.75)' : 'rgba(72, 71, 71, 0.6)', filter: 'none' }}
        >
          <div className={`relative w-full max-w-sm rounded-xl sm:rounded-2xl border-2 overflow-hidden ${isDark ? 'bg-black border-[#2C7FFF]' : 'bg-[#F4F4F4] border-[#2C7FFF]'}`}>
            <div className="h-1.5 sm:h-2 w-full bg-[#2C7FFF]" />

            <div className="px-5 sm:px-8 pt-6 sm:pt-10 pb-6 sm:pb-8 flex flex-col items-center text-center">
              <div className="relative mb-4 sm:mb-6">
                <div className="absolute inset-0 rounded-full bg-[#2C7FFF]/20 animate-ping" />
                <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#2C7FFF]/15 flex items-center justify-center">
                  <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-full bg-[#2C7FFF] flex items-center justify-center">
                    <svg className="w-6 h-6 sm:w-8 sm:h-8" fill="none" stroke={isContrast ? '#ffffff' : (isDarkMode ? '#000000' : '#ffffff')} strokeWidth="3" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
              </div>

              <span className={`inline-block px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-widest mb-3 border-2 ${isDark ? 'text-white bg-black border-[#2C7FFF]' : 'text-[#03045E] bg-white border-[#2C7FFF]'}`}>
                Profile Saved
              </span>

              <h2 className={`text-xl sm:text-2xl font-black tracking-tight mb-2 ${pageText}`}>
                Profile Saved Successfully!
              </h2>
              <p className={`text-xs sm:text-sm font-bold leading-relaxed mb-4 sm:mb-6 max-w-xs ${muted}`}>
                {saveSuccess.message}
              </p>

              <button
                onClick={() => setSaveSuccess({ isOpen: false, message: '' })}
                className={`w-full py-3 sm:py-3.5 rounded-lg sm:rounded-xl font-black text-xs sm:text-sm uppercase tracking-wider transition cursor-pointer border-2 ${isDark ? 'bg-[#2C7FFF] border-[#2C7FFF] hover:bg-white' : 'bg-[#03045E] text-white border-[#03045E] hover:bg-[#2C7FFF] hover:border-[#2C7FFF]'}`}
              >
                <span style={{ color: '#ffffff' }}>Got it</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}