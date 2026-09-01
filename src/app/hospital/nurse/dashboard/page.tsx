// src/app/hospital/nurse/dashboard/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Link from 'next/link';
import {
  CalendarIcon,
  UserGroupIcon,
  ChatBubbleLeftRightIcon,
  ClipboardDocumentListIcon,
  CalendarDaysIcon,
  ArrowRightIcon,
  CheckIcon,
} from '@heroicons/react/24/outline';
import api from '@/lib/api';
import { useHospitalId, useHospitalNurseUser } from '@/lib/hospital';

interface NurseDashboardStats {
  vitalsRecordedToday: number;
  activeAdmissions: number;
  medicationsAdministeredToday: number;
  newAssessmentsToday: number;
}

interface PatientRow {
  id: string;
  patientId: string;
  name: string;
  age: string;
  gender: string;
  status: string;
  condition: string;
  lastVisit: string;
}

interface ScheduleItem {
  id: string;
  time: string;
  title: string;
  description: string;
  status: 'COMPLETED' | 'ACTIVE' | 'UPCOMING';
}

export default function NurseDashboardPage() {
  const { t } = useTranslation();
  const hospitalId = useHospitalId();
  const nurseUser = useHospitalNurseUser();

  const [stats, setStats] = useState<NurseDashboardStats | null>(null);
  const [patients, setPatients] = useState<PatientRow[]>([]);
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!hospitalId) { setLoading(false); return; }
    let cancelled = false;

    Promise.allSettled([
      api.get<NurseDashboardStats>(`/hospitals/${hospitalId}/nurse/dashboard`),
      api.get<PatientRow[]>(`/hospitals/${hospitalId}/patients`),
      api.get<ScheduleItem[]>(`/hospitals/${hospitalId}/nurse/schedule?view=daily`),
    ]).then(([statsRes, patientsRes, scheduleRes]) => {
      if (cancelled) return;
      if (statsRes.status === 'fulfilled') setStats(statsRes.value.data);
      if (patientsRes.status === 'fulfilled') {
        const raw = patientsRes.value.data;
        const rows: PatientRow[] = (Array.isArray(raw) ? raw : []).slice(0, 6).map((p: any) => ({
          id: p.id ?? p.patientId ?? '',
          patientId: p.patientId ?? p.id ?? '',
          name: p.name ?? `${p.firstName ?? ''} ${p.lastName ?? ''}`.trim(),
          age: p.age ?? (p.dateOfBirth ? String(new Date().getFullYear() - new Date(p.dateOfBirth).getFullYear()) : '—'),
          gender: p.gender ?? '—',
          status: p.status ?? 'ACTIVE',
          condition: p.condition ?? p.reason ?? '—',
          lastVisit: p.lastVisit ?? p.admittedAt ?? '',
        }));
        setPatients(rows);
      }
      if (scheduleRes.status === 'fulfilled') {
        setSchedule(Array.isArray(scheduleRes.value.data) ? scheduleRes.value.data : []);
      }
      setLoading(false);
    });

    return () => { cancelled = true; };
  }, [hospitalId]);

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return t('hospital.goodMorning');
    if (h < 17) return t('hospital.goodAfternoon');
    return t('hospital.goodEvening');
  };

  const statCards = [
    {
      key: 'patients',
      icon: UserGroupIcon,
      color: '#2563EB',
      value: stats?.activeAdmissions ?? 0,
      title: t('hospital.activePatients'),
      subtitle: t('hospital.currentlyAdmitted'),
      action: t('hospital.viewPatients'),
      href: '/hospital/nurse/patients',
    },
    {
      key: 'tasks',
      icon: ClipboardDocumentListIcon,
      color: '#F97316',
      value: stats?.vitalsRecordedToday ?? 0,
      title: t('hospital.vitalsToday'),
      subtitle: t('hospital.recordedThisShift'),
      action: t('hospital.viewVitals'),
      href: '/hospital/nurse/medications',
    },
    {
      key: 'messages',
      icon: ChatBubbleLeftRightIcon,
      color: '#C026D3',
      value: stats?.medicationsAdministeredToday ?? 0,
      title: t('hospital.medsAdministered'),
      subtitle: t('hospital.givenToday'),
      action: t('hospital.viewMedications'),
      href: '/hospital/nurse/medications',
    },
  ];

  return (
    <div className="space-y-6">
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
            {getGreeting()}, {nurseUser.userName.split(' ')[0]}.
          </h1>
          <p className="text-lg" style={{ color: '#0284C7' }}>{t('hospital.welcomeNurse')}</p>
          <Link
            href="/hospital/nurse/schedule"
            className="mt-6 inline-flex items-center justify-center gap-2 text-sm font-semibold text-white shadow-sm transition hover:opacity-90"
            style={{ background: 'linear-gradient(to right, #0284C7, #38BDF8)', width: '140px', height: '44px', borderRadius: '16px' }}
          >
            <CalendarIcon className="w-4 h-4" /> {t('hospital.viewSchedule')}
          </Link>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid gap-5 md:grid-cols-3">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.key} className="rounded-2xl bg-white px-6 py-5 min-h-[180px] flex flex-col" style={{ border: `1px solid ${card.color}40` }}>
              <div className="flex items-center gap-3 mb-8">
                <Icon className="h-5 w-5" style={{ color: card.color }} />
                <h3 className="text-sm font-semibold text-gray-800">{card.title}</h3>
              </div>
              <h2 className="text-5xl font-light" style={{ color: card.color }}>{card.value}</h2>
              <p className="mt-3 text-xs text-gray-500">{card.subtitle}</p>
              <div className="flex-1" />
              <div className="border-t border-gray-200 my-4" />
              <Link href={card.href} className="flex items-center justify-between group/action">
                <span className="text-xs font-medium group-hover/action:underline" style={{ color: card.color }}>{card.action}</span>
                <ArrowRightIcon className="h-4 w-4 transition-transform group-hover/action:translate-x-1" style={{ color: card.color }} />
              </Link>
            </div>
          );
        })}
      </div>

      {/* Patient Overview */}
      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm p-5 sm:p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <UserGroupIcon className="h-6 w-6 text-[#2563EB]" />
            <h2 className="text-lg font-bold text-gray-800">{t('hospital.patientOverview')}</h2>
          </div>
          <Link href="/hospital/nurse/patients" className="text-sm font-bold text-[#2563EB] hover:underline">{t('common.viewAll')}</Link>
        </div>

        {loading ? (
          <p className="py-8 text-center text-sm text-gray-400">{t('common.loading')}</p>
        ) : patients.length === 0 ? (
          <p className="py-8 text-center text-sm text-gray-400">{t('hospital.noPatientsAdmitted')}</p>
        ) : (
          <div className="rounded-xl border border-gray-200 bg-white p-2 sm:p-4 divide-y divide-gray-100">
            {patients.map((patient) => (
              <div key={patient.id} className="grid grid-cols-12 gap-4 py-4 items-center px-2 hover:bg-slate-50 rounded-lg transition-colors group cursor-pointer">
                <div className="col-span-5 sm:col-span-3 pl-1">
                  <div className="font-bold text-gray-900 text-sm sm:text-base whitespace-nowrap overflow-hidden text-ellipsis">{patient.name}</div>
                  <div className="text-xs font-semibold text-gray-400 mt-0.5">{patient.gender}, {patient.age}</div>
                </div>
                <div className="col-span-4 sm:col-span-3 text-center sm:text-left">
                  <span className={`text-sm font-bold ${patient.status === 'ACTIVE' ? 'text-green-600' : patient.status === 'CRITICAL' ? 'text-red-600' : 'text-yellow-600'}`}>
                    {patient.status}
                  </span>
                </div>
                <div className="col-span-3 sm:col-span-4 text-xs text-gray-500 truncate">{patient.condition}</div>
                <div className="col-span-12 sm:col-span-2 flex justify-end">
                  <ArrowRightIcon className="h-5 w-5 text-gray-700 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Today's Schedule */}
      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <div className="flex items-center gap-2">
            <CalendarDaysIcon className="h-5 w-5 text-[#2563EB]" />
            <h2 className="font-semibold text-gray-800">{t('hospital.todaySchedule')}</h2>
          </div>
          <Link href="/hospital/nurse/schedule" className="text-sm text-[#2563EB]">{t('hospital.viewFullSchedule')}</Link>
        </div>

        {loading ? (
          <p className="py-8 text-center text-sm text-gray-400">{t('common.loading')}</p>
        ) : schedule.length === 0 ? (
          <p className="py-8 text-center text-sm text-gray-400">{t('hospital.noShiftsScheduled')}</p>
        ) : (
          <div>
            {schedule.map((item) => (
              <div key={item.id} className="flex items-center justify-between border-b border-gray-100 px-5 py-4 last:border-b-0">
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-500 w-16 shrink-0">{item.time}</span>
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{item.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{item.description}</p>
                  </div>
                </div>
                <span className={`inline-flex items-center gap-1 rounded-lg px-3 py-1 text-xs font-semibold ${item.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : 'bg-blue-50 text-blue-600'}`}>
                  {item.status === 'COMPLETED' ? t('hospital.completed') : item.status}
                  {item.status === 'COMPLETED' && <CheckIcon className="w-3.5 h-3.5" strokeWidth={2.5} />}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
