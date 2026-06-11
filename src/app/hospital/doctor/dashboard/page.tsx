// src/app/hospital/doctor/dashboard/page.tsx
'use client';

import { useTranslation } from 'react-i18next';
import Link from 'next/link';
import { MOCK_DASHBOARD_STATS, MOCK_RECENT_APPOINTMENTS } from '@/mock/hospital/dashboard';
import { MOCK_DOCTOR } from '@/mock/hospital/user';
import { CalendarIcon, UsersIcon, UserPlusIcon, BanknotesIcon } from '@heroicons/react/24/outline';

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

  // Overview Cards Data
  const overviewCards = [
    {
      title: MOCK_DASHBOARD_STATS.appointmentsByStatus.CONFIRMED + MOCK_DASHBOARD_STATS.appointmentsByStatus.PENDING,
      label: t('hospital.appointments'),
      icon: CalendarIcon,
      color: '#000000', cardBg: '#EBF5FF', iconColor: '#0284C7', borderColor:'#E0F2FE'
    },
    {
      title: MOCK_DASHBOARD_STATS.totalPatients,
      label: t('hospital.totalPatients'),
      icon: UsersIcon,
      color: '#000000', cardBg: '#EBF5FF', iconColor: '#04802D', borderColor:'#DCFCE7'
    },
    {
      title: MOCK_DASHBOARD_STATS.activeDoctors,
      label: t('hospital.activeDoctors'),
      icon: UserPlusIcon,
      color: '#000000', cardBg: '#EBF5FF', iconColor: '#FF0000', borderColor:'#FEE2E2'
    },
    {
      title: MOCK_DASHBOARD_STATS.monthlyRevenue.toLocaleString('en-US', { style: 'currency', currency: 'USD' }),
      label: t('common.monthly_revenue'),
      icon: BanknotesIcon,
      color: '#000000', cardBg: '#EBF5FF', iconColor: '#92009F', borderColor:'#F3E8FF'
    }
  ];

  //statusMap for appointments
  const statusMap: Record<string, { bg: string; color: string; dot: string }> = {
  PENDING:   { bg: '#EBF5FF', color: '#2563EB', dot: '#3B82F6' },
  CONFIRMED: { bg: '#EBF5FF', color: '#2563EB', dot: '#3B82F6' },
  COMPLETED: { bg: '#ECFDF5', color: '#059669', dot: '#10B981' },
  CANCELLED: { bg: '#FEF2F2', color: '#DC2626', dot: '#EF4444' },
};

  return (
    <div className="space-y-6">
      {/* Hero*/}
      <div className="rounded-2xl relative overflow-hidden w-full" style={{ background: '#EBF5FF', padding: '28px 48px' }}>
        <svg className="absolute right-0 top-1/2 -translate-y-1/2 opacity-10 pointer-events-none hidden sm:block sm:w-48" viewBox="0 0 320 140" fill="none">
          <polyline points="0,70 55,70 80,15 108,125 135,30 162,105 188,70 320,70" stroke="#1E4D8C" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <div className="relative z-10">
          <h1 className="text-4xl sm:text-5xl font-black mb-3" style={{ color: '#1a3470' }}>
            {getGreeting()},<br />{firstName}.
          </h1>
          <p className="text-lg" style={{ color: '#38BDF8' }}>Ready for today’s appointments and patient updates.</p>
          <button
            type="button"
            className="mt-6 inline-flex items-center justify-center gap-2 text-sm font-semibold text-white shadow-sm transition hover:opacity-90"
            style={{
              background: 'linear-gradient(to right, #0284C7, #38BDF8)',
              width: '121px',
              height: '41px',
              borderRadius: '16px',
            }} 
          >
            <CalendarIcon className="w-4 h-4" />
            {t('hospital.schedule')}
          </button>
        </div>
      </div>

      {/*Overview Stats Grid*/}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {overviewCards.map((card) => {
          const Icon = card.icon;

          return (
            <div className="rounded-2xl border p-5 bg-white"  key={card.label}  style={{ borderColor: card.borderColor }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500"> {card.label} </p>
                  <h3 className="mt-2 text-2xl font-bold text-gray-900"> {card.title} </h3>
                </div>

                <div className="rounded-xl p-3" style={{ backgroundColor: '#EBF5FF',}}>
                  <Icon className="w-6 h-6" style={{ color: card.iconColor }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/*Recent Appointments */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold" style={{ color: NAVY }}> {t('hospital.appointments')} </h2>
            <p className="text-xs text-gray-400 mt-0.5"> {t('hospital.latestActivity')} </p>
          </div>
          <Link href="/hospital/doctor/appointments" className="font-semibold text-sm flex items-center gap-1 hover:underline transition-all" style={{ color: NAVY }}>
            {t('common.viewAll')} <span className="text-base">›</span>
          </Link>
        </div>

        {MOCK_RECENT_APPOINTMENTS.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 text-xs font-semibold text-gray-400 uppercase tracking-wider bg-gray-50/50">
                  <th className="py-3 px-4">{t('hospital.patientName')}</th>
                  <th className="py-3 px-4">{t('hospital.doctorName')}</th>
                  <th className="py-3 px-4">{t('hospital.specialization')}</th>
                  <th className="py-3 px-4">{t('hospital.date')}</th>
                  <th className="py-3 px-4 text-center">{t('hospital.status')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-center-sm"> {MOCK_RECENT_APPOINTMENTS.map((apt) => {
                  const s = statusMap[apt.status] ?? statusMap.PENDING;
                  const formattedDate = new Date(apt.date).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  });
                  return (
                    <tr key={apt.id} className="hover:bg-gray-50/80 transition-colors group">

                      {/* Patient Name */}
                      <td className="py-4 px-4 font-semibold text-gray-900">
                        <Link href={`/hospital/doctor/appointments/${apt.id}`} className="hover:text-sky-600 transition-colors block">
                          {apt.patientName}</Link>
                      </td>

                      {/* Doctor */}
                      <td className="py-4 px-4 text-gray-600"> {apt.doctorName}  </td>

                      {/* Specialization */}
                      <td className="py-4 px-4 text-gray-600"> {apt.specialization} </td>

                      {/* Date */}
                      <td className="py-4 px-4 text-gray-600"> {formattedDate} </td>

                      {/* Status */}
                      <td className="py-4 px-4 text-right">
                        <span className="inline-flex align-items-center gap-1.5 px-3 py-1 rounded-full text-center-xs font-bold uppercase tracking-wider"
                          style={{ background: s.bg, color: s.color }}>
                          <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: s.dot }} />
                          {t(`${apt.status.charAt(0) + apt.status.slice(1).toLowerCase()}`)}
                        </span>
                      </td>
                    </tr>
                  );
                })} </tbody>
            </table>
          </div>
        ) : (
          <p className="text-center text-gray-500 py-10">{t('hospital.noRecentAppointments')}</p>
        )}

      </div>
    </div>
  );
}