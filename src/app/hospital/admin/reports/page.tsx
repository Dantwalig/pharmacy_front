'use client';

import { useState } from 'react';
import { ClipboardDocumentListIcon } from '@heroicons/react/24/outline';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, Legend,
  PieChart, Pie,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from 'recharts';
import {
  MOCK_WAIT_TIMES,
  MOCK_PATIENT_SATISFACTION,
  MOCK_STAFF_PER_DEPARTMENT,
  MOCK_ADMITTED_OVER_TIME,
} from '@/mock/hospital/reports';

// Bar colors are presentation-only; data comes from the mock layer.
const WAIT_TIME_COLORS = ['#60A5FA', '#3B82F6', '#60A5FA', '#2563EB', '#93C5FD', '#6B84A8', '#BFDBFE'];
const SATISFACTION_COLORS: Record<string, string> = {
  Excellent: '#1E4D8C',
  Good:      '#3B82F6',
  Poor:      '#7DD3FC',
};

// Radar background bands — concentric hexagon rings alternating light-blue / white.
const RADAR_MAX = 100;
const RADAR_BANDS = [
  { key: 'ring4', level: 100, fill: '#EDF2FB' },
  { key: 'ring3', level: 75,  fill: '#FFFFFF' },
  { key: 'ring2', level: 50,  fill: '#EDF2FB' },
  { key: 'ring1', level: 25,  fill: '#FFFFFF' },
];
const STAFF_RADAR_DATA = MOCK_STAFF_PER_DEPARTMENT.map((d) => ({
  ...d,
  ring4: 100, ring3: 75, ring2: 50, ring1: 25,
}));

const tooltipStyle = {
  borderRadius: 8,
  border: 'none',
  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
  fontSize: 12,
};

// ── Chart card wrapper ─────────────────────────────────────────────────────────
function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
      <h2 className="text-sm font-bold text-center mb-4" style={{ color: '#1E3A5F' }}>{title}</h2>
      {children}
    </div>
  );
}

// ── Donut legend ───────────────────────────────────────────────────────────────
function SatisfactionLegend() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 mt-2">
      {MOCK_PATIENT_SATISFACTION.map((s) => (
        <div key={s.name} className="flex items-center gap-2 text-xs text-gray-500">
          <span className="w-3 h-3 rounded-sm shrink-0" style={{ backgroundColor: SATISFACTION_COLORS[s.name] }} />
          {s.name} {s.value}%
        </div>
      ))}
    </div>
  );
}

export default function HospitalAdminReportsPage() {
  const [period] = useState('This Month');

  return (
    <div className="space-y-6 pb-8">

      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl px-6 py-7 sm:px-8" style={{ background: '#EBF5FF' }}>
        {/* Decorative trend illustration */}
        <svg
          className="hidden sm:block absolute right-6 top-1/2 -translate-y-1/2 opacity-50"
          width="170" height="90" viewBox="0 0 170 90" fill="none" aria-hidden="true"
        >
          <path d="M5 78 L45 55 L80 60 L120 28 L160 10" stroke="#BFDBFE" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M150 10 L162 8 L160 22" stroke="#BFDBFE" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <rect x="120" y="50" width="10" height="32" rx="2" fill="#DBEAFE" />
          <rect x="136" y="38" width="10" height="44" rx="2" fill="#DBEAFE" />
          <rect x="152" y="26" width="10" height="56" rx="2" fill="#DBEAFE" />
        </svg>

        <h1 className="text-3xl font-bold" style={{ color: '#1E3A5F' }}>Reports &amp; Analysis</h1>
        <p className="mt-1 text-sm font-medium" style={{ color: '#38BDF8' }}>
          Track the hospital reports and performance
        </p>
        <button
          className="mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-[#1E4D8C] to-[#38BDF8] hover:opacity-90 transition shadow-sm"
        >
          <ClipboardDocumentListIcon className="w-4 h-4" />
          {period}
        </button>
      </div>

      {/* Charts grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Average wait times by Department */}
        <ChartCard title="Average wait times by Department">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={MOCK_WAIT_TIMES} layout="vertical" margin={{ top: 0, right: 16, left: 8, bottom: 0 }} barCategoryGap={8}>
              <XAxis type="number" domain={[0, 80]} ticks={[0, 20, 40, 60, 80]} tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="department" width={72} tick={{ fontSize: 9, fill: '#6B7280' }} axisLine={false} tickLine={false} />
              <Tooltip formatter={(v: any) => [`${v} min`, 'Avg wait']} contentStyle={tooltipStyle} cursor={{ fill: 'rgba(219,234,254,0.4)' }} />
              <Bar dataKey="minutes" radius={[0, 6, 6, 0]} barSize={14}>
                {MOCK_WAIT_TIMES.map((d, i) => <Cell key={d.department} fill={WAIT_TIME_COLORS[i % WAIT_TIME_COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Patient Satisfaction */}
        <ChartCard title="Patient Satisfaction">
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={MOCK_PATIENT_SATISFACTION} cx="50%" cy="50%" innerRadius={58} outerRadius={92} dataKey="value" paddingAngle={2} startAngle={90} endAngle={-270}>
                {MOCK_PATIENT_SATISFACTION.map((s) => <Cell key={s.name} fill={SATISFACTION_COLORS[s.name]} />)}
              </Pie>
              <Tooltip formatter={(v: any, n: any) => [`${v}%`, n]} contentStyle={tooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
          <SatisfactionLegend />
        </ChartCard>

        {/* Staff Per Department*/}
        <ChartCard title="Staff Per Department">
          <ResponsiveContainer width="100%" height={260}>
            <RadarChart data={STAFF_RADAR_DATA} outerRadius="72%">
              <PolarRadiusAxis domain={[0, RADAR_MAX]} tickCount={5} tick={false} axisLine={false} />
              {RADAR_BANDS.map((b) => (
                <Radar
                  key={b.key}
                  dataKey={b.key}
                  stroke="none"
                  fill={b.fill}
                  fillOpacity={1}
                  isAnimationActive={false}
                  legendType="none"
                  tooltipType="none"
                />
              ))}
              <PolarGrid stroke="#E5E7EB" />
              <PolarAngleAxis dataKey="department" tick={{ fontSize: 10, fill: '#6B7280' }} />
              <Radar dataKey="staff" stroke="#2563EB" strokeWidth={2} fill="#3B82F6" fillOpacity={0.25} />
              <Tooltip formatter={(v: any) => [`${v} staff`, '']} contentStyle={tooltipStyle} />
            </RadarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/*Admitted Patients over time*/}
        <ChartCard title="Admitted Patients over time">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={MOCK_ADMITTED_OVER_TIME} margin={{ top: 10, right: 8, left: -12, bottom: 0 }} barGap={4}>
              <XAxis dataKey="period" tick={{ fontSize: 9, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 4000]} ticks={[0, 1000, 2000, 3000, 4000]} tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'rgba(219,234,254,0.4)' }} />
              <Legend iconType="rect" iconSize={10} wrapperStyle={{ fontSize: 11, color: '#6B7280' }} />
              <Bar name="Admitted Patients" dataKey="admitted" fill="#1E4D8C" radius={[4, 4, 0, 0]} barSize={14} />
              <Bar name="Outpatients" dataKey="outpatients" fill="#38BDF8" radius={[4, 4, 0, 0]} barSize={14} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}
