// src/app/hospital/doctor/dashboard/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import Link from 'next/link';
import { CalendarIcon, UsersIcon, UserPlusIcon, BanknotesIcon } from '@heroicons/react/24/outline';
import { api } from '@/lib/api';

// ── Types ──────────────────────────────────────────────────────────────────────

// GET /api/doctors/dashboard response
interface DoctorDashboard {
  todayAppointments:    number;
  totalPatients:        number;
  completedConsults:    number;
  totalAppointments:    number;
  appointmentsByStatus: Record<string, number>;
  weeklyVisits:         { label: string; count: number }[];
  doctorName:           string | null;
  specialization:       string;
  hospitalName:         string | null;
}

// GET /api/appointments (doctor-scoped, last 5)
interface BackendAppointment {
  id: string;
  date: string;
  status: string;
  type?: string;
  reason?: string;
  patient: { firstName: string; lastName: string };
}

// GET /api/notifications
interface BackendNotification {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

// ── Status badge map ──────────────────────────────────────────────────────────

const STATUS_MAP: Record<string, { bg: string; color: string }> = {
  PENDING:          { bg: '#EBF5FF', color: '#2563EB' },
  CONFIRMED:        { bg: '#FEF3C7', color: '#D97706' },
  SCHEDULED:        { bg: '#EBF5FF', color: '#2563EB' },
  READY_FOR_DOCTOR: { bg: '#F3E8FF', color: '#7C3AED' },
  COMPLETED:        { bg: '#ECFDF5', color: '#059669' },
  CANCELLED:        { bg: '#FEF2F2', color: '#DC2626' },
  ARRIVED:          { bg: '#F0FDF4', color: '#16A34A' },
  NO_SHOW:          { bg: '#F3F4F6', color: '#6B7280' },
  UNDER_REVIEW:     { bg: '#FFF7ED', color: '#C2410C' },
  'UNDER REVIEW':   { bg: '#FFF7ED', color: '#C2410C' },
  'FOLLOW-UP':      { bg: '#FEF2F2', color: '#B91C1C' },
};

const PRIORITY_CLASSES: Record<string, string> = {
  Low:    'bg-emerald-100 text-emerald-700',
  Medium: 'bg-amber-100 text-amber-700',
  High:   'bg-red-100 text-red-700',
};

const NOTE_STATUS_CLASSES: Record<string, string> = {
  New:    'bg-violet-100 text-violet-700',
  Viewed: 'bg-slate-100 text-slate-700',
};

// ── Skeletons ─────────────────────────────────────────────────────────────────

function StatSkeleton() {
  return (
    <div className="rounded-2xl border border-gray-100 p-5 bg-white shadow-sm flex items-center justify-between animate-pulse">
      <div className="space-y-2">
        <div className="h-3 w-24 bg-gray-200 rounded" />
        <div className="h-6 w-14 bg-gray-200 rounded" />
      </div>
      <div className="w-12 h-12 rounded-xl bg-gray-200" />
    </div>
  );
}

function RowSkeleton() {
  return (
    <tr className="animate-pulse">
      <td className="py-4 px-2"><div className="h-3 w-28 bg-gray-200 rounded" /></td>
      <td className="py-4 px-2"><div className="h-3 w-20 bg-gray-200 rounded" /></td>
      <td className="py-4 px-4 text-center"><div className="h-5 w-24 bg-gray-200 rounded-full mx-auto" /></td>
    </tr>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function HospitalDoctorDashboardPage() {
  const { t } = useTranslation();

  const [dashboard,      setDashboard]      = useState<DoctorDashboard | null>(null);
  const [appointments,   setAppointments]   = useState<BackendAppointment[]>([]);
  const [notifications,  setNotifications]  = useState<BackendNotification[]>([]);
  const [loadingStats,   setLoadingStats]   = useState(true);
  const [loadingAppts,   setLoadingAppts]   = useState(true);
  const [loadingNotes,   setLoadingNotes]   = useState(true);
  const [error,          setError]          = useState<string | null>(null);

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return t('hospital.goodMorning');
    if (h < 17) return t('hospital.goodAfternoon');
    return t('hospital.goodEvening');
  };

  // ── Fetch 1: GET /api/doctors/dashboard ───────────────────────────────────
  // New doctor-scoped stats endpoint. Returns today's count, total patients,
  // completed consults, total appointments, status breakdown, weekly visit buckets,
  // and the doctor's name + specialisation.

  const fetchDashboard = useCallback(async () => {
    setLoadingStats(true);
    setError(null);
    try {
      const res = await api.get<DoctorDashboard>('/doctors/dashboard');
      setDashboard(res.data);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? err?.message ?? 'Failed to load dashboard stats.');
    } finally {
      setLoadingStats(false);
    }
  }, []);

  // ── Fetch 2: GET /api/appointments ────────────────────────────────────────
  // Auto-scoped to this doctor. Used only for the recent appointments table.

  const fetchAppointments = useCallback(async () => {
    setLoadingAppts(true);
    try {
      const res = await api.get<BackendAppointment[] | { data: BackendAppointment[] }>('/appointments');
      const raw = Array.isArray(res.data) ? res.data : (res.data as any)?.data ?? [];
      // Sort descending by date, keep last 5
      const sorted = [...raw].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setAppointments(sorted.slice(0, 5));
    } catch {
      setAppointments([]);
    } finally {
      setLoadingAppts(false);
    }
  }, []);

  // ── Fetch 3: GET /api/notifications ──────────────────────────────────────
  // userType param is accepted by the controller but unused in the service —
  // the query filters solely by userId. Safe to call with any userType value.

  const fetchNotifications = useCallback(async () => {
    setLoadingNotes(true);
    try {
      const res = await api.get<BackendNotification[] | { data: BackendNotification[] }>(
        '/notifications?userType=doctor'
      );
      const raw = Array.isArray(res.data) ? res.data : (res.data as any)?.data ?? [];
      setNotifications(raw);
    } catch {
      setNotifications([]);
    } finally {
      setLoadingNotes(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
    fetchAppointments();
    fetchNotifications();
  }, [fetchDashboard, fetchAppointments, fetchNotifications]);

  const handleRetry = () => {
    fetchDashboard();
    fetchAppointments();
    fetchNotifications();
  };

  // ── Derived display values ─────────────────────────────────────────────────

  const doctorName = dashboard?.doctorName || 'Doctor';

  const overviewCards = [
    { title: dashboard?.todayAppointments ?? 0,   label: t('hospital.todayAppointments'), icon: CalendarIcon,  borderColor: '#E0F2FE', iconColor: '#0284C7', iconBg: '#EBF5FF' },
    { title: dashboard?.totalPatients     ?? 0,   label: t('hospital.totalPatients'),     icon: UsersIcon,     borderColor: '#DCFCE7', iconColor: '#04802D', iconBg: '#F0FDF4' },
    { title: dashboard?.completedConsults ?? 0,   label: 'Completed Consults',            icon: UserPlusIcon,  borderColor: '#FEE2E2', iconColor: '#FF0000', iconBg: '#FEF2F2' },
    { title: dashboard?.totalAppointments ?? 0,   label: 'Total Appointments',            icon: BanknotesIcon, borderColor: '#F3E8FF', iconColor: '#92009F', iconBg: '#F3E8FF' },
  ];

  // Weekly chart from GET /doctors/dashboard weeklyVisits
  const weeklyPoints  = dashboard?.weeklyVisits ?? [];
  const maxWeekly     = Math.max(...weeklyPoints.map((w) => w.count), 1);
  const weeklyCoords  = weeklyPoints.map((item, index) => ({
    x: 20 + index * (560 / Math.max(weeklyPoints.length - 1, 1)),
    y: 140 - (item.count / maxWeekly) * 100,
  }));
  const weeklyPath    = weeklyCoords.map((p) => `${p.x},${p.y}`).join(' ');

  // Donut from GET /doctors/dashboard appointmentsByStatus
  const statusCounts  = dashboard?.appointmentsByStatus ?? {};
  const categories    = [
    { label: 'Completed', value: statusCounts['COMPLETED'] ?? 0, color: '#059669' },
    { label: 'Active',    value: (statusCounts['SCHEDULED'] ?? 0) + (statusCounts['PENDING'] ?? 0) + (statusCounts['READY_FOR_DOCTOR'] ?? 0) + (statusCounts['ARRIVED'] ?? 0), color: '#2563EB' },
    { label: 'Cancelled', value: statusCounts['CANCELLED'] ?? 0, color: '#DC2626' },
  ].filter((c) => c.value > 0);
  const catTotal      = categories.reduce((s, c) => s + c.value, 0) || 0;
  let   startPct      = 0;
  const donutBg       = catTotal > 0
    ? `conic-gradient(${categories.map((c) => { const end = startPct + (c.value / catTotal) * 100; const seg = `${c.color} ${startPct}% ${end}%`; startPct = end; return seg; }).join(', ')})`
    : '#E5E7EB';

  // Notifications display
  const displayNotes  = notifications.slice(0, 8).map((n) => ({
    id:           n.id,
    time:         new Date(n.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    notification: n.title,
    priority:     (['READY_FOR_DOCTOR', 'APPOINTMENT_BOOKED'].includes(n.type) ? 'High' : n.type === 'PATIENT_ARRIVED' ? 'Medium' : 'Low') as 'High' | 'Medium' | 'Low',
    status:       n.isRead ? 'Viewed' : 'New',
  }));

  const loadingStats2 = loadingStats;

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">

      {/* Error banner */}
      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 px-5 py-4 text-sm text-red-700 flex items-center gap-3">
          <span className="font-semibold">Failed to load dashboard:</span> {error}
          <button onClick={handleRetry} className="ml-auto underline text-red-600 hover:text-red-800 text-xs font-semibold">
            Retry
          </button>
        </div>
      )}

      {/* Hero */}
      <div className="rounded-2xl relative overflow-hidden w-full" style={{ background: '#EBF5FF', padding: '28px 48px' }}>
        <svg
          className="absolute right-0 top-1/2 -translate-y-1/2 opacity-10 pointer-events-none hidden sm:block sm:w-48 md:w-64 lg:w-96 xl:w-[500px]"
          viewBox="0 0 320 140" fill="none" preserveAspectRatio="xMidYMid meet"
        >
          <polyline points="0,70 55,70 80,15 108,125 135,30 162,105 188,70 320,70" stroke="#1E4D8C" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <div className="relative z-10">
          <h1 className="text-4xl sm:text-5xl font-black mb-3" style={{ color: '#1a3470' }}>
            {getGreeting()}, {loadingStats2 ? 'Doctor.' : `${doctorName}.`}
          </h1>
          <p className="text-lg" style={{ color: '#0284C7' }}>{t('hospital.welcomeMessage')}</p>
          <Link
            href="/hospital/doctor/appointments"
            className="mt-6 inline-flex items-center justify-center gap-2 text-sm font-semibold text-white shadow-sm transition hover:opacity-90"
            style={{ background: 'linear-gradient(to right, #0284C7, #38BDF8)', width: '140px', height: '44px', borderRadius: '16px' }}
          >
            <CalendarIcon className="w-4 h-4" />
            {t('hospital.viewSchedule')}
          </Link>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {loadingStats2
          ? Array.from({ length: 4 }).map((_, i) => <StatSkeleton key={i} />)
          : overviewCards.map((card) => {
              const Icon = card.icon;
              return (
                <div
                  key={card.label}
                  className="rounded-2xl border p-5 bg-white shadow-sm flex items-center justify-between transition-all duration-300 hover:shadow-md"
                  style={{ borderColor: card.borderColor }}
                >
                  <div>
                    <p className="text-sm font-medium text-gray-500">{card.label}</p>
                    <h3 className="mt-2 text-2xl font-bold text-gray-900">{card.title}</h3>
                  </div>
                  <div className="rounded-xl p-3" style={{ backgroundColor: card.iconBg }}>
                    <Icon className="w-6 h-6" style={{ color: card.iconColor }} />
                  </div>
                </div>
              );
            })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Weekly Visit Chart */}
        <div className="lg:col-span-6 bg-white rounded-2xl border border-gray-100 p-6 shadow-sm flex flex-col justify-between">
          <div className="text-center mb-6">
            <h3 className="text-xs font-bold tracking-wider uppercase text-slate-700">
              {t('hospital.weeklyPatientVisitsRates')}
            </h3>
          </div>
          {loadingStats2 ? (
            <div className="h-64 bg-gray-100 rounded-xl animate-pulse" />
          ) : (
            <div className="relative w-full h-64 flex flex-col justify-between">
              <div className="absolute inset-0 flex flex-col justify-between text-xs text-gray-400 pointer-events-none pb-8 pr-2">
                {['80%', '60%', '40%', '20%', '0'].map((value, index) => (
                  <div key={value} className="w-full flex items-center gap-4">
                    <span className="w-8 text-right">{value}</span>
                    <div className={`flex-1 border-b ${index === 4 ? 'border-gray-300' : 'border-gray-100'}`} />
                  </div>
                ))}
              </div>
              <div className="relative flex-1 ml-12 mr-4 mt-2">
                <svg className="w-full h-full overflow-visible" viewBox="0 0 600 160" preserveAspectRatio="none">
                  <polyline fill="none" stroke="#38BDF8" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" points={weeklyPath} />
                  {weeklyCoords.map((pt, i) => (
                    <circle key={i} cx={pt.x} cy={pt.y} r="5" fill="#FFF" stroke="#A855F7" strokeWidth="2" />
                  ))}
                </svg>
              </div>
              <div className="flex justify-between text-[10px] font-semibold text-gray-400 pl-12 pr-4 pt-2">
                {weeklyPoints.map((item) => (
                  <span key={item.label} className="max-w-[70px] text-left">{item.label}</span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Recent Appointments Table */}
        <div className="lg:col-span-6 bg-white rounded-2xl border border-gray-100 p-6 shadow-sm overflow-hidden flex flex-col justify-between">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 text-xs font-bold text-gray-900 uppercase tracking-wider">
                  <th className="pb-4 pt-2 px-2">{t('hospital.patientName')}</th>
                  <th className="pb-4 pt-2 px-2">{t('hospital.condition')}</th>
                  <th className="pb-4 pt-2 px-4 text-center">{t('hospital.status')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm font-medium text-gray-700">
                {loadingAppts
                  ? Array.from({ length: 5 }).map((_, i) => <RowSkeleton key={i} />)
                  : appointments.length === 0
                  ? <tr><td colSpan={3} className="py-8 text-center text-gray-400 text-sm">No appointments found.</td></tr>
                  : appointments.map((row, idx) => {
                      const patientName  = `${row.patient?.firstName ?? ''} ${row.patient?.lastName ?? ''}`.trim();
                      const condition    = row.reason ?? row.type ?? 'N/A';
                      const activeStatus = row.status ?? 'PENDING';
                      const styleMeta    = STATUS_MAP[activeStatus] ?? { bg: '#F3F4F6', color: '#374151' };
                      return (
                        <tr key={row.id ?? idx} className="hover:bg-gray-50/60 transition-colors">
                          <td className="py-4 px-2 font-semibold text-gray-600 text-xs tracking-wide uppercase">{patientName || '—'}</td>
                          <td className="py-4 px-2 text-gray-500 text-xs tracking-wide">{condition}</td>
                          <td className="py-4 px-2 text-center whitespace-nowrap">
                            <span
                              className="inline-block px-4 py-1 rounded-full text-[10px] font-black tracking-widest uppercase w-32 text-center"
                              style={{ backgroundColor: styleMeta.bg, color: styleMeta.color }}
                            >
                              {activeStatus}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Patient Categories + Notifications */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">

        {/* Donut */}
        <div className="xl:col-span-4 bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <div className="text-xs font-bold tracking-wider uppercase text-slate-700 mb-4">
            {t('hospital.patientCategories')}
          </div>
          {loadingStats2 ? (
            <div className="flex justify-center"><div className="w-64 h-64 rounded-full bg-gray-100 animate-pulse" /></div>
          ) : (
            <>
              <div className="flex justify-center">
                <div className="relative w-64 h-64 rounded-full" style={{ background: donutBg }}>
                  <div className="absolute inset-0 m-10 rounded-full bg-white flex flex-col items-center justify-center">
                    <span className="text-sm font-semibold text-gray-500">{t('hospital.totalPatients')}</span>
                    <span className="text-3xl font-bold text-slate-900">{catTotal}</span>
                  </div>
                </div>
              </div>
              <div className="mt-6 grid grid-cols-2 gap-3">
                {categories.map((c) => (
                  <div key={c.label} className="rounded-2xl bg-slate-50 p-3 flex items-center gap-3">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: c.color }} />
                    <div>
                      <div className="text-[10px] font-semibold uppercase tracking-wide text-gray-500">{c.label}</div>
                      <div className="text-sm font-bold text-gray-900">{c.value}</div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Notifications */}
        <div className="xl:col-span-8 bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900">{t('hospital.notification')}</h2>
              <p className="text-xs text-gray-400 mt-0.5">Latest hospital alerts and priorities</p>
            </div>
          </div>
          {loadingNotes ? (
            <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-10 bg-gray-100 rounded-lg animate-pulse" />)}</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 text-xs font-semibold text-gray-400 uppercase tracking-wider bg-gray-50/50">
                    <th className="py-3 px-4">{t('hospital.time')}</th>
                    <th className="py-3 px-4">{t('hospital.notification')}</th>
                    <th className="py-3 px-4">{t('hospital.priority')}</th>
                    <th className="py-3 px-4">{t('hospital.status')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 text-sm">
                  {displayNotes.length === 0
                    ? <tr><td colSpan={4} className="py-8 text-center text-gray-400 text-sm">No notifications yet.</td></tr>
                    : displayNotes.map((note) => (
                        <tr key={note.id} className="hover:bg-gray-50/80 transition-colors">
                          <td className="py-4 px-4 font-semibold text-gray-900">{note.time}</td>
                          <td className="py-4 px-4 text-gray-600">{note.notification}</td>
                          <td className="py-4 px-4">
                            <span className={`inline-flex px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-widest ${PRIORITY_CLASSES[note.priority]}`}>
                              {note.priority}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <span className={`inline-flex px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-widest ${NOTE_STATUS_CLASSES[note.status]}`}>
                              {note.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
