// src/app/hospital/doctor/appointments/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Link from 'next/link';
import { api, unwrapData } from '@/lib/api';
import toast from 'react-hot-toast';
import { Appointment } from '@/types/hospital';
import {
  CalendarIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  EllipsisVerticalIcon,
} from '@heroicons/react/24/outline';

const PAGE_SIZE = 8;

export default function HospitalDoctorAppointmentsPage() {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<string>('ALL');
  const [page, setPage] = useState(1);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAppointments() {
      try {
        setLoading(true);
        const res = await api.get('/appointments');
        setAppointments(unwrapData<Appointment>(res.data));
      } catch (err) {
        toast.error('Failed to load appointments');
      } finally {
        setLoading(false);
      }
    }
    fetchAppointments();
  }, []);

  const totalCount = appointments.length;
  const confirmedCount = appointments.filter((a) => a.status === 'CONFIRMED').length;
  const completedCount = appointments.filter((a) => a.status === 'COMPLETED').length;
  const cancelledCount = appointments.filter((a) => a.status === 'CANCELLED').length;

  //stats
  const statCards = [
    { label: t('hospital.today', 'Today'), value: totalCount, icon: CalendarIcon, iconColor: '#7C3AED', bgColor: '#F3E8FF' },
    { label: t('hospital.upcoming', 'Upcoming'), value: confirmedCount, icon: ClockIcon, iconColor: '#0284C7', bgColor: '#E0F2FE' },
    { label: t('hospital.completed', 'Completed'), value: completedCount, icon: CheckCircleIcon, iconColor: '#16A34A', bgColor: '#DCFCE7' },
    { label: t('hospital.cancelled', 'Cancelled'), value: cancelledCount, icon: XCircleIcon, iconColor: '#EA580C', bgColor: '#FEE2E2' },
  ];

  const filterTabs = [
    { id: 'ALL', label: t('hospital.allTabs', 'All') },
    { id: 'PENDING', label: t('hospital.pending', 'Pending') },
    { id: 'CONFIRMED', label: t('hospital.confirmed', 'Confirmed') },
    { id: 'READY_FOR_DOCTOR', label: t('hospital.readyForDoctor', 'Ready for Doctor') },
    { id: 'COMPLETED', label: t('hospital.completed', 'Completed') },
    { id: 'CANCELLED', label: t('hospital.cancelled', 'Cancelled') },
  ];

  // filter
  const filteredAppointments = appointments.filter((apt: Appointment) => {
    const matchesTab = activeTab === 'ALL' || apt.status === activeTab;
    const patientName = `${apt.patientName ?? ''}`.toLowerCase();
    const matchesSearch = patientName.includes(searchTerm.toLowerCase()) || (apt.reason && apt.reason.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesTab && matchesSearch;
  });

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await api.patch(`/appointments/${id}/status`, { status: newStatus });
      setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: newStatus as Appointment['status'] } : a));
      toast.success(t('hospital.statusUpdated', 'Status updated successfully'));
    } catch (err) {
      toast.error(t('hospital.statusUpdateFailed', 'Status update failed'));
    }
  };

  const totalPages = Math.max(1, Math.ceil(filteredAppointments.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageItems = filteredAppointments.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const formatTime = (dateString: string) => new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  //statusMap for appointments
  const statusMap: Record<string, { bg: string; color: string; dot: string }> = {
    PENDING: { bg: '#EBF5FF', color: '#2563EB', dot: '#3B82F6' },
    CONFIRMED: { bg: '#EBF5FF', color: '#2563EB', dot: '#3B82F6' },
    READY_FOR_DOCTOR: { bg: '#FFF7ED', color: '#EA580C', dot: '#F97316' },
    COMPLETED: { bg: '#ECFDF5', color: '#059669', dot: '#10B981' },
    CANCELLED: { bg: '#FEF2F2', color: '#DC2626', dot: '#EF4444' },
  };


  return (
    <div className="space-y-6">
      {/* Hero Header */}
      <div className="rounded-2xl p-8" style={{ background: '#EBF5FF' }}>
        <h1 className="text-3xl font-bold" style={{ color: '#1E3A5F' }}>{t('hospital.doctorAppointmentsTitle', 'Appointments')}</h1>
        <p className="mt-1 text-sm" style={{ color: '#0284C7' }}>{t('hospital.doctorAppointmentsSubtitle', 'Manage and track patient appointments')}</p>
      </div>

      {/* Stats Cards Section */}
      <div className="grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-gray-700">{stat.label}</h3>
                  <p className="mt-2 text-3xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{t('hospital.appointmentsWord', 'Appointments')}</p>
                </div>
                <div className="rounded-xl p-2.5 shrink-0" style={{ backgroundColor: stat.bgColor }}>
                  <Icon className="w-5 h-5" style={{ color: stat.iconColor }} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filter Controls */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <MagnifyingGlassIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder={t('hospital.searchPlaceholder', 'Search name by ID, condition...')}
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider hidden lg:inline">{t('hospital.statusFilter', 'Status')}:</span>
          <div className="flex flex-wrap gap-1">
            {filterTabs.map((tab) => {
              const count = tab.id === 'ALL' ? totalCount : appointments.filter(a => a.status === tab.id).length;
              return (
                <button
                  key={tab.id}
                  onClick={() => { setActiveTab(tab.id); setPage(1); }}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 ${activeTab === tab.id
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-gray-50 border border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}
                >
                  {tab.label}
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${activeTab === tab.id ? 'bg-blue-700 text-white' : 'bg-gray-200 text-gray-700'}`}>{count}</span>
                </button>
              );
            })}
          </div>
          <button className="p-2 border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-500">
            <FunnelIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Appointments Table */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-xs font-bold text-gray-500 uppercase tracking-wider">
                <th className="px-6 py-4">{t('hospital.thPatient', 'Patient')}</th>
                <th className="px-6 py-4">{t('hospital.thTime', 'Time')}</th>
                <th className="px-6 py-4">{t('hospital.thType', 'Appointment type')}</th>
                <th className="px-6 py-4">{t('hospital.thDoctor', 'Doctor')}</th>
                <th className="px-6 py-4">{t('hospital.thNotes', 'Notes')}</th>
                <th className="px-6 py-4">{t('hospital.thStatus', 'Status')}</th>
                <th className="px-6 py-4 text-right" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-gray-400 font-medium animate-pulse">
                    Loading appointments...
                  </td>
                </tr>
              ) : pageItems.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-gray-400 font-medium">
                    {t('hospital.noAppointmentsFound', 'No appointments found matching the selected criteria.')}
                  </td>
                </tr>
              ) : (
                pageItems.map((apt: Appointment) => (
                  <tr key={apt.id} className="hover:bg-gray-50/70 transition-colors">
                    <td className="px-6 py-4 font-semibold text-gray-900">
                      {apt.patientName}
                    </td>
                    <td className="px-6 py-4 text-gray-600">{formatTime(apt.date)}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-md text-xs font-medium">
                        {apt.specialization || t('hospital.general', 'General')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{apt.doctorName}</td>
                    <td className="px-6 py-4 text-gray-500 max-w-[220px] truncate">{apt.notes ?? apt.reason}</td>
                    <td className="px-6 py-4">
                      {(() => {
                        const status = statusMap[apt.status] ?? {
                          bg: '#F3F4F6',
                          color: '#6B7280',
                          dot: '#9CA3AF',
                        };

                        return (
                          <div className="relative inline-block">
                            <select
                              value={apt.status}
                              onChange={(e) => handleStatusChange(apt.id, e.target.value)}
                              className="appearance-none inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold pr-8 cursor-pointer border-0 outline-none focus:ring-2 focus:ring-blue-500"
                              style={{ backgroundColor: status.bg, color: status.color }}
                            >
                              <option value="PENDING">PENDING</option>
                              <option value="CONFIRMED">CONFIRMED</option>
                              <option value="READY_FOR_DOCTOR">READY FOR DOCTOR</option>
                              <option value="COMPLETED">COMPLETED</option>
                              <option value="CANCELLED">CANCELLED</option>
                            </select>
                            <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full" style={{ backgroundColor: status.dot }} />
                          </div>
                        );
                      })()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/hospital/doctor/appointments/${apt.id}`}
                        aria-label={t('hospital.viewBtn', 'View')}
                        className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                      >
                        <EllipsisVerticalIcon className="w-5 h-5" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-t border-gray-200 text-xs text-gray-500">
          <span>
            {t('hospital.showingCount', 'Showing {{count}} of {{total}} Appointments', { count: pageItems.length, total: filteredAppointments.length })}
          </span>
          <div className="flex items-center gap-1">
            <AptNavButton onClick={() => setPage(p => Math.max(1, p - 1))} disabled={safePage === 1}>
              <ChevronLeftIcon className="w-3.5 h-3.5" />
            </AptNavButton>
            {aptPageNumbers(safePage, totalPages).map((n, i) =>
              n === '...'
                ? <span key={`ellipsis-${i}`} className="px-1 text-gray-400">...</span>
                : <AptPageButton key={n} label={n} active={n === safePage} onClick={() => setPage(n)} />
            )}
            <AptNavButton onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={safePage === totalPages}>
              <ChevronRightIcon className="w-3.5 h-3.5" />
            </AptNavButton>
          </div>
        </div>
      </div>
    </div>
  );
}

function aptPageNumbers(current: number, total: number): (number | '...')[] {
  if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | '...')[] = [1];
  if (current > 3) pages.push('...');
  for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) pages.push(i);
  if (current < total - 2) pages.push('...');
  pages.push(total);
  return pages;
}

function AptPageButton({ label, active, onClick }: { label: number; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`w-7 h-7 text-xs rounded flex items-center justify-center transition-colors ${active ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'
        }`}
    >
      {label}
    </button>
  );
}

function AptNavButton({ onClick, disabled, children }: { onClick: () => void; disabled: boolean; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="w-7 h-7 flex items-center justify-center rounded transition-colors disabled:text-gray-300 disabled:cursor-default text-gray-600 hover:bg-gray-100 disabled:hover:bg-transparent"
    >
      {children}
    </button>
  );
}