export default function DarkModeToggle({ isDark = false, onToggle }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      aria-pressed={isDark}
      className={`group flex items-center gap-2.5 px-3 py-2 rounded-2xl border-2 shadow-sm transition-all duration-300 cursor-pointer shrink-0 ${
        isDark
          ? 'bg-black border-white text-white'
          : 'bg-white border-[#03045E]/20 text-[#03045E] hover:border-[#2C7FFF]'
      }`}
    >
      <span
        className={`text-[10px] sm:text-xs font-black uppercase tracking-widest transition-colors ${
          isDark ? 'text-white' : 'text-[#03045E]/60'
        }`}
      >
        {isDark ? 'Dark' : 'Light'}
      </span>

      <span
        className={`relative w-11 h-6 sm:w-12 sm:h-7 rounded-full border-2 transition-colors duration-300 flex items-center ${
          isDark
            ? 'bg-black border-white'
            : 'bg-[#f4f4f4] border-[#03045E]/30'
        }`}
      >
        <span
          className={`absolute top-0.5 bottom-0.5 w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center shadow-md transition-all duration-300 ${
            isDark
              ? 'left-[calc(100%-1.375rem)] sm:left-[calc(100%-1.5rem)] bg-white text-black'
              : 'left-0.5 bg-[#2C7FFF] text-white'
          }`}
        >
          {isDark ? (
            <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          ) : (
            <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="12" cy="12" r="4" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M2 12h2m16 0h2M4.93 19.07l1.41-1.41m11.32-11.32l1.41-1.41" />
            </svg>
          )}
        </span>
      </span>
    </button>
  );
}