'use client';

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import { Users, ChevronRight } from 'lucide-react';
import { MOCK_RECEPTIONIST } from '@/mock/hospital/user';
import {
  MOCK_NEW_PATIENTS_WEEK,
  MOCK_CHECKINS_WEEK,
  MOCK_QUEUE,
  MOCK_TODAY_APPOINTMENTS,
  type QueueStatus,
  type TodayAppointmentStatus,
} from '@/mock/hospital/receptionist';

const NAVY = '#1E3A5F';
const TEAL = '#38BDF8';

const BAR_COLORS = ['#1D4ED8', '#60A5FA', '#38BDF8', '#2563EB', '#3B82F6', '#1E40AF', '#0EA5E9'];

const queueStatusStyles: Record<QueueStatus, { bg: string; color: string; labelKey: string }> = {
  WAITING:         { bg: '#EBF5FF', color: '#2563EB', labelKey: 'hospital.statusWaiting' },
  IN_CONSULTATION: { bg: '#ECFDF5', color: '#059669', labelKey: 'hospital.statusInConsultation' },
  COMPLETED:       { bg: '#F1F5F9', color: '#475569', labelKey: 'hospital.completed' },
};

const apptStatusStyles: Record<TodayAppointmentStatus, { bg: string; color: string; labelKey: string }> = {
  COMPLETED:  { bg: '#ECFDF5', color: '#059669', labelKey: 'hospital.completed' },
  UPCOMING:   { bg: '#EFF6FF', color: '#2563EB', labelKey: 'hospital.upcoming' },
  CHECKED_IN: { bg: '#EEF2FF', color: '#4F46E5', labelKey: 'hospital.checkedIn' },
};

export default function ReceptionistDashboardPage() {
  const { t } = useTranslation();
  const firstName = MOCK_RECEPTIONIST.firstName;

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <div className="space-y-6">

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
                <LineChart data={MOCK_NEW_PATIENTS_WEEK} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
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
                <BarChart data={MOCK_CHECKINS_WEEK} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid vertical={false} stroke="#F1F5F9" />
                  <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94A3B8' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94A3B8' }} domain={[0, 200]} />
                  <Tooltip cursor={{ fill: '#F8FAFC' }} />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={22}>
                    {MOCK_CHECKINS_WEEK.map((_, i) => (
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
              {MOCK_QUEUE.map((row, idx) => {
                const s = queueStatusStyles[row.status];
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
          {MOCK_TODAY_APPOINTMENTS.map((appt) => {
            const s = apptStatusStyles[appt.status];
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
