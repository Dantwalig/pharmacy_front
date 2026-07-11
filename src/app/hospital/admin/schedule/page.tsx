'use client';

import { useEffect, useMemo, useState } from 'react';
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
    CalendarIcon,
    Cog6ToothIcon,
    VideoCameraIcon,
    UserIcon,
    UsersIcon,
} from '@heroicons/react/24/outline';
import api from '@/lib/api';
import { useHospitalId } from '@/lib/hospital';

// GET /hospitals/:id/doctors row
interface BackendDoctor {
    id: string;
    firstName: string | null;
    lastName: string | null;
    specialization: string;
}

// GET /appointments (HOSPITAL_ADMIN-scoped) row
interface BackendAppointment {
    id: string;
    date: string;
    status: string;
    type?: string;
    doctorId: string;
    patient: { firstName: string; lastName: string };
    doctor: { id: string; firstName: string | null; lastName: string | null } | null;
}

// Deterministic colour per doctor id, same idea as the old mock's
// DOCTOR_COLORS lookup, but generated instead of hand-listed so it works for
// any real doctor id.
const PALETTE = ['#2D9B8A', '#1E4D8C', '#7C3AED', '#B45309', '#0891B2', '#059669', '#DB2777'];
function colorForDoctor(doctorId: string) {
    let hash = 0;
    for (let i = 0; i < doctorId.length; i++) hash = (hash * 31 + doctorId.charCodeAt(i)) >>> 0;
    return PALETTE[hash % PALETTE.length];
}

const HOURS = [8, 9, 10, 11, 12, 13, 14, 15, 16];

function hourLabel(h: number) {
    const period = h < 12 ? 'AM' : 'PM';
    const display = h % 12 === 0 ? 12 : h % 12;
    return `${display} ${period}`;
}

function doctorName(doc: { firstName: string | null; lastName: string | null } | null | undefined) {
    if (!doc) return 'Unassigned';
    const name = [doc.firstName, doc.lastName].filter(Boolean).join(' ');
    return name ? `Dr. ${name}` : 'Unassigned';
}

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
                                sel ? 'bg-blue-600 text-white font-bold'
                                    : today ? 'text-blue-600 font-bold'
                                    : muted ? 'text-gray-300'
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

export default function HospitalAdminSchedulePage() {
    const hospitalId = useHospitalId();

    const [currentDate, setCurrentDate] = useState(new Date());
    const [viewMode, setViewMode] = useState<'WEEK' | 'MONTH'>('WEEK');

    const [doctors, setDoctors] = useState<BackendDoctor[]>([]);
    const [doctorsLoading, setDoctorsLoading] = useState(true);
    const [selectedDoctorId, setSelectedDoctorId] = useState<string | null>(null);
    const [doctorSearch, setDoctorSearch] = useState('');

    const [appointments, setAppointments] = useState<BackendAppointment[]>([]);
    const [apptsLoading, setApptsLoading] = useState(true);

    // GET /doctors/:doctorId/slots?date=YYYY-MM-DD for the selected doctor and
    // the currently-selected calendar day. NOTE: this returns *available*
    // (bookable) slots, not existing bookings — a genuinely different thing
    // from the hourly grid below, which shows real appointments. See
    // src/docs/HOSPITAL_FRONTEND_BACKEND_GAPS.md (Gap SC-1) for why these are
    // kept as two separate panels rather than merged into one, and why month
    // view doesn't use this endpoint at all (it has no date-range mode, only
    // a single date per call).
    const [openSlots, setOpenSlots] = useState<string[]>([]);
    const [slotsLoading, setSlotsLoading] = useState(false);
    const [slotsError, setSlotsError] = useState(false);

    useEffect(() => {
        if (!hospitalId) { setDoctorsLoading(false); setApptsLoading(false); return; }
        api.get<BackendDoctor[]>(`/hospitals/${hospitalId}/doctors`)
            .then(res => setDoctors(Array.isArray(res.data) ? res.data : []))
            .catch(() => setDoctors([]))
            .finally(() => setDoctorsLoading(false));

        api.get<BackendAppointment[]>('/appointments')
            .then(res => setAppointments(Array.isArray(res.data) ? res.data : []))
            .catch(() => setAppointments([]))
            .finally(() => setApptsLoading(false));
    }, [hospitalId]);

    useEffect(() => {
        if (!selectedDoctorId) { setOpenSlots([]); return; }
        setSlotsLoading(true);
        setSlotsError(false);
        api.get(`/doctors/${selectedDoctorId}/slots`, { params: { date: format(currentDate, 'yyyy-MM-dd') } })
            .then(res => setOpenSlots(Array.isArray(res.data?.slots) ? res.data.slots : []))
            .catch(() => setSlotsError(true))
            .finally(() => setSlotsLoading(false));
    }, [selectedDoctorId, currentDate]);

    const filteredDoctors = useMemo(
        () => doctors.filter(d => doctorName(d).toLowerCase().includes(doctorSearch.toLowerCase())),
        [doctors, doctorSearch]
    );

    const visibleAppointments = useMemo(
        () => selectedDoctorId ? appointments.filter(a => a.doctorId === selectedDoctorId) : appointments,
        [appointments, selectedDoctorId]
    );

    const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
    const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
    const monthDays = eachDayOfInterval({ start: startOfMonth(currentDate), end: endOfMonth(currentDate) });

    const dayKey = (d: Date) => format(d, 'yyyy-MM-dd');
    const entriesAt = (d: Date, hour: number) =>
        visibleAppointments.filter((a) => {
            const ad = new Date(a.date);
            return dayKey(ad) === dayKey(d) && ad.getHours() === hour;
        });
    const entriesForDay = (d: Date) => visibleAppointments.filter((a) => dayKey(new Date(a.date)) === dayKey(d));

    const typeMeta = (type?: string) =>
        type === 'ONLINE'
            ? { label: 'Video Call', Icon: VideoCameraIcon }
            : { label: 'In-Person', Icon: UserIcon };

    const goPrev = () => viewMode === 'WEEK' ? setCurrentDate(subWeeks(currentDate, 1)) : setCurrentDate(subMonths(currentDate, 1));
    const goNext = () => viewMode === 'WEEK' ? setCurrentDate(addWeeks(currentDate, 1)) : setCurrentDate(addMonths(currentDate, 1));

    return (
        <div className="space-y-6">
            {/* Hero */}
            <div className="rounded-2xl px-8 py-7" style={{ background: '#EBF5FF' }}>
                <h1 className="text-2xl sm:text-3xl font-bold uppercase tracking-tight" style={{ color: '#1E3A5F' }}>Schedule</h1>
                <p className="mt-1 text-xs font-semibold" style={{ color: '#0284C7' }}>Select Date and Time</p>
                <button onClick={() => setCurrentDate(new Date())} className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-white px-4 py-2 rounded-lg" style={{ background: 'linear-gradient(to right, #0284C7, #38BDF8)' }}>
                    <CalendarIcon className="w-4 h-4" />
                    This Week
                </button>
            </div>

            {/* Controls */}
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-1 bg-white border border-gray-200 p-1 rounded-xl">
                    <button onClick={() => setViewMode('WEEK')} className={`px-5 py-1.5 rounded-lg text-sm font-semibold transition-all ${viewMode === 'WEEK' ? 'bg-blue-50 text-blue-600' : 'text-gray-500'}`}>Week</button>
                    <button onClick={() => setViewMode('MONTH')} className={`px-5 py-1.5 rounded-lg text-sm font-semibold transition-all ${viewMode === 'MONTH' ? 'bg-blue-50 text-blue-600' : 'text-gray-500'}`}>Month</button>
                </div>

                <div className="flex items-center gap-2">
                    <button onClick={goPrev} className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50"><ChevronLeftIcon className="w-4 h-4 text-gray-600" /></button>
                    <span className="text-sm font-semibold text-gray-700 min-w-[180px] text-center">
                        {viewMode === 'WEEK' ? `${format(weekDays[0], 'MMM d')} - ${format(weekDays[6], 'MMM d, yyyy')}` : format(currentDate, 'MMMM yyyy')}
                    </span>
                    <button onClick={goNext} className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50"><ChevronRightIcon className="w-4 h-4 text-gray-600" /></button>
                </div>

                <div className="flex items-center gap-2">
                    <button className="p-2 rounded-lg hover:bg-gray-100 text-gray-500"><Cog6ToothIcon className="w-5 h-5" /></button>
                </div>
            </div>

            {/* Calendar + sidebar */}
            <div className="flex flex-col lg:flex-row gap-6">
                <aside className="w-full lg:w-64 shrink-0 bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-5">
                    <MiniCalendar selected={currentDate} onSelect={setCurrentDate} />

                    <div className="relative">
                        <UsersIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search doctors"
                            value={doctorSearch}
                            onChange={e => setDoctorSearch(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                        />
                    </div>

                    {/* GET /hospitals/:id/doctors — click a doctor to filter the
                        grid to their appointments and load their open slots below. */}
                    <div>
                        <div className="flex items-center justify-between text-sm font-semibold text-gray-700 mb-2">
                            <span>Doctors</span>
                            <ChevronUpIcon className="w-4 h-4 text-gray-400" />
                        </div>
                        <div className="space-y-1 max-h-48 overflow-y-auto">
                            <button
                                onClick={() => setSelectedDoctorId(null)}
                                className={`w-full text-left px-2 py-1.5 rounded-lg text-xs font-semibold transition-colors ${!selectedDoctorId ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'}`}
                            >
                                All doctors
                            </button>
                            {doctorsLoading ? (
                                Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-6 bg-gray-100 rounded animate-pulse" />)
                            ) : filteredDoctors.map(d => (
                                <button
                                    key={d.id}
                                    onClick={() => setSelectedDoctorId(d.id)}
                                    className={`w-full text-left px-2 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-2 ${selectedDoctorId === d.id ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'}`}
                                >
                                    <span className="w-2 h-2 rounded-full shrink-0" style={{ background: colorForDoctor(d.id) }} />
                                    <span className="truncate">{doctorName(d)}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Open slots panel — GET /doctors/:doctorId/slots for the
                        selected doctor + selected day (availability, not bookings) */}
                    {selectedDoctorId && (
                        <div>
                            <div className="text-sm font-semibold text-gray-700 mb-2">
                                Open slots — {format(currentDate, 'MMM d')}
                            </div>
                            {slotsLoading ? (
                                <div className="h-6 bg-gray-100 rounded animate-pulse" />
                            ) : slotsError ? (
                                <p className="text-xs text-red-500">Could not load slots.</p>
                            ) : openSlots.length === 0 ? (
                                <p className="text-xs text-gray-400">No open slots this day.</p>
                            ) : (
                                <div className="flex flex-wrap gap-1.5">
                                    {openSlots.map(s => (
                                        <span key={s} className="text-[10px] font-semibold px-2 py-1 rounded-full bg-emerald-50 text-emerald-700">
                                            {s}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </aside>

                <div className="flex-1 min-w-0 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-x-auto">
                    {apptsLoading ? (
                        <div className="p-6 space-y-2">
                            {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-8 bg-gray-100 rounded animate-pulse" />)}
                        </div>
                    ) : viewMode === 'WEEK' ? (
                        <div className="min-w-[640px]">
                            <div className="grid border-b border-gray-100" style={{ gridTemplateColumns: '56px repeat(7, 1fr)' }}>
                                <div className="py-3" />
                                {weekDays.map((day) => {
                                    const todayCol = isToday(day);
                                    return (
                                        <div key={day.toISOString()} className="py-3 text-center border-l border-gray-100 flex items-center justify-center gap-2">
                                            <span className={`text-[11px] font-bold uppercase tracking-wider ${todayCol ? 'text-blue-600' : 'text-gray-400'}`}>{format(day, 'EEE')}</span>
                                            <span className={`text-sm font-bold inline-flex items-center justify-center w-7 h-7 rounded-full ${todayCol ? 'bg-blue-600 text-white' : 'text-gray-700'}`}>{format(day, 'd')}</span>
                                        </div>
                                    );
                                })}
                            </div>
                            {HOURS.map((hour) => (
                                <div key={hour} className="grid border-b border-gray-50 last:border-0" style={{ gridTemplateColumns: '56px repeat(7, 1fr)' }}>
                                    <div className="py-4 pr-2 text-right text-[11px] font-semibold text-gray-400">{hourLabel(hour)}</div>
                                    {weekDays.map((day) => {
                                        const entries = entriesAt(day, hour);
                                        return (
                                            <div key={day.toISOString()} className="min-h-[72px] border-l border-gray-100 p-1.5 space-y-1">
                                                {entries.map((entry) => {
                                                    const meta = typeMeta(entry.type);
                                                    const color = colorForDoctor(entry.doctorId);
                                                    const patientName = `${entry.patient?.firstName ?? ''} ${entry.patient?.lastName ?? ''}`.trim();
                                                    return (
                                                        <div
                                                            key={entry.id}
                                                            className="h-full rounded-lg border p-2"
                                                            style={{ background: `${color}14`, borderColor: `${color}55`, color }}
                                                        >
                                                            <p className="text-[10px] font-semibold opacity-80">{format(new Date(entry.date), 'h:mm a')}</p>
                                                            <p className="text-xs font-bold leading-tight mt-0.5 truncate">{patientName || doctorName(entry.doctor)}</p>
                                                            <p className="flex items-center gap-1 text-[10px] font-medium opacity-80 mt-1"><meta.Icon className="w-3 h-3" />{meta.label}</p>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        );
                                    })}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div>
                            <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-100">
                                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
                                    <div key={d} className="py-3 text-center text-xs font-bold text-gray-400 uppercase tracking-widest">{d}</div>
                                ))}
                            </div>
                            <div className="grid grid-cols-7">
                                {Array.from({ length: (startOfWeek(startOfMonth(currentDate), { weekStartsOn: 1 }).getDay() + 6) % 7 }).map((_, i) => (
                                    <div key={`pad-${i}`} className="h-28 border-b border-r border-gray-50" />
                                ))}
                                {monthDays.map((day) => {
                                    const entries = entriesForDay(day);
                                    const todayCell = isToday(day);
                                    return (
                                        <div key={day.toISOString()} className={`h-28 p-2 border-b border-r border-gray-100 ${todayCell ? 'bg-blue-50/40' : ''}`}>
                                            <span className={`text-sm font-bold ${todayCell ? 'text-blue-600' : 'text-gray-700'}`}>{format(day, 'd')}</span>
                                            {entries.length > 0 && (
                                                <div className="mt-1 inline-flex items-center gap-1 bg-blue-600 text-white rounded-md px-2 py-0.5">
                                                    <span className="text-[10px] font-bold">{entries.length}</span>
                                                    <span className="text-[10px]">visits</span>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
