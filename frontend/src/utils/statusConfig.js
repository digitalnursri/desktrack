/**
 * Centralized attendance status configuration
 * Used across Dashboard, Attendance, Calendar, and all other pages
 */

export const STATUS_CONFIG = {
  'PRESENT':        { color: '#16a34a', bg: '#dcfce7', border: '#bbf7d0', label: 'Present',       short: 'P',  tw: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  'ON TIME':        { color: '#16a34a', bg: '#dcfce7', border: '#bbf7d0', label: 'On Time',       short: 'P',  tw: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  'COMPLETE':       { color: '#16a34a', bg: '#dcfce7', border: '#bbf7d0', label: 'Complete',      short: 'P',  tw: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  'LATE':           { color: '#d97706', bg: '#fef3c7', border: '#fde68a', label: 'Late',          short: 'LT', tw: 'bg-amber-50 text-amber-700 border-amber-200' },
  'LATE_ARRIVAL':   { color: '#d97706', bg: '#fef3c7', border: '#fde68a', label: 'Late',          short: 'LT', tw: 'bg-amber-50 text-amber-700 border-amber-200' },
  'OVER LATE':      { color: '#ea580c', bg: '#ffedd5', border: '#fed7aa', label: 'Over Late',     short: 'OL', tw: 'bg-orange-50 text-orange-700 border-orange-200' },
  'OVERLATE':       { color: '#ea580c', bg: '#ffedd5', border: '#fed7aa', label: 'Over Late',     short: 'OL', tw: 'bg-orange-50 text-orange-700 border-orange-200' },
  'HALF DAY':       { color: '#9333ea', bg: '#f3e8ff', border: '#e9d5ff', label: 'Half Day',      short: 'HD', tw: 'bg-purple-50 text-purple-700 border-purple-200' },
  'HALFDAY':        { color: '#9333ea', bg: '#f3e8ff', border: '#e9d5ff', label: 'Half Day',      short: 'HD', tw: 'bg-purple-50 text-purple-700 border-purple-200' },
  'ABSENT':         { color: '#dc2626', bg: '#fee2e2', border: '#fecaca', label: 'Absent',        short: 'A',  tw: 'bg-red-50 text-red-700 border-red-200' },
  'WEEKEND':        { color: '#94a3b8', bg: '#f1f5f9', border: '#e2e8f0', label: 'Weekend',       short: 'W',  tw: 'bg-slate-50 text-slate-400 border-slate-200' },
  'INCOMPLETE':     { color: '#3b82f6', bg: '#eff6ff', border: '#bfdbfe', label: 'Active',        short: 'AC', tw: 'bg-blue-50 text-blue-700 border-blue-200' },
  'LEAVE':          { color: '#64748b', bg: '#f1f5f9', border: '#e2e8f0', label: 'Leave',         short: 'L',  tw: 'bg-slate-100 text-slate-600 border-slate-300' },
  'OFFICE HOLIDAY': { color: '#d97706', bg: '#fef3c7', border: '#fde68a', label: 'Office Holiday', short: 'OH', tw: 'bg-amber-50 text-amber-700 border-amber-200' },
  'PUBLIC HOLIDAY': { color: '#d97706', bg: '#fffbeb', border: '#fde68a', label: 'Public Holiday', short: 'H',  tw: 'bg-amber-50 text-amber-600 border-amber-200' },
  '-':              { color: '#e2e8f0', bg: 'transparent', border: '#e2e8f0', label: '-',         short: '',   tw: 'bg-slate-50 text-slate-300 border-slate-100' },
};

/**
 * Get status config — normalizes status string and returns config
 */
export const getStatusConfig = (status) => {
  const s = (status || '').toUpperCase().trim();
  return STATUS_CONFIG[s] || STATUS_CONFIG['-'];
};

/**
 * Get status badge classes (Tailwind) for inline use
 */
export const getStatusTw = (status) => getStatusConfig(status).tw;
