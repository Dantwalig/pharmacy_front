'use client';

import { useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';

export type RevenueChartPeriod = 'Daily' | 'Weekly' | 'Monthly';

export interface RevenueDataPoint {
  label: string;
  revenue: number;
  expenses?: number;
}

interface RevenueChartProps {
  data: RevenueDataPoint[];
  title?: string;
  showExpenses?: boolean;
  defaultPeriod?: RevenueChartPeriod;
  onPeriodChange?: (p: RevenueChartPeriod) => void;
  variant?: 'bar' | 'line';
}

const PERIODS: RevenueChartPeriod[] = ['Daily', 'Weekly', 'Monthly'];

function fmtRWF(v: number) {
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000)     return `${(v / 1_000).toFixed(0)}K`;
  return String(v);
}

export default function RevenueChart({
  data,
  title = 'Revenue Overview',
  showExpenses = false,
  defaultPeriod = 'Weekly',
  onPeriodChange,
  variant = 'bar',
}: RevenueChartProps) {
  const [period, setPeriod] = useState<RevenueChartPeriod>(defaultPeriod);

  const handlePeriod = (p: RevenueChartPeriod) => {
    setPeriod(p);
    onPeriodChange?.(p);
  };

  const ChartComponent = variant === 'bar' ? BarChart : LineChart;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col gap-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h2 className="text-base font-semibold text-slate-900">{title}</h2>
        <div className="flex items-center bg-slate-100 rounded-full p-0.5 gap-0.5">
          {PERIODS.map((p) => (
            <button
              key={p}
              onClick={() => handlePeriod(p)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                period === p
                  ? 'bg-brand-navy text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          {variant === 'bar' ? (
            <BarChart data={data} barCategoryGap="35%">
              <CartesianGrid vertical={false} stroke="#f1f5f9" />
              <XAxis
                dataKey="label"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: '#94a3b8' }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: '#94a3b8' }}
                tickFormatter={fmtRWF}
                width={45}
              />
              <Tooltip
                formatter={(v: number) => [`RWF ${v.toLocaleString()}`, '']}
                contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
              />
              {showExpenses && <Legend />}
              <Bar dataKey="revenue" fill="#1E4D8C" radius={[4, 4, 0, 0]} name="Revenue" />
              {showExpenses && (
                <Bar dataKey="expenses" fill="#93c5fd" radius={[4, 4, 0, 0]} name="Expenses" />
              )}
            </BarChart>
          ) : (
            <LineChart data={data}>
              <CartesianGrid vertical={false} stroke="#f1f5f9" />
              <XAxis
                dataKey="label"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: '#94a3b8' }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: '#94a3b8' }}
                tickFormatter={fmtRWF}
                width={45}
              />
              <Tooltip
                formatter={(v: number) => [`RWF ${v.toLocaleString()}`, '']}
                contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
              />
              {showExpenses && <Legend />}
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#1E4D8C"
                strokeWidth={2.5}
                dot={{ r: 3, fill: '#1E4D8C' }}
                name="Revenue"
              />
              {showExpenses && (
                <Line
                  type="monotone"
                  dataKey="expenses"
                  stroke="#93c5fd"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: '#93c5fd' }}
                  name="Expenses"
                />
              )}
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}
