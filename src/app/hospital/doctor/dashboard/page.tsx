// src/app/hospital/doctor/dashboard/page.tsx
'use client';

import { useTranslation } from 'react-i18next';
import Link from 'next/link';
import { MOCK_DASHBOARD_STATS, MOCK_RECENT_APPOINTMENTS, MOCK_WEEKLY_REVENUE, MOCK_PATIENT_CATEGORIES, MOCK_DASHBOARD_NOTIFICATIONS } from '@/mock/hospital/dashboard';
import { MOCK_DOCTOR } from '@/mock/hospital/user';
import { CalendarIcon, UsersIcon, UserPlusIcon, BanknotesIcon, ArrowRightIcon } from '@heroicons/react/24/outline';

const NAVY = '#1E4D8C';

export default function HospitalDoctorDashboardPage() {
  const { t } = useTranslation();
  const firstName = MOCK_DOCTOR.firstName;

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return t('hospital.goodMorning');
    if (h < 17) return t('hospital.goodAfternoon');
    return t('hospital.goodEvening');
  };

  // Overview Cards STATS
  const overviewCards = [
    {
      title: MOCK_DASHBOARD_STATS.appointmentsByStatus.CONFIRMED + MOCK_DASHBOARD_STATS.appointmentsByStatus.PENDING,
      label: t('hospital.todayAppointments'),
      icon: CalendarIcon,
      borderColor: '#E0F2FE',
      iconColor: '#0284C7',
      iconBg: '#EBF5FF'
    },
    {
      title: MOCK_DASHBOARD_STATS.totalPatients,
      label: t('hospital.totalPatients'),
      icon: UsersIcon,
      borderColor: '#DCFCE7',
      iconColor: '#04802D',
      iconBg: '#F0FDF4'
    },
    {
      title: MOCK_DASHBOARD_STATS.activeDoctors,
      label: t('hospital.activeDoctors'),
      icon: UserPlusIcon,
      borderColor: '#FEE2E2',
      iconColor: '#FF0000',
      iconBg: '#FEF2F2'
    },
    {
      title: MOCK_DASHBOARD_STATS.monthlyRevenue.toLocaleString('en-US', { style: 'currency', currency: 'USD' }),
      label: t('hospital.monthlyRevenue'),
      icon: BanknotesIcon,
      borderColor: '#F3E8FF',
      iconColor: '#92009F',
      iconBg: '#F3E8FF'
    }
  ];

  const maxWeeklyRevenue = Math.max(...MOCK_WEEKLY_REVENUE.map((item) => item.revenue), 1);
  const weeklyRevenuePoints = MOCK_WEEKLY_REVENUE.map((item, index) => {
    const x = 20 + index * (560 / Math.max(MOCK_WEEKLY_REVENUE.length - 1, 1));
    const y = 140 - (item.revenue / maxWeeklyRevenue) * 100;
    return `${x},${y}`;
  }).join(' ');
  const weeklyRevenueNodes = MOCK_WEEKLY_REVENUE.map((item, index) => {
    const x = 20 + index * (560 / Math.max(MOCK_WEEKLY_REVENUE.length - 1, 1));
    return { cx: x, cy: 140 - (item.revenue / maxWeeklyRevenue) * 100 };
  });

  const patientCategoryTotal = MOCK_PATIENT_CATEGORIES.reduce((sum, item) => sum + item.value, 0);
  let startPercentage = 0;
  const categoryGradient = `conic-gradient(${MOCK_PATIENT_CATEGORIES.map((item) => {
    const endPercentage = startPercentage + (item.value / patientCategoryTotal) * 100;
    const result = `${item.color} ${startPercentage}% ${endPercentage}%`;
    startPercentage = endPercentage;
    return result;
  }).join(', ')})`;

  const priorityBadgeClasses: Record<string, string> = {
    Low: 'bg-emerald-100 text-emerald-700',
    Medium: 'bg-amber-100 text-amber-700',
    High: 'bg-red-100 text-red-700',
  };

  const notificationStatusClasses: Record<string, string> = {
    New: 'bg-violet-100 text-violet-700',
    Viewed: 'bg-slate-100 text-slate-700',
  };

  //Status Badges Mapping
  const statusMap: Record<string, { bg: string; color: string; dot: string }> = {
    PENDING:          { bg: '#EBF5FF', color: '#2563EB', dot: '#3B82F6' },
    CONFIRMED:        { bg: '#FEF3C7', color: '#D97706', dot: '#F59E0B' },
    READY_FOR_DOCTOR: { bg: '#F3E8FF', color: '#7C3AED', dot: '#8B5CF6' },
    COMPLETED:        { bg: '#ECFDF5', color: '#059669', dot: '#10B981' },
    CANCELLED:        { bg: '#FEF2F2', color: '#DC2626', dot: '#EF4444' },
    STABLE:           { bg: '#ECFDF5', color: '#047857', dot: '#10B981' },
    'UNDER_REVIEW':   { bg: '#FFF7ED', color: '#C2410C', dot: '#F97316' },
    'UNDER REVIEW':   { bg: '#FFF7ED', color: '#C2410C', dot: '#F97316' },
    'FOLLOW-UP':      { bg: '#FEF2F2', color: '#B91C1C', dot: '#EF4444' },
  };

  return (
    <div className="space-y-6">
      {/* Hero*/}
      <div className="rounded-2xl relative overflow-hidden w-full" style={{ background: '#EBF5FF', padding: '28px 48px' }}>
        {/*Heartbeat SVG*/}
        <svg 
          className="absolute right-0 top-1/2 -translate-y-1/2 opacity-10 pointer-events-none hidden sm:block sm:w-48 md:w-64 lg:w-96 xl:w-[500px]" 
          viewBox="0 0 320 140" 
          fill="none"
          preserveAspectRatio="xMidYMid meet"
        >
          <polyline points="0,70 55,70 80,15 108,125 135,30 162,105 188,70 320,70" stroke="#1E4D8C" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>

        <div className="relative z-10">
          <h1 className="text-4xl sm:text-5xl font-black mb-3" style={{ color: '#1a3470' }}>
            {getGreeting()},{firstName}.
          </h1>
          <p className="text-lg" style={{ color: '#0284C7' }}>{t('hospital.welcomeMessage')}</p>
          <Link
            href="/hospital/doctor/appointments"
            className="mt-6 inline-flex items-center justify-center gap-2 text-sm font-semibold text-white shadow-sm transition hover:opacity-90"
            style={{
              background: 'linear-gradient(to right, #0284C7, #38BDF8)',
              width: '140px',
              height: '44px',
              borderRadius: '16px',
            }}
          >
            <CalendarIcon className="w-4 h-4" />
            {t('hospital.viewSchedule')}
          </Link>
        </div>
      </div>

      {/* Overview Stats*/}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {overviewCards.map((card) => {
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
        
        {/*Weekly Patient Visits */}
        <div className="lg:col-span-6 bg-white rounded-2xl border border-gray-100 p-6 shadow-sm flex flex-col justify-between">
          <div className="text-center mb-6">
            <h3 className="text-xs font-bold tracking-wider uppercase text-slate-700">
              {t('hospital.weeklyPatientVisitsRates')}
            </h3>
          </div>

          <div className="relative w-full h-64 flex flex-col justify-between">
            <div className="absolute inset-0 flex flex-col justify-between text-xs text-gray-400 pointer-events-none pb-8 pr-2">
              {['80%', '60%', '40%', '20%', '0'].map((value, index) => (
                <div key={value} className="w-full flex items-center gap-4">
                  <span className="w-8 text-right">{value}</span>
                  <div className={`flex-1 border-b ${index === 4 ? 'border-gray-300' : 'border-gray-100'}`} />
                </div>
              ))}
            </div>

            {/* Scale Area Container Mapping*/}
            <div className="relative flex-1 ml-12 mr-4 mt-2">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 600 160" preserveAspectRatio="none">
                <polyline
                  fill="none"
                  stroke="#38BDF8"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points={weeklyRevenuePoints}
                />

                {weeklyRevenueNodes.map((pt, i) => (
                  <circle key={i} cx={pt.cx} cy={pt.cy} r="5" fill="#FFF" stroke="#A855F7" strokeWidth="2" />
                ))}
              </svg>
            </div>

            {/* Week Labels */}
            <div className="flex justify-between text-[10px] font-semibold text-gray-400 pl-12 pr-4 pt-2">
              {MOCK_WEEKLY_REVENUE.map((item) => (
                <span key={item.label} className="max-w-[70px] text-left">
                  {item.label}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Patient Clinical Condition Table */}
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
                {MOCK_RECENT_APPOINTMENTS.slice(0, 5).map((row, idx) => {
                  const activeCondition = row.condition ?? 'N/A';
                  const activeStatus = row.healthStatus ?? row.status;
                  const styleMeta = statusMap[activeStatus] || { bg: '#F3F4F6', color: '#374151' };

                  return (
                    <tr key={row.id || idx} className="hover:bg-gray-50/60 transition-colors">
                      <td className="py-4 px-2 font-semibold text-gray-600 text-xs tracking-wide uppercase">
                        {row.patientName}
                      </td>
                      <td className="py-4 px-2 text-gray-500 text-xs tracking-wide">
                        {activeCondition}
                      </td>
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

      {/* Patient Categories and Notifications */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        <div className="xl:col-span-4 bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <div className="text-xs font-bold tracking-wider uppercase text-slate-700 mb-4">
            {t('hospital.patientCategories')}
          </div>
          <div className="flex justify-center">
            <div className="relative w-64 h-64 rounded-full" style={{ background: categoryGradient }}>
              <div className="absolute inset-0 m-10 rounded-full bg-white flex flex-col items-center justify-center">
                <span className="text-sm font-semibold text-gray-500">{t('hospital.totalPatients')}</span>
                <span className="text-3xl font-bold text-slate-900">{patientCategoryTotal}</span>
              </div>
            </div>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-3">
            {MOCK_PATIENT_CATEGORIES.map((category) => (
              <div key={category.label} className="rounded-2xl bg-slate-50 p-3 flex items-center gap-3">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: category.color }} />
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-wide text-gray-500">{category.label}</div>
                  <div className="text-sm font-bold text-gray-900">{category.value}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="xl:col-span-8 bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900">{t('hospital.notification')}</h2>
              <p className="text-xs text-gray-400 mt-0.5">Latest hospital alerts and priorities</p>
            </div>
          </div>

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
                {MOCK_DASHBOARD_NOTIFICATIONS.map((note) => (
                  <tr key={note.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="py-4 px-4 font-semibold text-gray-900">{note.time}</td>
                    <td className="py-4 px-4 text-gray-600">{note.notification}</td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-widest ${priorityBadgeClasses[note.priority]}`}>
                        {note.priority}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-widest ${notificationStatusClasses[note.status]}`}>
                        {note.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}