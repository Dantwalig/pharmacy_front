'use client';

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useHospitalId } from '@/lib/hospital';
import {
  Stethoscope,
  Microscope,
  HeartHandshake,
  Briefcase,
  Building2,
  Users,
  Activity,
  FlaskConical,
  Clock,
  HeartPulse,
  Truck,
  DollarSign,
  GitFork,
  Search,
  type LucideIcon,
} from 'lucide-react';
import api from '@/lib/api';

const NAVY = '#1E3A5F';
const DEPT_COLORS = ['#16A34A', '#7C3AED', '#2563EB', '#EA580C', '#0891B2', '#D97706', '#9333EA', '#0F766E'];
const DEPT_ICONS: LucideIcon[] = [Stethoscope, Microscope, HeartHandshake, Briefcase, Building2, FlaskConical, HeartPulse, Truck];

interface ServiceRow { icon: LucideIcon; label: string; value: string; }
interface ServiceGroup { title: string; color: string; icon: LucideIcon; rows: ServiceRow[]; }
interface Employee { name: string; department: string; phone: string; available: boolean; }

export default function HospitalAdminDepartmentsPage() {
  const { t } = useTranslation();
  const hospitalId = useHospitalId();

  const SERVICE_GROUPS: ServiceGroup[] = [
  {
    title: t('hospital.clinicalServices'), color: '#16A34A', icon: Stethoscope,
    rows: [
      { icon: Building2, label: t('hospital.departments'), value: '16' },
      { icon: Users,     label: t('hospital.staff'),       value: '250 Doctors' },
      { icon: Activity,  label: t('hospital.status'),      value: 'High Activity' },
    ],
  },
  {
    title: t('hospital.diagnosticServices'), color: '#7C3AED', icon: Microscope,
    rows: [
      { icon: Building2,    label: t('hospital.departments'),    value: '8' },
      { icon: FlaskConical, label: t('hospital.testsToday'),    value: '130' },
      { icon: Clock,        label: t('hospital.avgTurnaround'), value: '1.4 Hrs' },
    ],
  },
  {
    title: t('hospital.patientSupportServices'), color: '#2563EB', icon: HeartHandshake,
    rows: [
      { icon: Building2, label: t('hospital.departments'),          value: '10' },
      { icon: HeartPulse, label: t('hospital.activeCases'),        value: '67' },
      { icon: Truck,     label: t('hospital.ambulanceTripsToday'), value: '12' },
    ],
  },
  {
    title: t('hospital.administrativeOperations'), color: '#EA580C', icon: Briefcase,
    rows: [
      { icon: Building2,  label: t('hospital.departments'),      value: '12' },
      { icon: Users,      label: t('hospital.staff'),            value: '35 Employees' },
      { icon: DollarSign, label: t('hospital.todaysBilling'),  value: 'Rwf 1,250,000' },
    ],
  },
  ];

  const [search, setSearch] = useState('');
  const [dept, setDept] = useState('All');
  const [availability, setAvailability] = useState('All');
  const [serviceGroups, setServiceGroups] = useState<ServiceGroup[]>([]);
  const [employees, setEmployees]       = useState<Employee[]>([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(false);

  useEffect(() => {
    if (!hospitalId) { setLoading(false); return; }
    api.get(`/hospitals/${hospitalId}/doctors`)
      .then(res => {
        const doctors: any[] = Array.isArray(res.data) ? res.data : [];

        const mapped: Employee[] = doctors.map(doc => ({
          name: doc.user?.hospitalStaff
            ? `${doc.user.hospitalStaff.firstName} ${doc.user.hospitalStaff.lastName}`.trim()
            : (doc.user?.email ?? 'Unknown'),
          department: doc.specialization ?? 'General',
          phone: doc.user?.hospitalStaff?.phone ?? '—',
          available: !!doc.isAvailable,
        }));
        if (mapped.length) setEmployees(mapped);

        const bySpec = doctors.reduce((acc: Record<string, any[]>, doc) => {
          const key = doc.specialization ?? 'General';
          if (!acc[key]) acc[key] = [];
          acc[key].push(doc);
          return acc;
        }, {});

        const derived: ServiceGroup[] = Object.entries(bySpec).map(([spec, docs], i) => ({
          title: spec,
          color: DEPT_COLORS[i % DEPT_COLORS.length],
          icon: DEPT_ICONS[i % DEPT_ICONS.length],
          rows: [
            { icon: Users,     label: 'Doctors',   value: docs.length.toString() },
            { icon: Activity,  label: 'Available', value: docs.filter((d: any) => d.isAvailable).length.toString() },
            { icon: Building2, label: 'Status',    value: docs.some((d: any) => d.isAvailable) ? 'Active' : 'Inactive' },
          ],
        }));
        if (derived.length) setServiceGroups(derived);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [hospitalId]);

  const departments = ['All', ...serviceGroups.map(g => g.title)];

  const filtered = employees.filter(e => {
    if (search.trim() && !e.name.toLowerCase().includes(search.trim().toLowerCase())) return false;
    if (dept !== 'All' && e.department !== dept) return false;
    if (availability === 'Available' && !e.available) return false;
    if (availability === 'Unavailable' && e.available) return false;
    return true;
  });

  return (
    <div className="space-y-6 w-full max-w-full overflow-x-hidden">
      {/* Header */}
      <div className="rounded-2xl px-6 py-7 flex items-start justify-between" style={{ background: '#EBF5FF' }}>
        <div className="space-y-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: NAVY }}>{t('hospital.departments')}</h1>
            <p className="mt-1 text-sm font-medium" style={{ color: '#0284C7' }}>
              {t('hospital.departmentsSubtitle')}
            </p>
          </div>
          <button
            disabled
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white opacity-50 cursor-not-allowed"
            style={{ background: 'linear-gradient(to right, #0284C7, #38BDF8)' }}
          >
            <Stethoscope size={15} />
            {t('hospital.selectDepartment')}
          </button>
        </div>
        <div className="opacity-10 shrink-0 ml-4 hidden sm:block" style={{ color: NAVY }}>
          <GitFork size={72} className="rotate-180" />
        </div>
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 px-5 py-3 text-sm text-red-700">
          Could not load department data — check your connection and refresh.
        </div>
      )}

      {/* Service group cards */}
      {loading ? (
        <div className="flex items-center justify-center py-12 text-sm text-gray-400">Loading departments…</div>
      ) : serviceGroups.length === 0 ? (
        <div className="flex items-center justify-center py-12 text-sm text-gray-400">No departments found.</div>
      ) : (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {serviceGroups.map(group => {
          const Icon = group.icon;
          return (
            <div key={group.title} className="bg-white rounded-2xl border shadow-sm p-6" style={{ borderColor: `${group.color}25` }}>
              <div className="flex flex-col items-center gap-2 mb-5">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: `${group.color}15` }}>
                  <Icon size={22} style={{ color: group.color }} />
                </div>
                <h3 className="text-base font-bold" style={{ color: group.color }}>{group.title}</h3>
              </div>
              <div className="space-y-3 max-w-xs mx-auto">
                {group.rows.map(row => {
                  const RowIcon = row.icon;
                  return (
                    <div key={row.label} className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${group.color}12` }}>
                        <RowIcon size={14} style={{ color: group.color }} />
                      </div>
                      <p className="text-sm text-gray-600">
                        <span className="font-semibold text-gray-700">{row.label}:</span> {row.value}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
      )}

      {/* Employee Directory */}
      <div>
        <h2 className="text-lg font-bold mb-4" style={{ color: NAVY }}>{t('hospital.employeeDirectory')}</h2>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">{t('hospital.employeeDetails')}</label>
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder={t('hospital.searchPlaceholder')}
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">{t('hospital.selectDepartment')}</label>
            <select value={dept} onChange={e => setDept(e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500">
              {departments.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">{t('hospital.availability')}</label>
            <select value={availability} onChange={e => setAvailability(e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="All">{t('hospital.all')}</option>
              <option value="Available">{t('hospital.available')}</option>
              <option value="Unavailable">{t('hospital.unavailable')}</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[560px]">
              <thead>
                <tr className="border-b border-gray-100 text-xs font-semibold text-gray-500">
                  <th className="px-6 py-3">{t('hospital.hospital')}</th>
                  <th className="px-6 py-3">{t('hospital.department')}</th>
                  <th className="px-6 py-3">{t('hospital.phoneNumber')}</th>
                  <th className="px-6 py-3">{t('hospital.availability')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-sm">
                {filtered.length === 0 ? (
                  <tr><td colSpan={4} className="px-6 py-10 text-center text-gray-400 font-medium">No employees found.</td></tr>
                ) : filtered.map((emp, idx) => (
                  <tr key={`${emp.name}-${idx}`} className="hover:bg-gray-50/70 transition-colors">
                    <td className="px-6 py-4 font-bold text-gray-900">{emp.name}</td>
                    <td className="px-6 py-4 text-gray-600">{emp.department}</td>
                    <td className="px-6 py-4 text-gray-600">{emp.phone}</td>
                    <td className="px-6 py-4">
                      <span
                        className="inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider"
                        style={emp.available ? { background: '#ECFDF5', color: '#15803D' } : { background: '#FEF2F2', color: '#DC2626' }}
                      >
                        {emp.available ? (t('hospital.available')) : t('hospital.unavailable')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
