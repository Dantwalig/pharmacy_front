'use client';

import { useState, useMemo } from 'react';
import { ChevronLeftIcon, ChevronRightIcon, VideoCameraIcon, UserIcon } from '@heroicons/react/24/outline';
import { MOCK_SCHEDULE, DOCTOR_COLORS } from '@/mock/hospital/schedule';
import type { ScheduleEntry } from '@/types/hospital';

const NAVY = '#1E3A5F';

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const HOUR_SLOTS = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00'];

function getWeekDates(monday: Date): Date[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setUTCDate(d.getUTCDate() + i);
    return d;
  });
}

function toISODate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function parseMinutes(t: string): number {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

export default function HospitalAdminSchedulePage() {
  // Default to the mock data week (June 2, 2026 — a Monday)
  const [weekStart, setWeekStart] = useState(() => new Date('2026-06-02'));

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
    for (const date of weekDates) {
      map.set(toISODate(date), []);
    }
    for (const entry of MOCK_SCHEDULE) {
      if (map.has(entry.date)) {
        map.get(entry.date)!.push(entry);
      }
    }
    return map;
  }, [weekDates]);

  const weekLabel = `${weekDates[0].toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', timeZone: 'UTC',
  })} – ${weekDates[6].toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC',
  })}`;

  const doctorLegend = useMemo(() => {
    const seen = new Set<string>();
    const result: { id: string; name: string; color: string }[] = [];
    for (const e of MOCK_SCHEDULE) {
      const did = e.doctorId ?? '';
      if (did && !seen.has(did)) {
        seen.add(did);
        result.push({ id: did, name: e.doctorName ?? '', color: DOCTOR_COLORS[did] ?? '#999' });
      }
    }
    return result;
  }, []);

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="rounded-2xl p-8" style={{ background: '#EBF5FF' }}>
        <h1 className="text-3xl font-bold" style={{ color: NAVY }}>Schedule</h1>
        <p className="mt-1 text-sm text-gray-500">Weekly appointment calendar</p>
      </div>

      {/* Calendar card */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {/* Week navigation */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-base font-bold" style={{ color: NAVY }}>Weekly Health Plan</h2>
            <p className="text-xs text-gray-400 mt-0.5">{weekLabel}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={prevWeek}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Previous week"
            >
              <ChevronLeftIcon className="w-5 h-5 text-gray-500" />
            </button>
            <button
              onClick={nextWeek}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Next week"
            >
              <ChevronRightIcon className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Calendar grid — scrollable horizontally on small screens */}
        <div className="overflow-x-auto">
          <div className="min-w-[640px]">
            {/* Day header row */}
            <div
              className="grid border-b border-gray-100"
              style={{ gridTemplateColumns: '64px repeat(7, 1fr)' }}
            >
              <div />
              {weekDates.map((d, i) => (
                <div key={i} className="py-3 text-center border-l border-gray-100">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                    {DAY_LABELS[i]}
                  </p>
                  <p className="text-sm font-bold mt-0.5" style={{ color: NAVY }}>
                    {d.getUTCDate()}
                  </p>
                </div>
              ))}
            </div>

            {/* Hour rows */}
            {HOUR_SLOTS.map(hour => {
              const slotStart = parseMinutes(hour);
              const slotEnd = slotStart + 60;
              return (
                <div
                  key={hour}
                  className="grid border-t border-gray-50"
                  style={{ gridTemplateColumns: '64px repeat(7, 1fr)' }}
                >
                  {/* Hour label */}
                  <div className="px-2 py-2 text-xs text-gray-400 font-medium text-right leading-none pt-2.5">
                    {hour}
                  </div>

                  {/* Day cells */}
                  {weekDates.map((d, dayIdx) => {
                    const dayEntries = (entriesByDay.get(toISODate(d)) ?? []).filter(e => {
                      const start = parseMinutes(e.startTime ?? '00:00');
                      return start >= slotStart && start < slotEnd;
                    });

                    return (
                      <div
                        key={dayIdx}
                        className="border-l border-gray-100 min-h-[72px] p-1 space-y-1"
                      >
                        {dayEntries.map(entry => {
                          const hexColor = DOCTOR_COLORS[entry.doctorId ?? ''] ?? '#2D9B8A';
                          return (
                            <div
                              key={entry.id}
                              className="rounded-lg px-2 py-1.5 text-white text-xs"
                              style={{ backgroundColor: hexColor }}
                            >
                              <p className="font-semibold truncate leading-tight">
                                {entry.patientName}
                              </p>
                              <p className="opacity-90 truncate leading-tight">
                                {(entry.doctorName ?? '').replace('Dr. ', '')}
                              </p>
                              <p className="opacity-75 leading-tight">
                                {entry.startTime}–{entry.endTime}
                              </p>
                              <div className="flex items-center gap-1 opacity-80 mt-0.5">
                                {entry.type === 'ONLINE'
                                  ? <VideoCameraIcon className="w-3 h-3 shrink-0" />
                                  : <UserIcon className="w-3 h-3 shrink-0" />}
                                <span>{entry.type === 'ONLINE' ? 'Online' : 'In-person'}</span>
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

        {/* Doctor colour legend */}
        <div className="px-6 py-4 border-t border-gray-100">
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            {doctorLegend.map(doc => (
              <div key={doc.id} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ backgroundColor: doc.color }}
                />
                <span className="text-xs text-gray-600">{doc.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
