// src/app/hospital/admin/dashboard/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Link from 'next/link';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useHospitalAdminUser, useHospitalId } from '@/lib/hospital';
import { CalendarIcon, UsersIcon, BanknotesIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import api from '@/lib/api';

interface DashboardStats {
  totalAppointments: { thisMonth: number; allTime: number };
  totalRevenue: number;
  monthlyRevenue: number;
  totalDoctors: number;
  activeDoctors: number;
  totalPatients: number;
}

export default function HospitalAdminDashboardPage() {
  const { t } = useTranslation();
  const { userName } = useHospitalAdminUser();
  const hospitalId = useHospitalId();

  const firstName = userName.split(' ')[0];

  const [apiStats, setApiStats]       = useState<DashboardStats | null>(null);
  const [chartData, setChartData]     = useState<{ label: string; value: number }[]>([]);
  const [lowStockCount, setLowStockCount] = useState<number | null>(null);
  const [loading, setLoading]         = useState(true);

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return t('hospital.goodMorning');
    if (h < 17) return t('hospital.goodAfternoon');
    return t('hospital.goodEvening');
  };

  useEffect(() => {
    if (!hospitalId) { setLoading(false); return; }
    (async () => {
      const [statsRes, revenueRes, stockRes] = await Promise.allSettled([
        api.get(`/hospitals/${hospitalId}/dashboard/stats`),
        api.get(`/hospitals/${hospitalId}/dashboard/weekly-revenue`),
        api.get(`/hospitals/${hospitalId}/drug-stock`),
      ]);
      if (statsRes.status === 'fulfilled')
        setApiStats(statsRes.value.data);
      if (revenueRes.status === 'fulfilled') {
        const rows: { label: string; revenue: number }[] = Array.isArray(revenueRes.value.data)
          ? revenueRes.value.data
          : [];
        setChartData(rows.map(r => ({ label: r.label, value: r.revenue })));
      }
      if (stockRes.status === 'fulfilled') {
        const items = Array.isArray(stockRes.value.data) ? stockRes.value.data : [];
        setLowStockCount(items.filter((d: any) => d.lowStockAlert).length);
      }
      setLoading(false);
    })();
  }, [hospitalId]);

  const stats = [
    {
      label: t('hospital.appointments'),
      value: loading ? '—' : (apiStats?.totalAppointments.thisMonth ?? '—'),
      statusText: apiStats ? `${apiStats.totalAppointments.allTime} all time` : '—',
      statusColor: 'text-emerald-600',
      up: true,
      accent: 'border-brand-navy',
      iconBg: 'bg-brand-navy/10',
      iconColor: 'text-brand-navy',
      labelClass: 'text-brand-navy',
      icon: CalendarIcon,
    },
    {
      label: t('hospital.activeDoctors'),
      value: loading ? '—' : (apiStats?.activeDoctors ?? '—'),
      statusText: apiStats ? `${apiStats.totalDoctors} total doctors` : '—',
      statusColor: 'text-slate-500',
      up: false,
      accent: 'border-amber-500',
      iconBg: 'bg-amber-100',
      iconColor: 'text-amber-600',
      labelClass: 'text-slate-500',
      icon: UsersIcon,
    },
    {
      label: t('hospital.procuredValue'),
      value: loading ? '—' : (apiStats ? `${apiStats.monthlyRevenue.toLocaleString()} RWF` : '—'),
      statusText: apiStats ? `${apiStats.totalRevenue.toLocaleString()} RWF total` : '—',
      statusColor: 'text-emerald-600',
      up: true,
      accent: 'border-emerald-500',
      iconBg: 'bg-emerald-100',
      iconColor: 'text-emerald-600',
      labelClass: 'text-slate-500',
      icon: BanknotesIcon,
    },
    {
      label: t('hospital.lowStockExpiry'),
      value: loading ? '—' : (lowStockCount ?? '—'),
      statusText: t('hospital.requiresImmediateAttention'),
      statusColor: lowStockCount && lowStockCount > 0 ? 'text-red-500' : 'text-emerald-600',
      up: false,
      accent: 'border-red-500',
      iconBg: 'bg-red-100',
      iconColor: 'text-red-600',
      labelClass: 'text-slate-500',
      icon: ExclamationTriangleIcon,
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
          <p className="text-lg" style={{ color: '#0284C7' }}>
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
                <p className={`text-xs font-bold uppercase tracking-wider ${card.labelClass}`}>
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
            <p className={`mt-4 text-sm font-medium ${card.statusColor}`}>
              {card.up && <span className="mr-0.5">↑</span>}{card.statusText}
            </p>
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

          <div className="h-[300px]">
            {!loading && chartData.length === 0 ? (
              <div className="flex items-center justify-center h-full text-sm text-gray-400">No revenue data available</div>
            ) : (
              <ResponsiveContainer width="98%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid vertical={false} />
                  <XAxis dataKey="label" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} />
                  <Tooltip formatter={(v) => [`${(v as number).toLocaleString()} RWF`, 'Revenue']} />
                  <Line type="monotone" dataKey="value" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">{t('hospital.recentActivity')}</h2>
          <div className="flex items-center justify-center h-32 text-sm text-gray-400">
            No recent activity
          </div>
        </div>
      </div>
    </div>
  );
}
