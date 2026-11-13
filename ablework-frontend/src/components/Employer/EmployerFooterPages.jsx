import React, { useContext, useState } from 'react';
import { AccessibilityContext } from '../../context/AccessibilityContext';
import { useColorPalette } from '../../context/ColorPaletteContext';
import FinalLogo from '../../assets/DARK MODE.png';
import LightLogo from '../../assets/LIGHT MODE.png';


export function EmployerPolicy({ onBack }) {
  const { mode } = useContext(AccessibilityContext);
  const isDarkMode = mode && typeof mode === 'string' && (mode.toLowerCase().includes('dark') || mode.toLowerCase().includes('comfort'));
  const isContrast = mode && typeof mode === 'string' && mode.toLowerCase().includes('contrast');
  const isDark = isDarkMode || isContrast;

  const [openSection, setOpenSection] = useState(null);
  const toggleSection = (id) => setOpenSection(openSection === id ? null : id);

  return (
    <main role="main" aria-label="Privacy Policy Screen" className="flex-grow w-full p-3 pt-6 sm:p-6 sm:pt-10 md:p-10 md:pt-14 animate-in fade-in duration-300">
      <h1 className={`text-2xl sm:text-4xl md:text-5xl font-black text-center mb-8 sm:mb-12 ${isContrast ? 'text-[var(--color-text)]' : 'text-[#03045E]'}`}>
        Privacy Policy
      </h1>

      <div className="w-full space-y-6 text-sm sm:text-base leading-relaxed">
        <div className="p-5 rounded-2xl bg-[#2C7FFF]/10 border border-[#2C7FFF]/30">
          <span className="text-xs font-extrabold text-[#2C7FFF] uppercase tracking-widest mb-2 block">Transparency & Commitment</span>
          <p className="text-[#03045E] font-semibold">
            ABLEWORK ("the Platform", "we", "us") is dedicated to safeguarding the privacy and data security of all users, specifically Persons with Disabilities (PWDs) and participating employers. This Privacy Policy outlines our practices regarding the collection, use, storage, and protection of personal data in compliance with the Republic Act No. 10173, otherwise known as the Data Privacy Act of 2012 (DPA) of the Philippines, and its Implementing Rules and Regulations (IRR).
          </p>
          <p className="text-[#03045E] font-semibold mt-3">
            By registering an account or accessing the platform, you acknowledge and consent to the data processing practices described herein.
          </p>
        </div>

        <div className="border border-[#03045E]/15 rounded-2xl overflow-hidden bg-white">
          <button onClick={() => toggleSection(1)} className="w-full flex items-center justify-between p-4 sm:p-5 hover:bg-[#f4f4f4] transition-colors">
            <h2 className="text-lg font-bold text-[#03045E] flex items-center gap-2 text-left">
              <span className="w-2 h-2 rounded-full bg-[#2C7FFF]"></span>
              1. Information We Collect
            </h2>
            <svg className={`w-5 h-5 text-[#03045E] shrink-0 transition-transform duration-300 ${openSection === 1 ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <div className={`grid transition-all duration-300 ease-in-out ${openSection === 1 ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
            <div className="overflow-hidden">
              <div className="p-4 sm:p-5 border-t border-[#03045E]/10 text-[#03045E]">
                <p className="font-medium mb-3">We collect only the personal information reasonably necessary to facilitate inclusive employment matching, account verification, and secure platform operations:</p>
                <div className="space-y-3 pl-4">
                  <div>
                    <p className="font-bold mb-1">For Applicants (Job Seekers):</p>
                    <ul className="space-y-2 pl-4">
                      <li className="font-medium flex gap-2"><span className="text-[#2C7FFF] font-black shrink-0">•</span><span><strong>Personal Identifiers:</strong> Full name, contact number, residential address, and email address.</span></li>
                      <li className="font-medium flex gap-2"><span className="text-[#2C7FFF] font-black shrink-0">•</span><span><strong>Sensitive Personal Information (SPI):</strong> Birthdate, specific disability type/classification, required workplace accommodations, and uploaded government-issued PWD identification cards.</span></li>
                      <li className="font-medium flex gap-2"><span className="text-[#2C7FFF] font-black shrink-0">•</span><span><strong>Professional Credentials:</strong> Educational background, skills, work preferences, and uploaded resumes/curriculum vitae.</span></li>
                      <li className="font-medium flex gap-2"><span className="text-[#2C7FFF] font-black shrink-0">•</span><span><strong>Location Data:</strong> Approximate geographical coordinates (latitude and longitude) and user-defined travel radius preferences (in kilometers).</span></li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-bold mb-1">For Employers:</p>
                    <ul className="space-y-2 pl-4">
                      <li className="font-medium flex gap-2"><span className="text-[#2C7FFF] font-black shrink-0">•</span><span><strong>Company & Representative Details:</strong> Company name, company description, industry classification, representative full name, business email, and contact number.</span></li>
                      <li className="font-medium flex gap-2"><span className="text-[#2C7FFF] font-black shrink-0">•</span><span><strong>Verification Records:</strong> Uploaded business registration documents (e.g., DTI, SEC registration, or Mayor's/Business Permit).</span></li>
                      <li className="font-medium flex gap-2"><span className="text-[#2C7FFF] font-black shrink-0">•</span><span><strong>Job Listing Data:</strong> Job vacancies, job descriptions, required skills, guaranteed workplace accommodations, and accepted disability types.</span></li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-bold mb-1">System & Technical Metadata (All Users):</p>
                    <p className="font-medium">Network Internet Protocol (IP) addresses, verification attempt logs, system security timestamps, accessibility settings (e.g., high-contrast theme, font scale), and in-app notification logs.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="border border-[#03045E]/15 rounded-2xl overflow-hidden bg-white">
          <button onClick={() => toggleSection(2)} className="w-full flex items-center justify-between p-4 sm:p-5 hover:bg-[#f4f4f4] transition-colors">
            <h2 className="text-lg font-bold text-[#03045E] flex items-center gap-2 text-left">
              <span className="w-2 h-2 rounded-full bg-[#2C7FFF]"></span>
              2. Legal Basis and Purpose of Processing
            </h2>
            <svg className={`w-5 h-5 text-[#03045E] shrink-0 transition-transform duration-300 ${openSection === 2 ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <div className={`grid transition-all duration-300 ease-in-out ${openSection === 2 ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
            <div className="overflow-hidden">
              <div className="p-4 sm:p-5 border-t border-[#03045E]/10 text-[#03045E]">
                <p className="font-medium mb-3">In accordance with Sections 12 and 13 of the Data Privacy Act of 2012, personal and sensitive personal information is collected and processed based on explicit user consent and legitimate operational interests for the following purposes:</p>
                <ul className="space-y-2 pl-4">
                  <li className="font-medium flex gap-2"><span className="text-[#2C7FFF] font-black shrink-0">•</span><span>Authenticating user credentials using cryptographic hashing (bcrypt).</span></li>
                  <li className="font-medium flex gap-2"><span className="text-[#2C7FFF] font-black shrink-0">•</span><span>Enforcing administrator document verification to maintain a verified, safe talent marketplace.</span></li>
                  <li className="font-medium flex gap-2"><span className="text-[#2C7FFF] font-black shrink-0">•</span><span>Powering the automated, rule-based Smart Matching Engine (evaluating skill alignments, accommodation guarantees, and Haversine distance calculations).</span></li>
                  <li className="font-medium flex gap-2"><span className="text-[#2C7FFF] font-black shrink-0">•</span><span>Enforcing system security protocols, such as cooldown intervals and network rate-limiting against fraudulent submissions.</span></li>
                  <li className="font-medium flex gap-2"><span className="text-[#2C7FFF] font-black shrink-0">•</span><span>Delivering transactional email notifications and One-Time Password (OTP) verifications via automated SMTP services.</span></li>
                  <li className="font-medium flex gap-2"><span className="text-[#2C7FFF] font-black shrink-0">•</span><span>Facilitating AI chatbot interactions through the ABBY assistant.</span></li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="border border-[#03045E]/15 rounded-2xl overflow-hidden bg-white">
          <button onClick={() => toggleSection(3)} className="w-full flex items-center justify-between p-4 sm:p-5 hover:bg-[#f4f4f4] transition-colors">
            <h2 className="text-lg font-bold text-[#03045E] flex items-center gap-2 text-left">
              <span className="w-2 h-2 rounded-full bg-[#2C7FFF]"></span>
              3. Processing of Sensitive Personal Information
            </h2>
            <svg className={`w-5 h-5 text-[#03045E] shrink-0 transition-transform duration-300 ${openSection === 3 ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <div className={`grid transition-all duration-300 ease-in-out ${openSection === 3 ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
            <div className="overflow-hidden">
              <div className="p-4 sm:p-5 border-t border-[#03045E]/10 text-[#03045E]">
                <p className="font-medium">Disability classifications and PWD ID documents are processed strictly to verify eligibility and ensure that matched workplaces meet necessary physical and sensory accommodations. PWD IDs and business verification files are stored in restricted server storage directories and are accessible exclusively to authorized system administrators for audit and approval purposes. Disability-related details are never sold, rented, or made visible to third-party advertising networks.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="border border-[#03045E]/15 rounded-2xl overflow-hidden bg-white">
          <button onClick={() => toggleSection(4)} className="w-full flex items-center justify-between p-4 sm:p-5 hover:bg-[#f4f4f4] transition-colors">
            <h2 className="text-lg font-bold text-[#03045E] flex items-center gap-2 text-left">
              <span className="w-2 h-2 rounded-full bg-[#2C7FFF]"></span>
              4. Artificial Intelligence & Third-Party Service Providers
            </h2>
            <svg className={`w-5 h-5 text-[#03045E] shrink-0 transition-transform duration-300 ${openSection === 4 ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <div className={`grid transition-all duration-300 ease-in-out ${openSection === 4 ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
            <div className="overflow-hidden">
              <div className="p-4 sm:p-5 border-t border-[#03045E]/10 text-[#03045E]">
                <p className="font-medium mb-3">To deliver modern web capabilities, ABLEWORK interfaces with selected third-party service providers under data protection principles:</p>
                <ul className="space-y-2 pl-4">
                  <li className="font-medium flex gap-2"><span className="text-[#2C7FFF] font-black shrink-0">•</span><span><strong>Google Gemini API:</strong> Powers the ABBY conversational assistant. Real-time account metadata (e.g., application count, current verification standing) is supplied contextually during active chat queries to provide dynamic help. No passwords, credentials, or official government documents are transmitted to the AI engine.</span></li>
                  <li className="font-medium flex gap-2"><span className="text-[#2C7FFF] font-black shrink-0">•</span><span><strong>Email Dispatch (Nodemailer / Google SMTP):</strong> Delivers automated system alerts, application updates, and security OTPs to user-registered email addresses.</span></li>
                  <li className="font-medium flex gap-2"><span className="text-[#2C7FFF] font-black shrink-0">•</span><span><strong>Mapping & Geolocation Services:</strong> Processes device-derived or user-selected coordinates to calculate distance scores relative to employer workplaces.</span></li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="border border-[#03045E]/15 rounded-2xl overflow-hidden bg-white">
          <button onClick={() => toggleSection(5)} className="w-full flex items-center justify-between p-4 sm:p-5 hover:bg-[#f4f4f4] transition-colors">
            <h2 className="text-lg font-bold text-[#03045E] flex items-center gap-2 text-left">
              <span className="w-2 h-2 rounded-full bg-[#2C7FFF]"></span>
              5. Data Access, Disclosure, and Visibility
            </h2>
            <svg className={`w-5 h-5 text-[#03045E] shrink-0 transition-transform duration-300 ${openSection === 5 ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <div className={`grid transition-all duration-300 ease-in-out ${openSection === 5 ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
            <div className="overflow-hidden">
              <div className="p-4 sm:p-5 border-t border-[#03045E]/10 text-[#03045E]">
                <ul className="space-y-2 pl-4">
                  <li className="font-medium flex gap-2"><span className="text-[#2C7FFF] font-black shrink-0">•</span><span><strong>Between Users:</strong> When an applicant applies for an active job vacancy, their profile details (name, contact number, resume, skills, and accommodation requests) become accessible to that specific employer.</span></li>
                  <li className="font-medium flex gap-2"><span className="text-[#2C7FFF] font-black shrink-0">•</span><span><strong>Administrative Access:</strong> System administrators have role-restricted access to user directories, verification documents, and audit logs to approve accounts and manage operational integrity.</span></li>
                  <li className="font-medium flex gap-2"><span className="text-[#2C7FFF] font-black shrink-0">•</span><span><strong>Legal Compliance:</strong> We do not disclose personal information to external parties unless legally mandated by a valid subpoena, court order, or regulatory authority under Philippine jurisdiction.</span></li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="border border-[#03045E]/15 rounded-2xl overflow-hidden bg-white">
          <button onClick={() => toggleSection(6)} className="w-full flex items-center justify-between p-4 sm:p-5 hover:bg-[#f4f4f4] transition-colors">
            <h2 className="text-lg font-bold text-[#03045E] flex items-center gap-2 text-left">
              <span className="w-2 h-2 rounded-full bg-[#2C7FFF]"></span>
              6. Data Storage, Security, and Protection Measures
            </h2>
            <svg className={`w-5 h-5 text-[#03045E] shrink-0 transition-transform duration-300 ${openSection === 6 ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <div className={`grid transition-all duration-300 ease-in-out ${openSection === 6 ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
            <div className="overflow-hidden">
              <div className="p-4 sm:p-5 border-t border-[#03045E]/10 text-[#03045E]">
                <p className="font-medium mb-3">ABLEWORK implements organizational, physical, and technical measures to protect stored data:</p>
                <ul className="space-y-2 pl-4">
                  <li className="font-medium flex gap-2"><span className="text-[#2C7FFF] font-black shrink-0">•</span><span><strong>Cryptographic Protection:</strong> Passwords are mathematically hashed with unique cryptographic salts using bcrypt before database storage.</span></li>
                  <li className="font-medium flex gap-2"><span className="text-[#2C7FFF] font-black shrink-0">•</span><span><strong>Header & Transport Security:</strong> HTTP security headers (Helmet) and Cross-Origin Resource Sharing (CORS) rules protect API communication channels.</span></li>
                  <li className="font-medium flex gap-2"><span className="text-[#2C7FFF] font-black shrink-0">•</span><span><strong>Access Segregation:</strong> Verification documents and candidate resumes are isolated within designated upload directories linked only to validated database records.</span></li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="border border-[#03045E]/15 rounded-2xl overflow-hidden bg-white">
          <button onClick={() => toggleSection(7)} className="w-full flex items-center justify-between p-4 sm:p-5 hover:bg-[#f4f4f4] transition-colors">
            <h2 className="text-lg font-bold text-[#03045E] flex items-center gap-2 text-left">
              <span className="w-2 h-2 rounded-full bg-[#2C7FFF]"></span>
              7. Data Retention and Account Deletion
            </h2>
            <svg className={`w-5 h-5 text-[#03045E] shrink-0 transition-transform duration-300 ${openSection === 7 ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <div className={`grid transition-all duration-300 ease-in-out ${openSection === 7 ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
            <div className="overflow-hidden">
              <div className="p-4 sm:p-5 border-t border-[#03045E]/10 text-[#03045E]">
                <ul className="space-y-2 pl-4">
                  <li className="font-medium flex gap-2"><span className="text-[#2C7FFF] font-black shrink-0">•</span><span>Personal data, application histories, and profile records are retained for the duration of the user's active participation on the platform.</span></li>
                  <li className="font-medium flex gap-2"><span className="text-[#2C7FFF] font-black shrink-0">•</span><span><strong>Account Deactivation:</strong> Users may deactivate their profile, rendering their account and job listings inactive (Disabled).</span></li>
                  <li className="font-medium flex gap-2"><span className="text-[#2C7FFF] font-black shrink-0">•</span><span><strong>Permanent Erasure:</strong> Users retain the right to request permanent account deletion via system settings. Account deletion permanently purges user profile records, application submissions, and authentication data from the production database upon password re-verification.</span></li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="border border-[#03045E]/15 rounded-2xl overflow-hidden bg-white">
          <button onClick={() => toggleSection(8)} className="w-full flex items-center justify-between p-4 sm:p-5 hover:bg-[#f4f4f4] transition-colors">
            <h2 className="text-lg font-bold text-[#03045E] flex items-center gap-2 text-left">
              <span className="w-2 h-2 rounded-full bg-[#2C7FFF]"></span>
              8. User Rights under Republic Act No. 10173
            </h2>
            <svg className={`w-5 h-5 text-[#03045E] shrink-0 transition-transform duration-300 ${openSection === 8 ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <div className={`grid transition-all duration-300 ease-in-out ${openSection === 8 ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
            <div className="overflow-hidden">
              <div className="p-4 sm:p-5 border-t border-[#03045E]/10 text-[#03045E]">
                <p className="font-medium mb-3">As a data subject under the Philippine Data Privacy Act of 2012, you are entitled to:</p>
                <ul className="space-y-2 pl-4">
                  <li className="font-medium flex gap-2"><span className="text-[#2C7FFF] font-black shrink-0">•</span><span><strong>Right to be Informed:</strong> The right to know how your personal and sensitive data is gathered, stored, and utilized.</span></li>
                  <li className="font-medium flex gap-2"><span className="text-[#2C7FFF] font-black shrink-0">•</span><span><strong>Right to Access:</strong> The right to review your registered data, job history, and application records.</span></li>
                  <li className="font-medium flex gap-2"><span className="text-[#2C7FFF] font-black shrink-0">•</span><span><strong>Right to Rectification:</strong> The right to update or correct inaccurate profile details and submit verification documents.</span></li>
                  <li className="font-medium flex gap-2"><span className="text-[#2C7FFF] font-black shrink-0">•</span><span><strong>Right to Erasure or Blocking:</strong> The right to deactivate or permanently delete your account records.</span></li>
                  <li className="font-medium flex gap-2"><span className="text-[#2C7FFF] font-black shrink-0">•</span><span><strong>Right to Damages:</strong> The right to seek indemnification for damages sustained due to inaccurate, incomplete, outdated, false, or unlawfully obtained personal data.</span></li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="border border-[#03045E]/15 rounded-2xl overflow-hidden bg-white">
          <button onClick={() => toggleSection(9)} className="w-full flex items-center justify-between p-4 sm:p-5 hover:bg-[#f4f4f4] transition-colors">
            <h2 className="text-lg font-bold text-[#03045E] flex items-center gap-2 text-left">
              <span className="w-2 h-2 rounded-full bg-[#2C7FFF]"></span>
              9. Changes to This Privacy Policy
            </h2>
            <svg className={`w-5 h-5 text-[#03045E] shrink-0 transition-transform duration-300 ${openSection === 9 ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <div className={`grid transition-all duration-300 ease-in-out ${openSection === 9 ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
            <div className="overflow-hidden">
              <div className="p-4 sm:p-5 border-t border-[#03045E]/10 text-[#03045E]">
                <p className="font-medium">ABLEWORK reserves the right to revise this Privacy Policy to accommodate system improvements, algorithmic enhancements, or updates in legal statutes. Updates will be reflected directly on the platform with an updated effective date.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="border border-[#03045E]/15 rounded-2xl overflow-hidden bg-white">
          <button onClick={() => toggleSection(10)} className="w-full flex items-center justify-between p-4 sm:p-5 hover:bg-[#f4f4f4] transition-colors">
            <h2 className="text-lg font-bold text-[#03045E] flex items-center gap-2 text-left">
              <span className="w-2 h-2 rounded-full bg-[#2C7FFF]"></span>
              10. Contact Information and Inquiries
            </h2>
            <svg className={`w-5 h-5 text-[#03045E] shrink-0 transition-transform duration-300 ${openSection === 10 ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <div className={`grid transition-all duration-300 ease-in-out ${openSection === 10 ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
            <div className="overflow-hidden">
              <div className="p-4 sm:p-5 border-t border-[#03045E]/10 text-[#03045E]">
                <p className="font-medium mb-3">For questions, data access requests, or privacy-related concerns regarding ABLEWORK, contact the project data custody team:</p>
                <ul className="space-y-2 pl-4">
                  <li className="font-medium flex gap-2"><span className="text-[#2C7FFF] font-black shrink-0">•</span><span><strong>Platform:</strong> ABLEWORK Capstone Project</span></li>
                  <li className="font-medium flex gap-2"><span className="text-[#2C7FFF] font-black shrink-0">•</span><span><strong>Data Custody Team / Proponents:</strong> Paquio, Loueala Jean H., Pagado, Jesie Marie D., Astodillo, Felicite S., Gonzales, John Greg A., Gamboa, John Bryan T.</span></li>
                  <li className="font-medium flex gap-2"><span className="text-[#2C7FFF] font-black shrink-0">•</span><span><strong>Institution:</strong> STIWNU</span></li>
                  <li className="font-medium flex gap-2"><span className="text-[#2C7FFF] font-black shrink-0">•</span><span><strong>Official Support Email:</strong> ableworksys5i@gmail.com</span></li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export function EmployerTerms({ onBack }) {
  const { mode } = useContext(AccessibilityContext);
  const isDarkMode = mode && typeof mode === 'string' && (mode.toLowerCase().includes('dark') || mode.toLowerCase().includes('comfort'));
  const isContrast = mode && typeof mode === 'string' && mode.toLowerCase().includes('contrast');
  const isDark = isDarkMode || isContrast;

  const [openSection, setOpenSection] = useState(null);
  const toggleSection = (id) => setOpenSection(openSection === id ? null : id);

  return (
    <main role="main" aria-label="Terms of Service Screen" className="flex-grow w-full p-3 pt-6 sm:p-6 sm:pt-10 md:p-10 md:pt-14 animate-in fade-in duration-300">
      <h1 className={`text-2xl sm:text-4xl md:text-5xl font-black text-center mb-8 sm:mb-12 ${isContrast ? 'text-[var(--color-text)]' : 'text-[#03045E]'}`}>
        Terms of Service
      </h1>

      <div className="w-full space-y-6 text-sm sm:text-base leading-relaxed">
        <div className="p-5 rounded-2xl bg-[#2C7FFF]/10 border border-[#2C7FFF]/30">
          <span className="text-xs font-extrabold text-[#2C7FFF] uppercase tracking-widest mb-2 block">Employer Guidelines</span>
          <p className="text-[#03045E] font-semibold">
            Welcome to ABLEWORK, a web-based employment assistance system designed to connect persons with disabilities (PWDs) with suitable employment opportunities and help employers manage job vacancies and applications. By accessing or using ABLEWORK, you agree to comply with these Terms and Conditions. If you do not agree with any part of these terms, please do not use the system.
          </p>
        </div>

        <div className="border border-[#03045E]/15 rounded-2xl overflow-hidden bg-white">
          <button onClick={() => toggleSection(1)} className="w-full flex items-center justify-between p-4 sm:p-5 hover:bg-[#f4f4f4] transition-colors">
            <h2 className="text-lg font-bold text-[#03045E] flex items-center gap-2 text-left">
              <span className="w-2 h-2 rounded-full bg-[#2C7FFF]"></span>
              1. Acceptance of Terms
            </h2>
            <svg className={`w-5 h-5 text-[#03045E] shrink-0 transition-transform duration-300 ${openSection === 1 ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <div className={`grid transition-all duration-300 ease-in-out ${openSection === 1 ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
            <div className="overflow-hidden">
              <div className="p-4 sm:p-5 border-t border-[#03045E]/10 text-[#03045E]">
                <p className="font-medium">By creating an account or using ABLEWORK, you confirm that you have read, understood, and agreed to these Terms and Conditions. These terms apply to all applicants, employers, and authorized administrators using the platform.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="border border-[#03045E]/15 rounded-2xl overflow-hidden bg-white">
          <button onClick={() => toggleSection(2)} className="w-full flex items-center justify-between p-4 sm:p-5 hover:bg-[#f4f4f4] transition-colors">
            <h2 className="text-lg font-bold text-[#03045E] flex items-center gap-2 text-left">
              <span className="w-2 h-2 rounded-full bg-[#2C7FFF]"></span>
              2. Eligibility and User Accounts
            </h2>
            <svg className={`w-5 h-5 text-[#03045E] shrink-0 transition-transform duration-300 ${openSection === 2 ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <div className={`grid transition-all duration-300 ease-in-out ${openSection === 2 ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
            <div className="overflow-hidden">
              <div className="p-4 sm:p-5 border-t border-[#03045E]/10 text-[#03045E]">
                <p className="font-medium">Applicants must provide accurate and truthful information during registration. Applicants should provide information relevant to their skills, qualifications, work preferences, and workplace accommodation needs. Employers must provide accurate company information and valid business or verification documents when required. Users are responsible for keeping their login credentials confidential. Each user should maintain only one account unless otherwise authorized by the system administrator. ABLEWORK reserves the right to suspend or disable accounts that contain false information, violate these terms, or pose a security risk.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="border border-[#03045E]/15 rounded-2xl overflow-hidden bg-white">
          <button onClick={() => toggleSection(3)} className="w-full flex items-center justify-between p-4 sm:p-5 hover:bg-[#f4f4f4] transition-colors">
            <h2 className="text-lg font-bold text-[#03045E] flex items-center gap-2 text-left">
              <span className="w-2 h-2 rounded-full bg-[#2C7FFF]"></span>
              3. Account Verification
            </h2>
            <svg className={`w-5 h-5 text-[#03045E] shrink-0 transition-transform duration-300 ${openSection === 3 ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <div className={`grid transition-all duration-300 ease-in-out ${openSection === 3 ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
            <div className="overflow-hidden">
              <div className="p-4 sm:p-5 border-t border-[#03045E]/10 text-[#03045E]">
                <p className="font-medium">ABLEWORK requires applicants and employers to submit specific documents for account verification. Applicants must submit a valid PWD ID, and Employers must submit valid business registration documents (e.g., DTI, SEC, or Business Permit). Submitted documents must be authentic and belong to the account holder or registered organization. Administrators may review submitted documents before approving an account. An account may remain restricted or pending until verification is completed. In the event a verification document is rejected by an administrator, the account will be subject to a mandatory 7-day security cooldown before a new document can be submitted. The system also actively monitors and limits repeated failed verification attempts to prevent abuse. Verification does not guarantee employment, hiring, or acceptance of any application.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="border border-[#03045E]/15 rounded-2xl overflow-hidden bg-white">
          <button onClick={() => toggleSection(4)} className="w-full flex items-center justify-between p-4 sm:p-5 hover:bg-[#f4f4f4] transition-colors">
            <h2 className="text-lg font-bold text-[#03045E] flex items-center gap-2 text-left">
              <span className="w-2 h-2 rounded-full bg-[#2C7FFF]"></span>
              4. Use of the System
            </h2>
            <svg className={`w-5 h-5 text-[#03045E] shrink-0 transition-transform duration-300 ${openSection === 4 ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <div className={`grid transition-all duration-300 ease-in-out ${openSection === 4 ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
            <div className="overflow-hidden">
              <div className="p-4 sm:p-5 border-t border-[#03045E]/10 text-[#03045E]">
                <p className="font-medium mb-3">Users agree to use ABLEWORK only for lawful employment-related purposes. Users must not:</p>
                <ul className="space-y-2 pl-4">
                  <li className="font-medium flex gap-2"><span className="text-[#2C7FFF] font-black shrink-0">•</span><span>Submit false, misleading, or fraudulent information.</span></li>
                  <li className="font-medium flex gap-2"><span className="text-[#2C7FFF] font-black shrink-0">•</span><span>Post fake, discriminatory, or misleading job vacancies.</span></li>
                  <li className="font-medium flex gap-2"><span className="text-[#2C7FFF] font-black shrink-0">•</span><span>Use the system to harass, threaten, or discriminate against other users.</span></li>
                  <li className="font-medium flex gap-2"><span className="text-[#2C7FFF] font-black shrink-0">•</span><span>Access another person's account without permission.</span></li>
                  <li className="font-medium flex gap-2"><span className="text-[#2C7FFF] font-black shrink-0">•</span><span>Attempt to damage, disrupt, or gain unauthorized access to the system.</span></li>
                  <li className="font-medium flex gap-2"><span className="text-[#2C7FFF] font-black shrink-0">•</span><span>Upload harmful files, malicious code, or inappropriate content.</span></li>
                  <li className="font-medium flex gap-2"><span className="text-[#2C7FFF] font-black shrink-0">•</span><span>Collect or misuse another user's personal information.</span></li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="border border-[#03045E]/15 rounded-2xl overflow-hidden bg-white">
          <button onClick={() => toggleSection(5)} className="w-full flex items-center justify-between p-4 sm:p-5 hover:bg-[#f4f4f4] transition-colors">
            <h2 className="text-lg font-bold text-[#03045E] flex items-center gap-2 text-left">
              <span className="w-2 h-2 rounded-full bg-[#2C7FFF]"></span>
              5. Job Listings and Applications
            </h2>
            <svg className={`w-5 h-5 text-[#03045E] shrink-0 transition-transform duration-300 ${openSection === 5 ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <div className={`grid transition-all duration-300 ease-in-out ${openSection === 5 ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
            <div className="overflow-hidden">
              <div className="p-4 sm:p-5 border-t border-[#03045E]/10 text-[#03045E]">
                <p className="font-medium">Employers are responsible for ensuring that their job postings are accurate, complete, and up to date. Applicants are responsible for reviewing job requirements before submitting an application. ABLEWORK provides employment assistance and job-matching services but does not guarantee that an applicant will be hired. Employers are responsible for their own recruitment process, interviews, and final hiring decisions. ABLEWORK does not guarantee the availability, legitimacy, or continued existence of every job opportunity unless it has been specifically verified by the system or its administrators. Applicants should independently verify important employment details before accepting a job offer.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="border border-[#03045E]/15 rounded-2xl overflow-hidden bg-white">
          <button onClick={() => toggleSection(6)} className="w-full flex items-center justify-between p-4 sm:p-5 hover:bg-[#f4f4f4] transition-colors">
            <h2 className="text-lg font-bold text-[#03045E] flex items-center gap-2 text-left">
              <span className="w-2 h-2 rounded-full bg-[#2C7FFF]"></span>
              6. Job Matching and Recommendations
            </h2>
            <svg className={`w-5 h-5 text-[#03045E] shrink-0 transition-transform duration-300 ${openSection === 6 ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <div className={`grid transition-all duration-300 ease-in-out ${openSection === 6 ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
            <div className="overflow-hidden">
              <div className="p-4 sm:p-5 border-t border-[#03045E]/10 text-[#03045E]">
                <p className="font-medium">ABLEWORK provides job recommendations based on information such as user profiles, skills, qualifications, preferences, workplace requirements, and location. Recommendations are intended to assist users in finding potentially suitable opportunities but are not guarantees of employment or suitability. The matching algorithm strictly enforces specific requirements. If an employer cannot provide an applicant's required workplace accommodations, or if an applicant falls outside the employer's designated travel radius, the system will intentionally hide the job posting from that applicant to ensure safe and viable employment. Users should review the complete job description and determine whether the opportunity meets their needs. Location-based recommendations may depend on the accuracy of the location information provided or permitted by the user.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="border border-[#03045E]/15 rounded-2xl overflow-hidden bg-white">
          <button onClick={() => toggleSection(7)} className="w-full flex items-center justify-between p-4 sm:p-5 hover:bg-[#f4f4f4] transition-colors">
            <h2 className="text-lg font-bold text-[#03045E] flex items-center gap-2 text-left">
              <span className="w-2 h-2 rounded-full bg-[#2C7FFF]"></span>
              7. Accessibility Features
            </h2>
            <svg className={`w-5 h-5 text-[#03045E] shrink-0 transition-transform duration-300 ${openSection === 7 ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <div className={`grid transition-all duration-300 ease-in-out ${openSection === 7 ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
            <div className="overflow-hidden">
              <div className="p-4 sm:p-5 border-t border-[#03045E]/10 text-[#03045E]">
                <p className="font-medium">ABLEWORK may provide accessibility features such as display themes, font-size adjustments, and color-blindness support. These features are intended to improve usability but may not meet every user's individual accessibility needs. Users are encouraged to report accessibility problems so the system can be improved.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="border border-[#03045E]/15 rounded-2xl overflow-hidden bg-white">
          <button onClick={() => toggleSection(8)} className="w-full flex items-center justify-between p-4 sm:p-5 hover:bg-[#f4f4f4] transition-colors">
            <h2 className="text-lg font-bold text-[#03045E] flex items-center gap-2 text-left">
              <span className="w-2 h-2 rounded-full bg-[#2C7FFF]"></span>
              8. Chatbot and Automated Assistance
            </h2>
            <svg className={`w-5 h-5 text-[#03045E] shrink-0 transition-transform duration-300 ${openSection === 8 ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <div className={`grid transition-all duration-300 ease-in-out ${openSection === 8 ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
            <div className="overflow-hidden">
              <div className="p-4 sm:p-5 border-t border-[#03045E]/10 text-[#03045E]">
                <p className="font-medium mb-3">ABLEWORK includes ABBY, a chatbot that provides guidance and assistance during the job-search and application process.</p>
                <ul className="space-y-2 pl-4">
                  <li className="font-medium flex gap-2"><span className="text-[#2C7FFF] font-black shrink-0">•</span><span>ABBY is powered by third-party Artificial Intelligence (Google Gemini). While the chatbot is configured to assist with platform navigation and job inquiries, AI-generated responses can occasionally be inaccurate. Users should not rely on ABBY for binding legal or employment agreements.</span></li>
                  <li className="font-medium flex gap-2"><span className="text-[#2C7FFF] font-black shrink-0">•</span><span>Chatbot responses are intended for general assistance and may not always be accurate or complete. Users should verify important employment, account, and application information through the appropriate source.</span></li>
                  <li className="font-medium flex gap-2"><span className="text-[#2C7FFF] font-black shrink-0">•</span><span>The chatbot does not make final hiring decisions.</span></li>
                  <li className="font-medium flex gap-2"><span className="text-[#2C7FFF] font-black shrink-0">•</span><span>Users should not share passwords, payment information, or other unnecessary sensitive information through the chatbot.</span></li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="border border-[#03045E]/15 rounded-2xl overflow-hidden bg-white">
          <button onClick={() => toggleSection(9)} className="w-full flex items-center justify-between p-4 sm:p-5 hover:bg-[#f4f4f4] transition-colors">
            <h2 className="text-lg font-bold text-[#03045E] flex items-center gap-2 text-left">
              <span className="w-2 h-2 rounded-full bg-[#2C7FFF]"></span>
              9. Location Services
            </h2>
            <svg className={`w-5 h-5 text-[#03045E] shrink-0 transition-transform duration-300 ${openSection === 9 ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <div className={`grid transition-all duration-300 ease-in-out ${openSection === 9 ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
            <div className="overflow-hidden">
              <div className="p-4 sm:p-5 border-t border-[#03045E]/10 text-[#03045E]">
                <p className="font-medium mb-3">If enabled, ABLEWORK uses location-related information to provide nearby job recommendations and location-based services.</p>
                <ul className="space-y-2 pl-4">
                  <li className="font-medium flex gap-2"><span className="text-[#2C7FFF] font-black shrink-0">•</span><span>Users may be asked to allow location access to utilize the Travel Radius feature, which filters job recommendations based on maximum geographical distance. This data is strictly used for the matching algorithm.</span></li>
                  <li className="font-medium flex gap-2"><span className="text-[#2C7FFF] font-black shrink-0">•</span><span>Location-based features may not function accurately if location access is disabled or unavailable.</span></li>
                  <li className="font-medium flex gap-2"><span className="text-[#2C7FFF] font-black shrink-0">•</span><span>Users should only enable location services when they are comfortable sharing the required location information.</span></li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="border border-[#03045E]/15 rounded-2xl overflow-hidden bg-white">
          <button onClick={() => toggleSection(10)} className="w-full flex items-center justify-between p-4 sm:p-5 hover:bg-[#f4f4f4] transition-colors">
            <h2 className="text-lg font-bold text-[#03045E] flex items-center gap-2 text-left">
              <span className="w-2 h-2 rounded-full bg-[#2C7FFF]"></span>
              10. Intellectual Property
            </h2>
            <svg className={`w-5 h-5 text-[#03045E] shrink-0 transition-transform duration-300 ${openSection === 10 ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <div className={`grid transition-all duration-300 ease-in-out ${openSection === 10 ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
            <div className="overflow-hidden">
              <div className="p-4 sm:p-5 border-t border-[#03045E]/10 text-[#03045E]">
                <p className="font-medium">The ABLEWORK name, system design, interface, content, and software components are owned by the project proponents or their respective rights holders, unless otherwise stated. Users may not copy, reproduce, modify, distribute, or commercially use the system or its materials without proper authorization.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="border border-[#03045E]/15 rounded-2xl overflow-hidden bg-white">
          <button onClick={() => toggleSection(11)} className="w-full flex items-center justify-between p-4 sm:p-5 hover:bg-[#f4f4f4] transition-colors">
            <h2 className="text-lg font-bold text-[#03045E] flex items-center gap-2 text-left">
              <span className="w-2 h-2 rounded-full bg-[#2C7FFF]"></span>
              11. System Availability and Limitations
            </h2>
            <svg className={`w-5 h-5 text-[#03045E] shrink-0 transition-transform duration-300 ${openSection === 11 ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <div className={`grid transition-all duration-300 ease-in-out ${openSection === 11 ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
            <div className="overflow-hidden">
              <div className="p-4 sm:p-5 border-t border-[#03045E]/10 text-[#03045E]">
                <p className="font-medium">ABLEWORK is provided as an employment assistance platform. The system may occasionally experience interruptions due to maintenance, technical issues, internet connectivity, or third-party services. The proponents do not guarantee that the system will always be available, error-free, or uninterrupted.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="border border-[#03045E]/15 rounded-2xl overflow-hidden bg-white">
          <button onClick={() => toggleSection(12)} className="w-full flex items-center justify-between p-4 sm:p-5 hover:bg-[#f4f4f4] transition-colors">
            <h2 className="text-lg font-bold text-[#03045E] flex items-center gap-2 text-left">
              <span className="w-2 h-2 rounded-full bg-[#2C7FFF]"></span>
              12. Account Suspension or Termination
            </h2>
            <svg className={`w-5 h-5 text-[#03045E] shrink-0 transition-transform duration-300 ${openSection === 12 ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <div className={`grid transition-all duration-300 ease-in-out ${openSection === 12 ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
            <div className="overflow-hidden">
              <div className="p-4 sm:p-5 border-t border-[#03045E]/10 text-[#03045E]">
                <p className="font-medium mb-3">ABLEWORK may suspend, restrict, or terminate an account if the user:</p>
                <ul className="space-y-2 pl-4">
                  <li className="font-medium flex gap-2"><span className="text-[#2C7FFF] font-black shrink-0">•</span><span>Violates these Terms and Conditions.</span></li>
                  <li className="font-medium flex gap-2"><span className="text-[#2C7FFF] font-black shrink-0">•</span><span>Provides false or fraudulent information.</span></li>
                  <li className="font-medium flex gap-2"><span className="text-[#2C7FFF] font-black shrink-0">•</span><span>Misuses personal data or system features.</span></li>
                  <li className="font-medium flex gap-2"><span className="text-[#2C7FFF] font-black shrink-0">•</span><span>Attempts unauthorized access.</span></li>
                  <li className="font-medium flex gap-2"><span className="text-[#2C7FFF] font-black shrink-0">•</span><span>Engages in harmful, abusive, or unlawful activities.</span></li>
                </ul>
                <p className="font-medium mt-3">Users may contact the system administrator regarding account concerns or requests for account review.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="border border-[#03045E]/15 rounded-2xl overflow-hidden bg-white">
          <button onClick={() => toggleSection(13)} className="w-full flex items-center justify-between p-4 sm:p-5 hover:bg-[#f4f4f4] transition-colors">
            <h2 className="text-lg font-bold text-[#03045E] flex items-center gap-2 text-left">
              <span className="w-2 h-2 rounded-full bg-[#2C7FFF]"></span>
              13. Changes to These Terms
            </h2>
            <svg className={`w-5 h-5 text-[#03045E] shrink-0 transition-transform duration-300 ${openSection === 13 ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <div className={`grid transition-all duration-300 ease-in-out ${openSection === 13 ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
            <div className="overflow-hidden">
              <div className="p-4 sm:p-5 border-t border-[#03045E]/10 text-[#03045E]">
                <p className="font-medium">ABLEWORK may update these Terms and Conditions when necessary to improve the system, address security concerns, or comply with applicable regulations and legal requirements. Continued use of the platform after such updates constitutes acceptance of the revised terms.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="border border-[#03045E]/15 rounded-2xl overflow-hidden bg-white">
          <button onClick={() => toggleSection(14)} className="w-full flex items-center justify-between p-4 sm:p-5 hover:bg-[#f4f4f4] transition-colors">
            <h2 className="text-lg font-bold text-[#03045E] flex items-center gap-2 text-left">
              <span className="w-2 h-2 rounded-full bg-[#2C7FFF]"></span>
              14. Contact Information
            </h2>
            <svg className={`w-5 h-5 text-[#03045E] shrink-0 transition-transform duration-300 ${openSection === 14 ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <div className={`grid transition-all duration-300 ease-in-out ${openSection === 14 ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
            <div className="overflow-hidden">
              <div className="p-4 sm:p-5 border-t border-[#03045E]/10 text-[#03045E]">
                <p className="font-medium mb-3">For questions, concerns, or reports regarding these Terms and Conditions, please contact:</p>
                <ul className="space-y-2 pl-4">
                  <li className="font-medium flex gap-2"><span className="text-[#2C7FFF] font-black shrink-0">•</span><span><strong>System Name:</strong> ABLEWORK</span></li>
                  <li className="font-medium flex gap-2"><span className="text-[#2C7FFF] font-black shrink-0">•</span><span><strong>Project Team:</strong> 5i</span></li>
                  <li className="font-medium flex gap-2"><span className="text-[#2C7FFF] font-black shrink-0">•</span><span><strong>Email:</strong> ableworksys5i@gmail.com</span></li>
                  <li className="font-medium flex gap-2"><span className="text-[#2C7FFF] font-black shrink-0">•</span><span><strong>Address:</strong> Burgos Street, Barangay Villamonte, Bacolod City, 6100 Negros Occidental, Philippines</span></li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export function EmployerContact({ onBack }) {
  const { mode } = useContext(AccessibilityContext);
  const isDarkMode = mode && typeof mode === 'string' && (mode.toLowerCase().includes('dark') || mode.toLowerCase().includes('comfort'));
  const isContrast = mode && typeof mode === 'string' && mode.toLowerCase().includes('contrast');
  const isDark = isDarkMode || isContrast;

  return (
      <main role="main" aria-label="Contact Us Screen" className="flex-grow w-full p-3 pt-6 sm:p-6 sm:pt-10 md:p-10 md:pt-14 animate-in fade-in duration-300">
      <h1 className={`text-2xl sm:text-4xl md:text-5xl font-black text-center mb-8 sm:mb-12 ${isContrast ? 'text-[var(--color-text)]' : 'text-[#03045E]'}`}>
        Contact Us
      </h1>

      <div className="grid md:grid-cols-2 gap-4 sm:gap-8">
        <div style={isDark ? { backgroundColor: 'transparent', borderColor: '#D1D5DB' } : {}} className="rounded-2xl sm:rounded-3xl shadow-xl border-2 backdrop-blur-sm bg-[var(--color-surface)]/50 text-[#03045E] border-white/40 p-5 sm:p-8">
          <h2 className="text-lg sm:text-2xl font-black mb-4 sm:mb-6">Get in Touch</h2>
          <div className="space-y-4 sm:space-y-6">
            <div>
              <h3 className="text-xs sm:text-base font-black">Email</h3>
              <p className="text-xs sm:text-base font-semibold">employers@ablework.com</p>
            </div>
            <div>
              <h3 className="text-xs sm:text-base font-black">Partner Helpline</h3>
              <p className="text-xs sm:text-base font-semibold">+1 (800) 555-ABLE</p>
            </div>
            <div>
              <h3 className="text-xs sm:text-base font-black">Hours</h3>
              <p className="text-xs sm:text-base font-semibold">Monday – Friday, 9:00 AM – 6:00 PM EST</p>
            </div>
            <div>
              <h3 className="text-xs sm:text-base font-black">Address</h3>
              <p className="text-xs sm:text-base font-semibold">Burgos Street, Barangay Villamonte, Bacolod City, 6100 Negros Occidental, Philippines</p>
            </div>
          </div>
        </div>

        <div style={isDark ? { backgroundColor: 'transparent', borderColor: '#D1D5DB' } : {}} className="rounded-2xl sm:rounded-3xl shadow-xl border-2 backdrop-blur-sm bg-[var(--color-surface)]/50 text-[#03045E] border-white/40 p-5 sm:p-8">
          <h2 className="text-lg sm:text-2xl font-black mb-4 sm:mb-6">Send Us a Message</h2>
          <form className="space-y-3 sm:space-y-4" onSubmit={(e) => e.preventDefault()}>
            <div>
              <label htmlFor="emp-contact-name" className="sr-only">Your Name</label>
              <input
                id="emp-contact-name"
                type="text"
                placeholder="Your Name"
                aria-label="Your Name"
                className={`w-full p-2.5 sm:p-3 bg-transparent border-2 rounded-xl text-xs sm:text-sm font-semibold focus:outline-none focus:border-[var(--color-accent)] ${
                  isContrast ? 'border-[var(--color-border)] text-[var(--color-text)]' : 'border-[#03045E]/30 text-[#03045E] placeholder-[#03045E]/70'
                }`}
              />
            </div>
            <div>
              <label htmlFor="emp-contact-email" className="sr-only">Your Email</label>
              <input
                id="emp-contact-email"
                type="email"
                placeholder="Your Email"
                aria-label="Your Email"
                className={`w-full p-2.5 sm:p-3 bg-transparent border-2 rounded-xl text-xs sm:text-sm font-semibold focus:outline-none focus:border-[var(--color-accent)] ${
                  isContrast ? 'border-[var(--color-border)] text-[var(--color-text)]' : 'border-[#03045E]/30 text-[#03045E] placeholder-[#03045E]/70'
                }`}
              />
            </div>
            <div>
              <label htmlFor="emp-contact-message" className="sr-only">Your Message</label>
              <textarea
                id="emp-contact-message"
                rows="5"
                placeholder="Your Message"
                aria-label="Your Message"
                className={`w-full p-2.5 sm:p-3 bg-transparent border-2 rounded-xl text-xs sm:text-sm font-semibold focus:outline-none focus:border-[var(--color-accent)] ${
                  isContrast ? 'border-[var(--color-border)] text-[var(--color-text)]' : 'border-[#03045E]/30 text-[#03045E] placeholder-[#03045E]/70'
                }`}
              />
            </div>
            <button
              type="button"
              className={`w-full py-2.5 sm:py-3 rounded-full font-bold transition border-2 hover:brightness-125 text-xs sm:text-sm ${
                isContrast
                  ? 'bg-[var(--color-surface)]/50 text-[var(--color-text)] border-[var(--color-surface)] hover:text-[var(--color-background)] hover:border-[var(--color-accent)]'
                  : 'bg-[#03045E] text-[#f4f4f4] border-[#03045E] hover:text-[#f4f4f4] hover:border-[#2C7FFF]'
              }`}
            >
              Send Message
            </button>
          </form>
        </div>
      </div>
       </main>
  );
}

export function EmployerFooter({ activeTab, setActiveTab }) {
  const { mode } = useContext(AccessibilityContext);
  const { paletteKey } = useColorPalette();
  const isDarkActive = mode && typeof mode === 'string' && mode.toLowerCase().includes('dark');
  const useLightLogo = (paletteKey === 'highContrast' || paletteKey === 'darkComfort') && !isDarkActive;

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="w-full bg-[#03045E] text-white mt-auto z-10 relative border-t-2 border-white/20">
          <div className="w-full px-3 sm:px-6 md:px-10 py-8 sm:py-16">
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-12 mb-8 sm:mb-12">
          <div className="space-y-2 sm:space-y-4 col-span-2 md:col-span-2 lg:col-span-1">
            <div className="h-10 sm:h-14 flex items-center">
              <img
                src={useLightLogo ? LightLogo : FinalLogo}
                alt="AbleWork Logo"
                className="h-10 sm:h-14 w-auto object-contain"
              />
            </div>
            <p className="text-[10px] sm:text-sm font-semibold leading-relaxed text-white/90">
              A web-based employment assistance system designed to connect persons with disabilities with suitable employment opportunities and help employers manage job vacancies and applications.
            </p>
          </div>

          <div className="space-y-2 sm:space-y-4">
            <h4 className="text-[10px] sm:text-sm font-black uppercase tracking-widest text-white">Fast Links</h4>
            <ul className="space-y-1.5 sm:space-y-3">
              <li>
                <button onClick={() => handleTabClick('employer-policy')} className="text-[10px] sm:text-sm font-bold text-white/90 hover:text-white transition-colors cursor-pointer">
                  Privacy Policy
                </button>
              </li>
              <li>
                <button onClick={() => handleTabClick('employer-terms')} className="text-[10px] sm:text-sm font-bold text-white/90 hover:text-white transition-colors cursor-pointer">
                  Terms & Conditions
                </button>
              </li>
              <li>
                <button onClick={() => handleTabClick('employer-contact')} className="text-[10px] sm:text-sm font-bold text-white/90 hover:text-white transition-colors cursor-pointer">
                  Help & Support
                </button>
              </li>
            </ul>
          </div>

          <div className="space-y-2 sm:space-y-4">
            <h4 className="text-[10px] sm:text-sm font-black uppercase tracking-widest text-white">System Status</h4>
            <ul className="space-y-1.5 sm:space-y-3">
              <li className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-sm font-bold text-white/90">
                <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full animate-pulse" style={{ backgroundColor: '#22c55e' }} />
                Platform Core: Online
              </li>
              <li className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-sm font-bold text-white/90">
                <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full animate-pulse" style={{ backgroundColor: '#22c55e' }} />
                Smart Matching: Active
              </li>
              <li className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-sm font-bold text-white/90">
                <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full animate-pulse" style={{ backgroundColor: '#ffffff' }} />
                ABBY Assistant: Ready
              </li>
            </ul>
          </div>

                 <section
            role="region"
            aria-label="Contact information"
            className="space-y-2 sm:space-y-4 col-span-2 md:col-span-1 min-w-0"
          >
            <h4 className="text-[10px] sm:text-sm font-black uppercase tracking-widest text-white">Contact Info</h4>
            <ul role="list" className="space-y-1.5 sm:space-y-3 w-full min-w-0">
              <li role="listitem" aria-label="Address: Burgos Street, Barangay Villamonte, Bacolod City, 6100 Negros Occidental, Philippines" tabIndex="0" className="flex items-start gap-2 sm:gap-3 text-[10px] sm:text-sm font-bold text-white/90 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2C7FFF] focus-visible:ring-offset-2 focus-visible:ring-offset-[#03045E] w-full min-w-0">
                <svg aria-hidden="true" className="w-3 h-3 sm:w-4 sm:h-4 text-white shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="flex-1 min-w-0 break-words leading-tight sm:leading-normal">Burgos Street, Barangay Villamonte, Bacolod City, 6100 Negros Occidental, Philippines</span>
              </li>

              <li role="listitem" aria-label="Email: ableworksys5i@gmail.com" tabIndex="0" className="flex items-center gap-2 sm:gap-3 text-[10px] sm:text-sm font-bold text-white/90 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2C7FFF] focus-visible:ring-offset-2 focus-visible:ring-offset-[#03045E] w-full min-w-0">
                <svg aria-hidden="true" className="w-3 h-3 sm:w-4 sm:h-4 text-white shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span className="flex-1 min-w-0 break-all leading-tight sm:leading-normal">ableworksys5i@gmail.com</span>
              </li>

              <li role="listitem" aria-label="Phone: +63 900 000 0000" tabIndex="0" className="flex items-center gap-2 sm:gap-3 text-[10px] sm:text-sm font-bold text-white/90 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2C7FFF] focus-visible:ring-offset-2 focus-visible:ring-offset-[#03045E] w-full min-w-0">
                <svg aria-hidden="true" className="w-3 h-3 sm:w-4 sm:h-4 text-white shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span className="flex-1 min-w-0 break-words leading-tight sm:leading-normal">+63 900 000 0000</span>
              </li>
                     </ul>
          </section>
        </div>

        <div className="flex flex-col items-center justify-center gap-3 sm:gap-4 pt-5 sm:pt-8 border-t border-white/30">
          <p className="text-[9px] sm:text-xs font-bold text-white/80 text-center">
            &copy; {new Date().getFullYear()} ABLEWORK Capstone Project. All rights reserved.
          </p>
          <button
            onClick={() => handleTabClick('employer-contact')}
            className="w-auto px-3 py-1.5 sm:px-6 sm:py-2.5 bg-white text-[#03045E] font-black text-[9px] sm:text-sm rounded-lg sm:rounded-xl hover:opacity-90 transition-colors cursor-pointer flex items-center justify-center gap-1 sm:gap-2"
          >
            <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            Contact Support
          </button>
        </div>
      </div>
    </footer>
  );
}


function ApplicantPageLayout({ title, subtitle, children, onBack }) {
  const { mode } = useContext(AccessibilityContext);
  const isDarkMode = mode && typeof mode === 'string' && (mode.toLowerCase().includes('dark') || mode.toLowerCase().includes('comfort'));
  const isContrast = mode && typeof mode === 'string' && mode.toLowerCase().includes('contrast');
  const isDark = isDarkMode || isContrast;

  return (
    <main role="main" aria-label={`${title} Screen`} className="flex-grow w-full p-3 pt-6 sm:p-6 sm:pt-10 md:p-10 md:pt-14 space-y-6 animate-in fade-in duration-300">

      <h1 className={`text-2xl sm:text-4xl md:text-5xl font-black text-center mb-8 sm:mb-12 ${isContrast ? 'text-[var(--color-text)]' : 'text-[#03045E]'}`}>
        {title}
      </h1>

      <div style={isDark ? { backgroundColor: 'transparent', borderColor: '#D1D5DB' } : {}} className="bg-transparent rounded-3xl border border-[#D1D5DB] shadow-[0_4px_20px_rgba(3,4,94,0.03)] p-6 sm:p-10 text-[var(--color-text,#03045E)]">
        {children}
      </div>
      </main>
  );
}


export function ApplicantPolicy({ onBack }) {
  const [openSection, setOpenSection] = useState(null);
  const toggleSection = (id) => setOpenSection(openSection === id ? null : id);

  return (
    <ApplicantPageLayout
      title="Privacy Policy"
      subtitle="How AbleWork protects and handles your candidate information"
      onBack={onBack}
    >
      <div className="space-y-6 text-sm sm:text-base leading-relaxed">
        <div className="p-5 rounded-2xl bg-[#2C7FFF]/10 border border-[#2C7FFF]/30">
          <p className="text-xs font-extrabold text-[#2C7FFF] uppercase tracking-widest mb-2">Effective Date: [Insert Date]</p>
          <p className="text-[#03045E] font-semibold">
            ABLEWORK ("the Platform", "we", "us") is dedicated to safeguarding the privacy and data security of all users, specifically Persons with Disabilities (PWDs) and participating employers. This Privacy Policy outlines our practices regarding the collection, use, storage, and protection of personal data in compliance with the Republic Act No. 10173, otherwise known as the Data Privacy Act of 2012 (DPA) of the Philippines, and its Implementing Rules and Regulations (IRR).
          </p>
          <p className="text-[#03045E] font-semibold mt-3">
            By registering an account or accessing the platform, you acknowledge and consent to the data processing practices described herein.
          </p>
        </div>

        <div className="border border-[#03045E]/15 rounded-2xl overflow-hidden bg-white">
          <button onClick={() => toggleSection(1)} className="w-full flex items-center justify-between p-4 sm:p-5 hover:bg-[#f4f4f4] transition-colors">
            <h2 className="text-lg font-bold text-[#03045E] flex items-center gap-2 text-left">
              <span className="w-2 h-2 rounded-full bg-[#2C7FFF]"></span>
              1. Information We Collect
            </h2>
            <svg className={`w-5 h-5 text-[#03045E] shrink-0 transition-transform duration-300 ${openSection === 1 ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <div className={`grid transition-all duration-300 ease-in-out ${openSection === 1 ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
            <div className="overflow-hidden">
              <div className="p-4 sm:p-5 border-t border-[#03045E]/10 text-[#03045E]">
                <p className="font-medium mb-3">We collect only the personal information reasonably necessary to facilitate inclusive employment matching, account verification, and secure platform operations:</p>
                <div className="space-y-3 pl-4">
                  <div>
                    <p className="font-bold mb-1">For Applicants (Job Seekers):</p>
                    <ul className="space-y-2 pl-4">
                      <li className="font-medium flex gap-2"><span className="text-[#2C7FFF] font-black shrink-0">•</span><span><strong>Personal Identifiers:</strong> Full name, contact number, residential address, and email address.</span></li>
                      <li className="font-medium flex gap-2"><span className="text-[#2C7FFF] font-black shrink-0">•</span><span><strong>Sensitive Personal Information (SPI):</strong> Birthdate, specific disability type/classification, required workplace accommodations, and uploaded government-issued PWD identification cards.</span></li>
                      <li className="font-medium flex gap-2"><span className="text-[#2C7FFF] font-black shrink-0">•</span><span><strong>Professional Credentials:</strong> Educational background, skills, work preferences, and uploaded resumes/curriculum vitae.</span></li>
                      <li className="font-medium flex gap-2"><span className="text-[#2C7FFF] font-black shrink-0">•</span><span><strong>Location Data:</strong> Approximate geographical coordinates (latitude and longitude) and user-defined travel radius preferences (in kilometers).</span></li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-bold mb-1">For Employers:</p>
                    <ul className="space-y-2 pl-4">
                      <li className="font-medium flex gap-2"><span className="text-[#2C7FFF] font-black shrink-0">•</span><span><strong>Company & Representative Details:</strong> Company name, company description, industry classification, representative full name, business email, and contact number.</span></li>
                      <li className="font-medium flex gap-2"><span className="text-[#2C7FFF] font-black shrink-0">•</span><span><strong>Verification Records:</strong> Uploaded business registration documents (e.g., DTI, SEC registration, or Mayor's/Business Permit).</span></li>
                      <li className="font-medium flex gap-2"><span className="text-[#2C7FFF] font-black shrink-0">•</span><span><strong>Job Listing Data:</strong> Job vacancies, job descriptions, required skills, guaranteed workplace accommodations, and accepted disability types.</span></li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-bold mb-1">System & Technical Metadata (All Users):</p>
                    <p className="font-medium">Network Internet Protocol (IP) addresses, verification attempt logs, system security timestamps, accessibility settings (e.g., high-contrast theme, font scale), and in-app notification logs.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="border border-[#03045E]/15 rounded-2xl overflow-hidden bg-white">
          <button onClick={() => toggleSection(2)} className="w-full flex items-center justify-between p-4 sm:p-5 hover:bg-[#f4f4f4] transition-colors">
            <h2 className="text-lg font-bold text-[#03045E] flex items-center gap-2 text-left">
              <span className="w-2 h-2 rounded-full bg-[#2C7FFF]"></span>
              2. Legal Basis and Purpose of Processing
            </h2>
            <svg className={`w-5 h-5 text-[#03045E] shrink-0 transition-transform duration-300 ${openSection === 2 ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <div className={`grid transition-all duration-300 ease-in-out ${openSection === 2 ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
            <div className="overflow-hidden">
              <div className="p-4 sm:p-5 border-t border-[#03045E]/10 text-[#03045E]">
                <p className="font-medium mb-3">In accordance with Sections 12 and 13 of the Data Privacy Act of 2012, personal and sensitive personal information is collected and processed based on explicit user consent and legitimate operational interests for the following purposes:</p>
                <ul className="space-y-2 pl-4">
                  <li className="font-medium flex gap-2"><span className="text-[#2C7FFF] font-black shrink-0">•</span><span>Authenticating user credentials using cryptographic hashing (bcrypt).</span></li>
                  <li className="font-medium flex gap-2"><span className="text-[#2C7FFF] font-black shrink-0">•</span><span>Enforcing administrator document verification to maintain a verified, safe talent marketplace.</span></li>
                  <li className="font-medium flex gap-2"><span className="text-[#2C7FFF] font-black shrink-0">•</span><span>Powering the automated, rule-based Smart Matching Engine (evaluating skill alignments, accommodation guarantees, and Haversine distance calculations).</span></li>
                  <li className="font-medium flex gap-2"><span className="text-[#2C7FFF] font-black shrink-0">•</span><span>Enforcing system security protocols, such as cooldown intervals and network rate-limiting against fraudulent submissions.</span></li>
                  <li className="font-medium flex gap-2"><span className="text-[#2C7FFF] font-black shrink-0">•</span><span>Delivering transactional email notifications and One-Time Password (OTP) verifications via automated SMTP services.</span></li>
                  <li className="font-medium flex gap-2"><span className="text-[#2C7FFF] font-black shrink-0">•</span><span>Facilitating AI chatbot interactions through the ABBY assistant.</span></li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="border border-[#03045E]/15 rounded-2xl overflow-hidden bg-white">
          <button onClick={() => toggleSection(3)} className="w-full flex items-center justify-between p-4 sm:p-5 hover:bg-[#f4f4f4] transition-colors">
            <h2 className="text-lg font-bold text-[#03045E] flex items-center gap-2 text-left">
              <span className="w-2 h-2 rounded-full bg-[#2C7FFF]"></span>
              3. Processing of Sensitive Personal Information
            </h2>
            <svg className={`w-5 h-5 text-[#03045E] shrink-0 transition-transform duration-300 ${openSection === 3 ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <div className={`grid transition-all duration-300 ease-in-out ${openSection === 3 ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
            <div className="overflow-hidden">
              <div className="p-4 sm:p-5 border-t border-[#03045E]/10 text-[#03045E]">
                <p className="font-medium">Disability classifications and PWD ID documents are processed strictly to verify eligibility and ensure that matched workplaces meet necessary physical and sensory accommodations. PWD IDs and business verification files are stored in restricted server storage directories and are accessible exclusively to authorized system administrators for audit and approval purposes. Disability-related details are never sold, rented, or made visible to third-party advertising networks.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="border border-[#03045E]/15 rounded-2xl overflow-hidden bg-white">
          <button onClick={() => toggleSection(4)} className="w-full flex items-center justify-between p-4 sm:p-5 hover:bg-[#f4f4f4] transition-colors">
            <h2 className="text-lg font-bold text-[#03045E] flex items-center gap-2 text-left">
              <span className="w-2 h-2 rounded-full bg-[#2C7FFF]"></span>
              4. Artificial Intelligence & Third-Party Service Providers
            </h2>
            <svg className={`w-5 h-5 text-[#03045E] shrink-0 transition-transform duration-300 ${openSection === 4 ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <div className={`grid transition-all duration-300 ease-in-out ${openSection === 4 ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
            <div className="overflow-hidden">
              <div className="p-4 sm:p-5 border-t border-[#03045E]/10 text-[#03045E]">
                <p className="font-medium mb-3">To deliver modern web capabilities, ABLEWORK interfaces with selected third-party service providers under data protection principles:</p>
                <ul className="space-y-2 pl-4">
                  <li className="font-medium flex gap-2"><span className="text-[#2C7FFF] font-black shrink-0">•</span><span><strong>Google Gemini API:</strong> Powers the ABBY conversational assistant. Real-time account metadata (e.g., application count, current verification standing) is supplied contextually during active chat queries to provide dynamic help. No passwords, credentials, or official government documents are transmitted to the AI engine.</span></li>
                  <li className="font-medium flex gap-2"><span className="text-[#2C7FFF] font-black shrink-0">•</span><span><strong>Email Dispatch (Nodemailer / Google SMTP):</strong> Delivers automated system alerts, application updates, and security OTPs to user-registered email addresses.</span></li>
                  <li className="font-medium flex gap-2"><span className="text-[#2C7FFF] font-black shrink-0">•</span><span><strong>Mapping & Geolocation Services:</strong> Processes device-derived or user-selected coordinates to calculate distance scores relative to employer workplaces.</span></li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="border border-[#03045E]/15 rounded-2xl overflow-hidden bg-white">
          <button onClick={() => toggleSection(5)} className="w-full flex items-center justify-between p-4 sm:p-5 hover:bg-[#f4f4f4] transition-colors">
            <h2 className="text-lg font-bold text-[#03045E] flex items-center gap-2 text-left">
              <span className="w-2 h-2 rounded-full bg-[#2C7FFF]"></span>
              5. Data Access, Disclosure, and Visibility
            </h2>
            <svg className={`w-5 h-5 text-[#03045E] shrink-0 transition-transform duration-300 ${openSection === 5 ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <div className={`grid transition-all duration-300 ease-in-out ${openSection === 5 ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
            <div className="overflow-hidden">
              <div className="p-4 sm:p-5 border-t border-[#03045E]/10 text-[#03045E]">
                <ul className="space-y-2 pl-4">
                  <li className="font-medium flex gap-2"><span className="text-[#2C7FFF] font-black shrink-0">•</span><span><strong>Between Users:</strong> When an applicant applies for an active job vacancy, their profile details (name, contact number, resume, skills, and accommodation requests) become accessible to that specific employer.</span></li>
                  <li className="font-medium flex gap-2"><span className="text-[#2C7FFF] font-black shrink-0">•</span><span><strong>Administrative Access:</strong> System administrators have role-restricted access to user directories, verification documents, and audit logs to approve accounts and manage operational integrity.</span></li>
                  <li className="font-medium flex gap-2"><span className="text-[#2C7FFF] font-black shrink-0">•</span><span><strong>Legal Compliance:</strong> We do not disclose personal information to external parties unless legally mandated by a valid subpoena, court order, or regulatory authority under Philippine jurisdiction.</span></li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="border border-[#03045E]/15 rounded-2xl overflow-hidden bg-white">
          <button onClick={() => toggleSection(6)} className="w-full flex items-center justify-between p-4 sm:p-5 hover:bg-[#f4f4f4] transition-colors">
            <h2 className="text-lg font-bold text-[#03045E] flex items-center gap-2 text-left">
              <span className="w-2 h-2 rounded-full bg-[#2C7FFF]"></span>
              6. Data Storage, Security, and Protection Measures
            </h2>
            <svg className={`w-5 h-5 text-[#03045E] shrink-0 transition-transform duration-300 ${openSection === 6 ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <div className={`grid transition-all duration-300 ease-in-out ${openSection === 6 ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
            <div className="overflow-hidden">
              <div className="p-4 sm:p-5 border-t border-[#03045E]/10 text-[#03045E]">
                <p className="font-medium mb-3">ABLEWORK implements organizational, physical, and technical measures to protect stored data:</p>
                <ul className="space-y-2 pl-4">
                  <li className="font-medium flex gap-2"><span className="text-[#2C7FFF] font-black shrink-0">•</span><span><strong>Cryptographic Protection:</strong> Passwords are mathematically hashed with unique cryptographic salts using bcrypt before database storage.</span></li>
                  <li className="font-medium flex gap-2"><span className="text-[#2C7FFF] font-black shrink-0">•</span><span><strong>Header & Transport Security:</strong> HTTP security headers (Helmet) and Cross-Origin Resource Sharing (CORS) rules protect API communication channels.</span></li>
                  <li className="font-medium flex gap-2"><span className="text-[#2C7FFF] font-black shrink-0">•</span><span><strong>Access Segregation:</strong> Verification documents and candidate resumes are isolated within designated upload directories linked only to validated database records.</span></li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="border border-[#03045E]/15 rounded-2xl overflow-hidden bg-white">
          <button onClick={() => toggleSection(7)} className="w-full flex items-center justify-between p-4 sm:p-5 hover:bg-[#f4f4f4] transition-colors">
            <h2 className="text-lg font-bold text-[#03045E] flex items-center gap-2 text-left">
              <span className="w-2 h-2 rounded-full bg-[#2C7FFF]"></span>
              7. Data Retention and Account Deletion
            </h2>
            <svg className={`w-5 h-5 text-[#03045E] shrink-0 transition-transform duration-300 ${openSection === 7 ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <div className={`grid transition-all duration-300 ease-in-out ${openSection === 7 ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
            <div className="overflow-hidden">
              <div className="p-4 sm:p-5 border-t border-[#03045E]/10 text-[#03045E]">
                <ul className="space-y-2 pl-4">
                  <li className="font-medium flex gap-2"><span className="text-[#2C7FFF] font-black shrink-0">•</span><span>Personal data, application histories, and profile records are retained for the duration of the user's active participation on the platform.</span></li>
                  <li className="font-medium flex gap-2"><span className="text-[#2C7FFF] font-black shrink-0">•</span><span><strong>Account Deactivation:</strong> Users may deactivate their profile, rendering their account and job listings inactive (Disabled).</span></li>
                  <li className="font-medium flex gap-2"><span className="text-[#2C7FFF] font-black shrink-0">•</span><span><strong>Permanent Erasure:</strong> Users retain the right to request permanent account deletion via system settings. Account deletion permanently purges user profile records, application submissions, and authentication data from the production database upon password re-verification.</span></li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="border border-[#03045E]/15 rounded-2xl overflow-hidden bg-white">
          <button onClick={() => toggleSection(8)} className="w-full flex items-center justify-between p-4 sm:p-5 hover:bg-[#f4f4f4] transition-colors">
            <h2 className="text-lg font-bold text-[#03045E] flex items-center gap-2 text-left">
              <span className="w-2 h-2 rounded-full bg-[#2C7FFF]"></span>
              8. User Rights under Republic Act No. 10173
            </h2>
            <svg className={`w-5 h-5 text-[#03045E] shrink-0 transition-transform duration-300 ${openSection === 8 ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <div className={`grid transition-all duration-300 ease-in-out ${openSection === 8 ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
            <div className="overflow-hidden">
              <div className="p-4 sm:p-5 border-t border-[#03045E]/10 text-[#03045E]">
                <p className="font-medium mb-3">As a data subject under the Philippine Data Privacy Act of 2012, you are entitled to:</p>
                <ul className="space-y-2 pl-4">
                  <li className="font-medium flex gap-2"><span className="text-[#2C7FFF] font-black shrink-0">•</span><span><strong>Right to be Informed:</strong> The right to know how your personal and sensitive data is gathered, stored, and utilized.</span></li>
                  <li className="font-medium flex gap-2"><span className="text-[#2C7FFF] font-black shrink-0">•</span><span><strong>Right to Access:</strong> The right to review your registered data, job history, and application records.</span></li>
                  <li className="font-medium flex gap-2"><span className="text-[#2C7FFF] font-black shrink-0">•</span><span><strong>Right to Rectification:</strong> The right to update or correct inaccurate profile details and submit verification documents.</span></li>
                  <li className="font-medium flex gap-2"><span className="text-[#2C7FFF] font-black shrink-0">•</span><span><strong>Right to Erasure or Blocking:</strong> The right to deactivate or permanently delete your account records.</span></li>
                  <li className="font-medium flex gap-2"><span className="text-[#2C7FFF] font-black shrink-0">•</span><span><strong>Right to Damages:</strong> The right to seek indemnification for damages sustained due to inaccurate, incomplete, outdated, false, or unlawfully obtained personal data.</span></li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="border border-[#03045E]/15 rounded-2xl overflow-hidden bg-white">
          <button onClick={() => toggleSection(9)} className="w-full flex items-center justify-between p-4 sm:p-5 hover:bg-[#f4f4f4] transition-colors">
            <h2 className="text-lg font-bold text-[#03045E] flex items-center gap-2 text-left">
              <span className="w-2 h-2 rounded-full bg-[#2C7FFF]"></span>
              9. Changes to This Privacy Policy
            </h2>
            <svg className={`w-5 h-5 text-[#03045E] shrink-0 transition-transform duration-300 ${openSection === 9 ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <div className={`grid transition-all duration-300 ease-in-out ${openSection === 9 ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
            <div className="overflow-hidden">
              <div className="p-4 sm:p-5 border-t border-[#03045E]/10 text-[#03045E]">
                <p className="font-medium">ABLEWORK reserves the right to revise this Privacy Policy to accommodate system improvements, algorithmic enhancements, or updates in legal statutes. Updates will be reflected directly on the platform with an updated effective date.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="border border-[#03045E]/15 rounded-2xl overflow-hidden bg-white">
          <button onClick={() => toggleSection(10)} className="w-full flex items-center justify-between p-4 sm:p-5 hover:bg-[#f4f4f4] transition-colors">
            <h2 className="text-lg font-bold text-[#03045E] flex items-center gap-2 text-left">
              <span className="w-2 h-2 rounded-full bg-[#2C7FFF]"></span>
              10. Contact Information and Inquiries
            </h2>
            <svg className={`w-5 h-5 text-[#03045E] shrink-0 transition-transform duration-300 ${openSection === 10 ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <div className={`grid transition-all duration-300 ease-in-out ${openSection === 10 ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
            <div className="overflow-hidden">
              <div className="p-4 sm:p-5 border-t border-[#03045E]/10 text-[#03045E]">
                <p className="font-medium mb-3">For questions, data access requests, or privacy-related concerns regarding ABLEWORK, contact the project data custody team:</p>
                <ul className="space-y-2 pl-4">
                  <li className="font-medium flex gap-2"><span className="text-[#2C7FFF] font-black shrink-0">•</span><span><strong>Platform:</strong> ABLEWORK Capstone Project</span></li>
                  <li className="font-medium flex gap-2"><span className="text-[#2C7FFF] font-black shrink-0">•</span><span><strong>Data Custody Team / Proponents:</strong> Paquio, Loueala Jean H., Pagado, Jesie Marie D., Astodillo, Felicite S., Gonzales, John Greg A., Gamboa, John Bryan T.</span></li>
                  <li className="font-medium flex gap-2"><span className="text-[#2C7FFF] font-black shrink-0">•</span><span><strong>Institution:</strong> STIWNU</span></li>
                  <li className="font-medium flex gap-2"><span className="text-[#2C7FFF] font-black shrink-0">•</span><span><strong>Official Support Email:</strong> ableworksys5i@gmail.com</span></li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ApplicantPageLayout>
  );
}


export function ApplicantTerms({ onBack }) {
  const [openSection, setOpenSection] = useState(null);
  const toggleSection = (id) => setOpenSection(openSection === id ? null : id);

  return (
    <ApplicantPageLayout
      title="Terms of Service"
      subtitle="Applicant usage agreement and community standards"
      onBack={onBack}
    >
      <div className="space-y-6 text-sm sm:text-base leading-relaxed">
        <div className="p-5 rounded-2xl bg-[#2C7FFF]/10 border border-[#2C7FFF]/30">
          <p className="text-xs font-extrabold text-[#2C7FFF] uppercase tracking-widest mb-2">Effective Date: [Insert Date]</p>
          <p className="text-[#03045E] font-semibold">
            Welcome to ABLEWORK, a web-based employment assistance system designed to connect persons with disabilities (PWDs) with suitable employment opportunities and help employers manage job vacancies and applications.
          </p>
          <p className="text-[#03045E] font-semibold mt-3">
            By accessing or using ABLEWORK, you agree to comply with these Terms and Conditions. If you do not agree with any part of these terms, please do not use the system.
          </p>
        </div>

        <div className="border border-[#03045E]/15 rounded-2xl overflow-hidden bg-white">
          <button onClick={() => toggleSection(1)} className="w-full flex items-center justify-between p-4 sm:p-5 hover:bg-[#f4f4f4] transition-colors">
            <h2 className="text-lg font-bold text-[#03045E] flex items-center gap-2 text-left">
              <span className="w-2 h-2 rounded-full bg-[#2C7FFF]"></span>
              1. Acceptance of Terms
            </h2>
            <svg className={`w-5 h-5 text-[#03045E] shrink-0 transition-transform duration-300 ${openSection === 1 ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <div className={`grid transition-all duration-300 ease-in-out ${openSection === 1 ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
            <div className="overflow-hidden">
              <div className="p-4 sm:p-5 border-t border-[#03045E]/10 text-[#03045E]">
                <p className="font-medium">By creating an account or using ABLEWORK, you confirm that you have read, understood, and agreed to these Terms and Conditions. These terms apply to all applicants, employers, and authorized administrators using the platform. If you do not agree with any part of these terms, please do not use the system.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="border border-[#03045E]/15 rounded-2xl overflow-hidden bg-white">
          <button onClick={() => toggleSection(2)} className="w-full flex items-center justify-between p-4 sm:p-5 hover:bg-[#f4f4f4] transition-colors">
            <h2 className="text-lg font-bold text-[#03045E] flex items-center gap-2 text-left">
              <span className="w-2 h-2 rounded-full bg-[#2C7FFF]"></span>
              2. Eligibility and User Accounts
            </h2>
            <svg className={`w-5 h-5 text-[#03045E] shrink-0 transition-transform duration-300 ${openSection === 2 ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <div className={`grid transition-all duration-300 ease-in-out ${openSection === 2 ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
            <div className="overflow-hidden">
              <div className="p-4 sm:p-5 border-t border-[#03045E]/10 text-[#03045E]">
                <p className="font-medium">Applicants must provide accurate and truthful information during registration. Applicants should provide information relevant to their skills, qualifications, work preferences, and workplace accommodation needs. Employers must provide accurate company information and valid business or verification documents when required. Users are responsible for keeping their login credentials confidential. Each user should maintain only one account unless otherwise authorized by the system administrator. ABLEWORK reserves the right to suspend or disable accounts that contain false information, violate these terms, or pose a security risk.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="border border-[#03045E]/15 rounded-2xl overflow-hidden bg-white">
          <button onClick={() => toggleSection(3)} className="w-full flex items-center justify-between p-4 sm:p-5 hover:bg-[#f4f4f4] transition-colors">
            <h2 className="text-lg font-bold text-[#03045E] flex items-center gap-2 text-left">
              <span className="w-2 h-2 rounded-full bg-[#2C7FFF]"></span>
              3. Account Verification
            </h2>
            <svg className={`w-5 h-5 text-[#03045E] shrink-0 transition-transform duration-300 ${openSection === 3 ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <div className={`grid transition-all duration-300 ease-in-out ${openSection === 3 ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
            <div className="overflow-hidden">
              <div className="p-4 sm:p-5 border-t border-[#03045E]/10 text-[#03045E]">
                <p className="font-medium">ABLEWORK requires applicants and employers to submit specific documents for account verification. Applicants must submit a valid PWD ID, and Employers must submit valid business registration documents (e.g., DTI, SEC, or Business Permit). Submitted documents must be authentic and belong to the account holder or registered organization. Administrators may review submitted documents before approving an account. An account may remain restricted or pending until verification is completed. In the event a verification document is rejected by an administrator, the account will be subject to a mandatory 7-day security cooldown before a new document can be submitted. The system also actively monitors and limits repeated failed verification attempts to prevent abuse. Verification does not guarantee employment, hiring, or acceptance of any application.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="border border-[#03045E]/15 rounded-2xl overflow-hidden bg-white">
          <button onClick={() => toggleSection(4)} className="w-full flex items-center justify-between p-4 sm:p-5 hover:bg-[#f4f4f4] transition-colors">
            <h2 className="text-lg font-bold text-[#03045E] flex items-center gap-2 text-left">
              <span className="w-2 h-2 rounded-full bg-[#2C7FFF]"></span>
              4. Use of the System
            </h2>
            <svg className={`w-5 h-5 text-[#03045E] shrink-0 transition-transform duration-300 ${openSection === 4 ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <div className={`grid transition-all duration-300 ease-in-out ${openSection === 4 ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
            <div className="overflow-hidden">
              <div className="p-4 sm:p-5 border-t border-[#03045E]/10 text-[#03045E]">
                <p className="font-medium mb-3">Users agree to use ABLEWORK only for lawful employment-related purposes. Users must not:</p>
                <ul className="space-y-2 pl-4">
                  <li className="font-medium flex gap-2"><span className="text-[#2C7FFF] font-black shrink-0">•</span><span>Submit false, misleading, or fraudulent information.</span></li>
                  <li className="font-medium flex gap-2"><span className="text-[#2C7FFF] font-black shrink-0">•</span><span>Post fake, discriminatory, or misleading job vacancies.</span></li>
                  <li className="font-medium flex gap-2"><span className="text-[#2C7FFF] font-black shrink-0">•</span><span>Use the system to harass, threaten, or discriminate against other users.</span></li>
                  <li className="font-medium flex gap-2"><span className="text-[#2C7FFF] font-black shrink-0">•</span><span>Access another person's account without permission.</span></li>
                  <li className="font-medium flex gap-2"><span className="text-[#2C7FFF] font-black shrink-0">•</span><span>Attempt to damage, disrupt, or gain unauthorized access to the system.</span></li>
                  <li className="font-medium flex gap-2"><span className="text-[#2C7FFF] font-black shrink-0">•</span><span>Upload harmful files, malicious code, or inappropriate content.</span></li>
                  <li className="font-medium flex gap-2"><span className="text-[#2C7FFF] font-black shrink-0">•</span><span>Collect or misuse another user's personal information.</span></li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="border border-[#03045E]/15 rounded-2xl overflow-hidden bg-white">
          <button onClick={() => toggleSection(5)} className="w-full flex items-center justify-between p-4 sm:p-5 hover:bg-[#f4f4f4] transition-colors">
            <h2 className="text-lg font-bold text-[#03045E] flex items-center gap-2 text-left">
              <span className="w-2 h-2 rounded-full bg-[#2C7FFF]"></span>
              5. Job Listings and Applications
            </h2>
            <svg className={`w-5 h-5 text-[#03045E] shrink-0 transition-transform duration-300 ${openSection === 5 ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <div className={`grid transition-all duration-300 ease-in-out ${openSection === 5 ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
            <div className="overflow-hidden">
              <div className="p-4 sm:p-5 border-t border-[#03045E]/10 text-[#03045E]">
                <p className="font-medium">Employers are responsible for ensuring that their job postings are accurate, complete, and up to date. Applicants are responsible for reviewing job requirements before submitting an application. ABLEWORK provides employment assistance and job-matching services but does not guarantee that an applicant will be hired. Employers are responsible for their own recruitment process, interviews, and final hiring decisions. ABLEWORK does not guarantee the availability, legitimacy, or continued existence of every job opportunity unless it has been specifically verified by the system or its administrators. Applicants should independently verify important employment details before accepting a job offer.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="border border-[#03045E]/15 rounded-2xl overflow-hidden bg-white">
          <button onClick={() => toggleSection(6)} className="w-full flex items-center justify-between p-4 sm:p-5 hover:bg-[#f4f4f4] transition-colors">
            <h2 className="text-lg font-bold text-[#03045E] flex items-center gap-2 text-left">
              <span className="w-2 h-2 rounded-full bg-[#2C7FFF]"></span>
              6. Job Matching and Recommendations
            </h2>
            <svg className={`w-5 h-5 text-[#03045E] shrink-0 transition-transform duration-300 ${openSection === 6 ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <div className={`grid transition-all duration-300 ease-in-out ${openSection === 6 ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
            <div className="overflow-hidden">
              <div className="p-4 sm:p-5 border-t border-[#03045E]/10 text-[#03045E]">
                <p className="font-medium">ABLEWORK provides job recommendations based on information such as user profiles, skills, qualifications, preferences, workplace requirements, and location. Recommendations are intended to assist users in finding potentially suitable opportunities but are not guarantees of employment or suitability. The matching algorithm strictly enforces specific requirements. If an employer cannot provide an applicant's required workplace accommodations, or if an applicant falls outside the employer's designated travel radius, the system will intentionally hide the job posting from that applicant to ensure safe and viable employment. Users should review the complete job description and determine whether the opportunity meets their needs. Location-based recommendations may depend on the accuracy of the location information provided or permitted by the user.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="border border-[#03045E]/15 rounded-2xl overflow-hidden bg-white">
          <button onClick={() => toggleSection(7)} className="w-full flex items-center justify-between p-4 sm:p-5 hover:bg-[#f4f4f4] transition-colors">
            <h2 className="text-lg font-bold text-[#03045E] flex items-center gap-2 text-left">
              <span className="w-2 h-2 rounded-full bg-[#2C7FFF]"></span>
              7. Accessibility Features
            </h2>
            <svg className={`w-5 h-5 text-[#03045E] shrink-0 transition-transform duration-300 ${openSection === 7 ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <div className={`grid transition-all duration-300 ease-in-out ${openSection === 7 ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
            <div className="overflow-hidden">
              <div className="p-4 sm:p-5 border-t border-[#03045E]/10 text-[#03045E]">
                <p className="font-medium">ABLEWORK may provide accessibility features such as display themes, font-size adjustments, and color-blindness support. These features are intended to improve usability but may not meet every user's individual accessibility needs. Users are encouraged to report accessibility problems so the system can be improved.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="border border-[#03045E]/15 rounded-2xl overflow-hidden bg-white">
          <button onClick={() => toggleSection(8)} className="w-full flex items-center justify-between p-4 sm:p-5 hover:bg-[#f4f4f4] transition-colors">
            <h2 className="text-lg font-bold text-[#03045E] flex items-center gap-2 text-left">
              <span className="w-2 h-2 rounded-full bg-[#2C7FFF]"></span>
              8. Chatbot and Automated Assistance
            </h2>
            <svg className={`w-5 h-5 text-[#03045E] shrink-0 transition-transform duration-300 ${openSection === 8 ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <div className={`grid transition-all duration-300 ease-in-out ${openSection === 8 ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
            <div className="overflow-hidden">
              <div className="p-4 sm:p-5 border-t border-[#03045E]/10 text-[#03045E]">
                <p className="font-medium mb-3">ABLEWORK includes ABBY, a chatbot that provides guidance and assistance during the job-search and application process.</p>
                <ul className="space-y-2 pl-4">
                  <li className="font-medium flex gap-2"><span className="text-[#2C7FFF] font-black shrink-0">•</span><span>ABBY is powered by third-party Artificial Intelligence (Google Gemini). While the chatbot is configured to assist with platform navigation and job inquiries, AI-generated responses can occasionally be inaccurate. Users should not rely on ABBY for binding legal or employment agreements.</span></li>
                  <li className="font-medium flex gap-2"><span className="text-[#2C7FFF] font-black shrink-0">•</span><span>Chatbot responses are intended for general assistance and may not always be accurate or complete. Users should verify important employment, account, and application information through the appropriate source.</span></li>
                  <li className="font-medium flex gap-2"><span className="text-[#2C7FFF] font-black shrink-0">•</span><span>The chatbot does not make final hiring decisions.</span></li>
                  <li className="font-medium flex gap-2"><span className="text-[#2C7FFF] font-black shrink-0">•</span><span>Users should not share passwords, payment information, or other unnecessary sensitive information through the chatbot.</span></li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="border border-[#03045E]/15 rounded-2xl overflow-hidden bg-white">
          <button onClick={() => toggleSection(9)} className="w-full flex items-center justify-between p-4 sm:p-5 hover:bg-[#f4f4f4] transition-colors">
            <h2 className="text-lg font-bold text-[#03045E] flex items-center gap-2 text-left">
              <span className="w-2 h-2 rounded-full bg-[#2C7FFF]"></span>
              9. Location Services
            </h2>
            <svg className={`w-5 h-5 text-[#03045E] shrink-0 transition-transform duration-300 ${openSection === 9 ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <div className={`grid transition-all duration-300 ease-in-out ${openSection === 9 ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
            <div className="overflow-hidden">
              <div className="p-4 sm:p-5 border-t border-[#03045E]/10 text-[#03045E]">
                <p className="font-medium mb-3">If enabled, ABLEWORK uses location-related information to provide nearby job recommendations and location-based services.</p>
                <ul className="space-y-2 pl-4">
                  <li className="font-medium flex gap-2"><span className="text-[#2C7FFF] font-black shrink-0">•</span><span>Users may be asked to allow location access to utilize the Travel Radius feature, which filters job recommendations based on maximum geographical distance. This data is strictly used for the matching algorithm.</span></li>
                  <li className="font-medium flex gap-2"><span className="text-[#2C7FFF] font-black shrink-0">•</span><span>Location-based features may not function accurately if location access is disabled or unavailable.</span></li>
                  <li className="font-medium flex gap-2"><span className="text-[#2C7FFF] font-black shrink-0">•</span><span>Users should only enable location services when they are comfortable sharing the required location information.</span></li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="border border-[#03045E]/15 rounded-2xl overflow-hidden bg-white">
          <button onClick={() => toggleSection(10)} className="w-full flex items-center justify-between p-4 sm:p-5 hover:bg-[#f4f4f4] transition-colors">
            <h2 className="text-lg font-bold text-[#03045E] flex items-center gap-2 text-left">
              <span className="w-2 h-2 rounded-full bg-[#2C7FFF]"></span>
              10. Intellectual Property
            </h2>
            <svg className={`w-5 h-5 text-[#03045E] shrink-0 transition-transform duration-300 ${openSection === 10 ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <div className={`grid transition-all duration-300 ease-in-out ${openSection === 10 ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
            <div className="overflow-hidden">
              <div className="p-4 sm:p-5 border-t border-[#03045E]/10 text-[#03045E]">
                <p className="font-medium">The ABLEWORK name, system design, interface, content, and software components are owned by the project proponents or their respective rights holders, unless otherwise stated. Users may not copy, reproduce, modify, distribute, or commercially use the system or its materials without proper authorization.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="border border-[#03045E]/15 rounded-2xl overflow-hidden bg-white">
          <button onClick={() => toggleSection(11)} className="w-full flex items-center justify-between p-4 sm:p-5 hover:bg-[#f4f4f4] transition-colors">
            <h2 className="text-lg font-bold text-[#03045E] flex items-center gap-2 text-left">
              <span className="w-2 h-2 rounded-full bg-[#2C7FFF]"></span>
              11. System Availability and Limitations
            </h2>
            <svg className={`w-5 h-5 text-[#03045E] shrink-0 transition-transform duration-300 ${openSection === 11 ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <div className={`grid transition-all duration-300 ease-in-out ${openSection === 11 ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
            <div className="overflow-hidden">
              <div className="p-4 sm:p-5 border-t border-[#03045E]/10 text-[#03045E]">
                <p className="font-medium">ABLEWORK is provided as an employment assistance platform. The system may occasionally experience interruptions due to maintenance, technical issues, internet connectivity, or third-party services. The proponents do not guarantee that the system will always be available, error-free, or uninterrupted.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="border border-[#03045E]/15 rounded-2xl overflow-hidden bg-white">
          <button onClick={() => toggleSection(12)} className="w-full flex items-center justify-between p-4 sm:p-5 hover:bg-[#f4f4f4] transition-colors">
            <h2 className="text-lg font-bold text-[#03045E] flex items-center gap-2 text-left">
              <span className="w-2 h-2 rounded-full bg-[#2C7FFF]"></span>
              12. Account Suspension or Termination
            </h2>
            <svg className={`w-5 h-5 text-[#03045E] shrink-0 transition-transform duration-300 ${openSection === 12 ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <div className={`grid transition-all duration-300 ease-in-out ${openSection === 12 ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
            <div className="overflow-hidden">
              <div className="p-4 sm:p-5 border-t border-[#03045E]/10 text-[#03045E]">
                <p className="font-medium mb-3">ABLEWORK may suspend, restrict, or terminate an account if the user:</p>
                <ul className="space-y-2 pl-4">
                  <li className="font-medium flex gap-2"><span className="text-[#2C7FFF] font-black shrink-0">•</span><span>Violates these Terms and Conditions.</span></li>
                  <li className="font-medium flex gap-2"><span className="text-[#2C7FFF] font-black shrink-0">•</span><span>Provides false or fraudulent information.</span></li>
                  <li className="font-medium flex gap-2"><span className="text-[#2C7FFF] font-black shrink-0">•</span><span>Misuses personal data or system features.</span></li>
                  <li className="font-medium flex gap-2"><span className="text-[#2C7FFF] font-black shrink-0">•</span><span>Attempts unauthorized access.</span></li>
                  <li className="font-medium flex gap-2"><span className="text-[#2C7FFF] font-black shrink-0">•</span><span>Engages in harmful, abusive, or unlawful activities.</span></li>
                </ul>
                <p className="font-medium mt-3">Users may contact the system administrator regarding account concerns or requests for account review.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="border border-[#03045E]/15 rounded-2xl overflow-hidden bg-white">
          <button onClick={() => toggleSection(13)} className="w-full flex items-center justify-between p-4 sm:p-5 hover:bg-[#f4f4f4] transition-colors">
            <h2 className="text-lg font-bold text-[#03045E] flex items-center gap-2 text-left">
              <span className="w-2 h-2 rounded-full bg-[#2C7FFF]"></span>
              13. Changes to These Terms
            </h2>
            <svg className={`w-5 h-5 text-[#03045E] shrink-0 transition-transform duration-300 ${openSection === 13 ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <div className={`grid transition-all duration-300 ease-in-out ${openSection === 13 ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
            <div className="overflow-hidden">
              <div className="p-4 sm:p-5 border-t border-[#03045E]/10 text-[#03045E]">
                <p className="font-medium">ABLEWORK may update these Terms and Conditions when necessary to improve the system, address security concerns, or comply with applicable regulations and legal requirements. Continued use of the platform after such updates constitutes acceptance of the revised terms.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="border border-[#03045E]/15 rounded-2xl overflow-hidden bg-white">
          <button onClick={() => toggleSection(14)} className="w-full flex items-center justify-between p-4 sm:p-5 hover:bg-[#f4f4f4] transition-colors">
            <h2 className="text-lg font-bold text-[#03045E] flex items-center gap-2 text-left">
              <span className="w-2 h-2 rounded-full bg-[#2C7FFF]"></span>
              14. Contact Information
            </h2>
            <svg className={`w-5 h-5 text-[#03045E] shrink-0 transition-transform duration-300 ${openSection === 14 ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <div className={`grid transition-all duration-300 ease-in-out ${openSection === 14 ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
            <div className="overflow-hidden">
              <div className="p-4 sm:p-5 border-t border-[#03045E]/10 text-[#03045E]">
                <p className="font-medium mb-3">For questions, concerns, or reports regarding these Terms and Conditions, please contact:</p>
                <ul className="space-y-2 pl-4">
                  <li className="font-medium flex gap-2"><span className="text-[#2C7FFF] font-black shrink-0">•</span><span><strong>System Name:</strong> ABLEWORK</span></li>
                  <li className="font-medium flex gap-2"><span className="text-[#2C7FFF] font-black shrink-0">•</span><span><strong>Project Team:</strong> 5i</span></li>
                  <li className="font-medium flex gap-2"><span className="text-[#2C7FFF] font-black shrink-0">•</span><span><strong>Email:</strong> ableworksys5i@gmail.com</span></li>
                  <li className="font-medium flex gap-2"><span className="text-[#2C7FFF] font-black shrink-0">•</span><span><strong>Address:</strong> Burgos Street, Barangay Villamonte, Bacolod City, 6100 Negros Occidental, Philippines</span></li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ApplicantPageLayout>
  );
}


export function ApplicantContact({ onBack }) {
  return (
    <ApplicantPageLayout
      title="Applicant Support"
      subtitle="Get assistance with your dashboard, applications, or profile"
      onBack={onBack}
    >
      <div className="grid md:grid-cols-2 gap-8">

        <div className="space-y-6">
          <div className="p-5 rounded-2xl bg-[var(--color-surface,#f4f4f4)] border border-[var(--color-border,rgba(3,4,94,0.1))]">
            <h3 className="font-bold text-[var(--color-text,#03045E)] mb-1">Email Support</h3>
            <p className="text-sm font-semibold text-[var(--color-text,#03045E)]">applicants@ablework.com</p>
          </div>

          <div className="p-5 rounded-2xl bg-[var(--color-surface,#f4f4f4)] border border-[var(--color-border,rgba(3,4,94,0.1))]">
            <h3 className="font-bold text-[var(--color-text,#03045E)] mb-1">Helpdesk Phone</h3>
            <p className="text-sm font-semibold text-[var(--color-text,#03045E)]">+63 (034) 000-0000</p>
          </div>

          <div className="p-5 rounded-2xl bg-[var(--color-surface,#f4f4f4)] border border-[var(--color-border,rgba(3,4,94,0.1))]">
            <h3 className="font-bold text-[var(--color-text,#03045E)] mb-1">Office Location</h3>
            <p className="text-sm font-semibold text-[var(--color-text,#03045E)]">Bacolod City, Western Visayas, Philippines</p>
          </div>
        </div>

  
        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
          <h3 className="text-lg font-bold text-[var(--color-text,#03045E)]">Submit a Support Ticket</h3>
          <input
            type="text"
            placeholder="Subject / Issue Summary"
            className="w-full p-3.5 bg-[var(--color-surface,#f4f4f4)] border border-[var(--color-border,rgba(3,4,94,0.15))] rounded-xl text-sm font-medium text-[var(--color-text,#03045E)] placeholder-[var(--color-text,#03045E)]/50 focus:outline-none focus:border-[var(--color-primary,#2C7FFF)]"
          />
          <textarea
            rows="4"
            placeholder="Describe your issue or question..."
            className="w-full p-3.5 bg-[var(--color-surface,#f4f4f4)] border border-[var(--color-border,rgba(3,4,94,0.15))] rounded-xl text-sm font-medium text-[var(--color-text,#03045E)] placeholder-[var(--color-text,#03045E)]/50 focus:outline-none focus:border-[var(--color-primary,#2C7FFF)]"
          />
          <button
            type="submit"
            className="w-full py-3.5 bg-[var(--color-primary,#03045E)] text-[var(--color-button-text,#ffffff)] font-bold text-sm rounded-xl hover:opacity-90 transition-colors cursor-pointer"
          >
            Submit Request
          </button>
        </form>
      </div>
    </ApplicantPageLayout>
  );
}


export function ApplicantFooter({ activeTab, setActiveTab }) {
  const { mode } = useContext(AccessibilityContext);
  const isContrast = mode && typeof mode === 'string' && mode.toLowerCase().includes('contrast');

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="w-full bg-[#03045E] text-white mt-auto z-10 relative border-t-2 border-white/20">
      <div className="max-w-[1700px] mx-auto px-4 sm:px-10 py-8 sm:py-16">
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-12 mb-8 sm:mb-12">
          <div className="space-y-2 sm:space-y-4 col-span-2 md:col-span-2 lg:col-span-1">
            <div className="h-10 sm:h-14 flex items-center">
              <img
                src={FinalLogo}
                alt="AbleWork Logo"
                className="h-10 sm:h-14 w-auto object-contain"
              />
            </div>
            <p className="text-[10px] sm:text-sm font-semibold leading-relaxed text-white/90">
              A web-based employment assistance system designed to connect persons with disabilities with suitable employment opportunities and help employers manage job vacancies and applications.
            </p>
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
              <span className="px-2 sm:px-3 py-1 sm:py-1.5 rounded-[10px] bg-white/15 text-white text-[8px] sm:text-[11px] font-black uppercase tracking-wider border border-white/40 whitespace-nowrap">
                Equal Opportunity
              </span>
              <span className="px-2 sm:px-3 py-1 sm:py-1.5 rounded-[10px] bg-white/15 text-white text-[8px] sm:text-[11px] font-black uppercase tracking-wider border border-white/40 whitespace-nowrap">
                Smart Match
              </span>
            </div>
          </div>

          <div className="space-y-2 sm:space-y-4">
            <h4 className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-white">Fast Links</h4>
            <ul className="space-y-1.5 sm:space-y-3">
              <li>
                <button onClick={() => handleTabClick('applicant-policy')} className="text-[10px] sm:text-sm font-bold text-white/90 hover:text-white transition-colors cursor-pointer">
                  Privacy Policy
                </button>
              </li>
              <li>
                <button onClick={() => handleTabClick('applicant-terms')} className="text-[10px] sm:text-sm font-bold text-white/90 hover:text-white transition-colors cursor-pointer">
                  Terms & Conditions
                </button>
              </li>
              <li>
                <button onClick={() => handleTabClick('applicant-contact')} className="text-[10px] sm:text-sm font-bold text-white/90 hover:text-white transition-colors cursor-pointer">
                  Help & Support
                </button>
              </li>
            </ul>
          </div>

          <div className="space-y-2 sm:space-y-4">
            <h4 className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-white">System Status</h4>
            <ul className="space-y-1.5 sm:space-y-3">
              <li className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-sm font-bold text-white/90">
                <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full animate-pulse" style={{ backgroundColor: '#22c55e' }} />
                Platform Core: Online
              </li>
              <li className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-sm font-bold text-white/90">
                <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full animate-pulse" style={{ backgroundColor: '#22c55e' }} />
                Smart Matching: Active
              </li>
              <li className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-sm font-bold text-white/90">
                <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full animate-pulse" style={{ backgroundColor: '#ffffff' }} />
                ABBY Assistant: Ready
              </li>
            </ul>
          </div>

          <div className="space-y-2 sm:space-y-4 col-span-2 md:col-span-1">
            <h4 className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-white">Contact Info</h4>
            <ul className="space-y-1.5 sm:space-y-3">
              <li className="flex items-start gap-2 sm:gap-3 text-[10px] sm:text-sm font-bold text-white/90">
                <svg className="w-3 h-3 sm:w-4 sm:h-4 text-white shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>Burgos Street, Barangay Villamonte, Bacolod City, 6100 Negros Occidental, Philippines</span>
              </li>
              <li className="flex items-center gap-2 sm:gap-3 text-[10px] sm:text-sm font-bold text-white/90">
                <svg className="w-3 h-3 sm:w-4 sm:h-4 text-white shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span>ableworksys5i@gmail.com</span>
              </li>
              <li className="flex items-center gap-2 sm:gap-3 text-[10px] sm:text-sm font-bold text-white/90">
                <svg className="w-3 h-3 sm:w-4 sm:h-4 text-white shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span>+63 900 000 0000</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center gap-3 sm:gap-4 pt-5 sm:pt-8 border-t border-white/30">
          <p className="text-[9px] sm:text-xs font-bold text-white/80 text-center">
            &copy; {new Date().getFullYear()} ABLEWORK Capstone Project. All rights reserved.
          </p>
          <button
            onClick={() => handleTabClick('applicant-contact')}
            className="w-auto px-3 py-1.5 sm:px-6 sm:py-2.5 bg-white text-[#03045E] font-black text-[9px] sm:text-sm rounded-lg sm:rounded-xl hover:opacity-90 transition-colors cursor-pointer flex items-center justify-center gap-1 sm:gap-2"
          >
            <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            Contact Support
          </button>
        </div>
      </div>
    </footer>
  );
}