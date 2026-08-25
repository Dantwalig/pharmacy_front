'use client';

import StatusBadge from '@/components/shared/StatusBadge';
import { useTranslation } from 'react-i18next';

export interface RefundItem {
  id: string;
  amount: number;
  status: 'APPROVED' | 'REJECTED' | 'PENDING';
  date: string;
}

interface RefundTableProps {
  refunds: RefundItem[];
  onViewAll?: () => void;
}

function fmtRWF(n: number) {
  return `RWF ${n.toLocaleString()}`;
}

function fmtDate(iso: string, locale: string) {
  return new Date(iso).toLocaleDateString(locale, { month: '2-digit', day: '2-digit', year: 'numeric' });
}

export default function RefundTable({ refunds, onViewAll }: RefundTableProps) {
  const { t, i18n } = useTranslation();
  
  const statusLabels = {
  APPROVED: t('hospital.approved'),
  REJECTED: t('hospital.rejected'),
  PENDING: t('hospital.pending'),
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-slate-900">{t('hospital.refunds')}</h2>
        <button
          onClick={onViewAll}
          className="text-xs font-semibold text-brand-navy hover:underline"
        >
          {t('hospital.viewAll')}
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-gray-100">
              {[t('hospital.refund'), t('hospital.amount'), t('hospital.status'), t('hospital.date')].map((h) => (
                <th key={h} className="pb-2 text-left font-semibold text-slate-400 uppercase tracking-wide pr-3">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {refunds.map((r) => (
              <tr key={r.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="py-2.5 pr-3 font-mono text-slate-500">{r.id.toUpperCase()}</td>
                <td className="py-2.5 pr-3 font-semibold text-slate-800 whitespace-nowrap">{fmtRWF(r.amount)}</td>
                <td className="py-2.5 pr-3">
                  <StatusBadge
                    status={r.status} label={statusLabels[r.status]} 
                  />
                </td>
                <td className="py-2.5 text-slate-400 whitespace-nowrap">{fmtDate(r.date, i18n.language)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
