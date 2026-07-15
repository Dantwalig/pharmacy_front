'use client';

import { useState, useMemo } from 'react';
import {
  Users,
  UserCheck,
  UserX,
  Building2,
  Search,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
} from 'lucide-react';
import { MOCK_HOSPITAL_STAFF } from '@/mock/hospital/staff';
import type { HospitalStaffMember } from '@/types/hospital';
import {useTranslation} from 'react-i18next';

const NAVY = '#1E3A5F';
const TEAL = '#2D9B8A';
const PAGE_SIZE = 8;

// ── Department badge colours (matching design) ────────────────────────────────
const DEPT_BADGE: Record<string, { bg: string; color: string }> = {
  'Paediatrics':     { bg: '#FDF2F8', color: '#BE185D' },
  'Front Office':    { bg: '#FFF7ED', color: '#C2410C' },
  'Emergency':       { bg: '#F0FDF4', color: '#15803D' },
  'Cardiology':      { bg: '#EFF6FF', color: '#1D4ED8' },
  'General Medicine':{ bg: '#F0FDFA', color: '#0F766E' },
  'Surgery':         { bg: '#FFF1F2', color: '#BE123C' },
  'Neurology':       { bg: '#F5F3FF', color: '#6D28D9' },
  'Orthopaedics':    { bg: '#EEF2FF', color: '#4338CA' },
  'Dermatology':     { bg: '#FFFBEB', color: '#B45309' },
  'Maternity':       { bg: '#FFF0F6', color: '#C026D3' },
  'ICU':             { bg: '#F8FAFC', color: '#475569' },
};

function deptBadge(dept?: string) {
  const style = dept ? (DEPT_BADGE[dept] ?? { bg: '#F3F4F6', color: '#374151' }) : { bg: '#F3F4F6', color: '#374151' };
  return style;
}

function displayName(s: HospitalStaffMember) {
  const prefix = s.role === 'DOCTOR' ? 'Dr. ' : '';
  return `${prefix}${s.firstName} ${s.lastName}`;
}

// ── Stat card ─────────────────────────────────────────────────────────────────
function StatCard({
  icon: Icon, label, value, sub, iconBg, iconColor,
}: {
  icon: React.ElementType;
  label: string;
  value: number | string;
  sub: string;
  iconBg: string;
  iconColor: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-start gap-4">
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
        style={{ background: iconBg }}
      >
        <Icon size={20} style={{ color: iconColor }} />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-gray-400 font-medium">{label}</p>
        <p className="text-2xl font-bold mt-0.5" style={{ color: NAVY }}>{value}</p>
        <p className="text-xs font-medium mt-0.5" style={{ color: iconColor }}>{sub}</p>
      </div>
    </div>
  );
}

// ── Filter select ─────────────────────────────────────────────────────────────
function FilterSelect({
  value, onChange, options, placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
  placeholder: string;
}) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white text-gray-600 focus:outline-none focus:ring-2 focus:border-transparent cursor-pointer"
      style={{ focusRingColor: TEAL } as React.CSSProperties}
    >
      <option value="">{placeholder}</option>
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
export default function HospitalAdminStaffManagementPage() {
  const { t } = useTranslation();

  const STATUS_BADGE: Record<HospitalStaffMember['status'], { bg: string; color: string; label: string }> = {
  ACTIVE:   { bg: '#F0FDF4', color: '#15803D', label: t('hospital.active' )  },
  INACTIVE: { bg: '#FFF7ED', color: '#C2410C', label: t('hospital.inactive' ) },
  ON_LEAVE: { bg: '#FEFCE8', color: '#A16207', label: t('hospital.onLeave' ) },
 };
 const ROLE_LABEL: Record<HospitalStaffMember['role'], string> = {
  DOCTOR:       t('hospital.doctor'),
  NURSE:        t('hospital.nurse'),
  RECEPTIONIST: t('hospital.receptionist'),
 };


  const [search, setSearch]     = useState('');
  const [deptFilter, setDept]   = useState('');
  const [roleFilter, setRole]   = useState('');
  const [statusFilter, setStatus] = useState('');
  const [page, setPage]         = useState(1);

  // ── Derived stats ─────────────────────────────────────────────────────────
  const totalStaff   = MOCK_HOSPITAL_STAFF.length;
  const activeStaff  = MOCK_HOSPITAL_STAFF.filter(s => s.status === 'ACTIVE').length;
  const inactiveStaff = MOCK_HOSPITAL_STAFF.filter(s => s.status !== 'ACTIVE').length;
  const deptCount    = new Set(MOCK_HOSPITAL_STAFF.map(s => s.department)).size;
  const activePct    = Math.round((activeStaff / totalStaff) * 100);
  const inactivePct  = +(100 - activePct).toFixed(1);

  // ── Filter options ────────────────────────────────────────────────────────
  const allDepts   = useMemo(() => [...new Set(MOCK_HOSPITAL_STAFF.map(s => s.department ?? '').filter(Boolean))].sort(), []);
  const allRoles   = [t('hospital.doctor'), t('hospital.nurse'), t('hospital.receptionist')];
  const allStatuses = [t('hospital.active'), t('hospital.inactive'), t('hospital.onLeave')];

  // ── Filtered + paginated ──────────────────────────────────────────────────
  const filtered = useMemo(() => {
    return MOCK_HOSPITAL_STAFF.filter(s => {
      const name = displayName(s).toLowerCase();
      if (search && !name.includes(search.toLowerCase()) && !s.id.toLowerCase().includes(search.toLowerCase())) return false;
      if (deptFilter && s.department !== deptFilter) return false;
      if (roleFilter && ROLE_LABEL[s.role] !== roleFilter) return false;
      if (statusFilter && STATUS_BADGE[s.status].label !== statusFilter) return false;
      return true;
    });
  }, [search, deptFilter, roleFilter, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage   = Math.min(page, totalPages);
  const pageSlice  = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const startRow = filtered.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1;
  const endRow   = Math.min(safePage * PAGE_SIZE, filtered.length);

  function handleFilterChange(fn: (v: string) => void) {
    return (v: string) => { fn(v); setPage(1); };
  }

  // ── Visible page numbers (max 5 shown) ───────────────────────────────────
  function pageNumbers(): (number | '…')[] {
    if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (safePage <= 3) return [1, 2, 3, '…', totalPages];
    if (safePage >= totalPages - 2) return [1, '…', totalPages - 2, totalPages - 1, totalPages];
    return [1, '…', safePage, '…', totalPages];
  }

  return (
    <div className="space-y-6 w-full max-w-full overflow-x-hidden">

      {/* ── Header ── */}
      <div className="rounded-2xl px-6 py-7 flex items-center justify-between" style={{ background: '#EBF5FF' }}>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: NAVY }}>{t('hospital.staffManagement')}</h1>
          <p className="mt-1 text-sm font-medium" style={{ color: '#0284C7' }}>{t('hospital.staffSubtitle')}</p>
        </div>
        <div className="opacity-10 shrink-0 ml-4 hidden sm:block" style={{ color: NAVY }}>
          <Users size={60} />
        </div>
      </div>

      {/* ── Stats row ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Users}
          label={t('hospital.totalStaff')}
          value={totalStaff}
          sub={t('hospital.allEmployees')}
          iconBg="#EFF6FF"
          iconColor="#2563EB"
        />
        <StatCard
          icon={UserCheck}
          label={t('hospital.activeStaff')}
          value={activeStaff}
          sub={`${activePct}%`}
          iconBg="#F0FDF4"
          iconColor="#16A34A"
        />
        <StatCard
          icon={UserX}
          label={t('hospital.inactiveStaff')}
          value={inactiveStaff}
          sub={`${inactivePct}%`}
          iconBg="#FFF7ED"
          iconColor="#EA580C"
        />
        <StatCard
          icon={Building2}
          label={t('hospital.departments')}
          value={deptCount}
          sub={t('hospital.totalDepartments')}
          iconBg="#FEFCE8"
          iconColor="#CA8A04"
        />
      </div>

      {/* ── Staff Directory ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Card header */}
        <div className="px-6 py-5 border-b border-gray-100">
          <h2 className="text-base font-bold" style={{ color: NAVY }}>{t('hospital.staffDirectory')}</h2>
        </div>

        {/* Filters */}
        <div className="px-6 py-4 flex flex-wrap gap-3 items-center border-b border-gray-50">
          {/* Search */}
          <div className="relative flex-1 min-w-[180px] max-w-xs">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder={t('hospital.searchPlaceholder')}

              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-lg bg-white text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2"
              style={{ '--tw-ring-color': TEAL } as React.CSSProperties}
            />
          </div>

          <FilterSelect
            value={deptFilter}
            onChange={handleFilterChange(setDept)}
            options={allDepts}
            placeholder={t('hospital.allDepartments')}
          />
          <FilterSelect
            value={roleFilter}
            onChange={handleFilterChange(setRole)}
            options={allRoles}
            placeholder={t('hospital.allRoles')}
          />
          <FilterSelect
            value={statusFilter}
            onChange={handleFilterChange(setStatus)}
            options={allStatuses}
            placeholder={t('hospital.allStatuses')}
          />
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[640px]">
            <thead>
              <tr className="text-xs text-gray-400 uppercase tracking-wide border-b border-gray-100 bg-gray-50">
                <th className="text-left px-6 py-3 font-semibold">{t('hospital.staffId')}</th>
                <th className="text-left px-4 py-3 font-semibold">{t('hospital.name')}</th>
                <th className="text-left px-4 py-3 font-semibold">{t('hospital.role')}</th>
                <th className="text-left px-4 py-3 font-semibold">{t('hospital.department')}</th>
                <th className="text-left px-4 py-3 font-semibold">{t('hospital.status')}</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {pageSlice.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-sm text-gray-400">
                    {t('hospital.noStaffMembersFound')}
                  </td>
                </tr>
              ) : pageSlice.map(s => {
                const dept    = deptBadge(s.department);
                const status  = STATUS_BADGE[s.status];
                return (
                  <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-3.5 font-mono text-xs font-semibold text-gray-500">{s.id}</td>
                    <td className="px-4 py-3.5 font-semibold text-gray-800">{displayName(s)}</td>
                    <td className="px-4 py-3.5 text-gray-600">{ROLE_LABEL[s.role]}</td>
                    <td className="px-4 py-3.5">
                      {s.department && (
                        <span
                          className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold"
                          style={{ background: dept.bg, color: dept.color }}
                        >
                          {s.department}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold"
                        style={{ background: status.bg, color: status.color }}
                      >
                        {status.label}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <button className="text-gray-300 hover:text-gray-500 transition-colors p-1">
                        <MoreVertical size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <p className="text-xs text-gray-400">
            {filtered.length === 0
              ? t('hospital.noStaffFound')
              : `${t('hospital.showing')} ${startRow}–${endRow} of ${filtered.length} ${t('hospital.staff')}`}
          </p>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={safePage === 1}
              className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={14} />
            </button>

            {pageNumbers().map((n, i) =>
              n === '…' ? (
                <span key={`ellipsis-${i}`} className="px-2 text-xs text-gray-400">…</span>
              ) : (
                <button
                  key={n}
                  onClick={() => setPage(n as number)}
                  className="w-7 h-7 rounded-lg text-xs font-semibold transition-all"
                  style={
                    safePage === n
                      ? { background: NAVY, color: '#fff' }
                      : { color: '#6B7280' }
                  }
                >
                  {n}
                </button>
              )
            )}

            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={safePage === totalPages}
              className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
