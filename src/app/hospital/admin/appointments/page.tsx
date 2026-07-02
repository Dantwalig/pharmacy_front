'use client';

import { useMemo, useState } from 'react';
import { MagnifyingGlassIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { MOCK_APPOINTMENTS } from '@/mock/hospital/appointments';
import type { Appointment } from '@/types/hospital';
import { useTranslation } from 'react-i18next';

const STATUS_STYLE: Record<string, { bg: string; color: string; dot: string; labelKey: string }> = {
  CONFIRMED:        { bg: '#ECFDF5', color: '#059669', dot: '#10B981', labelKey: 'hospital.confirmed' },
  PENDING:          { bg: '#FFFBEB', color: '#D97706', dot: '#F59E0B', labelKey: 'hospital.pending' },
  READY_FOR_DOCTOR: { bg: '#EFF6FF', color: '#2563EB', dot: '#3B82F6', labelKey: 'hospital.readyForDoctor' },
  COMPLETED:        { bg: '#ECFDF5', color: '#059669', dot: '#10B981', labelKey: 'hospital.completed' },
  CANCELLED:        { bg: '#FEF2F2', color: '#DC2626', dot: '#EF4444', labelKey: 'hospital.cancelled' },
};

function formatDateTime(iso: string) {
  const d = new Date(iso);
  return `${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}, ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
}

export default function HospitalAdminAppointmentsPage() {
  const { t } = useTranslation();

  const [search, setSearch] = useState('');
  const [doctor, setDoctor] = useState('');
  const [department, setDepartment] = useState('');
  const [date, setDate] = useState('');

  const doctors = useMemo(() => [...new Set(MOCK_APPOINTMENTS.map(a => a.doctorName).filter(Boolean))].sort(), []);
  const departments = useMemo(() => [...new Set(MOCK_APPOINTMENTS.map(a => a.specialization).filter(Boolean))].sort() as string[], []);

  const filtered = MOCK_APPOINTMENTS.filter((a: Appointment) => {
    const q = search.trim().toLowerCase();
    if (q && !(a.patientName?.toLowerCase().includes(q) || a.doctorName?.toLowerCase().includes(q))) return false;
    if (doctor && a.doctorName !== doctor) return false;
    if (department && a.specialization !== department) return false;
    if (date && a.date.slice(0, 10) !== date) return false;
    return true;
  });

  const reset = () => { setSearch(''); setDoctor(''); setDepartment(''); setDate(''); };

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="rounded-2xl p-8" style={{ background: '#EBF5FF' }}>
        <h1 className="text-3xl font-bold" style={{ color: '#1E3A5F' }}>{t('hospital.appointmentsTitle')}</h1>
        <p className="mt-1 text-sm font-medium" style={{ color: '#0284C7' }}>{t('hospital.appointmentsSubtitle')}</p>
      </div>

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
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            className="px-3 py-2 text-sm border border-gray-200 rounded-lg text-gray-600 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button onClick={reset} className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
           {t('hospital.resetFilters')}
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[820px]">
            <thead>
              <tr className="border-b border-gray-100 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                <th className="px-6 py-4">{t('hospital.patientName')}</th>
                <th className="px-6 py-4">{t('hospital.assignedDoctor')}</th>
                <th className="px-6 py-4">{t('hospital.department')}</th>
                <th className="px-6 py-4">{t('hospital.dateTime')}</th>
                <th className="px-6 py-4">{t('hospital.status')}</th>
                <th className="px-6 py-4">{t('hospital.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-sm">
              {filtered.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-400 font-medium">{t('hospital.noAppointmentsFound')}</td></tr>
              ) : filtered.map((a: Appointment) => {
                const st = STATUS_STYLE[a.status] ?? { bg: '#F3F4F6', color: '#6B7280', dot: '#9CA3AF', label: a.status };
                const noActions = a.status === 'COMPLETED' || a.status === 'CANCELLED';
                return (
                  <tr key={a.id} className="hover:bg-gray-50/70 transition-colors">
                    <td className="px-6 py-4 font-bold text-gray-900">{a.patientName}</td>
                    <td className="px-6 py-4 text-gray-600">{a.doctorName}</td>
                    <td className="px-6 py-4">
                      <span className="inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider" style={{ background: '#EFF6FF', color: '#2563EB' }}>
                        {a.specialization}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500">{formatDateTime(a.date)}</td>
                    <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider" style={{ background: st.bg, color: st.color }}>
                      <span className="h-1.5 w-1.5 rounded-full" style={{ background: st.dot }} />
                      {t(st.labelKey)}
                    </span>
                    </td>
                    <td className="px-6 py-4">
                      {noActions ? (
                        <span className="text-xs text-gray-300 font-medium">{t('hospital.noActions')}</span>
                      ) : (
                        <div className="flex items-center gap-2">
                          <button aria-label={t('hospital.approve')} className="w-7 h-7 flex items-center justify-center rounded-lg border border-gray-200 text-emerald-600 hover:bg-emerald-50 transition-colors">
                            <CheckIcon className="w-4 h-4" />
                          </button>
                          <button aria-label={t('hospital.reject')} className="w-7 h-7 flex items-center justify-center rounded-lg border border-gray-200 text-red-500 hover:bg-red-50 transition-colors">
                            <XMarkIcon className="w-4 h-4" />
                          </button>
                        </div>
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
