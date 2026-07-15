'use client';

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell,
  PieChart, Pie,
  RadarChart, PolarGrid, PolarAngleAxis, Radar,
} from 'recharts';
import { ClipboardDocumentListIcon } from '@heroicons/react/24/outline';
import { useHospitalId } from '@/lib/hospital';
import api from '@/lib/api';
import type {
  DepartmentWaitTime,
  SatisfactionSlice,
  DepartmentStaffCount,
  AdmissionsTrendPoint,
} from '@/types/hospital';

const NAVY = '#1E4D8C';

// ── TODO: no backend endpoint yet — see gap doc ─────────────────────────────
// src/docs/HOSPITAL_ADMIN_REPORTS_SETTINGS_INTEGRATION.md (Gap R-3)
// GET /inpatient/admissions returns a raw, unpaginated, undated list and its
// resolveAdmitter() falls back to a HospitalStaff lookup for any non-DOCTOR
// role — HOSPITAL_ADMIN has no HospitalStaff row, so this 403s for admins
// today. No monthly-aggregated "admissions over time" endpoint exists. Kept
// on demo data until both issues are fixed.
const MOCK_ADMITTED_OVER_TIME: AdmissionsTrendPoint[] = [
  { month: 'Jan', admitted: 4000, out: 2200 },
  { month: 'Feb', admitted: 1600, out: 900 },
  { month: 'Mar', admitted: 2400, out: 1600 },
  { month: 'Apr', admitted: 3000, out: 1200 },
  { month: 'May', admitted: 3400, out: 1800 },
  { month: 'Jun', admitted: 1500, out: 900 },
  { month: 'Jul', admitted: 1700, out: 1300 },
  { month: 'Aug', admitted: 1400, out: 800 },
  { month: 'Sep', admitted: 3700, out: 1500 },
  { month: 'Oct', admitted: 3900, out: 2000 },
];

function ChartCard({
  title, loading, error, empty, children,
}: {
  title: string;
  loading: boolean;
  error?: boolean;
  empty?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <h3 className="text-sm font-bold text-center mb-4" style={{ color: NAVY }}>{title}</h3>
      <div className="h-64">
        {loading ? (
          <div className="h-full rounded-xl bg-gray-100 animate-pulse" />
        ) : error ? (
          <div className="flex items-center justify-center h-full text-sm text-red-500 text-center px-4">
            Could not load this chart — try refreshing.
          </div>
        ) : empty ? (
          <div className="flex items-center justify-center h-full text-sm text-gray-400">
            No data available yet
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
}

export default function HospitalAdminReportsPage() {
  const { t } = useTranslation();
  const hospitalId = useHospitalId();

  const [waitTimes, setWaitTimes]   = useState<DepartmentWaitTime[]>([]);
  const [waitLoading, setWaitLoading] = useState(true);
  const [waitError, setWaitError]     = useState(false);

  const [staffPerDept, setStaffPerDept]     = useState<DepartmentStaffCount[]>([]);
  const [staffLoading, setStaffLoading]     = useState(true);
  const [staffError, setStaffError]         = useState(false);

  // ── TODO: no backend endpoint yet — see gap doc (Gap R-2) ───────────────────
  // There is no patient-satisfaction/feedback model anywhere in schema.prisma.
  // Defined inside component so t() is available for translated slice names.
  const satisfaction: SatisfactionSlice[] = [
    { name: t('hospital.excellent'), value: 50, color: '#1E4D8C' },
    { name: t('hospital.good'),      value: 35, color: '#3B82F6' },
    { name: t('hospital.poor'),      value: 15, color: '#93C5FD' },
  ];

  const [admitted] = useState<AdmissionsTrendPoint[]>(MOCK_ADMITTED_OVER_TIME);
  const [admittedLoading] = useState(false);

  useEffect(() => {
    if (!hospitalId) { setWaitLoading(false); setStaffLoading(false); return; }

    // Average wait times by department — GET /reports/department/metrics
    api.get('/reports/department/metrics')
      .then(res => {
        const rows: any[] = Array.isArray(res.data) ? res.data : [];
        const seen = new Set<string>();
        const latest: DepartmentWaitTime[] = [];
        for (const r of rows) {
          if (seen.has(r.department)) continue;
          seen.add(r.department);
          latest.push({ dept: r.department, value: Math.round(r.avgWaitMinutesApprox ?? 0) });
        }
        setWaitTimes(latest);
      })
      .catch(() => setWaitError(true))
      .finally(() => setWaitLoading(false));

    // Staff per department — derived from GET /hospitals/:id/doctors grouped by specialization
    api.get(`/hospitals/${hospitalId}/doctors`)
      .then(res => {
        const doctors: any[] = Array.isArray(res.data) ? res.data : [];
        const bySpec = doctors.reduce((acc: Record<string, number>, doc) => {
          const key = doc.specialization ?? 'General';
          acc[key] = (acc[key] ?? 0) + 1;
          return acc;
        }, {});
        setStaffPerDept(Object.entries(bySpec).map(([dept, value]) => ({ dept, value })));
      })
      .catch(() => setStaffError(true))
      .finally(() => setStaffLoading(false));
  }, [hospitalId]);

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="rounded-2xl p-8 relative overflow-hidden" style={{ background: '#EBF5FF' }}>
        <div className="relative z-10">
          <h1 className="text-3xl font-bold" style={{ color: '#1E3A5F' }}>{t('hospital.reportsTitle')}</h1>
          <p className="mt-1 text-sm font-semibold" style={{ color: '#0284C7' }}>{t('hospital.reportsSubtitle')}</p>
          <button className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-white px-4 py-2 rounded-lg" style={{ background: 'linear-gradient(to right, #0284C7, #38BDF8)' }}>
            <ClipboardDocumentListIcon className="w-4 h-4" />
            {t('hospital.thisMonth')}
          </button>
        </div>
        <svg className="absolute right-8 top-1/2 -translate-y-1/2 opacity-20 hidden sm:block" width="140" height="90" viewBox="0 0 140 90" fill="none">
          <rect x="0"  y="60" width="20" height="30" rx="3" fill={NAVY} />
          <rect x="30" y="45" width="20" height="45" rx="3" fill={NAVY} />
          <rect x="60" y="55" width="20" height="35" rx="3" fill={NAVY} />
          <rect x="90" y="30" width="20" height="60" rx="3" fill={NAVY} />
          <polyline points="10,50 40,32 70,40 100,16 130,8" stroke={NAVY} strokeWidth="3" fill="none" strokeLinecap="round" />
          <path d="M122,8 L130,8 L130,16" stroke={NAVY} strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      {/* Charts grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title={t('hospital.averageWaitTimes')} loading={waitLoading} error={waitError} empty={!waitError && waitTimes.length === 0}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={waitTimes} layout="vertical" margin={{ left: 20, right: 20 }}>
              <CartesianGrid horizontal={false} stroke="#F1F5F9" />
              <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94A3B8' }} />
              <YAxis type="category" dataKey="dept" axisLine={false} tickLine={false} width={80} tick={{ fontSize: 10, fill: '#64748B' }} />
              <Tooltip cursor={{ fill: '#F8FAFC' }} />
              <Bar dataKey="value" fill="#93C5FD" radius={[0, 6, 6, 0]} barSize={14} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title={t('hospital.patientSatisfaction')} loading={false}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={satisfaction} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={2}>
                {satisfaction.map((s) => <Cell key={s.name} fill={s.color} />)}
              </Pie>
              <Legend verticalAlign="bottom" height={24} iconType="square" formatter={(value) => {
                const item = satisfaction.find(s => s.name === value);
                return <span className="text-xs text-gray-500">{value} {item?.value}%</span>;
              }} />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title={t('hospital.staffPerDepartment')} loading={staffLoading} error={staffError} empty={!staffError && staffPerDept.length === 0}>
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={staffPerDept} outerRadius="70%">
              <PolarGrid stroke="#E2E8F0" />
              <PolarAngleAxis dataKey="dept" tick={{ fontSize: 10, fill: '#64748B' }} />
              <Radar dataKey="value" stroke="#2563EB" fill="#3B82F6" fillOpacity={0.3} />
            </RadarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title={t('hospital.admittedPatientsOverTime')} loading={admittedLoading}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={admitted} margin={{ top: 8 }}>
              <CartesianGrid vertical={false} stroke="#F1F5F9" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94A3B8' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94A3B8' }} />
              <Tooltip cursor={{ fill: '#F8FAFC' }} />
              <Legend verticalAlign="bottom" height={24} iconType="square" formatter={(v) => <span className="text-xs text-gray-500">{v}</span>} />
              <Bar dataKey="admitted" name={t('hospital.admittedPatients')} fill="#1E4D8C" radius={[3, 3, 0, 0]} barSize={10} />
              <Bar dataKey="out" name={t('hospital.outPatients')} fill="#7DD3FC" radius={[3, 3, 0, 0]} barSize={10} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}
