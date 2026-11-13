import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AccessibilityContext } from '../context/AccessibilityContext';

export default function PreLanding() {
  const { mode, setMode } = useContext(AccessibilityContext);
  const navigate = useNavigate();
  const headingSize = mode === 'Assist' ? 'text-4xl' : 'text-3xl';
  const tapTargetSize = mode === 'Assist' ? 'py-4 px-6 text-xl' : 'py-2 px-4';

  return (
    <div className="flex flex-col h-screen items-center justify-center bg-[var(--bg-primary)] gap-8 transition-colors duration-300">
      

      <div className="text-center p-8 bg-[var(--bg-card)] rounded-lg shadow-xl border-l-8 border-[var(--border-accent)]">
        <h1 className={`${headingSize} font-bold text-[var(--text-primary)] mb-4`}>
          Welcome to ABLEWORK
        </h1>
        <p className="text-xl text-[var(--text-secondary)] font-semibold">
          Please select your preferred viewing mode:
        </p>
      </div>


      <div className="flex gap-4">
        <button 
          onClick={() => setMode('Standard')}
          className={`${tapTargetSize} bg-[#e5e7eb] hover:bg-gray-300 rounded font-bold text-[#1f2937] cursor-pointer`}
        >
          Standard
        </button>
        <button 
          onClick={() => setMode('High Contrast')}
          className={`${tapTargetSize} bg-[#000000] hover:bg-gray-800 rounded font-bold text-[#ffff00] cursor-pointer border-2 border-[#ffff00]`}
        >
          High Contrast
        </button>
        <button 
          onClick={() => setMode('Assist')}
          className={`${tapTargetSize} bg-[#bae6fd] hover:bg-blue-200 rounded font-bold text-[#0369a1] cursor-pointer`}
        >
          Assist Mode
        </button>
      </div>

   
      <button 
        onClick={() => navigate('/login')}
        className={`mt-4 ${tapTargetSize} bg-[var(--border-accent)] hover:opacity-80 rounded-full font-bold text-white shadow-lg w-64`}
      >
        Continue
      </button>

    </div>
  );
}