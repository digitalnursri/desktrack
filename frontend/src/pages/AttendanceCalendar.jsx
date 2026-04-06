import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, X, Clock, FileText, Search } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const MONTH_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAY_HEADERS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

const STATUS_MAP = {
  'PRESENT':   { color: '#16a34a', bg: '#dcfce7', label: 'Present', short: 'P' },
  'LATE':      { color: '#d97706', bg: '#fef3c7', label: 'Late', short: 'L' },
  'OVER LATE': { color: '#ea580c', bg: '#ffedd5', label: 'Over Late', short: 'OL' },
  'HALF DAY':  { color: '#9333ea', bg: '#f3e8ff', label: 'Half Day', short: 'HD' },
  'ABSENT':    { color: '#dc2626', bg: '#fee2e2', label: 'Absent', short: 'A' },
  'WEEKEND':   { color: '#94a3b8', bg: '#f1f5f9', label: 'Weekend', short: 'W' },
  '-':         { color: '#e2e8f0', bg: 'transparent', label: '-', short: '' },
};

const getS = (status) => STATUS_MAP[status] || STATUS_MAP['-'];

// Mini calendar for sidebar
const MiniCalendar = ({ month, year, onSelect, today }) => {
  const firstDow = new Date(year, month - 1, 1).getDay();
  const lastDay = new Date(year, month, 0).getDate();
  const todayStr = today.toISOString().split('T')[0];

  return (
    <div>
      <div className="grid grid-cols-7 gap-0 mb-1">
        {['S','M','T','W','T','F','S'].map((d, i) => (
          <div key={i} className="text-center text-[10px] font-semibold text-slate-400 py-1">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-0">
        {Array.from({ length: firstDow }, (_, i) => <div key={`p${i}`} className="h-7" />)}
        {Array.from({ length: lastDay }, (_, i) => {
          const d = i + 1;
          const dateStr = `${year}-${String(month).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
          const isToday = dateStr === todayStr;
          return (
            <button key={d} className={`h-7 w-7 mx-auto rounded-full text-xs font-medium transition-colors
              ${isToday ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
            >{d}</button>
          );
        })}
      </div>
    </div>
  );
};

const AttendanceCalendar = () => {
  const { user } = useAuth();
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [visibleEmps, setVisibleEmps] = useState({});
  const [detailPopup, setDetailPopup] = useState(null);
  const [empSearch, setEmpSearch] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/attendance/monthly?month=${month}&year=${year}`);
        setData(res.data);
        // Show all employees by default
        const vis = {};
        res.data.employees.forEach(e => { vis[e.id] = true; });
        setVisibleEmps(vis);
      } catch (err) {
        console.error('Failed to fetch monthly attendance:', err);
      }
      setLoading(false);
    };
    fetchData();
  }, [month, year]);

  const prevMonth = () => {
    if (month === 1) { setMonth(12); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (month === 12) { setMonth(1); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  };
  const goToday = () => { setMonth(now.getMonth() + 1); setYear(now.getFullYear()); };

  const toggleEmp = (id) => setVisibleEmps(v => ({ ...v, [id]: !v[id] }));
  const allVisible = data ? data.employees.every(e => visibleEmps[e.id]) : false;
  const toggleAll = () => {
    if (!data) return;
    const next = {};
    data.employees.forEach(e => { next[e.id] = !allVisible; });
    setVisibleEmps(next);
  };

  const formatTimeIST = (iso) => {
    if (!iso) return '-';
    try { return new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true, timeZone: 'Asia/Kolkata' }); }
    catch { return '-'; }
  };

  // Build calendar grid data
  const todayStr = now.toISOString().split('T')[0];
  const firstDow = new Date(year, month - 1, 1).getDay();
  const lastDay = new Date(year, month, 0).getDate();

  // Weeks array: each week = array of 7 day slots (null for padding)
  const weeks = [];
  let currentWeek = Array(firstDow).fill(null);
  for (let d = 1; d <= lastDay; d++) {
    currentWeek.push(d);
    if (currentWeek.length === 7) { weeks.push(currentWeek); currentWeek = []; }
  }
  if (currentWeek.length > 0) {
    while (currentWeek.length < 7) currentWeek.push(null);
    weeks.push(currentWeek);
  }

  const filteredEmps = data ? data.employees.filter(e => {
    if (!visibleEmps[e.id]) return false;
    if (empSearch && !e.name.toLowerCase().includes(empSearch.toLowerCase())) return false;
    return true;
  }) : [];

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-white">
      {/* LEFT SIDEBAR - Google style */}
      <div className="w-60 border-r border-slate-200 flex flex-col shrink-0 bg-white">
        {/* Mini calendar */}
        <div className="p-4 border-b border-slate-100">
          <div className="flex items-center justify-between mb-3">
            <button onClick={prevMonth} className="p-1 hover:bg-slate-100 rounded-full"><ChevronLeft size={14} className="text-slate-500" /></button>
            <span className="text-sm font-semibold text-slate-700">{MONTH_SHORT[month-1]} {year}</span>
            <button onClick={nextMonth} className="p-1 hover:bg-slate-100 rounded-full"><ChevronRight size={14} className="text-slate-500" /></button>
          </div>
          <MiniCalendar month={month} year={year} today={now} />
        </div>

        {/* Employee list */}
        <div className="flex-1 overflow-y-auto">
          <div className="px-4 pt-3 pb-2">
            <div className="relative mb-2">
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search people"
                value={empSearch}
                onChange={e => setEmpSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <label className="flex items-center gap-2 px-1 py-1.5 cursor-pointer hover:bg-slate-50 rounded">
              <input type="checkbox" checked={allVisible} onChange={toggleAll}
                className="w-3.5 h-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">All Employees</span>
            </label>
          </div>
          <div className="px-3 pb-3 space-y-0.5">
            {(data?.employees || []).filter(e => !empSearch || e.name.toLowerCase().includes(empSearch.toLowerCase())).map(emp => (
              <label key={emp.id} className="flex items-center gap-2.5 px-2 py-1.5 cursor-pointer hover:bg-slate-50 rounded-md group">
                <input type="checkbox" checked={!!visibleEmps[emp.id]} onChange={() => toggleEmp(emp.id)}
                  className="w-3.5 h-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-[10px] font-bold text-blue-700 shrink-0">
                  {emp.name.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase()}
                </div>
                <span className="text-xs font-medium text-slate-700 truncate">{emp.name}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="p-4 border-t border-slate-100">
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Status Legend</p>
          <div className="grid grid-cols-2 gap-1">
            {Object.entries(STATUS_MAP).filter(([k]) => k !== '-').map(([key, val]) => (
              <div key={key} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: val.color }} />
                <span className="text-[10px] text-slate-500">{val.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* MAIN CALENDAR AREA */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-slate-200 shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={goToday} className="px-4 py-1.5 text-sm font-medium border border-slate-300 rounded-md hover:bg-slate-50 transition-colors">Today</button>
            <button onClick={prevMonth} className="p-1.5 hover:bg-slate-100 rounded-full transition-colors"><ChevronLeft size={20} className="text-slate-600" /></button>
            <button onClick={nextMonth} className="p-1.5 hover:bg-slate-100 rounded-full transition-colors"><ChevronRight size={20} className="text-slate-600" /></button>
            <h1 className="text-xl font-normal text-slate-800">{MONTH_NAMES[month - 1]} {year}</h1>
          </div>
          {data && (
            <div className="flex items-center gap-4 text-xs text-slate-500">
              <span>{filteredEmps.length} employee{filteredEmps.length !== 1 ? 's' : ''}</span>
            </div>
          )}
        </div>

        {/* Calendar grid */}
        {loading || !data ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full" />
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto">
            <table className="w-full border-collapse table-fixed">
              <thead className="sticky top-0 z-10 bg-white">
                <tr>
                  {DAY_HEADERS.map((d, i) => (
                    <th key={d} className={`text-xs font-medium py-2 border-b border-slate-200 text-center
                      ${i === 0 || i === 6 ? 'text-slate-400' : 'text-slate-500'}`}>{d}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {weeks.map((week, wi) => (
                  <tr key={wi} className="border-b border-slate-100">
                    {week.map((day, di) => {
                      if (day === null) {
                        return <td key={`empty-${di}`} className="border-r border-slate-100 bg-slate-50/50 h-28" />;
                      }

                      const dateStr = `${year}-${String(month).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
                      const isToday = dateStr === todayStr;
                      const isWeekend = di === 0 || di === 6;

                      return (
                        <td key={day} className={`border-r border-slate-100 align-top p-0 h-28 transition-colors
                          ${isWeekend ? 'bg-slate-50/70' : 'bg-white'} hover:bg-blue-50/30`}>
                          {/* Date number */}
                          <div className="px-2 pt-1.5 pb-1 flex justify-end">
                            <span className={`text-xs font-medium leading-none flex items-center justify-center
                              ${isToday ? 'w-6 h-6 bg-blue-600 text-white rounded-full' : isWeekend ? 'text-slate-400' : 'text-slate-600'}`}>
                              {day}
                            </span>
                          </div>

                          {/* Employee attendance chips */}
                          <div className="px-1 space-y-[2px] overflow-y-auto max-h-[80px] custom-scrollbar">
                            {filteredEmps.map(emp => {
                              const rec = data.records[emp.id]?.[dateStr] || { status: '-' };
                              if (rec.status === '-') return null;
                              const s = getS(rec.status);
                              const hasDetail = rec.check_in;

                              return (
                                <button
                                  key={emp.id}
                                  onClick={() => hasDetail && setDetailPopup({ emp, dateStr, rec })}
                                  className={`w-full text-left rounded-[4px] px-1.5 py-[3px] text-[10px] font-medium truncate transition-opacity block
                                    ${hasDetail ? 'cursor-pointer hover:opacity-80' : 'cursor-default'}`}
                                  style={{ backgroundColor: s.bg, color: s.color, borderLeft: `3px solid ${s.color}` }}
                                  title={`${emp.name}: ${s.label}${rec.workHours ? ' | ' + rec.workHours : ''}`}
                                >
                                  {emp.name.split(' ')[0]} - {s.short}{rec.workHours && rec.status !== 'ABSENT' && rec.status !== 'WEEKEND' ? ` ${rec.workHours}` : ''}
                                </button>
                              );
                            })}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* DETAIL POPUP */}
      {detailPopup && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/20" onClick={() => setDetailPopup(null)}>
          <div className="w-full max-w-md bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden" onClick={e => e.stopPropagation()}>
            {/* Header stripe */}
            <div className="h-2" style={{ backgroundColor: getS(detailPopup.rec.status).color }} />

            <div className="p-5">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-medium text-slate-900">{detailPopup.emp.name}</h3>
                  <p className="text-sm text-slate-500">{new Date(detailPopup.dateStr + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
                </div>
                <button onClick={() => setDetailPopup(null)} className="p-1 hover:bg-slate-100 rounded-full transition-colors">
                  <X size={20} className="text-slate-400" />
                </button>
              </div>

              {/* Status */}
              {(() => {
                const s = getS(detailPopup.rec.status);
                return (
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-5"
                    style={{ backgroundColor: s.bg, color: s.color }}>
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
                    {s.label}
                  </div>
                );
              })()}

              {/* Info grid */}
              <div className="space-y-3">
                <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 rounded-lg">
                  <Clock size={18} className="text-blue-500" />
                  <div>
                    <p className="text-[11px] text-slate-400 font-medium uppercase">Check-in / Check-out</p>
                    <p className="text-sm font-semibold text-slate-800">
                      {formatTimeIST(detailPopup.rec.check_in)}
                      <span className="text-slate-300 mx-2">→</span>
                      {detailPopup.rec.check_out ? formatTimeIST(detailPopup.rec.check_out) : <span className="text-amber-500">Missed</span>}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="px-4 py-3 rounded-lg" style={{ backgroundColor: '#f0fdf4' }}>
                    <p className="text-[11px] text-emerald-500 font-medium uppercase">Work Hours</p>
                    <p className="text-base font-semibold text-emerald-700">{detailPopup.rec.workHours || '0h 00m'}</p>
                  </div>
                  <div className="px-4 py-3 rounded-lg" style={{ backgroundColor: '#eff6ff' }}>
                    <p className="text-[11px] text-blue-500 font-medium uppercase">Break Time</p>
                    <p className="text-base font-semibold text-blue-700">{detailPopup.rec.breakTime || '0h 00m'}</p>
                  </div>
                </div>

                {detailPopup.rec.remarks && (
                  <div className="flex items-start gap-3 px-4 py-3 bg-amber-50 rounded-lg">
                    <FileText size={16} className="text-amber-500 mt-0.5" />
                    <div>
                      <p className="text-[11px] text-amber-500 font-medium uppercase">Remarks</p>
                      <p className="text-sm text-amber-800">{detailPopup.rec.remarks}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendanceCalendar;
