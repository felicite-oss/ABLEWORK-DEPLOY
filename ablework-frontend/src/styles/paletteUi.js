export const getPaletteUi = (paletteKey) => {
  const key = (paletteKey || '').toString().toLowerCase();

  const isHighContrast = key === 'highcontrast' || key.includes('contrast');
  const isDarkComfort = key === 'darkcomfort' || key.includes('comfort');
  const isDarkMode = !isHighContrast && !isDarkComfort && key.includes('dark');
  const isColorVision = !isHighContrast && !isDarkComfort && !isDarkMode;

  const isAccessibility = isHighContrast || isDarkComfort;
  const useDarkLogo = isAccessibility;

  return {
    isAccessibility,
    isHighContrast,
    isDarkComfort,
    isDarkMode,
    isColorVision,
    useDarkLogo,

    headerBg: isAccessibility
      ? '!bg-black !border-b-2 !border-[#2C7FFF]'
      : isDarkMode
        ? '!bg-zinc-900 !border-b-2 !border-zinc-800'
        : 'bg-[#f4f4f4] border-b border-[#03045E]/10',
    headerText: isAccessibility || isDarkMode ? '!text-white' : 'text-[#03045E]',
    navLinkBase: isAccessibility
      ? '!text-white transition-colors duration-200 hover:scale-105 transform hover:!text-[#2C7FFF]'
      : isDarkMode
        ? '!text-white transition-colors duration-200 hover:scale-105 transform hover:!text-blue-400'
        : 'transition-colors duration-200 hover:text-[#2C7FFF] hover:scale-105 transform',
    navLinkActive: isAccessibility
      ? '!text-[#2C7FFF] font-semibold border-b-2 border-[#2C7FFF] pb-0.5'
      : isDarkMode
        ? '!text-blue-400 font-semibold border-b-2 border-blue-400 pb-0.5'
        : 'text-[#2C7FFF] font-semibold border-b-2 border-[#2C7FFF] pb-0.5',
    mobileNavBg: isAccessibility ? '!bg-black' : isDarkMode ? '!bg-zinc-900' : 'bg-[#f4f4f4]',
    mobileNavBorder: isAccessibility
      ? 'border-b-2 border-[#2C7FFF]'
      : isDarkMode
        ? 'border-b-2 border-zinc-800'
        : 'border-b border-[#03045E]/10',
    loginBtn: isAccessibility
      ? 'px-5 py-2 rounded-full bg-transparent !text-white text-sm font-bold border-2 !border-[#2C7FFF] hover:!bg-[#2C7FFF] hover:!text-white transform duration-200 transition whitespace-nowrap'
      : isDarkMode
        ? 'px-5 py-2 rounded-full bg-transparent !text-white text-sm font-bold border-2 !border-zinc-600 hover:!bg-blue-600 hover:!border-blue-600 hover:!text-white transform duration-200 transition whitespace-nowrap'
        : 'px-5 py-2 rounded-full bg-transparent text-[#03045E] text-sm font-bold border-2 border-[#03045E] hover:bg-[#2C7FFF] hover:text-[#f4f4f4] hover:border-[#2C7FFF] hover:brightness-125 transform duration-200 transition whitespace-nowrap',
    loginBtnActive: isAccessibility
      ? '!bg-[#2C7FFF] !text-white !border-[#2C7FFF] font-semibold'
      : isDarkMode
        ? '!bg-blue-600 !text-white !border-blue-600 font-semibold'
        : 'bg-[#2C7FFF] text-white border-[#2C7FFF] underline font-semibold',
    hamburgerBtn: isAccessibility
      ? 'md:hidden flex items-center justify-center w-10 h-10 rounded-lg !bg-black !text-white !border-2 !border-[#2C7FFF]'
      : isDarkMode
        ? 'md:hidden flex items-center justify-center w-10 h-10 rounded-lg !bg-zinc-900 !text-white !border-2 !border-zinc-800'
        : 'md:hidden flex items-center justify-center w-10 h-10 rounded-lg bg-[#2C7FFF] text-[#f4f4f4]',
    mobileLoginBtn: isAccessibility
      ? 'mt-2 px-5 py-2.5 rounded-full bg-transparent !text-white text-sm font-bold border-2 !border-[#2C7FFF] hover:!bg-[#2C7FFF] transform duration-200 transition w-fit whitespace-nowrap'
      : isDarkMode
        ? 'mt-2 px-5 py-2.5 rounded-full bg-transparent !text-white text-sm font-bold border-2 !border-zinc-600 hover:!bg-blue-600 hover:!border-blue-600 transform duration-200 transition w-fit whitespace-nowrap'
        : 'mt-2 px-5 py-2.5 rounded-full bg-transparent text-[#03045E] text-sm font-bold border-2 border-[#03045E] hover:bg-[#2C7FFF] hover:text-[#f4f4f4] hover:border-[#2C7FFF] hover:brightness-125 transform duration-200 transition w-fit whitespace-nowrap',

    mainCardBg: isAccessibility
      ? '!bg-black !border-2 !border-white'
      : isDarkMode
        ? '!bg-zinc-900 !border-2 !border-zinc-800'
        : 'bg-white/90 border border-[#03045E]/15',
    mainCardText: isAccessibility || isDarkMode ? '!text-white' : 'text-[#03045E]',
    mainCardSub: isAccessibility || isDarkMode ? '!text-white/80' : 'text-[#03045E]/80',
    badgeBg: isAccessibility
      ? '!bg-[#2C7FFF] !text-white'
      : isDarkMode
        ? '!bg-blue-900 !text-blue-100'
        : 'bg-[#2C7FFF]/15 text-[#2C7FFF]',

    cardBg: isAccessibility
      ? '!bg-black !border-2 !border-white hover:!border-[#2C7FFF]'
      : isDarkMode
        ? '!bg-zinc-900 !border-2 !border-zinc-800 hover:!border-blue-400'
        : 'bg-white border-[#03045E]/10 hover:border-[#2C7FFF]',
    cardTitle: isAccessibility
      ? '!text-white group-hover:!text-[#2C7FFF]'
      : isDarkMode
        ? '!text-white group-hover:!text-blue-400'
        : 'text-[#03045E] group-hover:text-[#2C7FFF]',
    cardDesc: isAccessibility || isDarkMode ? '!text-white/70' : 'text-[#03045E]/70',
    iconContainer: isAccessibility
      ? 'w-12 h-12 sm:w-14 sm:h-14 rounded-2xl !bg-black !border-2 !border-[#2C7FFF] flex items-center justify-center mb-2.5 !text-white group-hover:!bg-[#2C7FFF] group-hover:!text-white transition-all duration-300 shadow-inner'
      : isDarkMode
        ? 'w-12 h-12 sm:w-14 sm:h-14 rounded-2xl !bg-zinc-950 !border-2 !border-zinc-800 flex items-center justify-center mb-2.5 !text-blue-400 group-hover:!bg-blue-600 group-hover:!text-white group-hover:!border-blue-600 transition-all duration-300 shadow-inner'
        : 'w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-[#2C7FFF] border border-[#2C7FFF] flex items-center justify-center mb-2.5 text-[#f4f4f4] group-hover:bg-[#03045E] group-hover:text-white group-hover:border-[#03045E] transition-all duration-300 shadow-inner',
    iconColor: isAccessibility
      ? '!text-white group-hover:!text-white'
      : isDarkMode
        ? '!text-blue-400 group-hover:!text-white'
        : 'text-[#f4f4f4] group-hover:text-white',
    iconStroke: isAccessibility ? '#ffffff' : isDarkMode ? '#60a5fa' : 'currentColor',
    getStarted: isAccessibility ? '!text-[#2C7FFF]' : isDarkMode ? '!text-blue-400' : 'text-[#2C7FFF]',

    footerBg: isAccessibility
      ? '!bg-black !text-white border-t-2 !border-[#2C7FFF]'
      : isDarkMode
        ? '!bg-zinc-900 !text-white border-t-2 !border-zinc-800'
        : 'bg-[#03045E] text-white border-t-2 border-[#2C7FFF]',
    footerTopBar: isAccessibility ? '!bg-[#2C7FFF]' : isDarkMode ? '!bg-blue-600' : 'bg-[#2C7FFF]',
    footerText: isAccessibility || isDarkMode ? '!text-white' : 'text-white/85',
    footerMuted: isAccessibility || isDarkMode ? '!text-white/70' : 'text-white/70',
    footerHeading: isAccessibility || isDarkMode ? '!text-white' : 'text-white',
    footerLinkBase: isAccessibility
      ? '!text-white transition-all hover:translate-x-1 inline-flex items-center gap-1 hover:!text-[#2C7FFF]'
      : isDarkMode
        ? '!text-white/80 transition-all hover:translate-x-1 inline-flex items-center gap-1 hover:!text-blue-400'
        : 'text-white/80 transition-all hover:translate-x-1 inline-flex items-center gap-1 hover:text-[#7FB0FF]',
    footerIcon: isAccessibility ? '!text-[#2C7FFF]' : isDarkMode ? '!text-blue-400' : 'text-[#7FB0FF]',
    footerBottomBar: isAccessibility
      ? '!bg-black !text-white/70 !border-[#2C7FFF]/30'
      : isDarkMode
        ? '!bg-zinc-900 !text-white/70 !border-zinc-800'
        : 'bg-[#03045E] text-white/70 border-white/10'
  };
};