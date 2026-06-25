'use client';

import { useState } from 'react';
import {
  Search, Filter, MoreVertical, ChevronLeft, ChevronRight,
  Users, BedDouble, Activity, UserCheck,
} from 'lucide-react';
import { MOCK_PATIENTS } from '@/mock/hospital/consultations';
import type { PatientStatus } from '@/types/hospital';

const PAGE_SIZE = 3;

const STATUS_BADGE: Record<PatientStatus, string> = {
  ACTIVE:   'bg-green-100 text-green-700',
  CRITICAL: 'bg-red-100   text-red-600',
  INACTIVE: 'bg-gray-100  text-gray-600',
};

export default function NursePatientsPage() {
  const [search, setSearch]             = useState('');
  const [statusFilter, setStatus]       = useState<PatientStatus | 'ALL'>('ALL');
  const [conditionFilter, setCondition] = useState('ALL');
  const [lastVisitFilter, setLastVisit] = useState('ALL');
  const [page, setPage]                 = useState(1);

  const conditions = ['ALL', ...Array.from(new Set(MOCK_PATIENTS.map(p => p.condition)))];

  const filtered = MOCK_PATIENTS
    .filter(p => statusFilter === 'ALL' || p.status === statusFilter)
    .filter(p => conditionFilter === 'ALL' || p.condition === conditionFilter)
    .filter(p => {
      if (lastVisitFilter === 'ALL') return true;
      const visit = new Date(p.lastVisit).getTime();
      if (Number.isNaN(visit)) return true;
      const days = (Date.now() - visit) / 86_400_000;
      return days <= Number(lastVisitFilter);
    })
    .filter(p =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.patientId.toLowerCase().includes(search.toLowerCase())
    );

  const totalPages  = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage    = Math.min(page, totalPages);
  const pageItems   = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  function applyFilter(fn: () => void) { fn(); setPage(1); }

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="rounded-2xl p-8" style={{ background: '#EBF5FF' }}>
        <h1 className="text-3xl font-bold" style={{ color: '#1E3A5F' }}>Patients</h1>
        <p className="mt-1 text-sm font-medium" style={{ color: '#0284C7' }}>Tracking Patients Information</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Patients"     value={50} icon={<Users className="w-6 h-6" />}     color="red"    sub="View all patients" />
        <StatCard label="Admit Patients"     value={20} icon={<BedDouble className="w-6 h-6" />} color="purple" sub="Admitted" />
        <StatCard label="Critical Patients"  value={15} icon={<Activity className="w-6 h-6" />}  color="blue"   sub="Immediate Care" />
        <StatCard label="Discharged Patients" value={25} icon={<UserCheck className="w-6 h-6" />} color="green"  sub="Today" />
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-3 bg-white rounded-xl shadow-sm border border-gray-100 px-4 py-3">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search name by ID,..."
            value={search}
            onChange={e => applyFilter(() => setSearch(e.target.value))}
            className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <select value={statusFilter} onChange={e => applyFilter(() => setStatus(e.target.value as PatientStatus | 'ALL'))} className="px-3 py-2 text-sm border border-gray-200 rounded-lg text-gray-600 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="ALL">All Status</option>
          <option value="ACTIVE">Active</option>
          <option value="CRITICAL">Critical</option>
          <option value="INACTIVE">Inactive</option>
        </select>
        <select value={conditionFilter} onChange={e => applyFilter(() => setCondition(e.target.value))} className="px-3 py-2 text-sm border border-gray-200 rounded-lg text-gray-600 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
          {conditions.map(c => <option key={c} value={c}>{c === 'ALL' ? 'All Conditions' : c}</option>)}
        </select>
        <select value={lastVisitFilter} onChange={e => applyFilter(() => setLastVisit(e.target.value))} className="px-3 py-2 text-sm border border-gray-200 rounded-lg text-gray-600 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="ALL">Last Visit</option>
          <option value="7">Last 7 days</option>
          <option value="30">Last 30 days</option>
          <option value="90">Last 90 days</option>
        </select>
        <button className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors">
          <Filter className="w-4 h-4" />
          Filter
        </button>
      </div>

      {/* Table card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                {['Patient', 'Patient ID', 'Age', 'Gender', 'Last visit', 'Condition', 'Status', ''].map((h, i) => (
                  <th key={i} className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {pageItems.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-16 text-center">
                    <p className="text-gray-500 font-medium">No patients found</p>
                    <p className="text-gray-400 text-sm mt-1">Try adjusting your search or filters.</p>
                  </td>
                </tr>
              ) : pageItems.map(p => (
                <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{p.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{p.patientId}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{p.age}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{p.gender}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{p.lastVisit}</td>
                  <td className="px-6 py-4 text-sm text-gray-600 uppercase">{p.condition}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2.5 py-1 text-xs font-semibold rounded-full ${STATUS_BADGE[p.status]}`}>{p.status}</span>
                  </td>
                  <td className="px-6 py-4">
                    <button className="text-gray-400 hover:text-gray-600 transition-colors"><MoreVertical className="w-5 h-5" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filtered.length > 0 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 text-sm text-gray-500">
            <span>Showing {pageItems.length} of {filtered.length} patients</span>
            <div className="flex items-center gap-1">
              <NavButton onClick={() => setPage(p => Math.max(1, p - 1))} disabled={safePage === 1}><ChevronLeft className="w-3.5 h-3.5" /></NavButton>
              {pageNumbers(safePage, totalPages).map((n, i) =>
                n === '...'
                  ? <span key={`e-${i}`} className="px-1 text-gray-400">...</span>
                  : <PageButton key={n} label={n} active={n === safePage} onClick={() => setPage(n)} />
              )}
              <NavButton onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={safePage === totalPages}><ChevronRight className="w-3.5 h-3.5" /></NavButton>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function pageNumbers(current: number, total: number): (number | '...')[] {
  if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | '...')[] = [1];
  if (current > 3) pages.push('...');
  for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) pages.push(i);
  if (current < total - 2) pages.push('...');
  pages.push(total);
  return pages;
}

function PageButton({ label, active, onClick }: { label: number; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} className={`w-7 h-7 text-xs rounded flex items-center justify-center transition-colors ${active ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>{label}</button>
  );
}

function NavButton({ onClick, disabled, children }: { onClick: () => void; disabled: boolean; children: React.ReactNode }) {
  return (
    <button onClick={onClick} disabled={disabled} className="w-7 h-7 flex items-center justify-center rounded transition-colors disabled:text-gray-300 disabled:cursor-default text-gray-600 hover:bg-gray-100 disabled:hover:bg-transparent">{children}</button>
  );
}

function StatCard({ label, value, icon, color, sub }: {
  label: string; value: number; icon: React.ReactNode; color: 'red' | 'purple' | 'blue' | 'green'; sub: string;
}) {
  const palette = {
    red:    { bg: 'bg-red-50',    text: 'text-red-500',    border: 'border-red-100' },
    purple: { bg: 'bg-purple-50', text: 'text-purple-500', border: 'border-purple-100' },
    blue:   { bg: 'bg-blue-50',   text: 'text-blue-500',   border: 'border-blue-100' },
    green:  { bg: 'bg-green-50',  text: 'text-green-500',  border: 'border-green-100' },
  }[color];
  return (
    <div className={`bg-white rounded-xl p-5 border ${palette.border} shadow-sm`}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-sm text-gray-500">{label}</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
          <p className="text-xs text-gray-400 mt-1">{sub}</p>
        </div>
        <div className={`w-10 h-10 ${palette.bg} ${palette.text} rounded-lg flex items-center justify-center shrink-0`}>{icon}</div>
      </div>
    </div>
  );
}
