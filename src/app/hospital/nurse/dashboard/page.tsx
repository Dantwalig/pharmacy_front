// src/app/hospital/nurse/dashboard/page.tsx

'use client';

import { useTranslation } from 'react-i18next';
import Link from 'next/link';
import { CalendarIcon, UserGroupIcon, ChatBubbleLeftRightIcon, ClipboardDocumentListIcon, CalendarDaysIcon, ArrowRightIcon, CheckIcon } from '@heroicons/react/24/outline';
import { nurseDashboardStats, nurseDashboardCardsData, nursePatients, nurseSchedule } from '@/mock/hospital/nurse';
import { MOCK_NURSE } from '@/mock/hospital/user';

export default function NurseDashboardPage() {
  const { t } = useTranslation();

  const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return t('hospital.goodMorning');
  if (h < 17) return t('hospital.goodAfternoon');
  return t('hospital.goodEvening');
  };

// Stats Card Styling
  const cardStylesConfig: Record<string, { icon: any; color: string; value: number }> = {
    patients: {
      icon: UserGroupIcon,
      color: '#2563EB',
      value: nurseDashboardStats.totalPatients,
    },
    tasks: {
      icon: ClipboardDocumentListIcon,
      color: '#F97316',
      value: nurseDashboardStats.pendingTasks,
    },
    messages: {
      icon: ChatBubbleLeftRightIcon,
      color: '#C026D3',
      value: nurseDashboardStats.unreadMessages,
    },
  };

  // Merge the text withstyle config for easier rendering
  const statCards = nurseDashboardCardsData.map((card) => ({
    ...card,
    ...cardStylesConfig[card.key],
  }));

  return (
    <div className="space-y-6">
      {/* Hero*/}
      <div className="rounded-2xl relative overflow-hidden w-full" style={{ background: '#EBF5FF', padding: '28px 48px' }}>
        {/*Heartbeat SVG*/}
        <svg 
          className="absolute right-0 top-1/2 -translate-y-1/2 opacity-10 pointer-events-none hidden sm:block sm:w-48 md:w-64 lg:w-96 xl:w-[500px]" 
          viewBox="0 0 320 140"  fill="none" preserveAspectRatio="xMidYMid meet" >
          <polyline points="0,70 55,70 80,15 108,125 135,30 162,105 188,70 320,70" stroke="#1E4D8C" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>

        <div className="relative z-10">
          <h1 className="text-4xl sm:text-5xl font-black mb-3" style={{ color: '#1a3470' }}>
            {getGreeting()}, {MOCK_NURSE.firstName}.
          </h1>
          <p className="text-lg" style={{ color: '#0284C7' }}>{t('hospital.welcomeNurse')}</p>
          <Link
            href="/hospital/nurse/schedule"
            className="mt-6 inline-flex items-center justify-center gap-2 text-sm font-semibold text-white shadow-sm transition hover:opacity-90"
            style={{
              background: 'linear-gradient(to right, #0284C7, #38BDF8)',
              width: '140px',
              height: '44px',
              borderRadius: '16px',
            }} >
            <CalendarIcon className="w-4 h-4" /> {t('hospital.viewSchedule')}
          </Link>
        </div>
      </div>
    
     {/* Stat Cards */}
    <div className="grid gap-5 md:grid-cols-3">
      {statCards.map((card) => {const Icon = card.icon;

        return (
          <div key={card.title} className="rounded-2xl bg-white px-6 py-5 min-h-[180px] flex flex-col"
            style={{ border: `1px solid ${card.color}40`, }} >

            {/* Header */}
            <div className="flex items-center gap-3 mb-8">
              <Icon className="h-5 w-5" style={{ color: card.color }} />
              <h3 className="text-sm font-semibold text-gray-800"> {card.title}</h3>
            </div>

            <h2 className="text-5xl font-light" style={{ color: card.color }} > {card.value} </h2>
            <p className="mt-3 text-xs text-gray-500"> {card.subtitle} </p>

            <div className="flex-1" />
            <div className="border-t border-gray-200 my-4" />
            <Link href={card.href} className="flex items-center justify-between group/action">
              <span className="text-xs font-medium group-hover/action:underline" style={{ color: card.color }}>
                {card.action}
              </span>
              <ArrowRightIcon className="h-4 w-4 transition-transform group-hover/action:translate-x-1" style={{ color: card.color }} />
            </Link>
          </div>
        );
      })}
    </div>
      {/* Patient Overview*/}
      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm p-5 sm:p-6">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <UserGroupIcon className="h-6 w-6 text-[#2563EB]" />
            <h2 className="text-lg font-bold text-gray-800">{t('hospital.patientOverview')}</h2>
          </div>
          <button className="text-sm font-bold text-[#2563EB] hover:underline">{t('common.viewAll')}</button>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-2 sm:p-4 divide-y divide-gray-100">
          {nursePatients.map((patient) => (
            <div 
              key={patient.id} 
              className="grid grid-cols-12 gap-4 py-4 items-center px-2 hover:bg-slate-50 rounded-lg transition-colors group cursor-pointer" >
              <div className="col-span-2 sm:col-span-1 flex items-center gap-2 border-r border-gray-200 pr-2">
                <span className="text-sm font-bold text-gray-400">{patient.id}</span>
              </div>

              <div className="col-span-5 sm:col-span-3 pl-1">
                <div className="font-bold text-gray-900 text-sm sm:text-base whitespace-nowrap overflow-hidden text-ellipsis">
                  {patient.name}
                </div>
                <div className="text-xs font-semibold text-gray-400 mt-0.5"> {patient.gender}, {patient.age} </div>
              </div>

              <div className="col-span-5 sm:col-span-2 text-center sm:text-left">
                <span className={`text-sm font-bold ${ patient.status === 'Stable' ? 'text-green-600' : 'text-red-600' }`}>
                  {patient.status}
                </span>
              </div>

              <div className="col-span-12 sm:col-span-5 grid grid-cols-3 gap-2 text-center sm:text-left pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100">
                {/* BP */}
                <div>
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">BP</div>
                  <div className="text-xs sm:text-sm font-bold text-gray-800 mt-0.5">{patient.bp}</div>
                </div>
                {/* HR */}
                <div>
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">HR</div>
                  <div className="text-xs sm:text-sm font-bold text-gray-800 mt-0.5">{patient.hr}</div>
                </div>
                {/* Temp */}
                <div>
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Temp</div>
                  <div className="text-xs sm:text-sm font-bold text-gray-800 mt-0.5">{patient.temperature}</div>
                </div>
              </div>

              <div className="absolute right-4 sm:relative sm:right-auto col-span-12 sm:col-span-1 flex justify-end">
                <ArrowRightIcon className="h-5 w-5 text-gray-700 transition-transform group-hover:translate-x-1" />
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-6">
          <button className="text-sm font-bold text-[#2563EB] hover:underline">
            {t('hospital.viewAllPatients')}
          </button>
        </div>

      </div>

      {/* Schedule */}
      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <div className="flex items-center gap-2">
            <CalendarDaysIcon className="h-5 w-5 text-[#2563EB]" />
            <h2 className="font-semibold text-gray-800"> {t('hospital.todaySchedule')} </h2>
          </div>

          <button className="text-sm text-[#2563EB]">{t('hospital.viewFullSchedule')}</button>
        </div>

        <div>
          {nurseSchedule.map((item) => (
            <div key={item.id}
              className="flex items-center justify-between border-b border-gray-100 px-5 py-4 last:border-b-0">

              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-500 w-16 shrink-0">{item.time}</span>
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-gray-800">{item.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{item.location}</p>
                </div>
              </div>

              <span
                className={`inline-flex items-center gap-1 rounded-lg px-3 py-1 text-xs font-semibold ${
                item.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-blue-50 text-blue-600' }`}>
                {item.status}
                {item.status === 'Completed' && <CheckIcon className="w-3.5 h-3.5" strokeWidth={2.5} />}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
