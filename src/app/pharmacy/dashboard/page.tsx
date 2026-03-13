'use client';
// src/app/(pharmacy)/dashboard/page.tsx
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  GitBranch, Users, DollarSign, TrendingUp,
  Activity, AlertTriangle, User
} from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

const TEAL  = '#2D9B8A';
const NAVY  = '#1E4D8C';
const COLORS = [NAVY, TEAL, '#3B82F6', '#10B981', '#6366F1'];

const lineData = [
  { month: 'Sep', revenue: 8100000 },
  { month: 'Oct', revenue: 8700000 },
  { month: 'Nov', revenue: 8300000 },
  { month: 'Dec', revenue: 11500000 },
  { month: 'Jan', revenue: 13200000 },
  { month: 'Feb', revenue: 14800000 },
];

const barData = [
  { name: 'Main',   revenue: 4200000 },
  { name: 'Nyami.', revenue: 3800000 },
  { name: 'Huye',   revenue: 2000000 },
  { name: 'Musanze',revenue: 3000000 },
  { name: 'Remera', revenue: 1800000 },
];

const pieData = [
  { name: 'Main Branch',   value: 420 },
  { name: 'Nyamirambo',    value: 310 },
  { name: 'Huye',          value: 280 },
  { name: 'Musanze',       value: 195 },
  { name: 'Remera',        value: 150 },
];

function fmt(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(0)}K`;
  return String(n);
}

export default function PharmacyDashboard() {
  const { t } = useTranslation();

  const stats = [
    {
      icon: GitBranch,
      label: t('pharmacyOwner.totalBranches'),
      value: '5',
      bg: 'bg-gray-50',
      iconColor: 'text-gray-500',
    },
    {
      icon: Users,
      label: t('pharmacyOwner.totalEmployees'),
      value: '24',
      bg: 'bg-gray-50',
      iconColor: 'text-gray-500',
    },
    {
      icon: DollarSign,
      label: t('pharmacyOwner.monthlyRevenue'),
      value: '14.8M RWF',
      bg: 'bg-gray-50',
      iconColor: 'text-gray-500',
    },
    {
      icon: TrendingUp,
      label: t('pharmacyOwner.totalRevenue'),
      value: '62.5M RWF',
      bg: 'bg-gray-50',
      iconColor: 'text-gray-500',
      darkCard: true,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Hero banner */}
      <div
        className="rounded-2xl p-8 text-white"
        style={{ backgroundColor: NAVY }}
      >
        <h1 className="text-3xl font-bold">{t('pharmacyOwner.ownerOverview')}</h1>
        <p className="mt-1 text-white/70">{t('pharmacyOwner.ownerOverviewSubtitle')}</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => {
          const Icon = s.icon;
          const dark = i === 3;
          return (
            <div
              key={i}
              className="rounded-2xl p-5 flex items-center justify-between"
              style={{ backgroundColor: dark ? NAVY : TEAL }}
            >
              <div>
                <p className="text-white/80 text-sm">{s.label}</p>
                <p className="text-white text-2xl font-bold mt-1">{s.value}</p>
              </div>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-white/15">
                <Icon size={22} className="text-white" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Line chart */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100">
          <h3 className="font-semibold text-gray-800 mb-4">
            {t('pharmacyOwner.monthlyBranchRevenue')}
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={lineData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tickFormatter={fmt} tick={{ fontSize: 12 }} />
              <Tooltip formatter={(v: any) => [`${fmt(v as number)} RWF`, 'Revenue']} />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke={TEAL}
                strokeWidth={2.5}
                dot={{ fill: TEAL, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Bar chart */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100">
          <h3 className="font-semibold text-gray-800 mb-4">
            {t('pharmacyOwner.revenueByBranch')}
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tickFormatter={fmt} tick={{ fontSize: 12 }} />
              <Tooltip formatter={(v: any) => [`${fmt(v as number)} RWF`, 'Revenue']} />
              <Bar dataKey="revenue" fill={NAVY} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Pie + activity/alerts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Pie chart */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100">
          <h3 className="font-semibold text-gray-800 mb-4">
            {t('pharmacyOwner.inventoryDistribution')}
          </h3>
          <div className="flex items-center gap-6">
            <PieChart width={180} height={180}>
              <Pie
                data={pieData}
                cx={85}
                cy={85}
                innerRadius={55}
                outerRadius={85}
                dataKey="value"
              >
                {pieData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
            <div className="flex-1 space-y-2">
              {pieData.map((entry, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: COLORS[i % COLORS.length] }}
                    />
                    <span className="text-sm text-gray-600">{entry.name}</span>
                  </div>
                  <span className="text-sm font-medium text-gray-800">
                    {entry.value} {t('pharmacyOwner.items')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Activity & Alerts */}
        <div className="space-y-4">
          {/* Recent Manager Activity */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-800">
                {t('pharmacyOwner.recentManagerActivity')}
              </h3>
              <Activity size={18} className="text-gray-400" />
            </div>
            {[
              { name: 'John Doe', action: 'Approved order #1042', branch: 'Main Branch', time: '12 min ago' },
              { name: 'Jane Smith', action: 'Added staff member', branch: 'Nyamirambo Branch', time: '1 hr ago' },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3 py-2.5 border-b border-gray-50 last:border-0">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold shrink-0 mt-0.5"
                  style={{ backgroundColor: NAVY }}
                >
                  <User size={14} />
                </div>
                <div>
                  <p className="text-sm text-gray-800">
                    <span className="font-medium">{item.name}</span> — {item.action}
                  </p>
                  <p className="text-xs text-gray-400">{item.branch} · {item.time}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Branch Alerts */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-800">
                {t('pharmacyOwner.branchAlerts')}
              </h3>
              <AlertTriangle size={18} className="text-gray-400" />
            </div>
            {[
              { branch: 'Remera Branch', msg: 'Low stock: 4 medications below threshold', level: 'warning' },
              { branch: 'Musanze Branch', msg: 'Manager contract expiring soon', level: 'info' },
            ].map((alert, i) => (
              <div key={i} className="flex items-start gap-3 py-2.5 border-b border-gray-50 last:border-0">
                <span
                  className="px-2 py-0.5 rounded-full text-xs font-medium shrink-0 mt-0.5"
                  style={{
                    backgroundColor: alert.level === 'warning' ? '#FEF3C7' : '#DBEAFE',
                    color: alert.level === 'warning' ? '#92400E' : '#1E40AF',
                  }}
                >
                  {t('pharmacyOwner.warning')}
                </span>
                <div>
                  <p className="text-sm font-medium text-gray-800">{alert.branch}</p>
                  <p className="text-xs text-gray-500">{alert.msg}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}