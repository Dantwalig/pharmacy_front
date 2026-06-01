'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    startOfWeek,
    addDays,
    addWeeks,
    subWeeks,
    format,
    startOfMonth,
    endOfMonth,
    eachDayOfInterval,
    isSameDay,
    isToday
} from 'date-fns';
import { ChevronLeftIcon, ChevronRightIcon, CalendarIcon, PlusIcon } from '@heroicons/react/24/outline';
import { MOCK_SCHEDULE } from '@/mock/hospital/schedule';
import { ScheduleEntry, EntryColor } from '@/types/hospital';

const COLOR_MAP: Record<EntryColor, string> = {
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    green: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    orange: 'bg-orange-50 text-orange-700 border-orange-200',
    purple: 'bg-purple-50 text-purple-700 border-purple-200',
    red: 'bg-red-50 text-red-700 border-red-200',
};

export default function DoctorSchedulePage() {
    const { t } = useTranslation();
    const [currentDate, setCurrentDate] = useState(new Date('2026-06-01')); // Setting to June 1st to match mock data week
    const [viewMode, setViewMode] = useState<'WEEK' | 'MONTH'>('WEEK');

    const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 }); // Monday
    const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

    const handlePrev = () => {
        if (viewMode === 'WEEK') setCurrentDate(subWeeks(currentDate, 1));
        else setCurrentDate(addDays(monthStart, -1));
    };

    const handleNext = () => {
        if (viewMode === 'WEEK') setCurrentDate(addWeeks(currentDate, 1));
        else setCurrentDate(addDays(monthEnd, 1));
    };

    const getEntriesForDay = (day: Date) => {
        return MOCK_SCHEDULE.filter(entry =>
            format(new Date(entry.date), 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd')
        );
    };

    return (
        <div className="max-w-7xl mx-auto p-4 lg:p-8 space-y-6">
            {/* ── Page Hero ── */}
            <div
                className="relative rounded-3xl overflow-hidden px-8 py-12 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100/50 shadow-sm"
            >
                <div className="relative z-10">
                    <h1 className="text-4xl font-extrabold text-blue-900 tracking-tight">
                        {t('hospital.schedule') || 'Doctor Schedule & Calendar'}
                    </h1>
                    <p className="text-blue-600/80 mt-2 text-lg font-medium">
                        Organize, view, and reserve time slots for examinations, surgeries, and clinics.
                    </p>
                </div>
                <div className="absolute top-1/2 -right-8 -translate-y-1/2 opacity-10">
                    <CalendarIcon className="w-64 h-64 text-blue-600" />
                </div>
            </div>

            {/* ── Controls ── */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-2 bg-gray-50 p-1 rounded-xl border border-gray-100">
                    <button
                        onClick={() => setViewMode('WEEK')}
                        className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all ${viewMode === 'WEEK'
                                ? 'bg-blue-600 text-white shadow-md'
                                : 'text-gray-500 hover:text-gray-800'
                            }`}
                    >
                        Weekly Overview
                    </button>
                    <button
                        onClick={() => setViewMode('MONTH')}
                        className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all ${viewMode === 'MONTH'
                                ? 'bg-blue-600 text-white shadow-md'
                                : 'text-gray-500 hover:text-gray-800'
                            }`}
                    >
                        Monthly View
                    </button>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handlePrev}
                            className="p-2 rounded-full hover:bg-gray-100 transition-colors border border-gray-200"
                        >
                            <ChevronLeftIcon className="w-5 h-5 text-gray-600" />
                        </button>
                        <span className="text-base font-bold text-gray-700 min-w-[140px] text-center">
                            {viewMode === 'WEEK'
                                ? `${format(weekDays[0], 'MMM d')} - ${format(weekDays[6], 'MMM d, yyyy')}`
                                : format(currentDate, 'MMMM yyyy')
                            }
                        </span>
                        <button
                            onClick={handleNext}
                            className="p-2 rounded-full hover:bg-gray-100 transition-colors border border-gray-200"
                        >
                            <ChevronRightIcon className="w-5 h-5 text-gray-600" />
                        </button>
                    </div>

                    <button className="flex items-center gap-2 bg-sky-500 hover:bg-sky-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm transition-all">
                        <PlusIcon className="w-4 h-4" />
                        Reserve Time Slot
                    </button>
                </div>
            </div>

            {/* ── Weekly View ── */}
            {viewMode === 'WEEK' && (
                <div className="grid grid-cols-7 gap-4">
                    {weekDays.map((day, idx) => {
                        const dayEntries = getEntriesForDay(day);
                        const isTodayDay = isToday(day);

                        return (
                            <div key={idx} className="flex flex-col gap-4">
                                <div className={`text-center py-3 rounded-xl border transition-all ${isTodayDay
                                        ? 'bg-blue-50 border-blue-200 shadow-sm'
                                        : 'bg-white border-gray-100'
                                    }`}>
                                    <p className={`text-xs font-bold uppercase tracking-wider ${isTodayDay ? 'text-blue-600' : 'text-gray-400'}`}>
                                        {format(day, 'EEE')}
                                    </p>
                                    <p className={`text-xl font-black mt-0.5 ${isTodayDay ? 'text-blue-700' : 'text-gray-800'}`}>
                                        {format(day, 'd')}
                                    </p>
                                </div>

                                <div className={`flex-1 min-h-[500px] rounded-2xl p-3 space-y-3 transition-colors ${isTodayDay ? 'bg-blue-50/30' : 'bg-gray-50/50'
                                    }`}>
                                    {dayEntries.length > 0 ? (
                                        dayEntries.map((entry) => (
                                            <div
                                                key={entry.id}
                                                className={`p-3 rounded-xl border shadow-sm transition-transform hover:scale-[1.02] cursor-pointer ${COLOR_MAP[entry.color]}`}
                                            >
                                                <p className="text-[10px] font-bold opacity-70 uppercase mb-1">{entry.time}</p>
                                                <p className="text-sm font-bold leading-tight">{entry.patientName}</p>
                                                {entry.type && (
                                                    <p className="text-[10px] font-medium mt-1 truncate opacity-80">{entry.type}</p>
                                                )}
                                            </div>
                                        ))
                                    ) : (
                                        <div className="flex flex-col items-center justify-center h-full opacity-20 py-10">
                                            <CalendarIcon className="w-8 h-8 mb-2" />
                                            <p className="text-xs font-medium">No shifts</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* ── Monthly View ── */}
            {viewMode === 'MONTH' && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-100">
                        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
                            <div key={d} className="py-3 text-center text-xs font-bold text-gray-400 uppercase tracking-widest">{d}</div>
                        ))}
                    </div>
                    <div className="grid grid-cols-7">
                        {/* Pad transition from previous month */}
                        {Array.from({ length: (startOfWeek(monthStart, { weekStartsOn: 1 }).getDay() + 6) % 7 }).map((_, i) => (
                            <div key={`pad-${i}`} className="h-32 border-b border-r border-gray-50 opacity-20" />
                        ))}

                        {monthDays.map((day, idx) => {
                            const entries = getEntriesForDay(day);
                            const isTodayDay = isToday(day);

                            return (
                                <div
                                    key={idx}
                                    className={`h-32 p-3 border-b border-r border-gray-100 transition-colors relative group ${isTodayDay ? 'bg-blue-50/50' : 'hover:bg-gray-50/50'
                                        }`}
                                >
                                    <span className={`text-sm font-bold ${isTodayDay ? 'text-blue-600 bg-blue-100 w-7 h-7 flex items-center justify-center rounded-full' : 'text-gray-700'
                                        }`}>
                                        {format(day, 'd')}
                                    </span>

                                    {entries.length > 0 && (
                                        <div className="mt-2 space-y-1">
                                            <div className="flex items-center gap-1 bg-blue-600 text-white rounded-md px-2 py-1 shadow-sm">
                                                <span className="text-[10px] font-bold">{entries.length}</span>
                                                <span className="text-[10px] font-medium">Shifts</span>
                                            </div>
                                            <div className="flex -space-x-1.5 overflow-hidden">
                                                {entries.slice(0, 3).map((e, i) => (
                                                    <div
                                                        key={e.id}
                                                        className={`w-4 h-4 rounded-full border border-white shadow-sm ${e.color === 'blue' ? 'bg-blue-400' :
                                                                e.color === 'green' ? 'bg-emerald-400' :
                                                                    e.color === 'orange' ? 'bg-orange-400' :
                                                                        e.color === 'purple' ? 'bg-purple-400' : 'bg-red-400'
                                                            }`}
                                                    />
                                                ))}
                                                {entries.length > 3 && (
                                                    <div className="w-4 h-4 rounded-full bg-gray-200 border border-white text-[8px] flex items-center justify-center font-bold text-gray-500">
                                                        +{entries.length - 3}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
