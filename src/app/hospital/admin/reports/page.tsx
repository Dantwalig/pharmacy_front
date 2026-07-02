'use client';

import {
  ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell,
  PieChart, Pie,
  RadarChart, PolarGrid, PolarAngleAxis, Radar,
} from 'recharts';
import { ClipboardDocumentListIcon } from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';

const NAVY = '#1E4D8C';

const WAIT_TIMES = [
  { dept: 'Cardiology',   value: 42 },
  { dept: 'Dermatology',  value: 30 },
  { dept: 'Neurology',    value: 38 },
  { dept: 'Orthopedics',  value: 55 },
  { dept: 'Surgery',      value: 48 },
  { dept: 'Gynecology',   value: 78 },
];

const STAFF_PER_DEPT = [
  { dept: 'Cardiology',  value: 80 },
  { dept: 'Surgery',     value: 65 },
  { dept: 'Dermatology', value: 40 },
  { dept: 'Gynecology',  value: 55 },
  { dept: 'Orthopedics', value: 45 },
  { dept: 'Neurology',   value: 60 },
];

const ADMITTED = [
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

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <h3 className="text-sm font-bold text-center mb-4" style={{ color: NAVY }}>{title}</h3>
      <div className="h-64">{children}</div>
    </div>
  );
}

export default function HospitalAdminReportsPage() {
  const { t } = useTranslation();

  const SATISFACTION = [
  { name: (t('hospital.excellent')), value: 50, color: '#1E4D8C' },
  { name: t('hospital.good'),      value: 35, color: '#3B82F6' },
  { name: t('hospital.poor'),      value: 15, color: '#93C5FD' },
  ];
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
        <ChartCard title={t('hospital.averageWaitTimes')}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={WAIT_TIMES} layout="vertical" margin={{ left: 20, right: 20 }}>
              <CartesianGrid horizontal={false} stroke="#F1F5F9" />
              <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94A3B8' }} />
              <YAxis type="category" dataKey="dept" axisLine={false} tickLine={false} width={80} tick={{ fontSize: 10, fill: '#64748B' }} />
              <Tooltip cursor={{ fill: '#F8FAFC' }} />
              <Bar dataKey="value" fill="#93C5FD" radius={[0, 6, 6, 0]} barSize={14} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title={t('hospital.patientSatisfaction')}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={SATISFACTION} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={2}>
                {SATISFACTION.map((s) => <Cell key={s.name} fill={s.color} />)}
              </Pie>
              <Legend verticalAlign="bottom" height={24} iconType="square" formatter={(value) => {
                const item = SATISFACTION.find(s => s.name === value);
                return <span className="text-xs text-gray-500">{value} {item?.value}%</span>;
              }} />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title={t('hospital.staffPerDepartment')}>
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={STAFF_PER_DEPT} outerRadius="70%">
              <PolarGrid stroke="#E2E8F0" />
              <PolarAngleAxis dataKey="dept" tick={{ fontSize: 10, fill: '#64748B' }} />
              <Radar dataKey="value" stroke="#2563EB" fill="#3B82F6" fillOpacity={0.3} />
            </RadarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title={t('hospital.admittedPatientsOverTime')}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={ADMITTED} margin={{ top: 8 }}>
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
