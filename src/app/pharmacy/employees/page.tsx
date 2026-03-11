'use client';
// src/app/(pharmacy)/employees/page.tsx
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, Filter, Plus, Eye, Ban } from 'lucide-react';
import { api } from '@/lib/api';

const NAVY = '#1E4D8C';
const TEAL = '#2D9B8A';

const ROLE_COLORS: Record<string, { bg: string; text: string }> = {
  BRANCH_MANAGER: { bg: '#EDE9FE', text: '#5B21B6' },
  PHARMACIST:     { bg: '#DBEAFE', text: '#1E40AF' },
  CASHIER:        { bg: '#D1FAE5', text: '#065F46' },
  NURSE:          { bg: '#FEF3C7', text: '#92400E' },
};

export default function EmployeesPage() {
  const { t } = useTranslation();
  const [employees, setEmployees] = useState<any[]>([]);
  const [branches, setBranches]   = useState<any[]>([]);
  const [search, setSearch]       = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [branchFilter, setBranchFilter] = useState('');
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    Promise.all([api.get('/staff'), api.get('/branches')])
      .then(([s, b]) => {
        setEmployees(s.data?.data ?? s.data ?? []);
        setBranches(b.data?.data ?? b.data ?? []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = employees.filter(e => {
    if (search && !e.name?.toLowerCase().includes(search.toLowerCase())) return false;
    if (roleFilter && e.role !== roleFilter) return false;
    if (branchFilter && e.branchId !== branchFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="rounded-2xl p-8 text-white" style={{ backgroundColor: NAVY }}>
        <h1 className="text-3xl font-bold">{t('pharmacyOwner.employeeManagement')}</h1>
        <p className="mt-1 text-white/70">{t('pharmacyOwner.employeeManagementSubtitle')}</p>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3 top-3 text-gray-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={t('pharmacyOwner.searchEmployees')}
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter size={16} className="text-gray-400" />
          <select
            value={roleFilter}
            onChange={e => setRoleFilter(e.target.value)}
            className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none"
          >
            <option value="">{t('pharmacyOwner.allRoles')}</option>
            <option value="BRANCH_MANAGER">Manager</option>
            <option value="PHARMACIST">Pharmacist</option>
            <option value="CASHIER">Cashier</option>
            <option value="NURSE">Nurse</option>
          </select>
        </div>

        <select
          value={branchFilter}
          onChange={e => setBranchFilter(e.target.value)}
          className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none"
        >
          <option value="">{t('pharmacyOwner.allBranches')}</option>
          {branches.map((b: any) => (
            <option key={b.id} value={b.id}>{b.name}</option>
          ))}
        </select>

        <button
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-medium ml-auto"
          style={{ backgroundColor: TEAL }}
        >
          <Plus size={16} />
          {t('pharmacyOwner.addManager')}
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              {[
                t('common.name'),
                t('pharmacyOwner.role'),
                t('pharmacyOwner.assignedBranch'),
                t('common.status'),
                t('common.actions'),
              ].map(h => (
                <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="py-12 text-center text-gray-400">{t('common.loading')}</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={5} className="py-12 text-center text-gray-400">{t('common.noData')}</td></tr>
            ) : (
              filtered.map((emp: any) => {
                const rc = ROLE_COLORS[emp.role] ?? { bg: '#F3F4F6', text: '#374151' };
                const displayRole =
                  emp.role === 'BRANCH_MANAGER' ? 'Manager' :
                  emp.role === 'PHARMACIST' ? 'Pharmacist' :
                  emp.role === 'CASHIER' ? 'Cashier' :
                  emp.role === 'NURSE' ? 'Nurse' : 'Staff';

                return (
                  <tr key={emp.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                    <td className="px-5 py-4 text-sm font-semibold text-gray-800">{emp.name}</td>
                    <td className="px-5 py-4">
                      <span
                        className="px-2.5 py-1 rounded-full text-xs font-semibold"
                        style={{ backgroundColor: rc.bg, color: rc.text }}
                      >
                        {displayRole}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-600">
                      {emp.branchName ?? '—'}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className="px-2.5 py-1 rounded-full text-xs font-semibold"
                        style={
                          emp.status === 'ACTIVE'
                            ? { backgroundColor: '#D1FAE5', color: '#065F46' }
                            : { backgroundColor: '#FEE2E2', color: '#991B1B' }
                        }
                      >
                        {emp.status === 'ACTIVE' ? t('common.active') : t('common.inactive')}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <button className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50">
                          <Eye size={14} />
                        </button>
                        {emp.role === 'BRANCH_MANAGER' && (
                          <button className="p-1.5 rounded-lg border border-red-200 text-red-500 hover:bg-red-50">
                            <Ban size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}