import React, { createContext, useContext, useState, useEffect } from 'react';

export const COLOR_PALETTES = {
  default: {
    name: 'Default',
    description: 'Standard AbleWork colors',
    swatch: ['#03045E', '#2C7FFF', '#f4f4f4'],
    colors: {
      primary: '#03045E',
      primarySoft: 'rgba(3,4,94,0.7)',
      accent: '#2C7FFF',
      accentSoft: 'rgba(44,127,255,0.15)',
      background: '#f4f4f4',
      surface: '#ffffff',
      surfaceMuted: 'rgba(3,4,94,0.05)',
      border: 'rgba(3,4,94,0.15)',
      text: '#03045E',
      textMuted: 'rgba(3,4,94,0.7)',
      textSubtle: 'rgba(3,4,94,0.5)',
      success: '#10b981',
      successText: '#047857',
      warning: '#f59e0b',
      warningText: '#b45309',
      error: '#ef4444',
      errorText: '#b91c1c',
      info: '#3b82f6'
    }
  },
  deuteranopia: {
    name: 'Deuteranopia',
    description: 'Green-red colorblind friendly',
    swatch: ['#1A365D', '#3182CE', '#EBF8FF'],
    colors: {
      primary: '#1A365D',
      primarySoft: 'rgba(26,54,93,0.75)',
      accent: '#3182CE',
      accentSoft: 'rgba(49,130,206,0.15)',
      background: '#EBF8FF',
      surface: '#ffffff',
      surfaceMuted: 'rgba(26,54,93,0.05)',
      border: 'rgba(26,54,93,0.2)',
      text: '#1A365D',
      textMuted: 'rgba(26,54,93,0.75)',
      textSubtle: 'rgba(26,54,93,0.55)',
      success: '#2B6CB0',
      successText: '#1A365D',
      warning: '#B7791F',
      warningText: '#744210',
      error: '#822727',
      errorText: '#63171B',
      info: '#4299E1'
    }
  },
  protanopia: {
    name: 'Protanopia',
    description: 'Red-blind friendly palette',
    swatch: ['#1A202C', '#4299E1', '#F7FAFC'],
    colors: {
      primary: '#1A202C',
      primarySoft: 'rgba(26,32,44,0.75)',
      accent: '#4299E1',
      accentSoft: 'rgba(66,153,225,0.15)',
      background: '#F7FAFC',
      surface: '#ffffff',
      surfaceMuted: 'rgba(26,32,44,0.05)',
      border: 'rgba(26,32,44,0.2)',
      text: '#1A202C',
      textMuted: 'rgba(26,32,44,0.75)',
      textSubtle: 'rgba(26,32,44,0.55)',
      success: '#2F855A',
      successText: '#22543D',
      warning: '#C05621',
      warningText: '#7B341E',
      error: '#822727',
      errorText: '#63171B',
      info: '#3182CE'
    }
  },
  tritanopia: {
    name: 'Tritanopia',
    description: 'Blue-yellow colorblind friendly',
    swatch: ['#742A2A', '#D69E2E', '#FFFAF0'],
    colors: {
      primary: '#742A2A',
      primarySoft: 'rgba(116,42,42,0.75)',
      accent: '#D69E2E',
      accentSoft: 'rgba(214,158,46,0.15)',
      background: '#FFFAF0',
      surface: '#ffffff',
      surfaceMuted: 'rgba(116,42,42,0.05)',
      border: 'rgba(116,42,42,0.2)',
      text: '#742A2A',
      textMuted: 'rgba(116,42,42,0.75)',
      textSubtle: 'rgba(116,42,42,0.55)',
      success: '#2F855A',
      successText: '#22543D',
      warning: '#D69E2E',
      warningText: '#744210',
      error: '#C53030',
      errorText: '#822727',
      info: '#B7791F'
    }
  },
  warmTone: {
    name: 'Warm Tone',
    description: 'Soft warm colors for eye comfort',
    swatch: ['#7C2D12', '#EA580C', '#FFF7ED'],
    colors: {
      primary: '#7C2D12',
      primarySoft: 'rgba(124,45,18,0.75)',
      accent: '#EA580C',
      accentSoft: 'rgba(234,88,12,0.15)',
      background: '#FFF7ED',
      surface: '#FFFFFF',
      surfaceMuted: 'rgba(124,45,18,0.05)',
      border: 'rgba(124,45,18,0.2)',
      text: '#7C2D12',
      textMuted: 'rgba(124,45,18,0.75)',
      textSubtle: 'rgba(124,45,18,0.55)',
      success: '#65A30D',
      successText: '#3F6212',
      warning: '#D97706',
      warningText: '#92400E',
      error: '#DC2626',
      errorText: '#991B1B',
      info: '#0891B2'
    }
  },
  coolTone: {
    name: 'Cool Tone',
    description: 'Calm cool colors to reduce eye strain',
    swatch: ['#1E3A8A', '#0891B2', '#ECFEFF'],
    colors: {
      primary: '#1E3A8A',
      primarySoft: 'rgba(30,58,138,0.75)',
      accent: '#0891B2',
      accentSoft: 'rgba(8,145,178,0.15)',
      background: '#ECFEFF',
      surface: '#FFFFFF',
      surfaceMuted: 'rgba(30,58,138,0.05)',
      border: 'rgba(30,58,138,0.2)',
      text: '#1E3A8A',
      textMuted: 'rgba(30,58,138,0.75)',
      textSubtle: 'rgba(30,58,138,0.55)',
      success: '#059669',
      successText: '#065F46',
      warning: '#D97706',
      warningText: '#92400E',
      error: '#DC2626',
      errorText: '#991B1B',
      info: '#0EA5E9'
    }
  },
  monochrome: {
    name: 'Monochrome',
    description: 'Grayscale for total color blindness',
    swatch: ['#111827', '#6B7280', '#F9FAFB'],
    colors: {
      primary: '#111827',
      primarySoft: 'rgba(17,24,39,0.8)',
      accent: '#6B7280',
      accentSoft: 'rgba(107,114,128,0.15)',
      background: '#F9FAFB',
      surface: '#FFFFFF',
      surfaceMuted: 'rgba(17,24,39,0.05)',
      border: 'rgba(17,24,39,0.25)',
      text: '#111827',
      textMuted: 'rgba(17,24,39,0.75)',
      textSubtle: 'rgba(17,24,39,0.55)',
      success: '#374151',
      successText: '#111827',
      warning: '#4B5563',
      warningText: '#1F2937',
      error: '#1F2937',
      errorText: '#000000',
      info: '#6B7280'
    }
  }
};

const ColorPaletteContext = createContext({
  paletteKey: 'default',
  palette: COLOR_PALETTES.default,
  setPaletteKey: () => {},
  palettes: COLOR_PALETTES
});

export function ColorPaletteProvider({ children }) {
  const [paletteKey, setPaletteKey] = useState(() => {
    const stored = localStorage.getItem('color_palette');
    return stored && COLOR_PALETTES[stored] ? stored : 'default';
  });

  const palette = COLOR_PALETTES[paletteKey] || COLOR_PALETTES.default;

  useEffect(() => {
    localStorage.setItem('color_palette', paletteKey);
    const root = document.documentElement;
    Object.entries(palette.colors).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key}`, value);
    });
    root.classList.remove(
      'palette-default',
      'palette-deuteranopia',
      'palette-protanopia',
      'palette-tritanopia',
      'palette-warmTone',
      'palette-coolTone',
      'palette-monochrome'
    );
    root.classList.add(`palette-${paletteKey}`);
  }, [paletteKey, palette]);

  return (
    <ColorPaletteContext.Provider value={{ paletteKey, palette, setPaletteKey, palettes: COLOR_PALETTES }}>
      {children}
    </ColorPaletteContext.Provider>
  );
}

export function useColorPalette() {
  return useContext(ColorPaletteContext);
}