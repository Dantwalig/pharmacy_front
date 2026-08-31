// frontend/src/components/shared/LeaveBalanceSummary.tsx

'use client';

import { useTranslation } from 'react-i18next';
import { LeaveBalanceEntry } from '@/types/leave';

interface LeaveBalanceSummaryProps {
  balances: LeaveBalanceEntry[];
}

export default function LeaveBalanceSummary({ balances }: LeaveBalanceSummaryProps) {
  const { t } = useTranslation();

  if (balances.length === 0) return null;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
      {balances.map((b) => (
        <div key={b.leaveType} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{b.label}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {b.remainingDays}
            <span className="text-sm font-medium text-gray-400"> / {b.allocatedDays}</span>
          </p>
          <p className="text-xs text-gray-400 mt-0.5">{t('leave.daysRemaining')}</p>
          {!b.isCustom && (
            <p className="text-[10px] text-gray-300 mt-1">{t('leave.defaultAllocation')}</p>
          )}
        </div>
      ))}
    </div>
  );
}
