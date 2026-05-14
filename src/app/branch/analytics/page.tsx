'use client';

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import api from '@/lib/api';
import type { AttendanceSummary } from '@/types';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import {
  ShoppingCartIcon,
  CheckCircleIcon,
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
} from '@heroicons/react/24/outline';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Area,
  AreaChart,
} from 'recharts';

// ── Colour tokens ────────────────────────────────────────────────────────────
const NAVY   = '#1E3A5F';
const BLUE   = '#1E4D8C';
const LBLUE  = '#29ABE2';
const TEAL   = '#2D9B8A';

// ── Helpers ──────────────────────────────────────────────────────────────────
function fmt(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(0)}k`;
  return String(n ?? 0);
}

function fmtRwf(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M Rwf`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(0)}k Rwf`;
  return `${n} Rwf`;
}

// ── Custom tooltip ────────────────────────────────────────────────────────────
function RevenueTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-lg p-3 text-xs">
      <p className="font-semibold text-gray-700 mb-1">{label}</p>
      <p style={{ color: LBLUE }}>Revenue: RWF {Number(payload[0]?.value ?? 0).toLocaleString()}</p>
    </div>
  );
}

// ── Speedometer / Gauge component ─────────────────────────────────────────────
function GaugeChart({ value }: { value: number }) {
  // SVG half-circle gauge. value: 0-100
  const pct    = Math.min(Math.max(value, 0), 100) / 100;
  const radius = 80;
  const cx     = 120;
  const cy     = 110;
  // Arc from 180° to 0° (left to right across the top)
  const startAngle = Math.PI;          // 180° in radians
  const endAngle   = 0;                // 0°
  const arcLen     = startAngle - endAngle; // π
  const angle      = startAngle - pct * arcLen; // needle angle

  // Background arc path (grey)
  const bgX1 = cx + radius * Math.cos(startAngle);
  const bgY1 = cy + radius * Math.sin(startAngle);
  const bgX2 = cx + radius * Math.cos(endAngle);
  const bgY2 = cy + radius * Math.sin(endAngle);

  // Filled arc path (blue) - from 180° to current angle
  const fillX2 = cx + radius * Math.cos(angle);
  const fillY2 = cy + radius * Math.sin(angle);
  const largeArc = pct > 0.5 ? 1 : 0;

  // Needle
  const needleLen = 68;
  const needleX   = cx + needleLen * Math.cos(angle);
  const needleY   = cy + needleLen * Math.sin(angle);

  // Tick marks (0,10,20,...100)
  const ticks = Array.from({ length: 11 }, (_, i) => i * 10);

  return (
    <svg viewBox="0 0 240 130" className="w-full max-w-xs mx-auto">
      {/* Background track */}
      <path
        d={`M ${bgX1} ${bgY1} A ${radius} ${radius} 0 0 1 ${bgX2} ${bgY2}`}
        fill="none"
        stroke="#E5E7EB"
        strokeWidth="14"
        strokeLinecap="round"
      />
      {/* Filled arc */}
      {pct > 0 && (
        <path
          d={`M ${bgX1} ${bgY1} A ${radius} ${radius} 0 ${largeArc} 1 ${fillX2} ${fillY2}`}
          fill="none"
          stroke={LBLUE}
          strokeWidth="14"
          strokeLinecap="round"
        />
      )}

      {/* Tick marks */}
      {ticks.map(tick => {
        const t   = tick / 100;
        const ta  = startAngle - t * arcLen;
        const r1  = radius + 12;
        const r2  = radius + 20;
        const x1  = cx + r1 * Math.cos(ta);
        const y1  = cy + r1 * Math.sin(ta);
        const x2  = cx + r2 * Math.cos(ta);
        const y2  = cy + r2 * Math.sin(ta);
        const lx  = cx + (radius + 30) * Math.cos(ta);
        const ly  = cy + (radius + 30) * Math.sin(ta);
        return (
          <g key={tick}>
            <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#9CA3AF" strokeWidth="1.5" />
            <text
              x={lx}
              y={ly}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="8"
              fill="#9CA3AF"
            >
              {tick}
            </text>
          </g>
        );
      })}

      {/* Needle */}
      <line
        x1={cx}
        y1={cy}
        x2={needleX}
        y2={needleY}
        stroke={LBLUE}
        strokeWidth="3"
        strokeLinecap="round"
      />
      <circle cx={cx} cy={cy} r="6" fill={LBLUE} />

      {/* Value label */}
      <text x={cx} y={cy + 22} textAnchor="middle" fontSize="22" fontWeight="bold" fill={NAVY}>
        {value}
      </text>
    </svg>
  );
}

// ── Funnel component ──────────────────────────────────────────────────────────
const FUNNEL_STEPS = [
  { label: 'Created',   pct: 90 },
  { label: 'Confirmed', pct: 80 },
  { label: 'Processed', pct: 70 },
  { label: 'Delivered', pct: 60 },
  { label: 'Completed', pct: 50 },
];

function FunnelChart() {
  return (
    <div className="flex flex-col items-center gap-0.5 w-full mt-2">
      {FUNNEL_STEPS.map((step, i) => {
        const width = step.pct + 10; // percentage width, slightly padded
        const opacity = 1 - i * 0.12;
        return (
          <div
            key={step.label}
            style={{
              width: `${width}%`,
              backgroundColor: `rgba(30, 58, 95, ${opacity})`,
            }}
            className="flex items-center justify-between px-4 py-2 rounded-sm text-white text-xs font-semibold"
          >
            <span>{step.label}</span>
            <span>{step.pct}%</span>
          </div>
        );
      })}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function BranchAnalyticsPage() {
  const { t } = useTranslation();
  const [orders, setOrders]                     = useState<any[]>([]);
  const [attendanceSummary, setAttendanceSummary] = useState<AttendanceSummary | null>(null);
  const [loading, setLoading]                   = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    Promise.all([
      api.get('/orders/pharmacy-orders', { signal: controller.signal }),
      api.get('/attendance/summary',     { signal: controller.signal }),
    ])
      .then(([ordersRes, attRes]) => {
        setOrders(Array.isArray(ordersRes.data) ? ordersRes.data : ordersRes.data?.data ?? []);
        setAttendanceSummary(attRes.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, []);

  if (loading) return <div className="flex justify-center py-20"><LoadingSpinner /></div>;

  // ── Derived metrics ─────────────────────────────────────────────────────────
  const completedOrders = orders.filter(o => o.status === 'COMPLETED' || o.status === 'DELIVERED');
  const pendingOrders   = orders.filter(o => o.status === 'PENDING');
  const inProgressOrders = orders.filter(o =>
    ['ACCEPTED', 'PREPARING', 'OUT_FOR_DELIVERY', 'READY_FOR_PICKUP'].includes(o.status)
  );
  const totalRevenue  = completedOrders.reduce((sum, o) => sum + (o.total ?? 0), 0);
  const avgOrderValue = completedOrders.length > 0 ? totalRevenue / completedOrders.length : 0;
  const completionRate = orders.length > 0
    ? Math.round((completedOrders.length / orders.length) * 100)
    : 0;

  // ── Stat cards ──────────────────────────────────────────────────────────────
  const statCards = [
    {
      icon: ShoppingCartIcon,
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      label: t('analytics.totalOrders'),
      value: orders.length,
      sub: t('analytics.thisMonth') || 'This Month',
      subColor: 'text-gray-400',
    },
    {
      icon: CheckCircleIcon,
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      label: t('analytics.completedOrders'),
      value: completedOrders.length,
      sub: 'Last Month',
      subColor: 'text-gray-400',
    },
    {
      icon: CurrencyDollarIcon,
      iconBg: 'bg-teal-100',
      iconColor: 'text-teal-600',
      label: t('analytics.totalRevenue'),
      value: fmtRwf(totalRevenue),
      sub: '+8% vs last month',
      subColor: 'text-green-500',
    },
    {
      icon: ArrowTrendingUpIcon,
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
      label: t('analytics.avgOrderValue2') || 'Avg Order Value',
      value: fmtRwf(avgOrderValue),
      sub: '+4%',
      subColor: 'text-green-500',
    },
  ];

  // ── Monthly revenue (Jan → current month) ────────────────────────────────
  const currentMonth = new Date().getMonth(); // 0-based
  const monthNames   = ['Jan','Feb','March','April','May','June','July','Aug','Sep','Oct','Nov','Dec'];
  const monthlyRevenue = monthNames.slice(0, currentMonth + 1).map((month, idx) => {
    const revenue = completedOrders
      .filter(o => {
        const d = new Date(o.createdAt);
        return d.getMonth() === idx && d.getFullYear() === new Date().getFullYear();
      })
      .reduce((sum, o) => sum + (o.total ?? 0), 0);
    return { month, revenue };
  });

  // ── Orders by status (3 groups: Pending / In Progress / Completed) ─────────
  const statusData = [
    { status: 'Pending',     count: pendingOrders.length },
    { status: 'In Progress', count: inProgressOrders.length },
    { status: 'Completed',   count: completedOrders.length },
  ];

  return (
    <div className="space-y-5">

      {/* ── Hero banner ─────────────────────────────────────────────────── */}
      <div
        className="rounded-2xl p-6 lg:p-8 text-white"
        style={{ background: `linear-gradient(135deg, ${NAVY} 0%, ${BLUE} 60%, ${LBLUE} 100%)` }}
      >
        <h1 className="text-2xl lg:text-3xl font-bold">
          {t('analytics.branchAnalytics') || 'Branch Analytics'}
        </h1>
        <p className="mt-1 text-white/70 text-sm">
          {t('analytics.branchPerformance') || 'Your branch performance overview this month'}
        </p>
        <div className="mt-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/40 text-white/90 text-xs font-medium">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            This month
          </span>
        </div>
      </div>

      {/* ── Stat cards ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(card => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${card.iconBg}`}>
                <Icon className={`w-5 h-5 ${card.iconColor}`} />
              </div>
              <p className="text-xs text-gray-500 mb-1">{card.label}</p>
              <p className="text-2xl font-bold text-gray-900">{card.value}</p>
              <p className={`text-xs mt-1 ${card.subColor}`}>{card.sub}</p>
            </div>
          );
        })}
      </div>

      {/* ── Charts row 1: Revenue Trend + Orders By Status ──────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Revenue Trend */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <h3 className="font-semibold text-gray-800 mb-0.5">
            {t('analytics.revenueTrend') || 'Revenue Trend'}
          </h3>
          <p className="text-xs text-gray-400 mb-4">Monthly revenue for this year</p>
          {monthlyRevenue.some(d => d.revenue > 0) ? (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={monthlyRevenue} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <defs>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor={LBLUE} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={LBLUE} stopOpacity={0}   />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 11, fill: '#9CA3AF' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#9CA3AF' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={v => fmt(v)}
                  width={48}
                />
                <Tooltip content={<RevenueTooltip />} />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke={LBLUE}
                  strokeWidth={2.5}
                  fill="url(#revenueGrad)"
                  dot={false}
                  activeDot={{ r: 4 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-48 text-gray-300 text-sm">
              No completed orders yet this year
            </div>
          )}
        </div>

        {/* Orders By Status */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <h3 className="font-semibold text-gray-800 mb-0.5">
            {t('analytics.ordersByStatus') || 'Orders By Status'}
          </h3>
          <p className="text-xs text-gray-400 mb-4">Current breakdown</p>
          {statusData.some(d => d.count > 0) ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={statusData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                <XAxis
                  dataKey="status"
                  tick={{ fontSize: 11, fill: '#9CA3AF' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#9CA3AF' }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                  width={36}
                />
                <Tooltip
                  contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="count" name="Orders" fill={BLUE} radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-48 text-gray-300 text-sm">
              No orders yet
            </div>
          )}
        </div>
      </div>

      {/* ── Charts row 2: Gauge + Funnel ─────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Order Completion Rate — Gauge */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex flex-col items-center">
          <h3 className="font-semibold text-gray-800 mb-0.5 self-start">Order Completion Rate</h3>
          <p className="text-xs text-gray-400 mb-4 self-start">
            Percentage of orders successfully completed
          </p>
          <GaugeChart value={completionRate} />
        </div>

        {/* Order Completion Percentage — Funnel */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <h3 className="font-semibold text-gray-800 mb-0.5">Order Completion Percentage</h3>
          <p className="text-xs text-gray-400 mb-4">Order pipeline funnel</p>
          <FunnelChart />
        </div>
      </div>
    </div>
  );
}
