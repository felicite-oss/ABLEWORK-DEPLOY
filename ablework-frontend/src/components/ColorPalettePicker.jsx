import React from 'react';
import { useColorPalette } from '../context/ColorPaletteContext';

export default function ColorPalettePicker() {
  const { paletteKey, setPaletteKey, palettes } = useColorPalette();

  return (
    <div className="flex flex-col gap-2">
      <span tabIndex="0" className="text-[0.6rem] sm:text-xs font-black uppercase tracking-wider text-[var(--color-textMuted)]">
      </span>
      <p className="text-[0.55rem] sm:text-[0.85rem] font-bold text-[var(--color-textMuted)] -mt-1 mb-1 leading-snug">
        Choose colors that work best for your eyes
      </p>
      <div className="grid grid-cols-2 gap-1.5 sm:gap-2 bg-[var(--color-surface)] border-2 border-[var(--color-border)] p-1.5 sm:p-2 rounded-xl sm:rounded-2xl">
        {Object.entries(palettes).map(([key, p]) => {
          const selected = key === paletteKey;
          return (
            <button
              key={key}
              onClick={() => setPaletteKey(key)}
              aria-pressed={selected}
              aria-label={`Select ${p.name} color palette`}
              className={`relative w-full flex flex-col items-center justify-center gap-1 sm:gap-1.5 px-1.5 py-2 sm:px-3 sm:py-3 rounded-lg sm:rounded-xl text-center transition-all cursor-pointer border-2 ${
                selected
                  ? 'bg-[var(--color-accentSoft)] border-[var(--color-accent)] shadow-sm'
                  : 'bg-[var(--color-surface)] border-[var(--color-border)] hover:border-[var(--color-accent)]'
              }`}
            >
              {selected && (
                <span className="absolute top-1 right-1 sm:top-1.5 sm:right-1.5 w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-[var(--color-accent)] text-[var(--color-background)] flex items-center justify-center shadow-sm pointer-events-none" aria-hidden="true">
                  <svg className="w-2 h-2 sm:w-2.5 sm:h-2.5" fill="none" stroke="currentColor" strokeWidth="3.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </span>
              )}
              <div className="flex items-center gap-0.5 shrink-0">
                {p.swatch.map((color, i) => (
                  <span
                    key={i}
                    className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 rounded-full border border-[var(--color-border)]"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
              <div className="flex-1 min-w-0 w-full">
                {/* Changed from text-[9px] to text-[0.6rem] */}
                <p className="text-[0.6rem] sm:text-[0.7rem] font-black text-[var(--color-text)] truncate leading-tight">{p.name}</p>
                {/* Changed from text-[7px] to text-[0.45rem] */}
                <p className="text-[0.45rem] sm:text-[0.6rem] font-bold truncate leading-tight mt-0.5 text-[var(--color-textMuted)]">{p.description}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}