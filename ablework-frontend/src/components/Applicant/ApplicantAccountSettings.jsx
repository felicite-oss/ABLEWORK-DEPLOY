import { useState, useContext, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AccessibilityContext } from '../../context/AccessibilityContext';
import { useColorPalette } from '../../context/ColorPaletteContext';
import API_BASE_URL from '../../../config';

export default function ApplicantAccountSettings({ profile }) {
  const navigate = useNavigate();
  const { mode } = useContext(AccessibilityContext);
  const { paletteKey } = useColorPalette();
  const isContrast = mode && typeof mode === 'string' && mode.toLowerCase().includes('contrast');
  const isDarkMode = mode && typeof mode === 'string' && mode.toLowerCase().includes('dark');
  const isColorVision = (mode && typeof mode === 'string' && (mode.toLowerCase().includes('tritanopia') || mode.toLowerCase().includes('protanopia') || mode.toLowerCase().includes('deuteranopia') || mode.toLowerCase().includes('colorvision'))) || (paletteKey && typeof paletteKey === 'string' && (paletteKey.toLowerCase().includes('tritanopia') || paletteKey.toLowerCase().includes('protanopia') || paletteKey.toLowerCase().includes('deuteranopia') || paletteKey.toLowerCase().includes('colorvision') || paletteKey.toLowerCase().includes('warm')));
  const isDark = isContrast || isDarkMode;
  const isDarkScreen = isContrast || isDarkMode;
  const isHighContrastOrDarkComfort = paletteKey === 'highContrast' || paletteKey === 'darkComfort';

  const isRejected = profile?.verification_status === 'Rejected';
  const [openSection, setOpenSection] = useState(isRejected ? 'verification' : 'email');
  const toggleSection = (section) => {
    setOpenSection(openSection === section ? null : section);
  };

  const [email, setEmail] = useState(profile?.email || '');
  const [emailStep, setEmailStep] = useState(1); 
  const [emailOtp, setEmailOtp] = useState('');
  const [emailStatus, setEmailStatus] = useState({ type: '', msg: '' });
  const [isUpdatingEmail, setIsUpdatingEmail] = useState(false);
  const [showEmailSuccess, setShowEmailSuccess] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordStep, setPasswordStep] = useState(1); 
  const [passwordOtp, setPasswordOtp] = useState('');
  const [passwordStatus, setPasswordStatus] = useState({ type: '', msg: '' });
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [isRequestingPassword, setIsRequestingPassword] = useState(false);
  const [showPasswordSuccess, setShowPasswordSuccess] = useState(false);
  const [passwordProcessing, setPasswordProcessing] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showDeletePassword, setShowDeletePassword] = useState(false);
  const [verificationDoc, setVerificationDoc] = useState(null);
  const [verStatus, setVerStatus] = useState({ type: '', msg: '' });
  const [isResubmitting, setIsResubmitting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [dangerStatus, setDangerStatus] = useState({ type: '', msg: '' });
  const [isDeactivated, setIsDeactivated] = useState(profile?.status === 'Deactivated' || profile?.account_status === 'Deactivated' || false);
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [deactivateStage, setDeactivateStage] = useState('confirm');
  const [deactivateTargetState, setDeactivateTargetState] = useState(false);

  const deleteModalRef = useRef(null);
  const emailSuccessRef = useRef(null);
  const passwordSuccessRef = useRef(null);
  const deactivateModalRef = useRef(null);

  useEffect(() => {
    if (showDeleteModal && deleteModalRef.current) {
      const timer = setTimeout(() => deleteModalRef.current.focus(), 100);
      return () => clearTimeout(timer);
    }
  }, [showDeleteModal]);

  useEffect(() => {
    if (showEmailSuccess && emailSuccessRef.current) {
      const timer = setTimeout(() => emailSuccessRef.current.focus(), 100);
      return () => clearTimeout(timer);
    }
  }, [showEmailSuccess]);

  useEffect(() => {
    if (showPasswordSuccess && passwordSuccessRef.current) {
      const timer = setTimeout(() => passwordSuccessRef.current.focus(), 100);
      return () => clearTimeout(timer);
    }
  }, [showPasswordSuccess]);

  useEffect(() => {
    if (showDeactivateModal && deactivateModalRef.current) {
      const timer = setTimeout(() => deactivateModalRef.current.focus(), 100);
      return () => clearTimeout(timer);
    }
  }, [showDeactivateModal]);

  let daysLeft = 0;
  let canResubmit = false;

  if (isRejected && profile?.rejection_timestamp) {
    const rejectDate = new Date(profile.rejection_timestamp);
    const today = new Date();
    const diffTime = Math.abs(today - rejectDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    daysLeft = 8 - diffDays;
    canResubmit = daysLeft <= 0;
  }

  const successMsg = isHighContrastOrDarkComfort
    ? 'bg-transparent !text-white border-[#2C7FFF]'
    : isDark
      ? 'bg-transparent !text-white border-[#2C7FFF]'
      : 'bg-[#2C7FFF] text-white border-[#2C7FFF]';
  const errorMsg = isDark
    ? 'bg-black text-white border-white'
    : 'bg-white text-[#03045E] border-[#03045E]';

  const handleRequestEmailUpdate = async (e) => {
    e.preventDefault();
    if (email === profile?.email) {
      return setEmailStatus({ type: 'error', msg: 'Please enter a different email address.' });
    }
    
    setEmailStatus({ type: '', msg: '' });
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/${profile.user_id}/request-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email, type: 'email' }) 
      });
      const data = await response.json();

      if (response.ok) {
        setEmailStatus({ type: 'success', msg: `A 6-digit verification code has been sent to ${email}.` });
        setEmailStep(2);
      } else {
        setEmailStatus({ type: 'error', msg: data.message });
      }
    } catch (error) {
      setEmailStatus({ type: 'error', msg: 'Failed to request code. Check server connection.' });
    }
  };

  const handleVerifyAndUpdateEmail = async (e) => {
    e.preventDefault();
    if (emailOtp.length < 6) {
      return setEmailStatus({ type: 'error', msg: 'Please enter a valid 6-digit code.' });
    }

    setEmailStatus({ type: '', msg: '' });
    setIsUpdatingEmail(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/applicant/${profile.user_id}/credentials`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: emailOtp })
      });
      const data = await response.json();

      if (response.ok) {
        setEmailStatus({ type: 'success', msg: 'Email successfully verified and updated!' });
        setEmailStep(1);
        setEmailOtp('');
        setShowEmailSuccess(true);
      } else {
        setEmailStatus({ type: 'error', msg: data.message || 'Invalid verification code.' });
      }
    } catch (error) {
      setEmailStatus({ type: 'error', msg: 'Server connection error.' });
    } finally {
      setIsUpdatingEmail(false);
    }
  };

  const handleRequestPasswordUpdate = async (e) => {
    e.preventDefault();
    setPasswordStatus({ type: '', msg: '' });

    if (newPassword !== confirmPassword) {
      return setPasswordStatus({ type: 'error', msg: 'New passwords do not match.' });
    }
    if (newPassword.length < 6) {
      return setPasswordStatus({ type: 'error', msg: 'Password must be at least 6 characters long.' });
    }

    setIsRequestingPassword(true);
    const minLoad = new Promise((resolve) => setTimeout(resolve, 2000));

    try {
      const [response] = await Promise.all([
        fetch(`${API_BASE_URL}/api/users/${profile.user_id}/request-otp`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: profile?.email, type: 'password' }) 
        }),
        minLoad
      ]);
      const data = await response.json();

      if (response.ok) {
        setPasswordStatus({ type: 'success', msg: `A 6-digit verification code has been sent to your email.` });
        setPasswordStep(2);
      } else {
        setPasswordStatus({ type: 'error', msg: data.message });
      }
    } catch (error) {
      setPasswordStatus({ type: 'error', msg: 'Failed to request code. Check server connection.' });
    } finally {
      setIsRequestingPassword(false);
    }
  };

  const handleVerifyAndUpdatePassword = async (e) => {
    e.preventDefault();
    if (passwordOtp.length < 6) {
      return setPasswordStatus({ type: 'error', msg: 'Please enter a valid 6-digit code.' });
    }

    setPasswordStatus({ type: '', msg: '' });
    setIsUpdatingPassword(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/applicant/${profile.user_id}/credentials`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword, otp: passwordOtp })
      });
      const data = await response.json();

      if (response.ok) {
        setPasswordStatus({ type: 'success', msg: data.message || 'Password updated successfully!' });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setPasswordStep(1);
        setPasswordOtp('');

        setShowPasswordSuccess(true);
        setPasswordProcessing(true);
        setTimeout(() => {
          setPasswordProcessing(false);
        }, 2000);
      } else {
        setPasswordStatus({ type: 'error', msg: data.message || 'Invalid verification code.' });
      }
    } catch (error) {
      setPasswordStatus({ type: 'error', msg: 'Server connection error.' });
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleResubmitVerification = async (e) => {
    e.preventDefault();
    if (!verificationDoc) return setVerStatus({ type: 'error', msg: 'Please select a file first.' });

    const validImageTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!validImageTypes.includes(verificationDoc.type)) {
      return setVerStatus({ type: 'error', msg: 'Only picture files (.jpg, .jpeg, .png) are allowed.' });
    }

    const maxSizeInBytes = 5 * 1024 * 1024;
    if (verificationDoc.size > maxSizeInBytes) {
      return setVerStatus({ type: 'error', msg: 'File size exceeds the 5MB limit. Please choose a smaller image.' });
    }

    setIsResubmitting(true);
    setVerStatus({ type: '', msg: '' });

    const formData = new FormData();
    formData.append('document', verificationDoc);

    try {
      const response = await fetch(`${API_BASE_URL}/api/users/${profile.user_id}/resubmit`, {
        method: 'POST',
        body: formData
      });
      const data = await response.json();

      if (response.ok) {
        setVerStatus({ type: 'success', msg: data.message });
        setTimeout(() => window.location.reload(), 2000); 
      } else {
        setVerStatus({ type: 'error', msg: data.message });
      }
    } catch (error) {
      setVerStatus({ type: 'error', msg: 'Server connection error.' });
    } finally {
      setIsResubmitting(false);
    }
  };

  const handleToggleDeactivation = () => {
    setDeactivateTargetState(isDeactivated);
    setDeactivateStage('confirm');
    setShowDeactivateModal(true);
  };

  const confirmToggleDeactivation = async () => {
    const actionText = deactivateTargetState ? 'reactivate' : 'deactivate';
    setDeactivateStage('processing');

    try {
      const [res] = await Promise.all([
        fetch(`${API_BASE_URL}/api/users/${profile.user_id}/toggle-status`, { 
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: deactivateTargetState ? 'activate' : 'deactivate' })
        }),
        new Promise((resolve) => setTimeout(resolve, 2000))
      ]);
      
      if (res.ok) {
        setIsDeactivated(!deactivateTargetState);
        setDeactivateStage('success');
      } else {
        setDeactivateStage('error');
      }
    } catch (error) {
      setDeactivateStage('error');
    }
  };

  const handleDelete = async (e) => {
    e.preventDefault();
    setDangerStatus({ type: '', msg: '' });

    try {
      const res = await fetch(`${API_BASE_URL}/api/users/${profile.user_id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: deletePassword })
      });
      
      const data = await res.json();
      if (res.ok) {
        localStorage.removeItem('user');
        navigate('/');
      } else {
        setDangerStatus({ type: 'error', msg: data.message });
      }
    } catch (error) {
      setDangerStatus({ type: 'error', msg: 'Failed to delete account.' });
    }
  };

  const ChevronIcon = ({ isOpen }) => (
    <svg className={`w-5 h-5 text-[#03045E]/60 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"></path></svg>
  );

  return (
    <div className="animate-fadeIn w-full space-y-4 sm:space-y-5 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none'] pb-6">
      
      <div
        role="region"
        aria-label="Account Settings header. Manage your security credentials and verification documents."
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2"
      >
        <div className="flex flex-col items-start gap-1 w-fit text-left">
          <h2
            role="heading"
            aria-level="1"
            aria-label="Account Settings"
            tabIndex="0"
            className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#03045E] break-words transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2C7FFF] focus-visible:ring-offset-2 rounded-lg p-1 -m-1"
          >
            Account Settings
          </h2>
          <p
            role="text"
            aria-label="Manage your security credentials and verification documents."
            tabIndex="0"
            className="text-[#03045E] mt-1 text-xs sm:text-sm md:text-base font-bold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2C7FFF] focus-visible:ring-offset-2 rounded-lg p-1 -m-1"
          >
            Manage your security credentials and verification documents.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:gap-4">
        
        <div className={`bg-white rounded-xl sm:rounded-2xl border shadow-md overflow-hidden transition-all duration-300 ${openSection === 'verification' ? 'border-[#2C7FFF]/40' : 'border-[#03045E]/20 hover:border-[#2C7FFF]/30'}`}>
          <button
            type="button"
            onClick={() => toggleSection('verification')}
            aria-expanded={openSection === 'verification'}
            aria-controls="account-settings-verification-panel"
            className="w-full p-4 sm:p-5 flex justify-between items-center bg-transparent focus:outline-none cursor-pointer"
          >
            <span className="sr-only">
              Verification Status. Check your standing and manage your uploaded PWD ID.
            </span>
            <div className="flex flex-col items-start gap-1 w-fit text-left">
              <h2 
                tabIndex="0"
                className="text-base sm:text-lg font-extrabold text-[#03045E] transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2C7FFF] focus-visible:ring-offset-2 rounded-lg p-1 -m-1"
              >
                Verification Status
              </h2>
              <p 
                tabIndex="0"
                className="text-[11px] sm:text-sm text-[#03045e]/90 mt-0.5 font-semibold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2C7FFF] focus-visible:ring-offset-2 rounded-lg p-1 -m-1"
              >
                Check your standing and manage your uploaded PWD ID.
              </p>
            </div>
            <ChevronIcon isOpen={openSection === 'verification'} />
          </button>
          
          {openSection === 'verification' && (
            <div
              id="account-settings-verification-panel"
              role="region"
              aria-label="Verification Status details"
              className="px-3 pb-3 sm:px-5 sm:pb-5 border-t border-[#03045E]/10 pt-3 sm:pt-4 animate-fadeIn"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-lg border border-[#03045E]/10 bg-[#f4f4f4]">
                  <div className="flex items-center gap-2 mb-2.5">
                    <div className="w-7 h-7 rounded-lg bg-[#2C7FFF]/15 flex items-center justify-center shrink-0">
                      <svg className="w-4 h-4 text-[#2C7FFF]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </div>
<p tabIndex={0} role="text" aria-label="Current Standing" className="text-[10px] font-black uppercase tracking-widest text-[#03045E]/60">Current Standing</p>
                  </div>
                  {profile?.verification_status === 'Approved' && (
                    <span role="status" aria-label="Verification status: Approved" tabIndex="0" className="inline-flex items-center gap-1.5 px-3 py-1 bg-white text-[#03045E] font-extrabold text-xs rounded-lg border border-[#03045E]/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2C7FFF] focus-visible:ring-offset-2">
                      <svg className="w-3.5 h-3.5 text-[#2C7FFF]" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                      Approved
                    </span>
                  )}
                  {profile?.verification_status === 'Pending' && (
                    <span role="status" aria-label="Verification status: Pending Review" tabIndex="0" className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#2C7FFF]/10 text-[#2C7FFF] font-extrabold text-xs rounded-lg border border-[#2C7FFF]/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2C7FFF] focus-visible:ring-offset-2">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      Pending Review
                    </span>
                  )}
                  {isRejected && (
                    <span role="status" aria-label="Verification status: Action Required" tabIndex="0" className="inline-flex items-center gap-1.5 px-3 py-1 bg-white text-[#03045E] font-extrabold text-xs rounded-lg border border-[#03045E]/25 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2C7FFF] focus-visible:ring-offset-2">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                      Action Required
                    </span>
                  )}
<p
  tabIndex={0}
  role="text"
  aria-label={
    profile?.verification_status === 'Approved'
      ? 'Your account is fully verified.'
      : profile?.verification_status === 'Pending'
      ? 'Awaiting admin review of your submission.'
      : isRejected
      ? 'Please re-upload a valid document.'
      : ''
  }
  className="text-[10px] font-semibold text-[#03045E]/50 mt-2.5 leading-relaxed"
>
  {profile?.verification_status === 'Approved' && 'Your account is fully verified.'}
  {profile?.verification_status === 'Pending' && 'Awaiting admin review of your submission.'}
  {isRejected && 'Please re-upload a valid document.'}
</p>
                </div>

                <div className="p-3.5 rounded-lg border border-[#03045E]/10 bg-[#f4f4f4]">
                  <div className="flex items-center gap-2 mb-2.5">
                    <div className="w-7 h-7 rounded-lg bg-[#2C7FFF]/15 flex items-center justify-center shrink-0">
                      <svg className="w-4 h-4 text-[#2C7FFF]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                    </div>
<p tabIndex={0} role="text" aria-label="Uploaded Document" className="text-[10px] font-black uppercase tracking-widest text-[#03045E]/60">Uploaded Document</p>
                  </div>
                  <a href={`${API_BASE_URL}/${profile?.pwd_document_path?.replace(/\\/g, '/')}`} target="_blank" rel="noopener noreferrer" aria-label="View Document on File, opens in new tab" tabIndex="0" className="inline-flex items-center gap-1.5 text-xs font-extrabold text-[#2C7FFF] hover:underline rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2C7FFF] focus-visible:ring-offset-2">
                    View Document on File
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                  </a>
<p tabIndex={0} role="text" aria-label="Your submitted PWD ID on file." className="text-[10px] font-semibold text-[#03045E]/50 mt-2.5 leading-relaxed">Your submitted PWD ID on file.</p>
                </div>

                {isRejected && (
                  <div className="sm:col-span-2 p-3.5 rounded-lg border border-[#03045E]/15 bg-[#f4f4f4]">
                    <h3 className="text-xs font-extrabold text-[#03045E] mb-1">Re-verify Account</h3>
                    <p className="text-[10px] text-[#03045E]/70 mb-3 font-semibold">
                      {canResubmit ? "Your cooldown has expired. Please upload a clear, valid PWD ID image (Max 5MB)." : `Security lock active. You can upload a new document in ${daysLeft} days.`}
                    </p>
                    {verStatus.msg && (
                      <div role={verStatus.type === 'error' ? 'alert' : 'status'} aria-live="assertive" className={`p-2 text-[10px] font-bold rounded-md mb-3 border ${verStatus.type === 'error' ? 'bg-white text-[#03045E] border-[#03045E]/20' : 'bg-[#2C7FFF]/10 text-[#2C7FFF] border-[#2C7FFF]/30'}`}>
                        {verStatus.msg}
                      </div>
                    )}
                    <form onSubmit={handleResubmitVerification} className="flex flex-col gap-2">
                      <input type="file" accept="image/jpeg,image/jpg,image/png" disabled={!canResubmit || isResubmitting} onChange={(e) => setVerificationDoc(e.target.files[0])} aria-label="Upload a new PWD ID picture file. Only JPG, JPEG, and PNG formats are allowed. Maximum size 5 megabytes." className="text-[10px] text-[#03045E] file:mr-2 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-[10px] file:font-bold file:bg-[#03045E] file:text-white hover:file:bg-[#2C7FFF] disabled:opacity-50 cursor-pointer" />
                      {canResubmit && (
                        <button type="submit" disabled={isResubmitting || !verificationDoc} aria-label={isResubmitting ? 'Uploading new document, please wait' : 'Submit New Document'} className="py-2 bg-[#03045E] hover:bg-[#2C7FFF] text-white font-extrabold text-xs rounded-md transition disabled:opacity-50 shadow-sm cursor-pointer">
                          {isResubmitting ? 'Uploading...' : 'Submit New Document'}
                        </button>
                      )}
                    </form>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>


        <div className={`bg-white rounded-xl sm:rounded-2xl border shadow-md overflow-hidden transition-all duration-300 ${openSection === 'password' ? 'border-[#2C7FFF]/40' : 'border-[#03045E]/20 hover:border-[#2C7FFF]/30'}`}>
          <button
            type="button"
            onClick={() => toggleSection('password')}
            aria-expanded={openSection === 'password'}
            aria-controls="account-settings-password-panel"
            className="w-full p-4 sm:p-5 flex justify-between items-center bg-transparent focus:outline-none cursor-pointer"
          >
            <span className="sr-only">
              Change Password. Update your account password securely.
            </span>
            <div className="flex flex-col items-start gap-1 w-fit text-left">
              <h2 
                tabIndex="0"
                className="text-base sm:text-lg font-extrabold text-[#03045E] transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2C7FFF] focus-visible:ring-offset-2 rounded-lg p-1 -m-1"
              >
                Change Password
              </h2>
              <p 
                tabIndex="0"
                className="text-[11px] sm:text-sm text-[#03045E]/90 mt-0.5 font-semibold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2C7FFF] focus-visible:ring-offset-2 rounded-lg p-1 -m-1"
              >
                Update your account password securely.
              </p>
            </div>
            <ChevronIcon isOpen={openSection === 'password'} />
          </button>

          {openSection === 'password' && (
            <div
              id="account-settings-password-panel"
              role="region"
              aria-label="Change Password details"
              className="px-3 pb-3 sm:px-5 sm:pb-5 border-t border-[#03045E]/10 pt-3 sm:pt-4 animate-fadeIn"
            >
              {passwordStatus.msg && (
                <div role={passwordStatus.type === 'error' ? 'alert' : 'status'} aria-live="assertive" className={`p-2.5 mb-3 rounded-md text-xs font-bold border-2 ${passwordStatus.type === 'error' ? errorMsg : successMsg}`}>
                  {passwordStatus.msg}
                </div>
              )}

              {passwordStep === 1 ? (
                <form onSubmit={handleRequestPasswordUpdate} aria-label="Request password change form" className="flex flex-col gap-3">
                  <div className="p-3 rounded-lg border border-[#03045E]/10 bg-[#f4f4f4]">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 rounded-md bg-[#2C7FFF]/15 flex items-center justify-center shrink-0">
                        <svg className="w-3.5 h-3.5 text-[#2C7FFF]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                      </div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-[#03045E]/60">Verify Current Password</p>
                    </div>
                    <div className="relative">
                      <input id="account-settings-current-password" type={showCurrentPassword ? "text" : "password"} value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required disabled={isRequestingPassword} placeholder="Enter your current password" aria-label="Enter your current password" className="w-full px-3 py-2.5 pr-10 border border-[#03045E]/20 rounded-lg bg-white focus:border-[#2C7FFF] outline-none transition font-semibold text-xs text-[#03045E] disabled:opacity-60" />
                      <button type="button" onClick={() => setShowCurrentPassword(!showCurrentPassword)} aria-label={showCurrentPassword ? 'Hide current password' : 'Show current password'} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#03045E]/50 hover:text-[#2C7FFF] transition cursor-pointer">
                        {showCurrentPassword ? (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                        ) : (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"></path></svg>
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3 rounded-lg border border-[#03045E]/10 bg-[#f4f4f4]">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-6 h-6 rounded-md bg-[#2C7FFF]/15 flex items-center justify-center shrink-0">
                          <svg className="w-3.5 h-3.5 text-[#2C7FFF]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-[#03045E]/60">New Password</p>
                      </div>
                      <div className="relative">
                        <input id="account-settings-new-password" type={showNewPassword ? "text" : "password"} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required disabled={isRequestingPassword} placeholder="Min. 6 characters" aria-label="Enter your new password" className="w-full px-3 py-2.5 pr-10 border border-[#03045E]/20 rounded-lg bg-white focus:border-[#2C7FFF] outline-none transition font-semibold text-xs text-[#03045E] disabled:opacity-60" />
                        <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} aria-label={showNewPassword ? 'Hide new password' : 'Show new password'} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#03045E]/50 hover:text-[#2C7FFF] transition cursor-pointer">
                          {showNewPassword ? (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                          ) : (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"></path></svg>
                          )}
                        </button>
                      </div>
                    </div>
                    <div className="p-3 rounded-lg border border-[#03045E]/10 bg-[#f4f4f4]">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-6 h-6 rounded-md bg-[#2C7FFF]/15 flex items-center justify-center shrink-0">
                          <svg className="w-3.5 h-3.5 text-[#2C7FFF]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-[#03045E]/60">Confirm Password</p>
                      </div>
                      <div className="relative">
                        <input id="account-settings-confirm-password" type={showConfirmPassword ? "text" : "password"} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required disabled={isRequestingPassword} placeholder="Re-enter new password" aria-label="Confirm your new password" className="w-full px-3 py-2.5 pr-10 border border-[#03045E]/20 rounded-lg bg-white focus:border-[#2C7FFF] outline-none transition font-semibold text-xs text-[#03045E] disabled:opacity-60" />
                        <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#03045E]/50 hover:text-[#2C7FFF] transition cursor-pointer">
                          {showConfirmPassword ? (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                          ) : (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"></path></svg>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  <button type="submit" disabled={isRequestingPassword} aria-label={isRequestingPassword ? 'Sending verification code, please wait' : 'Request Password Change'} style={{ color: isDarkMode ? '#000000' : '#ffffff' }} className="w-full px-4 py-2.5 bg-[#03045E] font-black text-xs rounded-lg shadow-md hover:bg-[#2C7FFF] transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                    {isRequestingPassword ? (
                      <>
                        <svg className="w-4 h-4 animate-spin" style={{ color: isDarkMode ? '#000000' : '#ffffff' }} fill="none" viewBox="0 0 24 24" aria-hidden="true">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        <span style={{ color: isDarkMode ? '#000000' : '#ffffff' }}>Sending code...</span>
                      </>
                    ) : (
                      'Request Password Change'
                    )}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyAndUpdatePassword} aria-label="Verify and update password form" className="flex flex-col gap-3">
                  <div className="p-3 rounded-lg border border-[#03045E]/10 bg-[#f4f4f4]">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 rounded-md bg-[#2C7FFF]/15 flex items-center justify-center shrink-0">
                        <svg className="w-3.5 h-3.5 text-[#2C7FFF]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                      </div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-[#03045E]/60">Email Verification Code</p>
                    </div>
                    <input id="account-settings-password-otp" type="text" value={passwordOtp} onChange={(e) => setPasswordOtp(e.target.value)} required placeholder="000000" maxLength="6" aria-label="Enter the 6-digit verification code sent to your email" className="w-full px-3 py-2.5 border border-[#03045E]/20 rounded-lg bg-white focus:border-[#2C7FFF] outline-none transition tracking-[0.3em] text-center font-mono font-bold text-sm text-[#03045E]" />
                  </div>
                  <div className="flex gap-2">
                    <button type="button" aria-label="Cancel password change" onClick={() => { setPasswordStep(1); setPasswordStatus({type:'', msg:''}); }} className="px-4 py-2.5 bg-[#f4f4f4] border border-[#03045E]/15 text-[#03045E] font-black text-xs rounded-lg hover:bg-white transition cursor-pointer">
                      Cancel
                    </button>
                    <button type="submit" disabled={isUpdatingPassword || passwordOtp.length < 6} aria-label={isUpdatingPassword ? 'Verifying code, please wait' : 'Verify and update password'} style={{ color: isDarkMode ? '#000000' : '#ffffff' }} className="flex-1 px-4 py-2.5 bg-[#03045E] font-black text-xs rounded-lg shadow-md hover:bg-[#2C7FFF] transition disabled:opacity-50 cursor-pointer">
                      {isUpdatingPassword ? 'Verifying...' : 'Verify & Update Password'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>

        <div className={`bg-white rounded-xl sm:rounded-2xl border shadow-md overflow-hidden transition-all duration-300 ${openSection === 'danger' ? 'border-[#03045E]/40' : 'border-[#03045E]/20 hover:border-[#03045E]/30'}`}>
          <button
            type="button"
            onClick={() => toggleSection('danger')}
            aria-expanded={openSection === 'danger'}
            aria-controls="account-settings-danger-panel"
            className="w-full p-4 sm:p-5 flex justify-between items-center bg-transparent focus:outline-none cursor-pointer"
          >
            <span className="sr-only">
              Danger Zone. Deactivate or permanently delete your account.
            </span>
            <div className="flex flex-col items-start gap-1 w-fit text-left">
              <h2 
                tabIndex="0"
                className="text-base sm:text-lg font-extrabold text-[#ff0000] transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2C7FFF] focus-visible:ring-offset-2 rounded-lg p-1 -m-1"
              >
                Danger Zone
              </h2>
              <p 
                tabIndex="0"
                className="text-[11px] sm:text-sm text-[#ff0000]/90 mt-0.5 font-semibold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2C7FFF] focus-visible:ring-offset-2 rounded-lg p-1 -m-1"
              >
                Deactivate or permanently delete your account.
              </p>
            </div>
            <ChevronIcon isOpen={openSection === 'danger'} />
          </button>

          {openSection === 'danger' && (
            <div
              id="account-settings-danger-panel"
              role="region"
              aria-label="Danger Zone details"
              className="px-3 pb-3 sm:px-5 sm:pb-5 border-t border-[#03045E]/10 pt-3 sm:pt-4 animate-fadeIn"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-lg border border-[#ff0000]/30 bg-[#f4f4f4]">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-7 h-7 rounded-lg bg-[#ff0000]/10 flex items-center justify-center shrink-0">
                      <svg className="w-4 h-4 text-[#ff0000]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>
                    </div>
                    <h3 tabIndex="0" className="text-xs font-black uppercase tracking-wider text-[#ff0000] rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2C7FFF] focus-visible:ring-offset-2 w-fit">
                      {isDeactivated ? 'Account Deactivated' : 'Deactivate Account'}
                    </h3>
                  </div>
                  <p tabIndex="0" className="text-[11px] font-semibold text-[#03045E]/70 mb-3 leading-relaxed rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2C7FFF] focus-visible:ring-offset-2">
                    {isDeactivated ? 'Your profile is hidden from employers.' : 'Temporarily hide your profile and applications.'}
                  </p>
                  <button type="button" onClick={handleToggleDeactivation} aria-label={isDeactivated ? 'Reactivate Account' : 'Deactivate Account'} className="w-full px-4 py-2 bg-white text-[#ff0000] border-2 border-[#ff0000] font-black text-xs rounded-lg hover:bg-[#ff0000]/5 transition cursor-pointer">
                    {isDeactivated ? 'Reactivate Account' : 'Deactivate Account'}
                  </button>
                </div>

                <div className="p-3.5 rounded-lg border border-[#ff0000]/30 bg-[#f4f4f4]">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-7 h-7 rounded-lg bg-[#ff0000]/10 flex items-center justify-center shrink-0">
                      <svg className="w-4 h-4 text-[#ff0000]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </div>
                    <h3 tabIndex="0" className="text-xs font-black uppercase tracking-wider text-[#ff0000] rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2C7FFF] focus-visible:ring-offset-2 w-fit">Delete Account</h3>
                  </div>
                  <p tabIndex="0" className="text-[11px] font-semibold text-[#03045E]/70 mb-3 leading-relaxed rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2C7FFF] focus-visible:ring-offset-2">Permanently erase your data. This cannot be undone.</p>
                  <button type="button" onClick={() => setShowDeleteModal(true)} aria-label="Delete Account" className="w-full px-4 py-2 bg-[#ff0000] text-white font-black text-xs rounded-lg hover:bg-[#cc0000] transition cursor-pointer shadow-sm">
                    Delete Account
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

      </div>

      {showDeleteModal && (
        <div
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="delete-modal-title"
          aria-describedby="delete-modal-desc"
          aria-live="assertive"
          tabIndex="-1"
          className="fixed inset-0 z-[9999999] flex items-center justify-center p-4 backdrop-blur-[1spx] animate-in fade-in transition-all duration-300"
          style={{ backgroundColor: (isContrast || isDarkMode) ? 'rgba(0, 0, 0, 0.75)' : 'rgba(72, 71, 71, 0.6)', filter: 'none' }}
        >
          <div
            ref={deleteModalRef}
            tabIndex={-1}
            className="bg-white rounded-xl sm:rounded-2xl w-full max-w-md p-5 sm:p-8 shadow-2xl border border-[#03045E]/10 flex flex-col gap-3 sm:gap-4 animate-fadeIn focus:outline-none"
          >
            <h3 id="delete-modal-title" tabIndex="0" className="text-lg sm:text-xl font-extrabold text-[#03045E] transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2C7FFF] focus-visible:ring-offset-2 rounded-lg p-1 -m-1 w-fit">Confirm Deletion</h3>
            <p id="delete-modal-desc" tabIndex="0" className="text-xs sm:text-sm font-medium text-[#03045E]/70 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2C7FFF] focus-visible:ring-offset-2 rounded-lg p-1 -m-1 w-fit">This will permanently delete your account, documents, and application history. Please enter your password to confirm.</p>
            
            {dangerStatus.msg && (
              <div
                role="alert"
                aria-live="assertive"
                className="p-2.5 sm:p-3 bg-[#f4f4f4] border border-[#03045E]/20 text-[#03045E] text-xs sm:text-sm font-bold rounded-md sm:rounded-lg"
              >
                {dangerStatus.msg}
              </div>
            )}

            <form onSubmit={handleDelete} aria-label="Delete account form" className="flex flex-col gap-3 sm:gap-4 mt-1 sm:mt-2">
              <div className="relative">
                <label htmlFor="delete-account-password" className="sr-only">Enter password to confirm account deletion</label>
                <input 
                  id="delete-account-password"
                  type={showDeletePassword ? "text" : "password"} 
                  value={deletePassword} 
                  onChange={(e) => setDeletePassword(e.target.value)} 
                  required 
                  placeholder="Enter password"
                  aria-label="Enter password to confirm account deletion"
                  className="w-full p-3 pr-10 sm:p-3.5 sm:pr-12 border border-[#03045E]/20 rounded-md sm:rounded-lg bg-[#f4f4f4] focus:border-[#2C7FFF] focus:bg-white outline-none transition text-[#03045E] font-medium text-xs sm:text-sm" 
                />
                <button
                  type="button"
                  onClick={() => setShowDeletePassword(!showDeletePassword)}
                  aria-label={showDeletePassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-[#03045E]/50 hover:text-[#2C7FFF] transition cursor-pointer"
                >
                  {showDeletePassword ? (
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                  ) : (
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"></path></svg>
                  )}
                </button>
              </div>
              
              <div className="flex gap-2 sm:gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(false)}
                  aria-label="Cancel account deletion"
                  className="flex-1 py-3 sm:py-3.5 bg-[#f4f4f4] border border-[#03045E]/15 text-[#03045E] font-extrabold text-xs sm:text-sm rounded-md sm:rounded-lg hover:bg-white transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  aria-label="Confirm Delete Account"
                  style={{ color: '#ffffff' }}
                  className={`flex-1 py-3 sm:py-3.5 font-extrabold text-xs sm:text-sm rounded-md sm:rounded-lg shadow-md transition cursor-pointer ${isDarkMode ? 'bg-black border-2 border-white' : 'bg-[#03045E] hover:bg-[#2C7FFF]'}`}
                >
                  Confirm Delete
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEmailSuccess && (
        <div
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="email-success-title"
          aria-describedby="email-success-desc"
          aria-live="assertive"
          tabIndex="-1"
          className="fixed inset-0 z-[9999999] flex items-center justify-center p-4 backdrop-blur-[1spx] animate-in fade-in transition-all duration-300"
          style={{ backgroundColor: 'rgba(72, 71, 71, 0.6)', filter: 'none' }}
        >
          <div
            ref={emailSuccessRef}
            tabIndex={-1}
            className="relative w-full max-w-sm rounded-xl sm:rounded-2xl border-2 overflow-hidden bg-[#F4F4F4] border-[#2C7FFF] focus:outline-none"
          >
            <div aria-hidden="true" className="h-2 w-full bg-[#2C7FFF]" />

            <div className="px-5 pt-8 pb-6 sm:px-8 sm:pt-10 sm:pb-8 flex flex-col items-center text-center">
              <div aria-hidden="true" className="relative mb-5 sm:mb-6">
                <div className="absolute inset-0 rounded-full bg-[#2C7FFF]/20 animate-ping" />
                <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#2C7FFF]/15 flex items-center justify-center">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#2C7FFF] flex items-center justify-center">
                    <svg className="w-6 h-6 sm:w-8 sm:h-8" style={{ color: isDarkMode ? '#000000' : '#ffffff' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
              </div>

              <span tabIndex="0" className="inline-block px-3 py-1 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-widest mb-2 sm:mb-3 border-2 text-[#03045E] bg-white border-[#2C7FFF] transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2C7FFF] focus-visible:ring-offset-2">
                Email Updated
              </span>

              <h2 id="email-success-title" tabIndex="0" className="text-xl sm:text-2xl font-black tracking-tight mb-2 text-[#03045E] transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2C7FFF] focus-visible:ring-offset-2 rounded-lg p-1 -m-1 w-fit">
                Email Successfully Updated!
              </h2>
              <p id="email-success-desc" tabIndex="0" className="text-xs sm:text-sm font-bold leading-relaxed mb-5 sm:mb-6 max-w-xs text-[#03045E]/80 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2C7FFF] focus-visible:ring-offset-2 rounded-lg p-1 -m-1 w-fit">
                Your new email address is now linked to your account. Use it the next time you log in.
              </p>

              <button
                type="button"
                aria-label="Got it, close email success confirmation"
                onClick={() => setShowEmailSuccess(false)}
                style={{ color: isDarkMode ? '#000000' : '#ffffff' }}
                className="w-full py-3 sm:py-3.5 rounded-lg sm:rounded-xl font-black text-xs sm:text-sm uppercase tracking-wider transition cursor-pointer border-2 bg-[#03045E] border-[#03045E] hover:bg-[#2C7FFF] hover:border-[#2C7FFF] focus:outline-none"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}

      {showPasswordSuccess && (
        <div
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="password-success-title"
          aria-describedby="password-success-desc"
          aria-live="assertive"
          tabIndex="-1"
          className="fixed inset-0 z-[9999999] flex items-center justify-center p-4 backdrop-blur-[1spx] animate-in fade-in transition-all duration-300"
          style={{ backgroundColor: (isContrast || isDarkMode) ? 'rgba(0, 0, 0, 0.75)' : 'rgba(72, 71, 71, 0.6)', filter: 'none' }}
        >
          <div
            ref={passwordSuccessRef}
            tabIndex={-1}
            className={`relative w-full max-w-sm rounded-xl sm:rounded-2xl shadow-2xl border-2 overflow-hidden animate-in zoom-in-95 duration-300 focus:outline-none ${isDarkScreen ? 'bg-black border-[#2C7FFF]' : 'bg-white border-[#2C7FFF]/30'}`}
          >
            {passwordProcessing ? (
              <div className="px-5 py-10 sm:px-8 sm:py-12 flex flex-col items-center text-center">
                <div aria-hidden="true" className="relative w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center mb-5 sm:mb-6">
                  <div className="absolute inset-0 rounded-full border-4 border-[#2C7FFF]/25 animate-pulse" />
                  <div className="absolute inset-0 rounded-full border-4 border-t-[#2C7FFF] border-r-transparent border-b-[#03045E] border-l-transparent animate-spin" />
                  <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-[#03045E] shadow-lg animate-ping opacity-70 absolute" />
                </div>
                <h2 id="password-success-title" tabIndex="0" className="text-lg sm:text-xl font-black text-[#03045E] tracking-tight mb-1.5 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2C7FFF] focus-visible:ring-offset-2 rounded-lg p-1 -m-1 w-fit">
                  Verifying Password
                </h2>
                <p id="password-success-desc" tabIndex="0" className="text-[11px] sm:text-xs font-bold text-[#03045E]/70 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2C7FFF] focus-visible:ring-offset-2 rounded-lg p-1 -m-1 w-fit">
                  Please wait while we secure your account...
                </p>
                <div aria-hidden="true" className="flex items-center gap-1.5 mt-4 sm:mt-5">
                  <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#2C7FFF] animate-bounce" />
                  <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#2C7FFF] animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#2C7FFF] animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            ) : (
              <div className="px-5 pt-8 pb-6 sm:px-8 sm:pt-10 sm:pb-8 flex flex-col items-center text-center">
                <div aria-hidden="true" className="relative mb-4 sm:mb-5">
                  <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center ${isDarkScreen ? 'bg-[#2C7FFF]/15' : 'bg-[#2C7FFF]/10'}`}>
                    <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center shadow-lg ${isDarkScreen ? 'bg-[#2C7FFF] shadow-[#2C7FFF]/40' : 'bg-[#2C7FFF] shadow-[#2C7FFF]/40'}`}>
                      <svg className="w-6 h-6 sm:w-8 sm:h-8" style={{ color: isDarkMode ? '#000000' : '#ffffff' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                </div>

                <h2 id="password-success-title" tabIndex="0" className={`text-xl sm:text-2xl font-black tracking-tight mb-2 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2C7FFF] focus-visible:ring-offset-2 rounded-lg p-1 -m-1 w-fit ${isDarkScreen ? 'text-white' : 'text-[#03045E]'}`}>
                  Password Updated!
                </h2>
                <p id="password-success-desc" tabIndex="0" className={`text-xs sm:text-sm font-semibold leading-relaxed mb-5 sm:mb-6 max-w-xs transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2C7FFF] focus-visible:ring-offset-2 rounded-lg p-1 -m-1 w-fit ${isDarkScreen ? 'text-white/70' : 'text-[#03045E]/70'}`}>
                  Your new password has been saved securely. Use it the next time you log in.
                </p>

                <button
                  type="button"
                  aria-label="Got it, close password updated confirmation"
                  onClick={() => setShowPasswordSuccess(false)}
                  style={{ color: isDarkMode ? '#000000' : '#ffffff' }}
                  className={`w-full py-3 sm:py-3.5 rounded-lg sm:rounded-xl bg-[#2C7FFF] font-black text-xs sm:text-sm uppercase tracking-wider shadow-md transition-all cursor-pointer focus:outline-none`}
                >
                  Got it
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {showDeactivateModal && (
        <div
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="deactivate-modal-title"
          aria-describedby="deactivate-modal-desc"
          aria-live="assertive"
          tabIndex="-1"
          className="fixed inset-0 z-[9999999] flex items-center justify-center p-4 backdrop-blur-[1spx] animate-in fade-in transition-all duration-300"
          style={{ backgroundColor: (isContrast || isDarkMode) ? 'rgba(0, 0, 0, 0.75)' : 'rgba(72, 71, 71, 0.6)', filter: 'none' }}
        >
          <div
            ref={deactivateModalRef}
            tabIndex={-1}
            className={`relative w-full max-w-sm rounded-xl sm:rounded-2xl shadow-2xl border-2 overflow-hidden animate-fadeIn focus:outline-none ${isColorVision ? 'bg-[#FEF3C7] border-[#B45309]' : 'bg-[#f4f4f4] border-[#2C7FFF]'}`}
          >
            <div aria-hidden="true" className={`h-2 w-full ${isColorVision ? 'bg-[#B45309]' : 'bg-[#2C7FFF]'}`} />

            {deactivateStage === 'confirm' && (
              <div className="px-5 pt-8 pb-6 sm:px-8 sm:pt-10 sm:pb-8 flex flex-col items-center text-center">
                <div aria-hidden="true" className="relative mb-5 sm:mb-6">
                  <div className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center ${isColorVision ? 'bg-[#B45309]/15' : 'bg-[#2C7FFF]/15'}`}>
                    <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center shadow-lg ${isColorVision ? 'bg-[#92400E] shadow-[#92400E]/40' : 'bg-[#03045E] shadow-[#03045E]/40'}`}>
                      {deactivateTargetState ? (
                        <svg className={`w-6 h-6 sm:w-7 sm:h-7 ${isColorVision ? 'text-[#FEF3C7]' : 'text-[#2c7fff]'}`} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                      ) : (
                        <svg className={`w-6 h-6 sm:w-7 sm:h-7 ${isColorVision ? 'text-[#FEF3C7]' : 'text-[#2c7fff]'}`} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                        </svg>
                      )}
                    </div>
                  </div>
                </div>

                <span tabIndex="0" className={`inline-block px-3 py-1 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-widest mb-2 sm:mb-3 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2C7FFF] focus-visible:ring-offset-2 ${isColorVision ? 'bg-[#B45309]/20 text-[#92400E]' : 'bg-[#2C7FFF]/15 text-[#2C7FFF]'}`}>
                  {deactivateTargetState ? 'Confirm Reactivation' : 'Confirm Deactivation'}
                </span>

                <h2 id="deactivate-modal-title" tabIndex="0" className={`text-xl sm:text-2xl font-black tracking-tight mb-2 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2C7FFF] focus-visible:ring-offset-2 rounded-lg p-1 -m-1 w-fit ${isColorVision ? 'text-[#92400E]' : 'text-[#03045E]'}`}>
                  {deactivateTargetState ? 'Reactivate Account?' : 'Deactivate Account?'}
                </h2>
                <p id="deactivate-modal-desc" tabIndex="0" className={`text-xs sm:text-sm font-semibold leading-relaxed mb-5 sm:mb-6 max-w-xs transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2C7FFF] focus-visible:ring-offset-2 rounded-lg p-1 -m-1 w-fit ${isColorVision ? 'text-[#B45309]/90' : 'text-[#2c7fff]/75'}`}>
                  {deactivateTargetState
                    ? 'Your profile will be visible to employers again and you can resume applying for jobs.'
                    : 'Your profile and applications will be temporarily hidden. You can reactivate anytime by logging back in.'}
                </p>

                <div className="flex gap-2 sm:gap-3 w-full">
                  <button
                    type="button"
                    aria-label="Cancel account status change"
                    onClick={() => setShowDeactivateModal(false)}
                    className={`flex-1 py-3 sm:py-3.5 rounded-lg sm:rounded-xl font-black text-xs sm:text-sm uppercase tracking-wider border-2 transition-all duration-300 cursor-pointer focus:outline-none ${isColorVision ? 'bg-[#FEF3C7] text-[#92400E] border-[#92400E]' : 'bg-[#f4f4f4] text-[#03045E] border-[#03045E]'}`}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    aria-label={deactivateTargetState ? 'Confirm reactivate account' : 'Confirm deactivate account'}
                    onClick={confirmToggleDeactivation}
                    className={`flex-1 py-3 sm:py-3.5 rounded-lg sm:rounded-xl font-black text-xs sm:text-sm uppercase tracking-wider shadow-md transition-all duration-300 cursor-pointer border-2 focus:outline-none ${isColorVision ? 'bg-[#B45309] border-[#B45309]' : 'bg-[#2C7FFF] border-[#2C7FFF]'}`}
                    style={{ color: '#ffffff' }}
                  >
                    {deactivateTargetState ? 'Reactivate' : 'Deactivate'}
                  </button>
                </div>
              </div>
            )}

            {deactivateStage === 'processing' && (
              <div className="px-5 py-10 sm:px-8 sm:py-12 flex flex-col items-center text-center">
                <div aria-hidden="true" className="relative w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center mb-5 sm:mb-6">
                  <div className={`absolute inset-0 rounded-full border-4 animate-pulse ${isColorVision ? 'border-[#B45309]/25' : 'border-[#2C7FFF]/25'}`} />
                  <div className={`absolute inset-0 rounded-full border-4 border-r-transparent border-l-transparent animate-spin ${isColorVision ? 'border-t-[#B45309] border-b-[#92400E]' : 'border-t-[#2C7FFF] border-b-[#03045E]'}`} />
                  <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full shadow-lg animate-ping opacity-70 absolute ${isColorVision ? 'bg-[#92400E]' : 'bg-[#03045E]'}`} />
                </div>
                <h2 id="deactivate-modal-title" tabIndex="0" className={`text-lg sm:text-xl font-black tracking-tight mb-1.5 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2C7FFF] focus-visible:ring-offset-2 rounded-lg p-1 -m-1 w-fit ${isColorVision ? 'text-[#92400E]' : 'text-[#03045E]'}`}>
                  {deactivateTargetState ? 'Reactivating Account' : 'Deactivating Account'}
                </h2>
                <p id="deactivate-modal-desc" tabIndex="0" className={`text-[11px] sm:text-xs font-bold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2C7FFF] focus-visible:ring-offset-2 rounded-lg p-1 -m-1 w-fit ${isColorVision ? 'text-[#92400E]/70' : 'text-[#03045E]/70'}`}>
                  Applying your account status change...
                </p>
                <div aria-hidden="true" className="flex items-center gap-1.5 mt-4 sm:mt-5">
                  <span className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full animate-bounce ${isColorVision ? 'bg-[#B45309]' : 'bg-[#2C7FFF]'}`} />
                  <span className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full animate-bounce ${isColorVision ? 'bg-[#B45309]' : 'bg-[#2C7FFF]'}`} style={{ animationDelay: '150ms' }} />
                  <span className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full animate-bounce ${isColorVision ? 'bg-[#B45309]' : 'bg-[#2C7FFF]'}`} style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}

            {deactivateStage === 'success' && (
              <div className="px-5 pt-8 pb-6 sm:px-8 sm:pt-10 sm:pb-8 flex flex-col items-center text-center">
                <div aria-hidden="true" className="relative mb-5 sm:mb-6">
                  <div className={`absolute inset-0 rounded-full animate-ping ${isColorVision ? 'bg-[#B45309]/20' : 'bg-[#2C7FFF]/20'}`} />
                  <div className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center ${isColorVision ? 'bg-[#B45309]/15' : 'bg-[#2C7FFF]/15'}`}>
                    <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center shadow-lg ${isColorVision ? 'bg-[#B45309] shadow-[#B45309]/40' : 'bg-[#2C7FFF] shadow-[#2C7FFF]/40'}`}>
                      <svg className="w-6 h-6 sm:w-8 sm:h-8" style={{ color: isDarkMode ? '#000000' : '#f4f4f4' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                </div>

                <span tabIndex="0" className={`inline-block px-3 py-1 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-widest mb-2 sm:mb-3 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2C7FFF] focus-visible:ring-offset-2 ${isColorVision ? 'bg-[#B45309]/20 text-[#92400E]' : 'bg-[#2C7FFF]/15 text-[#2C7FFF]'}`}>
                  Account Status Updated
                </span>

                <h2 id="deactivate-modal-title" tabIndex="0" className={`text-xl sm:text-2xl font-black tracking-tight mb-2 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2C7FFF] focus-visible:ring-offset-2 rounded-lg p-1 -m-1 w-fit ${isColorVision ? 'text-[#92400E]' : 'text-[#03045E]'}`}>
                  {deactivateTargetState ? 'Account Reactivated!' : 'Account Deactivated!'}
                </h2>
                <p id="deactivate-modal-desc" tabIndex="0" className={`text-xs sm:text-sm font-semibold leading-relaxed mb-5 sm:mb-6 max-w-xs transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2C7FFF] focus-visible:ring-offset-2 rounded-lg p-1 -m-1 w-fit ${isColorVision ? 'text-[#B45309]/90' : 'text-[#2c7fff]/75'}`}>
                  {deactivateTargetState
                    ? 'Your profile is now active. Welcome back and good luck with your job search!'
                    : 'Your profile is now hidden. Log back in anytime to reactivate your account.'}
                </p>

                <button
                  type="button"
                  aria-label="Got it, close account status confirmation"
                  onClick={() => setShowDeactivateModal(false)}
                  style={{ color: (isHighContrastOrDarkComfort || isColorVision) ? '#ffffff' : (isDarkMode ? '#000000' : '#03045E') }}
                  className={`w-full py-3 sm:py-3.5 rounded-lg sm:rounded-xl font-black text-xs sm:text-sm uppercase tracking-wider shadow-md transition-all duration-300 cursor-pointer border-2 focus:outline-none ${isColorVision ? 'bg-[#B45309] border-[#B45309]' : 'bg-white border-white'}`}
                >
                  Got it
                </button>
              </div>
            )}

            {deactivateStage === 'error' && (
              <div className="px-5 pt-8 pb-6 sm:px-8 sm:pt-10 sm:pb-8 flex flex-col items-center text-center">
                <div aria-hidden="true" className="relative mb-5 sm:mb-6">
                  <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center ${isColorVision ? 'bg-[#92400E]/15' : 'bg-[#03045E]/15'}`}>
                    <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center shadow-lg ${isColorVision ? 'bg-[#92400E]' : 'bg-[#03045E]'}`}>
                      <svg className="w-6 h-6 sm:w-8 sm:h-8 text-[#f4f4f4]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </div>
                  </div>
                </div>

                <span tabIndex="0" className={`inline-block px-3 py-1 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-widest mb-2 sm:mb-3 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2C7FFF] focus-visible:ring-offset-2 ${isColorVision ? 'bg-[#B45309]/20 text-[#92400E]' : 'bg-[#2C7FFF]/15 text-[#2C7FFF]'}`}>
                  Action Failed
                </span>

                <h2 id="deactivate-modal-title" tabIndex="0" className={`text-xl sm:text-2xl font-black tracking-tight mb-2 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2C7FFF] focus-visible:ring-offset-2 rounded-lg p-1 -m-1 w-fit ${isColorVision ? 'text-[#92400E]' : 'text-[#03045E]'}`}>
                  Something went wrong
                </h2>
                <p id="deactivate-modal-desc" tabIndex="0" className={`text-xs sm:text-sm font-semibold leading-relaxed mb-5 sm:mb-6 max-w-xs transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2C7FFF] focus-visible:ring-offset-2 rounded-lg p-1 -m-1 w-fit ${isColorVision ? 'text-[#92400E]/75' : 'text-[#03045E]/75'}`}>
                  We couldn't update your account status. Please try again in a moment.
                </p>

                <button
                  type="button"
                  aria-label="Close error dialog"
                  onClick={() => setShowDeactivateModal(false)}
                  style={{ color: isDarkMode ? '#000000' : '#ffffff' }}
                  className={`w-full py-3 sm:py-3.5 rounded-lg sm:rounded-xl font-black text-xs sm:text-sm uppercase tracking-wider shadow-md transition-all duration-300 cursor-pointer border-2 focus:outline-none ${isColorVision ? 'bg-[#B45309] border-[#B45309]' : 'bg-[#03045E] border-[#03045E]'}`}
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}