'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    startOfWeek,
    endOfWeek,
    startOfMonth,
    endOfMonth,
    eachDayOfInterval,
    addDays,
    addWeeks,
    subWeeks,
    addMonths,
    subMonths,
    isSameMonth,
    isSameDay,
    format,
    isToday,
} from 'date-fns';
import {
    ChevronLeftIcon,
    ChevronRightIcon,
    ChevronUpIcon,
    PlusIcon,
    VideoCameraIcon,
    UserIcon,
    UsersIcon,
    EllipsisHorizontalIcon,
} from '@heroicons/react/24/outline';
import { MOCK_SCHEDULE } from '@/mock/hospital/schedule';
import { EntryColor } from '@/types/hospital';

const COLOR_MAP: Record<EntryColor, string> = {
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    green: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    orange: 'bg-orange-50 text-orange-700 border-orange-200',
    purple: 'bg-purple-50 text-purple-700 border-purple-200',
    red: 'bg-red-50 text-red-700 border-red-200',
};

// Working hours shown on both views (8 AM – 4 PM)
const HOURS = [8, 9, 10, 11, 12, 13, 14, 15, 16];

function hourLabel(h: number) {
    const period = h < 12 ? 'AM' : 'PM';
    const display = h % 12 === 0 ? 12 : h % 12;
    return `${String(display).padStart(2, '0')}:00 ${period}`;
}

function startHour(entry: { startTime?: string }) {
    return entry.startTime ? parseInt(entry.startTime.split(':')[0], 10) : -1;
}

// ── Mini month calendar used in the calendar-view sidebar ──────────────────────
function MiniCalendar({ selected, onSelect }: { selected: Date; onSelect: (d: Date) => void }) {
    const [month, setMonth] = useState(selected);
    const gridStart = startOfWeek(startOfMonth(month), { weekStartsOn: 0 });
    const gridEnd = endOfWeek(endOfMonth(month), { weekStartsOn: 0 });
    const days = eachDayOfInterval({ start: gridStart, end: gridEnd });

    return (
        <div>
            <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-gray-700">{format(month, 'MMMM yyyy')}</span>
                <div className="flex items-center gap-1">
                    <button onClick={() => setMonth(subMonths(month, 1))} className="p-1 rounded hover:bg-gray-100">
                        <ChevronLeftIcon className="w-3.5 h-3.5 text-gray-400" />
                    </button>
                    <button onClick={() => setMonth(addMonths(month, 1))} className="p-1 rounded hover:bg-gray-100">
                        <ChevronRightIcon className="w-3.5 h-3.5 text-gray-400" />
                    </button>
                </div>
            </div>
            <div className="grid grid-cols-7 text-center text-[10px] font-semibold text-gray-400 mb-1">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => <span key={i}>{d}</span>)}
            </div>
            <div className="grid grid-cols-7 gap-y-1 text-center text-[11px]">
                {days.map((day) => {
                    const muted = !isSameMonth(day, month);
                    const sel = isSameDay(day, selected);
                    const today = isToday(day);
                    return (
                        <button
                            key={day.toISOString()}
                            onClick={() => onSelect(day)}
                            className={`w-6 h-6 mx-auto rounded-full flex items-center justify-center transition-colors ${
                                sel
                                    ? 'bg-blue-600 text-white font-bold'
                                    : today
                                        ? 'text-blue-600 font-bold'
                                        : muted
                                            ? 'text-gray-300'
                                            : 'text-gray-600 hover:bg-gray-100'
                            }`}
                        >
                            {format(day, 'd')}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

export default function DoctorSchedulePage() {
    const { t } = useTranslation();
    const [currentDate, setCurrentDate] = useState(new Date('2026-06-01')); // matches mock week
    const [view, setView] = useState<'LIST' | 'CALENDAR'>('LIST');

    const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 }); // Monday
    const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

    const goPrev = () =>
        view === 'LIST' ? setCurrentDate(addDays(currentDate, -1)) : setCurrentDate(subWeeks(currentDate, 1));
    const goNext = () =>
        view === 'LIST' ? setCurrentDate(addDays(currentDate, 1)) : setCurrentDate(addWeeks(currentDate, 1));

    const dayKey = (d: Date) => format(d, 'yyyy-MM-dd');
    const entriesForDay = (d: Date) => MOCK_SCHEDULE.filter((e) => e.date === dayKey(d));
    const entryAt = (d: Date, hour: number) =>
        MOCK_SCHEDULE.find((e) => e.date === dayKey(d) && startHour(e) === hour);

    const typeMeta = (type?: string) =>
        type === 'ONLINE'
            ? { label: 'Video Call', Icon: VideoCameraIcon }
            : { label: 'In-Person', Icon: UserIcon };

    return (
        <div className="max-w-7xl mx-auto p-4 lg:p-8 space-y-6">
            {/* ── Page Hero ── */}
            <div className="rounded-2xl px-8 py-8" style={{ background: '#EBF5FF' }}>
                <h1 className="text-3xl sm:text-4xl font-bold tracking-tight" style={{ color: '#1E3A5F' }}>
                    {t('hospital.schedule') || 'Doctor Schedule & Calendar'}
                </h1>
                <p className="mt-2 text-sm sm:text-base font-medium" style={{ color: '#3B82F6' }}>
                    Organize, view, and reserve time slots for examinations, surgeries, and clinics.
                </p>
            </div>

            {/* ── Controls ── */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                {/* List / Calendar toggle */}
                <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl">
                    <button
                        onClick={() => setView('LIST')}
                        className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all ${
                            view === 'LIST' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-800'
                        }`}
                    >
                        Daily Schedule
                    </button>
                    <button
                        onClick={() => setView('CALENDAR')}
                        className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all ${
                            view === 'CALENDAR' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-800'
                        }`}
                    >
                        Weekly Overview
                    </button>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <button onClick={goPrev} className="p-2 rounded-full hover:bg-gray-100 transition-colors border border-gray-200">
                            <ChevronLeftIcon className="w-5 h-5 text-gray-600" />
                        </button>
                        <span className="text-sm font-bold text-gray-700 min-w-[180px] text-center">
                            {view === 'LIST'
                                ? format(currentDate, 'EEEE, MMM d, yyyy')
                                : `${format(weekDays[0], 'MMM d')} – ${format(weekDays[6], 'MMM d, yyyy')}`}
                        </span>
                        <button onClick={goNext} className="p-2 rounded-full hover:bg-gray-100 transition-colors border border-gray-200">
                            <ChevronRightIcon className="w-5 h-5 text-gray-600" />
                        </button>
                    </div>

                    <button className="flex items-center gap-2 bg-sky-500 hover:bg-sky-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm transition-all">
                        <PlusIcon className="w-4 h-4" />
                        Reserve Time Slot
                    </button>
                </div>
            </div>

            {/* ── List view ── */}
            {view === 'LIST' && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3 sm:p-4 space-y-2">
                    {HOURS.map((hour) => {
                        const entry = entryAt(currentDate, hour);
                        if (entry) {
                            const accent = COLOR_MAP[entry.color] ?? COLOR_MAP.blue;
                            return (
                                <div
                                    key={hour}
                                    className="flex items-center gap-4 rounded-xl border border-gray-100 bg-white pl-0 pr-4 py-3 shadow-sm overflow-hidden"
                                >
                                    <span className="w-1.5 self-stretch rounded-full bg-blue-500 shrink-0" />
                                    <span className="text-sm font-bold text-gray-700 w-20 shrink-0">{hourLabel(hour)}</span>
                                    <span className="text-sm font-bold text-gray-900 flex-1 truncate">{entry.patientName}</span>
                                    <span className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full border ${accent}`}>
                                        {typeMeta(entry.type).label}
                                    </span>
                                </div>
                            );
                        }
                        return (
                            <div
                                key={hour}
                                className="flex items-center gap-4 rounded-xl bg-gray-50/70 px-4 py-3"
                            >
                                <span className="text-sm font-bold text-gray-500 w-20 shrink-0">{hourLabel(hour)}</span>
                                <span className="text-sm font-medium text-gray-400 flex-1">Available Time Slot</span>
                                <button className="text-[11px] font-semibold text-gray-500 bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-full transition-colors flex items-center gap-1">
                                    <PlusIcon className="w-3 h-3" />
                                    Reserve
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* ── Calendar (weekly time-grid) view ── */}
            {view === 'CALENDAR' && (
              <div className="flex flex-col lg:flex-row gap-6">
                {/* Sidebar */}
                <aside className="w-full lg:w-64 shrink-0 bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-5">
                    <MiniCalendar selected={currentDate} onSelect={setCurrentDate} />

                    {/* Search for people */}
                    <div className="relative">
                        <UsersIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search for people"
                            className="w-full pl-9 pr-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                        />
                    </div>

                    {/* Booking Pages */}
                    <button className="w-full flex items-center justify-between text-sm font-semibold text-gray-700 hover:text-gray-900 transition-colors">
                        <span>Booking Pages</span>
                        <PlusIcon className="w-4 h-4 text-gray-400" />
                    </button>

                    {/* My calendars */}
                    <div>
                        <div className="flex items-center justify-between text-sm font-semibold text-gray-700 mb-2">
                            <span>My calendars</span>
                            <ChevronUpIcon className="w-4 h-4 text-gray-400" />
                        </div>
                        <div className="flex items-center gap-2 pl-1">
                            <span className="w-3.5 h-3.5 rounded-sm shrink-0" style={{ background: '#22D3EE' }} />
                            <span className="text-xs text-gray-600 flex-1 truncate">Dr. Charles Edwin</span>
                            <EllipsisHorizontalIcon className="w-4 h-4 text-gray-300" />
                        </div>
                    </div>

                    {/* Other calendars */}
                    <div className="flex items-center justify-between text-sm font-semibold text-gray-700">
                        <span>Other calendars</span>
                        <div className="flex items-center gap-1">
                            <PlusIcon className="w-4 h-4 text-gray-400" />
                            <ChevronUpIcon className="w-4 h-4 text-gray-400" />
                        </div>
                    </div>
                </aside>

                {/* Week grid */}
                <div className="flex-1 min-w-0 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-x-auto">
                    <div className="min-w-[640px]">
                        {/* Day header row */}
                        <div className="grid border-b border-gray-100" style={{ gridTemplateColumns: '64px repeat(7, 1fr)' }}>
                            <div className="py-3" />
                            {weekDays.map((day) => {
                                const todayCol = isToday(day);
                                return (
                                    <div key={day.toISOString()} className="py-3 text-center border-l border-gray-100">
                                        <p className={`text-[11px] font-bold uppercase tracking-wider ${todayCol ? 'text-blue-600' : 'text-gray-400'}`}>
                                            {format(day, 'EEE')}
                                        </p>
                                        <p
                                            className={`mt-1 text-sm font-bold inline-flex items-center justify-center w-7 h-7 rounded-full ${
                                                todayCol ? 'bg-blue-600 text-white' : 'text-gray-700'
                                            }`}
                                        >
                                            {format(day, 'd')}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Hour rows */}
                        {HOURS.map((hour) => (
                            <div
                                key={hour}
                                className="grid border-b border-gray-50 last:border-0"
                                style={{ gridTemplateColumns: '64px repeat(7, 1fr)' }}
                            >
                                <div className="py-4 pr-2 text-right text-[11px] font-semibold text-gray-400">
                                    {hourLabel(hour).replace(':00', '')}
                                </div>
                                {weekDays.map((day) => {
                                    const entry = entryAt(day, hour);
                                    return (
                                        <div key={day.toISOString()} className="min-h-[72px] border-l border-gray-100 p-1.5">
                                            {entry && (() => {
                                                const meta = typeMeta(entry.type);
                                                const accent = COLOR_MAP[entry.color] ?? COLOR_MAP.blue;
                                                return (
                                                    <div className={`h-full rounded-lg border p-2 ${accent}`}>
                                                        <p className="text-[10px] font-semibold opacity-80">
                                                            {entry.startTime && format(new Date(`2026-01-01T${entry.startTime}`), 'h:mm a')}
                                                        </p>
                                                        <p className="text-xs font-bold leading-tight mt-0.5 truncate">{entry.patientName}</p>
                                                        <p className="flex items-center gap-1 text-[10px] font-medium opacity-80 mt-1">
                                                            <meta.Icon className="w-3 h-3" />
                                                            {meta.label}
                                                        </p>
                                                    </div>
                                                );
                                            })()}
                                        </div>
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                </div>
              </div>
            )}

            {/* Empty-day hint for list view */}
            {view === 'LIST' && entriesForDay(currentDate).length === 0 && (
                <p className="text-center text-xs text-gray-400">No reservations yet for this day — all slots are available.</p>
            )}
        </div>
    );
}
