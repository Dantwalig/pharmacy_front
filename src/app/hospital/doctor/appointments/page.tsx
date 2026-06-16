// src/app/hospital/doctor/appointments/page.tsx

'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Link from 'next/link';
import { MOCK_APPOINTMENTS } from '@/mock/hospital/appointments';
import { Appointment } from '@/types/hospital';
import {
  CalendarIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
} from '@heroicons/react/24/outline';

export default function HospitalDoctorAppointmentsPage() {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<string>('ALL');

  const totalCount = MOCK_APPOINTMENTS.length;
  const confirmedCount = MOCK_APPOINTMENTS.filter((a) => a.status === 'CONFIRMED').length;
  const completedCount = MOCK_APPOINTMENTS.filter((a) => a.status === 'COMPLETED').length;
  const cancelledCount = MOCK_APPOINTMENTS.filter((a) => a.status === 'CANCELLED').length;

  //stats
  const statCards = [
    { label: t('hospital.total', 'Total'), value: totalCount, icon: CalendarIcon, iconColor: '#1E4D8C', bgColor: '#EBF5FF' },
    { label: t('hospital.confirmed', 'Confirmed'), value: confirmedCount, icon: ClockIcon, iconColor: '#0284C7', bgColor: '#E0F2FE' },
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
  const filteredAppointments = MOCK_APPOINTMENTS.filter((apt: Appointment) => {
  const matchesTab = activeTab === 'ALL' || apt.status === activeTab;
  const patientName = `${apt.patientName ?? ''}`.toLowerCase();
  const matchesSearch = patientName.includes(searchTerm.toLowerCase()) || (apt.reason && apt.reason.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesTab && matchesSearch;
  });

  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString();
  const formatTime = (dateString: string) => new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    //statusMap for appointments
  const statusMap: Record<string, { bg: string; color: string; dot: string }> = {
  PENDING:   { bg: '#EBF5FF', color: '#2563EB', dot: '#3B82F6' },
  CONFIRMED: { bg: '#EBF5FF', color: '#2563EB', dot: '#3B82F6' },
  READY_FOR_DOCTOR: { bg: '#FFF7ED', color: '#EA580C', dot: '#F97316' },
  COMPLETED: { bg: '#ECFDF5', color: '#059669', dot: '#10B981' },
  CANCELLED: { bg: '#FEF2F2', color: '#DC2626', dot: '#EF4444' },
};


  return (
    <div className="space-y-6">
      {/* Hero Header */}
      <div className="rounded-2xl p-8" style={{ background: '#EBF5FF' }}>
        <h1 className="text-3xl font-extrabold text-gray-900">{t('hospital.appointmentsTitle', 'Appointment Scheduling & Tracking')}</h1>
        <p className="mt-1 text-sm text-gray-600">{t('hospital.appointmentsSubtitle', 'Manage and track patient consultation timelines')}</p>
      </div>

      {/* Stats Cards Section */}
      <div className="grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm flex items-center justify-between">
              <div>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{stat.label}</h3>
                <p className="mt-1 text-3xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className="rounded-xl p-3 shrink-0" style={{ backgroundColor: stat.bgColor }}>
                <Icon className="w-6 h-6" style={{ color: stat.iconColor }} />
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
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider hidden lg:inline">{t('hospital.statusFilter', 'Status')}:</span>
          <div className="flex flex-wrap gap-1">
            {filterTabs.map((tab) => {
              const count = tab.id === 'ALL' ? totalCount : MOCK_APPOINTMENTS.filter(a => a.status === tab.id).length;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 ${
                    activeTab === tab.id
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
                <th className="px-6 py-4">{t('hospital.thDate', 'Date')}</th>
                <th className="px-6 py-4">{t('hospital.thTime', 'Time')}</th>
                <th className="px-6 py-4">{t('hospital.thSpecialization', 'Specialization')}</th>
                <th className="px-6 py-4">{t('hospital.thType', 'Type')}</th>
                <th className="px-6 py-4">{t('hospital.thStatus', 'Status')}</th>
                <th className="px-6 py-4 text-right">{t('hospital.thActions', 'Actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {filteredAppointments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-gray-400 font-medium">
                    {t('hospital.noAppointmentsFound', 'No appointments found matching the selected criteria.')}
                  </td>
                </tr>
              ) : (
                filteredAppointments.map((apt: Appointment) => (
                  <tr key={apt.id} className="hover:bg-gray-50/70 transition-colors">
                    <td className="px-6 py-4 font-semibold text-gray-900">
                      {apt.patientName}
                    </td>
                    <td className="px-6 py-4 text-gray-600">{formatDate(apt.date)}</td>
                    <td className="px-6 py-4 text-gray-600">{formatTime(apt.date)}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-md text-xs font-medium">
                        {apt.specialization || t('hospital.general', 'General')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600 capitalize">{apt.type?.toLowerCase().replace('_', '-')}</td>
                    <td className="px-6 py-4">
                      {(() => {
                        const status = statusMap[apt.status] ?? {
                            bg: '#F3F4F6',
                            color: '#6B7280',
                            dot: '#9CA3AF',
                          };

                        return (
                          <span className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold"
                            style={{ backgroundColor: status.bg, color: status.color,}}>
                            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: status.dot }} />
                            {apt.status.replaceAll('_', ' ')}
                          </span>
                        );
                      })()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/hospital/doctor/appointments/${apt.id}`}
                        className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-semibold rounded-xl bg-white text-gray-700 hover:bg-gray-50 transition-all shadow-sm"
                      >
                        {t('hospital.viewBtn', 'View')}
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 text-xs text-gray-500">
          {t('hospital.showingCount', 'Showing {{count}} of {{total}} Appointments', { count: filteredAppointments.length, total: totalCount })}
        </div>
      </div>
    </div>
  );
}