'use client';
// src/app/(pharmacy)/dashboard/page.tsx
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ShoppingCart, Clock, DollarSign, AlertTriangle,
  TrendingUp, TrendingDown, Package, Users, BarChart2, Activity,
} from 'lucide-react';
import { api } from '@/lib/api';

const TEAL = '#2D9B8A';
const NAVY = '#1E4D8C';

function fmt(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(0)}K`;
  return String(n);
}

function ChangeBadge({ value }: { value: number }) {
  const up = value >= 0;
  return (
    <span
      className="inline-flex items-center gap-0.5 text-xs font-semibold px-2 py-0.5 rounded-full"
      style={{
        backgroundColor: up ? '#D1FAE5' : '#FEF3C7',
        color: up ? '#065F46' : '#92400E',
      }}
    >
      {up ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
      {Math.abs(value)}%
    </span>
  );
}

// ── Skeleton helpers ─────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="rounded-2xl p-5 bg-white border border-gray-100 animate-pulse space-y-3">
      <div className="w-8 h-8 rounded-xl bg-gray-100" />
      <div className="h-3 w-24 bg-gray-100 rounded" />
      <div className="h-6 w-20 bg-gray-200 rounded" />
    </div>
  );
}

function SkeletonBanner() {
  return (
    <div className="rounded-2xl p-8 animate-pulse bg-gray-200 h-28" />
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function PharmacyDashboard() {
  const { t } = useTranslation();

  const [stats, setStats]         = useState<any>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;

    Promise.all([
      api.get('/pharmacies/dashboard/stats',     { signal }),
      api.get('/pharmacies/dashboard/analytics', { signal }),
    ])
      .then(([statsRes, analyticsRes]) => {
        setStats(statsRes.data?.data ?? statsRes.data);
        setAnalytics(analyticsRes.data?.data ?? analyticsRes.data);
      })
      .catch(err => {
        if (err?.code === 'ERR_CANCELED') return;
        setError(true);
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, []);

  // ── Loading state ───────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="space-y-6">
        <SkeletonBanner />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      </div>
    );
  }

  // ── Error state ─────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="space-y-6">
        <div className="rounded-2xl p-8 text-white" style={{ backgroundColor: NAVY }}>
          <h1 className="text-3xl font-bold">{t('pharmacyOwner.ownerOverview')}</h1>
          <p className="mt-1 text-white/70">{t('pharmacyOwner.ownerOverviewSubtitle')}</p>
        </div>
        <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
          Could not load dashboard data. Check your connection and refresh.
        </div>
      </div>
    );
  }

  // ── Quick-stat cards ────────────────────────────────────────────────────────
  const quickStats = [
    {
      icon: ShoppingCart,
      label: "Today's Orders",
      value: stats?.todayOrders ?? 0,
      dark: false,
    },
    {
      icon: Clock,
      label: 'Pending Orders',
      value: stats?.pendingOrders ?? 0,
      dark: false,
    },
    {
      icon: DollarSign,
      label: "Today's Revenue",
      value: `RWF ${fmt(stats?.todayRevenue ?? 0)}`,
      dark: false,
    },
    {
      icon: AlertTriangle,
      label: 'Low Stock Items',
      value: stats?.lowStockItems ?? 0,
      dark: true,
    },
  ];

  // ── Analytics cards ─────────────────────────────────────────────────────────
  const analyticsCards = [
    {
      icon: TrendingUp,
      label: 'Monthly Revenue',
      value: `RWF ${fmt(analytics?.totalRevenue ?? 0)}`,
      change: analytics?.revenueChange,
    },
    {
      icon: BarChart2,
      label: 'Monthly Orders',
      value: analytics?.totalOrders ?? 0,
      change: analytics?.ordersChange,
    },
    {
      icon: DollarSign,
      label: 'Avg Order Value',
      value: `RWF ${fmt(analytics?.avgOrderValue ?? 0)}`,
      change: analytics?.avgValueChange,
    },
    {
      icon: Package,
      label: 'Items Sold',
      value: analytics?.itemsSold ?? 0,
      change: analytics?.itemsChange,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Hero banner */}
      <div className="rounded-2xl p-8 text-white" style={{ backgroundColor: NAVY }}>
        <h1 className="text-3xl font-bold">{t('pharmacyOwner.ownerOverview')}</h1>
        <p className="mt-1 text-white/70">{t('pharmacyOwner.ownerOverviewSubtitle')}</p>
      </div>

      {/* Low-stock alert */}
      {(stats?.lowStockItems ?? 0) > 0 && (
        <div
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium"
          style={{ backgroundColor: '#FEF3C7', color: '#92400E' }}
        >
          <AlertTriangle size={16} />
          {stats.lowStockItems} medication{stats.lowStockItems !== 1 ? 's' : ''} are running low on stock.
        </div>
      )}

      {/* Today's snapshot */}
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Today's Snapshot</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickStats.map((s, i) => {
            const Icon = s.icon;
            return (
              <div
                key={i}
                className="rounded-2xl p-5 flex items-center justify-between"
                style={{ backgroundColor: s.dark ? NAVY : TEAL }}
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
      </div>

      {/* Monthly performance */}
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Monthly Performance</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {analyticsCards.map((s, i) => {
            const Icon = s.icon;
            return (
              <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                  style={{ backgroundColor: '#F0F7F6' }}
                >
                  <Icon size={18} style={{ color: TEAL }} />
                </div>
                <p className="text-xs text-gray-500 mb-1">{s.label}</p>
                <div className="flex items-end justify-between gap-2">
                  <p className="text-lg font-bold text-gray-900">{s.value}</p>
                  {s.change !== undefined && <ChangeBadge value={s.change} />}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Charts placeholder — requires branch-level time-series data from backend */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {[t('pharmacyOwner.monthlyBranchRevenue'), t('pharmacyOwner.revenueByBranch')].map(title => (
          <div key={title} className="bg-white rounded-2xl p-5 border border-gray-100">
            <h3 className="font-semibold text-gray-800 mb-4">{title}</h3>
            <div className="flex items-center justify-center h-48 text-gray-300 text-sm">
              <div className="text-center space-y-1">
                <Activity size={28} className="mx-auto text-gray-200" />
                <p>Branch-level data not yet available</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
