// src/app/hospital/admin/dashboard/page.tsx
'use client';

import { useTranslation } from 'react-i18next';
import Link from 'next/link';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { MOCK_ADMIN } from '@/mock/hospital/user';
import { CalendarIcon, UsersIcon, BanknotesIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

export default function HospitalAdminDashboardPage() {
  const { t } = useTranslation();

  const firstName = MOCK_ADMIN.firstName;
  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return t('hospital.goodMorning');
    if (h < 17) return t('hospital.goodAfternoon');
    return t('hospital.goodEvening');
  };

  const stats = [
    {
      label: t('hospital.appointments'),
      value: 9,
      statusText: '18% vs yesterday',
      accent: 'border-brand-navy',
      iconBg: 'bg-brand-navy/10',
      iconColor: 'text-brand-navy',
      labelClass: 'text-brand-navy',
      icon: CalendarIcon,
    },
    {
      label: t('hospital.activeDoctors'),
      value: 6,
      statusText: t('hospital.onDutyToday'),
      accent: 'border-amber-500',
      iconBg: 'bg-amber-100',
      iconColor: 'text-amber-600',
      labelClass: 'text-slate-500',
      icon: UsersIcon,
    },
    {
      label: t('hospital.procuredValue'),
      value: '1,850,000 RWF',
      statusText: '12% budget utilization',
      accent: 'border-emerald-500',
      iconBg: 'bg-emerald-100',
      iconColor: 'text-emerald-600',
      labelClass: 'text-slate-500',
      icon: BanknotesIcon,
    },
    {
      label: t('hospital.lowStockExpiry'),
      value: 7,
      statusText: t('hospital.requiresImmediateAttention'),
      accent: 'border-red-500',
      iconBg: 'bg-red-100',
      iconColor: 'text-red-600',
      labelClass: 'text-slate-500',
      icon: ExclamationTriangleIcon,
    },
  ];

  const chartData = [
    { label: 'Dec', value: 420 },
    { label: 'Jan', value: 620 },
    { label: 'Feb', value: 520 },
    { label: 'Mar', value: 760 },
    { label: 'Apr', value: 890 },
    { label: 'May', value: 940 },
  ];

  const activityFeed = [
    {
      title: 'New appointment scheduled for Kevine Mugisha under Pediatrics.',
      time: '10 mins ago',
      color: 'bg-sky-100 text-sky-600',
    },
    {
      title: 'Low stock warning: Amoxicillin 500mg level dropped below threshold limit.',
      time: '1 hour ago',
      color: 'bg-amber-100 text-amber-600',
    },
    {
      title: 'Procurement request PR-6644 marked as delivered. Stock levels updated.',
      time: '3 hours ago',
      color: 'bg-emerald-100 text-emerald-600',
    },
    {
      title: 'Item Insulin Glargine Vials expired on 2026-05-05.',
      time: '1 day ago',
      color: 'bg-red-100 text-red-600',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="rounded-2xl relative overflow-hidden w-full bg-brand-hero p-7 sm:p-12">
        {/* Heartbeat SVG */}
        <svg
          className="absolute right-0 top-1/2 -translate-y-1/2 opacity-45 pointer-events-none hidden sm:block sm:w-48 md:w-64 lg:w-96 xl:w-[500px]"
          viewBox="0 0 320 140"
          fill="none"
          preserveAspectRatio="xMidYMid meet"
        >
          <polyline
            points="0,70 55,70 80,15 108,125 135,30 162,105 188,70 320,70"
            stroke="var(--color-brand-blue-light)"
            strokeWidth="7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>

        <div className="relative z-10 max-w-3xl">
          <h1 className="text-4xl sm:text-5xl font-black mb-3 text-brand-blue-light">
            {getGreeting()}, {firstName}.
          </h1>
          <p className="text-lg text-brand-navy-dark">
            {t('hospital.adminWelcomeMessage')}
          </p>
          <Link
            href="/hospital/admin/appointments"
            className="mt-6 inline-flex min-w-[185px] h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-navy to-sky-400 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 whitespace-nowrap"
          >
            <CalendarIcon className="w-4 h-4" />
            {t('hospital.viewAppointments')}
          </Link>
        </div>
      </div>

      {/* Overview cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((card) => (
          <div
            key={card.label}
            className={`rounded-2xl border ${card.accent} border-l-4 bg-white shadow-sm p-5 transition-all duration-300 hover:shadow-md`}
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className={`text-sm font-semibold ${card.labelClass}`}>
                  {card.label}
                </p>
                <h3 className="mt-2 text-3xl font-bold text-slate-900">
                  {card.value}
                </h3>
              </div>
              <div className={`rounded-xl p-3 ${card.iconBg}`}>
                <card.icon className={`w-6 h-6 ${card.iconColor}`} />
              </div>
            </div>
            <p className="mt-4 text-sm text-slate-500">{card.statusText}</p>
          </div>
        ))}
      </div>

      {/* Monthly Logistics & Procurement Value */}
      <div className="grid grid-cols-1 xl:grid-cols-[2fr_1fr] gap-6">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">{t('hospital.monthlyLogistics')}</h2>
            </div>
            <div className="flex items-center gap-2 bg-slate-100 rounded-full p-1" aria-label='Show spend chart'>
              <button className="rounded-full px-4 py-2 text-sm font-semibold text-white bg-brand-navy shadow-sm transition hover:bg-brand-navy/5">
                {t('hospital.spend')}
              </button>
              <button className="rounded-full px-4 py-2 text-sm font-semibold text-slate-500 transition hover:bg-slate-200">
                {t('hospital.volume')}
              </button>
            </div>
          </div>

          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="label" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Line type="monotone" dataKey="value" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">{t('hospital.recentActivity')}</h2>
          <div className="space-y-5">
            {activityFeed.map((item) => (
              <div key={item.title} className="flex gap-4">
                <div className={`mt-1 h-10 w-10 rounded-2xl flex items-center justify-center ${item.color}`}>
                  <span className="h-2.5 w-2.5 rounded-full bg-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                  <p className="text-xs text-slate-500 mt-1">{item.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
