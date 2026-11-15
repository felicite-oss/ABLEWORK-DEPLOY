// frontend/src/shared/withdrawalReasons.js
//
// Single source of truth for withdrawal reason keys and labels.
// Used by BOTH the applicant Job Tracker and the employer Applications view.
//
// RULES:
//  - `key` is what gets stored in the DB (applications.withdrawal_reasons JSON array).
//  - `label` is what is rendered in the UI (checkboxes on applicant side, list on employer side).
//  - To add/rename a reason, edit here ONLY. The backend stores keys verbatim and
//    renders them via this map on the employer side, so old data keeps working.
//  - Keys are stable identifiers. NEVER rename a key once data exists in production —
//    add a new one and leave the old one in place for backwards compatibility.

export const WITHDRAWAL_REASON_OPTIONS = [
  { key: 'accepted_other_offer',  label: 'I accepted a job offer elsewhere' },
  { key: 'double_hired',          label: 'I was hired for another role on AbleWork' },
  { key: 'personal_reasons',      label: 'Personal or health reasons' },
  { key: 'relocation',            label: 'Relocating to a different area' },
  { key: 'role_mismatch',         label: 'The role was not what I expected' },
  { key: 'schedule_conflict',     label: 'Schedule or availability conflict' },
  { key: 'employer_unresponsive', label: 'The employer was not responsive' },
  { key: 'other',                 label: 'Other (please describe below)' },
];

// Fast lookup: { accepted_other_offer: '...', double_hired: '...' }
export const WITHDRAWAL_REASON_LABELS = Object.fromEntries(
  WITHDRAWAL_REASON_OPTIONS.map(r => [r.key, r.label])
);

// Statuses from which an applicant may withdraw.
// 'Hired' is intentionally included — the double-hire / accepted-elsewhere scenario.
export const WITHDRAWABLE_STATUSES = ['Received', 'Under Review', 'Shortlisted', 'Hired'];

// Statuses considered terminal (no withdraw button, no action).
export const TERMINAL_STATUSES = ['Rejected', 'Withdrawn'];

// Defensive parser — JSON columns can arrive as arrays (mysql2) or strings
// (depending on driver config), and old rows may be CSV. Mirrors the backend's
// safeParseArray so both sides tolerate the same payloads.
export function parseWithdrawalReasons(data) {
  if (!data) return [];
  if (Array.isArray(data)) return data.filter(Boolean).map(String);
  if (typeof data === 'string') {
    const trimmed = data.trim();
    if (!trimmed) return [];
    try {
      const parsed = JSON.parse(trimmed);
      return Array.isArray(parsed) ? parsed.filter(Boolean).map(String) : [];
    } catch {
      return trimmed
        .replace(/[\[\]"\\]/g, '')
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);
    }
  }
  return [];
}

// Human-readable label for a single key. Falls back to the raw key so unknown
// (legacy) reasons still render something rather than an empty string.
export function labelForReason(key) {
  return WITHDRAWAL_REASON_LABELS[key] || key;
}