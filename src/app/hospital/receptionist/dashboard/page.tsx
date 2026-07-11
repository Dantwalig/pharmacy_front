'use client';

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import { Users, ChevronRight } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { api, unwrapData } from '@/lib/api';
import type { QueueStatus, TodayAppointmentStatus } from '@/mock/hospital/receptionist';

const NAVY = '#1E3A5F';
const TEAL = '#38BDF8';

const BAR_COLORS = ['#1D4ED8', '#60A5FA', '#38BDF8', '#2563EB', '#3B82F6', '#1E40AF', '#0EA5E9'];

const queueStatusStyles: Record<QueueStatus, { bg: string; color: string; labelKey: string }> = {
  WAITING: { bg: '#EBF5FF', color: '#2563EB', labelKey: 'hospital.statusWaiting' },
  IN_CONSULTATION: { bg: '#ECFDF5', color: '#059669', labelKey: 'hospital.statusInConsultation' },
  COMPLETED: { bg: '#F1F5F9', color: '#475569', labelKey: 'hospital.completed' },
};

const apptStatusStyles: Record<TodayAppointmentStatus, { bg: string; color: string; labelKey: string }> = {
  COMPLETED: { bg: '#ECFDF5', color: '#059669', labelKey: 'hospital.completed' },
  UPCOMING: { bg: '#EFF6FF', color: '#2563EB', labelKey: 'hospital.upcoming' },
  CHECKED_IN: { bg: '#EEF2FF', color: '#4F46E5', labelKey: 'hospital.checkedIn' },
};

export default function ReceptionistDashboardPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const hospitalId = (user as any)?.hospitalId || '';
  const firstName = (user as any)?.firstName || 'Receptionist';

  const [mounted, setMounted] = useState(false);
  const [data, setData] = useState<any>({
    newPatientsWeek: [],
    checkinsWeek: [],
    queue: [],
    todayAppointments: []
  });
  const [loading, setLoading] = useState(true);
  const [errorProp, setErrorProp] = useState('');

  useEffect(() => {
    setMounted(true);
    if (!hospitalId) {
      setLoading(false);
      setErrorProp('No hospital session found. Please log in.');
      return;
    }
    api.get(`/hospitals/${hospitalId}/receptionist/dashboard`)
      .then(res => {
        setData((res.data?.data) || res.data || { newPatientsWeek: [], checkinsWeek: [], queue: [], todayAppointments: [] });
      })
      .catch(err => {
        setErrorProp('Failed to load dashboard data or endpoint not available.');
      })
      .finally(() => setLoading(false));
  }, [hospitalId]);

  if (loading) return <div className="p-8 text-center text-gray-500 animate-pulse">Loading dashboard...</div>;

  return (
    <div className="space-y-6">
      {errorProp && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm mb-4 border border-red-100">
          {errorProp}
        </div>
      )}

      {/* ── Hero header ── */}
      <div className="rounded-2xl px-6 sm:px-10 py-8" style={{ background: '#EBF5FF' }}>
        <h1 className="text-3xl sm:text-4xl font-bold" style={{ color: NAVY }}>
          {t('hospital.welcomeBack')}, {firstName}
        </h1>
        <p className="mt-2 text-sm sm:text-base" style={{ color: TEAL }}>
          {t('hospital.receptionistDashboardSubtitle')}
        </p>
      </div>

      {/* ── Charts ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* New Patients this week */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <h3 className="text-sm font-bold text-center mb-4" style={{ color: NAVY }}>
            {t('hospital.newPatientsThisWeek')}
          </h3>
          <div className="h-56">
            {mounted && (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.newPatientsWeek} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid vertical={false} stroke="#F1F5F9" />
                  <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94A3B8' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94A3B8' }} domain={[0, 400]} />
                  <Tooltip />
                  <Line type="monotone" dataKey="value" stroke={TEAL} strokeWidth={2}
                    dot={{ r: 4, fill: '#fff', stroke: TEAL, strokeWidth: 2 }} activeDot={{ r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Check-ins This Week */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <h3 className="text-sm font-bold text-center mb-4" style={{ color: NAVY }}>
            {t('hospital.checkInsThisWeek')}
          </h3>
          <div className="h-56">
            {mounted && (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.checkinsWeek} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid vertical={false} stroke="#F1F5F9" />
                  <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94A3B8' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94A3B8' }} domain={[0, 200]} />
                  <Tooltip cursor={{ fill: '#F8FAFC' }} />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={22}>
                    {(data.checkinsWeek || []).map((_: any, i: number) => (
                      <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* ── Check-ins & Queue overview ── */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <Users size={18} style={{ color: TEAL }} />
            <h2 className="text-base font-bold" style={{ color: NAVY }}>{t('hospital.checkInsQueueOverview')}</h2>
          </div>
          <button className="text-sm font-semibold" style={{ color: TEAL }}>{t('common.viewAll')}</button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <th className="py-3 px-4 rounded-l-lg">#</th>
                <th className="py-3 px-4">{t('hospital.thPatientName')}</th>
                <th className="py-3 px-4">{t('hospital.tokenNo')}</th>
                <th className="py-3 px-4">{t('hospital.thDepartment')}</th>
                <th className="py-3 px-4 text-right rounded-r-lg">{t('hospital.thStatus')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {data.queue?.length === 0 && (
                <tr><td colSpan={5} className="py-4 text-center text-gray-400">No queue data</td></tr>
              )}
              {data.queue?.map((row: any, idx: number) => {
                const s = queueStatusStyles[row.status as QueueStatus] || queueStatusStyles.WAITING;
                return (
                  <tr key={row.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="py-4 px-4 text-gray-500">{idx + 1}</td>
                    <td className="py-4 px-4 font-medium text-gray-800">{row.patientName}</td>
                    <td className="py-4 px-4 text-gray-600">{row.token}</td>
                    <td className="py-4 px-4 text-gray-600">{row.department}</td>
                    <td className="py-4 px-4 text-right">
                      <span
                        className="inline-flex px-3 py-1 rounded-full text-xs font-semibold"
                        style={{ backgroundColor: s.bg, color: s.color }}
                      >
                        {t(s.labelKey)}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="flex justify-center mt-6">
          <button
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors hover:bg-blue-100"
            style={{ backgroundColor: '#EBF5FF', color: '#2563EB' }}
          >
            <Users size={16} />
            {t('hospital.manageQueue')}
          </button>
        </div>
      </div>

      {/* ── Today's Appointments ── */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke={TEAL} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <h2 className="text-base font-bold" style={{ color: NAVY }}>{t('hospital.todaysAppointments')}</h2>
          </div>
          <button className="text-sm font-semibold" style={{ color: TEAL }}>{t('common.viewAll')}</button>
        </div>

        <div className="divide-y divide-gray-100">
          {data.todayAppointments?.length === 0 && (
            <div className="py-4 text-center text-sm text-gray-400">No appointments today</div>
          )}
          {data.todayAppointments?.map((appt: any) => {
            const s = apptStatusStyles[appt.status as TodayAppointmentStatus] || apptStatusStyles.UPCOMING;
            return (
              <button
                key={appt.id}
                className="w-full flex items-center gap-4 py-4 text-left hover:bg-gray-50/60 transition-colors rounded-lg px-2"
              >
                <span className="w-20 text-sm font-semibold text-gray-700 shrink-0">{appt.time}</span>
                <span className="flex-1 text-sm font-medium text-gray-800">{appt.patientName}</span>
                <span className="flex-1 text-sm text-gray-500 hidden sm:block">{appt.doctorName}</span>
                <span
                  className="inline-flex px-3 py-1 rounded-full text-xs font-semibold shrink-0"
                  style={{ backgroundColor: s.bg, color: s.color }}
                >
                  {t(s.labelKey)}
                </span>
                <ChevronRight size={18} className="text-gray-400 shrink-0" />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
