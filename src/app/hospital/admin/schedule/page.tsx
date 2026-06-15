'use client';

import { useState, useMemo } from 'react';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  VideoCameraIcon,
  UserIcon,
  PhoneIcon,
  MagnifyingGlassIcon,
  Cog6ToothIcon,
  PlusIcon,
  ChevronDownIcon,
  CalendarDaysIcon,
} from '@heroicons/react/24/outline';
import { MOCK_SCHEDULE, DOCTOR_COLORS } from '@/mock/hospital/schedule';
import type { ScheduleEntry } from '@/types/hospital';

const NAVY = '#1E3A5F';
const TEAL = '#38BDF8';

// Pastel card palette keyed to the color field on ScheduleEntry
const CARD_PALETTE: Record<string, { bg: string; fg: string }> = {
  blue:   { bg: '#EFF6FF', fg: '#1E40AF' },
  green:  { bg: '#F0FDF4', fg: '#166534' },
  purple: { bg: '#F5F3FF', fg: '#5B21B6' },
  orange: { bg: '#FFF7ED', fg: '#9A3412' },
  red:    { bg: '#FFF1F2', fg: '#9F1239' },
};

function cardColors(color: string) {
  return CARD_PALETTE[color] ?? CARD_PALETTE.blue;
}

function typeDisplay(type?: string): { label: string; Icon: React.ElementType } {
  if (type === 'VIDEO_CALL' || type === 'ONLINE') return { label: 'Video Call', Icon: VideoCameraIcon };
  if (type === 'AUDIO_CALL') return { label: 'Audio Call', Icon: PhoneIcon };
  return { label: 'In Person', Icon: UserIcon };
}

// ── Date helpers ────────────────────────────────────────────────────────────

function getMondayOfWeek(d: Date): Date {
  const dow = d.getUTCDay(); // 0=Sun
  const diff = dow === 0 ? -6 : 1 - dow;
  const m = new Date(d);
  m.setUTCDate(d.getUTCDate() + diff);
  return m;
}

function getWeekDates(monday: Date): Date[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setUTCDate(monday.getUTCDate() + i);
    return d;
  });
}

function toISO(d: Date) { return d.toISOString().slice(0, 10); }

function parseMin(t: string) {
  const [h, m] = (t ?? '00:00').split(':').map(Number);
  return h * 60 + m;
}

function fmt12(h: number) {
  return h === 12 ? '12 PM' : h > 12 ? `${h - 12} PM` : `${h} AM`;
}

// ── Constants ────────────────────────────────────────────────────────────────

const HOUR_SLOTS = [8, 9, 10, 11, 12, 13, 14, 15];
const DAY_LABELS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'];
const DOW_ABBR = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

// Mock "today" anchored to the demo data week so the calendar pre-loads with data
const MOCK_TODAY = new Date('2026-06-02T00:00:00Z');

// ── Component ────────────────────────────────────────────────────────────────

export default function HospitalAdminSchedulePage() {
  const todayStr = toISO(MOCK_TODAY);

  // Week being viewed
  const [weekStart, setWeekStart] = useState(() => getMondayOfWeek(MOCK_TODAY));

  // Mini-calendar month being shown
  const [calYear, setCalYear] = useState(MOCK_TODAY.getUTCFullYear());
  const [calMonth, setCalMonth] = useState(MOCK_TODAY.getUTCMonth());

  // Mobile left-panel visibility
  const [leftOpen, setLeftOpen] = useState(false);

  // Week / Month tab (Month is visual only — no grid change)
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week');

  const weekDates = useMemo(() => getWeekDates(weekStart), [weekStart]);

  const prevWeek = () => {
    const d = new Date(weekStart);
    d.setUTCDate(d.getUTCDate() - 7);
    setWeekStart(d);
  };

  const nextWeek = () => {
    const d = new Date(weekStart);
    d.setUTCDate(d.getUTCDate() + 7);
    setWeekStart(d);
  };

  const entriesByDay = useMemo(() => {
    const map = new Map<string, ScheduleEntry[]>();
    for (const wd of weekDates) map.set(toISO(wd), []);
    for (const e of MOCK_SCHEDULE) {
      if (map.has(e.date)) map.get(e.date)!.push(e);
    }
    return map;
  }, [weekDates]);

  const weekLabel = `${weekDates[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' })} – ${weekDates[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' })}`;

  // Mini-calendar helpers
  const daysInMonth = new Date(Date.UTC(calYear, calMonth + 1, 0)).getUTCDate();
  const firstDow    = new Date(Date.UTC(calYear, calMonth, 1)).getUTCDay(); // 0=Sun

  const handleCalDay = (day: number) => {
    const clicked = new Date(Date.UTC(calYear, calMonth, day));
    setWeekStart(getMondayOfWeek(clicked));
  };

  const prevCalMonth = () => calMonth === 0 ? (setCalYear(y => y - 1), setCalMonth(11)) : setCalMonth(m => m - 1);
  const nextCalMonth = () => calMonth === 11 ? (setCalYear(y => y + 1), setCalMonth(0)) : setCalMonth(m => m + 1);

  // Doctor legend
  const doctorLegend = useMemo(() => {
    const seen = new Set<string>();
    return MOCK_SCHEDULE.reduce<{ id: string; name: string; color: string }[]>((acc, e) => {
      const id = e.doctorId ?? '';
      if (id && !seen.has(id)) {
        seen.add(id);
        acc.push({ id, name: e.doctorName ?? '', color: DOCTOR_COLORS[id] ?? '#999' });
      }
      return acc;
    }, []);
  }, []);

  // ── Left panel ─────────────────────────────────────────────────────────────

  const leftPanel = (
    <div className="space-y-3">
      {/* Mini calendar */}
      <div className="bg-white rounded-2xl p-4 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <button onClick={prevCalMonth} className="p-1 rounded-lg hover:bg-gray-100">
            <ChevronLeftIcon className="w-3.5 h-3.5 text-gray-500" />
          </button>
          <span className="text-[11px] font-bold" style={{ color: NAVY }}>
            {MONTH_NAMES[calMonth]} {calYear}
          </span>
          <button onClick={nextCalMonth} className="p-1 rounded-lg hover:bg-gray-100">
            <ChevronRightIcon className="w-3.5 h-3.5 text-gray-500" />
          </button>
        </div>

        {/* Day-of-week header */}
        <div className="grid grid-cols-7 mb-1">
          {DOW_ABBR.map((d, i) => (
            <div key={i} className="text-center text-[9px] font-semibold text-gray-400">{d}</div>
          ))}
        </div>

        {/* Day grid */}
        <div className="grid grid-cols-7 gap-y-0.5">
          {Array.from({ length: firstDow }, (_, i) => <div key={`e${i}`} />)}
          {Array.from({ length: daysInMonth }, (_, i) => {
            const day = i + 1;
            const dateStr = `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const isToday  = dateStr === todayStr;
            const isInWeek = weekDates.some(d => toISO(d) === dateStr);
            return (
              <button
                key={day}
                onClick={() => handleCalDay(day)}
                className="w-6 h-6 mx-auto flex items-center justify-center text-[11px] rounded-full transition-colors hover:opacity-90"
                style={
                  isToday  ? { backgroundColor: TEAL,  color: '#fff', fontWeight: 700 } :
                  isInWeek ? { backgroundColor: NAVY,  color: '#fff', opacity: 0.55 }  :
                             { color: '#374151' }
                }
              >
                {day}
              </button>
            );
          })}
        </div>
      </div>

      {/* Search for people */}
      <div className="bg-white rounded-2xl px-3 py-2.5 shadow-sm">
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          <input
            type="text"
            placeholder="Search for people"
            className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-200"
          />
        </div>
      </div>

      {/* Booking pages + My/Other calendars */}
      <div className="bg-white rounded-2xl p-4 shadow-sm space-y-4">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Booking Pages</p>

        {/* My calendars */}
        <div>
          <button className="flex items-center gap-1.5 text-[11px] font-semibold text-gray-700 w-full">
            <ChevronDownIcon className="w-3 h-3 shrink-0" />
            My calendars
          </button>
          <div className="mt-2 pl-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm shrink-0" style={{ backgroundColor: TEAL }} />
              <span className="text-[11px] text-gray-600">Hospital Admin</span>
            </div>
          </div>
        </div>

        {/* Other calendars */}
        <div>
          <button className="flex items-center gap-1.5 text-[11px] font-semibold text-gray-700 w-full group">
            <PlusIcon className="w-3 h-3 shrink-0 group-hover:text-sky-500 transition-colors" />
            Other calendars
          </button>
        </div>
      </div>
    </div>
  );

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div>
      {/* Mobile panel toggle */}
      <button
        className="lg:hidden mb-4 inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-white"
        style={{ backgroundColor: NAVY }}
        onClick={() => setLeftOpen(o => !o)}
      >
        <CalendarDaysIcon className="w-4 h-4" />
        {leftOpen ? 'Hide panel' : 'Calendar panel'}
      </button>

      <div className="flex gap-5 items-start">
        {/* Left panel */}
        <aside className={`w-52 shrink-0 ${leftOpen ? 'block' : 'hidden'} lg:block`}>
          {leftPanel}
        </aside>

        {/* Main content */}
        <div className="flex-1 min-w-0 space-y-4">
          {/* Page header */}
          <div className="rounded-2xl px-8 py-6" style={{ background: '#EBF5FF' }}>
            <div className="flex items-start justify-between flex-wrap gap-3">
              <div>
                <h1 className="text-3xl font-extrabold tracking-tight" style={{ color: NAVY }}>
                  SCHEDULE
                </h1>
                <p className="mt-0.5 text-sm text-gray-500">Appointment list &middot; Today</p>
              </div>
              <button
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90"
                style={{ backgroundColor: TEAL }}
              >
                Try now
                <ChevronRightIcon className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Calendar card */}
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            {/* Navigation bar */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100 flex-wrap">
              {/* Week / Month toggle */}
              <div className="flex rounded-lg border border-gray-200 overflow-hidden text-xs font-semibold">
                <button
                  onClick={() => setViewMode('week')}
                  className="px-4 py-1.5 transition-colors"
                  style={viewMode === 'week' ? { backgroundColor: NAVY, color: '#fff' } : { color: '#6B7280' }}
                >
                  Week
                </button>
                <button
                  onClick={() => setViewMode('month')}
                  className="px-4 py-1.5 transition-colors"
                  style={viewMode === 'month' ? { backgroundColor: NAVY, color: '#fff' } : { color: '#6B7280' }}
                >
                  Month
                </button>
              </div>

              {/* Arrows + date range */}
              <div className="flex items-center gap-1 flex-1 justify-center min-w-0">
                <button onClick={prevWeek} className="p-1.5 rounded-lg hover:bg-gray-100 shrink-0">
                  <ChevronLeftIcon className="w-4 h-4 text-gray-500" />
                </button>
                <span className="text-xs font-semibold px-1 truncate" style={{ color: NAVY }}>
                  {weekLabel}
                </span>
                <button onClick={nextWeek} className="p-1.5 rounded-lg hover:bg-gray-100 shrink-0">
                  <ChevronRightIcon className="w-4 h-4 text-gray-500" />
                </button>
              </div>

              {/* Search + Settings */}
              <div className="flex items-center gap-1 shrink-0">
                <button className="p-1.5 rounded-lg hover:bg-gray-100">
                  <MagnifyingGlassIcon className="w-4 h-4 text-gray-500" />
                </button>
                <button className="p-1.5 rounded-lg hover:bg-gray-100">
                  <Cog6ToothIcon className="w-4 h-4 text-gray-500" />
                </button>
              </div>
            </div>

            {/* Grid — scrolls horizontally on small screens */}
            <div className="overflow-x-auto">
              <div className="min-w-[640px]">
                {/* Day-column headers */}
                <div className="grid border-b border-gray-100" style={{ gridTemplateColumns: '52px repeat(7, 1fr)' }}>
                  <div className="py-3 text-center text-[9px] text-gray-400 font-semibold uppercase tracking-widest">
                    GMT
                  </div>
                  {weekDates.map((d, i) => {
                    const isToday = toISO(d) === todayStr;
                    return (
                      <div key={i} className="py-2 text-center border-l border-gray-100">
                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                          {DAY_LABELS[i]}
                        </p>
                        <div
                          className="mx-auto mt-1 w-7 h-7 flex items-center justify-center rounded-full text-sm font-bold"
                          style={isToday
                            ? { backgroundColor: TEAL, color: '#fff' }
                            : { color: NAVY }}
                        >
                          {d.getUTCDate()}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Hour rows */}
                {HOUR_SLOTS.map(hour => {
                  const slotStart = hour * 60;
                  const slotEnd   = slotStart + 60;
                  return (
                    <div
                      key={hour}
                      className="grid border-t border-gray-50"
                      style={{ gridTemplateColumns: '52px repeat(7, 1fr)' }}
                    >
                      {/* Time label */}
                      <div className="pr-2 pt-2.5 text-[10px] text-gray-400 font-medium text-right border-r border-gray-100">
                        {fmt12(hour)}
                      </div>

                      {/* Day cells */}
                      {weekDates.map((d, di) => {
                        const isToday  = toISO(d) === todayStr;
                        const daySlots = (entriesByDay.get(toISO(d)) ?? []).filter(e => {
                          const s = parseMin(e.startTime ?? '00:00');
                          return s >= slotStart && s < slotEnd;
                        });
                        return (
                          <div
                            key={di}
                            className="border-l border-gray-100 min-h-[76px] p-1 space-y-1"
                            style={isToday ? { backgroundColor: '#EFF6FF40' } : {}}
                          >
                            {daySlots.map(entry => {
                              const { bg, fg } = cardColors(entry.color as string);
                              const { label, Icon } = typeDisplay(entry.type);
                              return (
                                <div
                                  key={entry.id}
                                  className="rounded-xl px-2.5 py-2 text-xs cursor-default"
                                  style={{ backgroundColor: bg, color: fg }}
                                >
                                  <p className="font-semibold truncate leading-snug">
                                    {entry.doctorName ?? entry.patientName}
                                  </p>
                                  <div className="flex items-center gap-1 mt-0.5 opacity-80">
                                    <Icon className="w-3 h-3 shrink-0" />
                                    <span className="truncate text-[10px]">{label}</span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Doctor legend */}
            <div className="px-5 py-3 border-t border-gray-100 bg-gray-50/40">
              <div className="flex flex-wrap gap-x-5 gap-y-1.5">
                {doctorLegend.map(doc => (
                  <div key={doc.id} className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: doc.color }} />
                    <span className="text-[11px] text-gray-600">{doc.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
