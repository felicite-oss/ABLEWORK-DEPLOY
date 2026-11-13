import { useContext } from 'react';
import { AccessibilityContext } from '../context/AccessibilityContext';

export default function useApplicantTheme() {
  const { mode } = useContext(AccessibilityContext);
  const m = typeof mode === 'string' ? mode.toLowerCase() : '';

  const isContrast = m.includes('contrast');
  const isDarkMode = m.includes('dark') || m.includes('comfort');

  const isProtanopia = m.includes('protanopia') || m.includes('protan');
  const isDeuteranopia = m.includes('deuteranopia') || m.includes('deuteran');
  const isTritanopia = m.includes('tritanopia') || m.includes('tritan');
  const isAchromatopsia = m.includes('achromatopsia') || m.includes('achromat') || m.includes('monochrom');

  const isColorVisionPalette =
    isProtanopia || isDeuteranopia || isTritanopia || isAchromatopsia;

  const isDarkScreen = isContrast || isDarkMode;

  const displayMode = isContrast
    ? 'high-contrast'
    : isDarkMode
      ? 'dark-comfort'
      : 'default';

  const cvdPalette = isProtanopia
    ? 'protanopia'
    : isDeuteranopia
      ? 'deuteranopia'
      : isTritanopia
        ? 'tritanopia'
        : isAchromatopsia
          ? 'achromatopsia'
          : 'none';

  return {
    displayMode,
    cvdPalette,
    isContrast,
    isDarkMode,
    isDarkScreen,
    isProtanopia,
    isDeuteranopia,
    isTritanopia,
    isAchromatopsia,
    isColorVisionPalette,
  };
}