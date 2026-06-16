'use client';

import { ArrowTrendingUpIcon, ArrowTrendingDownIcon } from '@heroicons/react/24/solid';

export interface KpiCardProps {
  label: string;
  value: number;
  trend: number;
  trendUp: boolean;
  /** Formats value as RWF currency. Defaults to true. */
  currency?: boolean;
  icon: React.ReactNode;
  accentColor: string; // Tailwind bg class for icon tile e.g. 'bg-blue-100'
  iconColor: string;   // Tailwind text class e.g. 'text-blue-600'
}

function formatRWF(n: number): string {
  if (n >= 1_000_000) return `RWF ${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `RWF ${(n / 1_000).toFixed(0)}K`;
  return `RWF ${n.toLocaleString()}`;
}

export default function KpiCard({
  label,
  value,
  trend,
  trendUp,
  currency = true,
  icon,
  accentColor,
  iconColor,
}: KpiCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col gap-3 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${accentColor}`}>
          <span className={iconColor}>{icon}</span>
        </div>
        <span
          className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${
            trendUp
              ? 'bg-emerald-50 text-emerald-700'
              : 'bg-red-50 text-red-600'
          }`}
        >
          {trendUp
            ? <ArrowTrendingUpIcon className="w-3 h-3" />
            : <ArrowTrendingDownIcon className="w-3 h-3" />}
          {trend}%
        </span>
      </div>
      <div>
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{label}</p>
        <p className="mt-1 text-2xl font-bold text-slate-900">
          {currency ? formatRWF(value) : value.toLocaleString()}
        </p>
      </div>
      <p className="text-xs text-slate-400">vs last month</p>
    </div>
  );
}
