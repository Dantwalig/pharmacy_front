// frontend/src/components/shared/LeaveBalanceEditor.tsx
//
// Lets a branch manager (own branch staff) or a pharmacy owner (anyone in
// the pharmacy, including branch managers) set the number of leave days
// allocated to an employee for a given leave type and year.

'use client';

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { getErrorMessage } from '@/lib/errorHandler';
import { AdjustmentsHorizontalIcon, UserIcon } from '@heroicons/react/24/outline';
import { EmployeeLeaveBalances, LeaveType, LeaveTypeInfo } from '@/types/leave';

interface LeaveBalanceEditorProps {
  employees: EmployeeLeaveBalances[];
  /** 'branch' -> PUT /leave/branch/balances, 'pharmacy' -> PUT /leave/pharmacy/balances */
  scope: 'branch' | 'pharmacy';
  year: number;
  onChanged?: () => void;
}

export default function LeaveBalanceEditor({ employees, scope, year, onChanged }: LeaveBalanceEditorProps) {
  const { t } = useTranslation();
  const [types, setTypes] = useState<LeaveTypeInfo[]>([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [leaveType, setLeaveType] = useState<LeaveType>('ANNUAL');
  const [allocatedDays, setAllocatedDays] = useState('18');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get('/leave/types').then((res) => setTypes(res.data ?? [])).catch(() => {});
  }, []);

  useEffect(() => {
    if (!selectedUserId && employees.length > 0) {
      setSelectedUserId(employees[0].userId);
    }
  }, [employees, selectedUserId]);

  const selectedEmployee = employees.find((e) => e.userId === selectedUserId);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId) {
      toast.error(t('leave.selectEmployee'));
      return;
    }
    const days = Number(allocatedDays);
    if (Number.isNaN(days) || days < 0) {
      toast.error(t('leave.invalidDays'));
      return;
    }
    setSaving(true);
    try {
      const endpoint = scope === 'branch' ? '/leave/branch/balances' : '/leave/pharmacy/balances';
      await api.put(endpoint, {
        userId: selectedUserId,
        year,
        leaveType,
        allocatedDays: days,
        notes: notes.trim() || undefined,
      });
      toast.success(t('leave.balanceUpdated'));
      setNotes('');
      onChanged?.();
    } catch (error: unknown) {
      toast.error(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
      <div className="flex items-center gap-2">
        <AdjustmentsHorizontalIcon className="w-5 h-5 text-brand-teal" />
        <h2 className="font-bold text-gray-900">{t('leave.setLeaveDays')}</h2>
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1.5">{t('leave.employee')}</label>
        <select
          value={selectedUserId}
          onChange={(e) => setSelectedUserId(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
        >
          {employees.map((emp) => (
            <option key={emp.userId} value={emp.userId}>
              {emp.name} — {emp.role.replace(/_/g, ' ')}
              {emp.branchName ? ` (${emp.branchName})` : ''}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5">{t('leave.leaveType')}</label>
          <select
            value={leaveType}
            onChange={(e) => setLeaveType(e.target.value as LeaveType)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
          >
            {types.map((ty) => (
              <option key={ty.type} value={ty.type}>
                {ty.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5">{t('leave.allocatedDays')}</label>
          <input
            type="number"
            min={0}
            max={365}
            value={allocatedDays}
            onChange={(e) => setAllocatedDays(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1.5">
          {t('leave.notes')} <span className="text-gray-400 font-normal">({t('form.optional')})</span>
        </label>
        <input
          type="text"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder={t('leave.notesPlaceholder')}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
        />
      </div>

      <button
        type="submit"
        disabled={saving}
        className="w-full py-2.5 rounded-xl text-white text-sm font-semibold bg-brand-teal hover:opacity-90 transition-opacity disabled:opacity-50"
      >
        {saving ? t('leave.saving') : t('leave.saveAllocation')}
      </button>

      {/* Current balances for the selected employee */}
      {selectedEmployee && (
        <div className="pt-4 border-t border-gray-100">
          <div className="flex items-center gap-1.5 mb-2">
            <UserIcon className="w-4 h-4 text-gray-400" />
            <p className="text-xs font-semibold text-gray-700">
              {selectedEmployee.name} — {t('leave.currentBalances')}
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {selectedEmployee.balances.map((b) => (
              <div key={b.leaveType} className="bg-gray-50 rounded-lg p-2.5">
                <p className="text-[11px] font-semibold text-gray-500">{b.label}</p>
                <p className="text-sm font-bold text-gray-900">
                  {b.remainingDays}/{b.allocatedDays} {t('leave.days')}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </form>
  );
}
