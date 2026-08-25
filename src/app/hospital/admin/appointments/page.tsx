'use client';

import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import type { AppointmentStatus } from '@/types/hospital';

// GET /appointments (HOSPITAL_ADMIN-scoped, see appointmentInclude in
// back-end appointments.service.ts) — shape is richer than the old mock
// Appointment type (nested patient/doctor/hospital objects, not flat
// patientName/doctorName strings), so this is its own local type rather
// than reusing src/types/hospital.ts Appointment.
interface BackendAppointment {
  id: string;
  date: string;
  status: AppointmentStatus;
  reason?: string;
  type?: string;
  patient: { firstName: string; lastName: string; phone?: string };
  doctor: { firstName: string | null; lastName: string | null; specialization: string } | null;
}

// Real backend enum (back-end src/prisma/schema.prisma AppointmentStatus) —
// no PENDING/CONFIRMED, see the note in src/types/hospital.ts and the gap
// doc (Gap A-1) for why the old mock-driven UI's Approve/Reject buttons
// don't map cleanly onto these values.
const ALL_STATUSES: AppointmentStatus[] = [
  'SCHEDULED', 'ARRIVED', 'IN_TRIAGE', 'READY_FOR_DOCTOR', 'COMPLETED', 'CANCELLED', 'NO_SHOW',
];

const STATUS_STYLE: Record<AppointmentStatus, { bg: string; color: string; dot: string; label: string }> = {
  SCHEDULED:        { bg: '#FFFBEB', color: '#D97706', dot: '#F59E0B', label: 'Scheduled' },
  ARRIVED:          { bg: '#F0FDF4', color: '#16A34A', dot: '#22C55E', label: 'Arrived' },
  IN_TRIAGE:        { bg: '#FFF7ED', color: '#C2410C', dot: '#FB923C', label: 'In Triage' },
  READY_FOR_DOCTOR: { bg: '#EFF6FF', color: '#2563EB', dot: '#3B82F6', label: 'Ready for Doctor' },
  COMPLETED:        { bg: '#ECFDF5', color: '#059669', dot: '#10B981', label: 'Completed' },
  CANCELLED:        { bg: '#FEF2F2', color: '#DC2626', dot: '#EF4444', label: 'Cancelled' },
  NO_SHOW:          { bg: '#F3F4F6', color: '#6B7280', dot: '#9CA3AF', label: 'No Show' },
};

const TERMINAL: AppointmentStatus[] = ['COMPLETED', 'CANCELLED'];

function formatDateTime(iso: string) {
  const d = new Date(iso);
  return `${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}, ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
}

function doctorName(doc: BackendAppointment['doctor']) {
  if (!doc) return '—';
  const name = [doc.firstName, doc.lastName].filter(Boolean).join(' ');
  return name ? `Dr. ${name}` : '—';
}

export default function HospitalAdminAppointmentsPage() {
  const { t } = useTranslation();

  const [appointments, setAppointments] = useState<BackendAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [doctor, setDoctor] = useState('');
  const [department, setDepartment] = useState('');
  const [date, setDate] = useState('');
  const [status, setStatus] = useState('');

  useEffect(() => {
    api.get<BackendAppointment[]>('/appointments')
      .then(res => setAppointments(Array.isArray(res.data) ? res.data : []))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  const doctors = useMemo(
    () => [...new Set(appointments.map(a => doctorName(a.doctor)).filter(n => n !== '—'))].sort(),
    [appointments]
  );
  const departments = useMemo(
    () => [...new Set(appointments.map(a => a.doctor?.specialization).filter(Boolean))].sort() as string[],
    [appointments]
  );

  // Status filter dropdown is client-side, per the ticket — GET /appointments
  // has no status query param, so we just filter the already-fetched list.
  const filtered = appointments.filter((a) => {
    const patientName = `${a.patient?.firstName ?? ''} ${a.patient?.lastName ?? ''}`.trim();
    const q = search.trim().toLowerCase();
    if (q && !(patientName.toLowerCase().includes(q) || doctorName(a.doctor).toLowerCase().includes(q))) return false;
    if (doctor && doctorName(a.doctor) !== doctor) return false;
    if (department && a.doctor?.specialization !== department) return false;
    if (date && a.date.slice(0, 10) !== date) return false;
    if (status && a.status !== status) return false;
    return true;
  });

  const reset = () => { setSearch(''); setDoctor(''); setDepartment(''); setDate(''); setStatus(''); };

  async function handleStatusChange(appointmentId: string, newStatus: AppointmentStatus) {
    setUpdatingId(appointmentId);
    try {
      const res = await api.patch(`/appointments/${appointmentId}/status`, { status: newStatus });
      setAppointments(prev => prev.map(a => (a.id === appointmentId ? { ...a, status: res.data?.status ?? newStatus } : a)));
      toast.success('Appointment status updated.');
    } catch {
      toast.error('Failed to update appointment status — please try again.');
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="rounded-2xl p-8" style={{ background: '#EBF5FF' }}>
        <h1 className="text-3xl font-bold" style={{ color: '#1E3A5F' }}>{t('hospital.appointmentsTitle')}</h1>
        <p className="mt-1 text-sm font-medium" style={{ color: '#0284C7' }}>{t('hospital.appointmentsSubtitle')}</p>
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 px-5 py-3 text-sm text-red-700">
          Could not load appointments — check your connection and refresh.
        </div>
      )}

      {/* Filter bar */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col lg:flex-row lg:items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <MagnifyingGlassIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={t('hospital.searchPlaceholder')}
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <select value={doctor} onChange={e => setDoctor(e.target.value)} className="px-3 py-2 text-sm border border-gray-200 rounded-lg text-gray-600 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">{t('hospital.allDoctors')}</option>
            {doctors.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
          <select value={department} onChange={e => setDepartment(e.target.value)} className="px-3 py-2 text-sm border border-gray-200 rounded-lg text-gray-600 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">{t('hospital.allDepartments')}</option>
            {departments.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
          <select value={status} onChange={e => setStatus(e.target.value)} className="px-3 py-2 text-sm border border-gray-200 rounded-lg text-gray-600 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">{t('hospital.allStatuses')}</option>
            {ALL_STATUSES.map(s => <option key={s} value={s}>{STATUS_STYLE[s].label}</option>)}
          </select>
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            className="px-3 py-2 text-sm border border-gray-200 rounded-lg text-gray-600 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button onClick={reset} className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            {t('hospital.resetFilter')}
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[860px]">
            <thead>
              <tr className="border-b border-gray-100 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                <th className="px-6 py-4">{t('hospital.patientName')}</th>
                <th className="px-6 py-4">{t('hospital.thAssignedDoctor')}</th>
                <th className="px-6 py-4">{t('hospital.department')}</th>
                <th className="px-6 py-4">{t('hospital.thAppointmentTime')}</th>
                <th className="px-6 py-4">{t('hospital.status')}</th>
                <th className="px-6 py-4">{t('hospital.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-sm">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={6} className="px-6 py-4"><div className="h-4 bg-gray-100 rounded w-full" /></td>
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-400 font-medium">{t('hospital.noAppointmentsFound')}</td></tr>
              ) : filtered.map((a) => {
                const st = STATUS_STYLE[a.status] ?? { bg: '#F3F4F6', color: '#6B7280', dot: '#9CA3AF', label: a.status };
                const patientName = `${a.patient?.firstName ?? ''} ${a.patient?.lastName ?? ''}`.trim();
                const isTerminal = TERMINAL.includes(a.status);
                const isUpdating = updatingId === a.id;
                return (
                  <tr key={a.id} className="hover:bg-gray-50/70 transition-colors">
                    <td className="px-6 py-4 font-bold text-gray-900">{patientName || '—'}</td>
                    <td className="px-6 py-4 text-gray-600">{doctorName(a.doctor)}</td>
                    <td className="px-6 py-4">
                      {a.doctor?.specialization && (
                        <span className="inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider" style={{ background: '#EFF6FF', color: '#2563EB' }}>
                          {a.doctor.specialization}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-gray-500">{formatDateTime(a.date)}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider" style={{ background: st.bg, color: st.color }}>
                        <span className="h-1.5 w-1.5 rounded-full" style={{ background: st.dot }} />
                        {st.label}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {isTerminal ? (
                        <span className="text-xs text-gray-300 font-medium">{t('hospital.noActions', 'No actions')}</span>
                      ) : (
                        <select
                          disabled={isUpdating}
                          value=""
                          onChange={e => e.target.value && handleStatusChange(a.id, e.target.value as AppointmentStatus)}
                          className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                        >
                          <option value="">{isUpdating ? 'Updating…' : 'Change to…'}</option>
                          {ALL_STATUSES.filter(s => s !== a.status).map(s => (
                            <option key={s} value={s}>{STATUS_STYLE[s].label}</option>
                          ))}
                        </select>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
