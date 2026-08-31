// frontend/src/app/pharmacy/leave/page.tsx

'use client';

import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import api from '@/lib/api';
import { useFetch } from '@/hooks/useFetch';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import LeaveReviewList from '@/components/shared/LeaveReviewList';
import LeaveBalanceEditor from '@/components/shared/LeaveBalanceEditor';
import { EmployeeLeaveBalances, LeaveRequest, LeaveStatus } from '@/types/leave';

type Tab = 'requests' | 'set-days';

const CURRENT_YEAR = new Date().getFullYear();
const STATUS_FILTERS: (LeaveStatus | 'all')[] = ['all', 'PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'];

export default function PharmacyLeavePage() {
  const { t } = useTranslation();
  const [tab, setTab] = useState<Tab>('requests');
  const [statusFilter, setStatusFilter] = useState<LeaveStatus | 'all'>('PENDING');

  const fetchRequests = useCallback(
    async (signal: AbortSignal) => {
      const query = statusFilter === 'all' ? '' : `?status=${statusFilter}`;
      const res = await api.get(`/leave/pharmacy/requests${query}`, { signal });
      return res.data as LeaveRequest[];
    },
    [statusFilter],
  );
  const { data: requests, loading: loadingRequests, refetch: refetchRequests } =
    useFetch<LeaveRequest[]>(fetchRequests, [statusFilter]);

  const fetchBalances = useCallback(async (signal: AbortSignal) => {
    const res = await api.get(`/leave/pharmacy/balances?year=${CURRENT_YEAR}`, { signal });
    return res.data as EmployeeLeaveBalances[];
  }, []);
  const { data: balances, loading: loadingBalances, refetch: refetchBalances } =
    useFetch<EmployeeLeaveBalances[]>(fetchBalances, []);

  return (
    <div className="max-w-5xl mx-auto space-y-5 p-4 lg:p-6">
      {/* Hero */}
      <div className="rounded-2xl p-6 lg:p-8 text-white bg-brand-navy">
        <h1 className="text-2xl lg:text-3xl font-bold">{t('leave.ownerPageTitle')}</h1>
        <p className="mt-1 text-white/70">{t('leave.ownerPageSubtitle')}</p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setTab('requests')}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
            tab === 'requests' ? 'bg-brand-teal text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
          }`}
        >
          {t('leave.tabAllRequests')}
        </button>
        <button
          onClick={() => setTab('set-days')}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
            tab === 'set-days' ? 'bg-brand-teal text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
          }`}
        >
          {t('leave.tabSetDays')}
        </button>
      </div>

      {tab === 'requests' && (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {STATUS_FILTERS.map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  statusFilter === s ? 'bg-brand-teal text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
              >
                {s === 'all' ? t('leave.statusAll') : s}
              </button>
            ))}
          </div>

          {loadingRequests ? (
            <div className="flex justify-center py-12"><LoadingSpinner /></div>
          ) : (
            <LeaveReviewList
              requests={requests ?? []}
              onChanged={refetchRequests}
              showBranch
            />
          )}
        </div>
      )}

      {tab === 'set-days' && (
        loadingBalances ? (
          <div className="flex justify-center py-12"><LoadingSpinner /></div>
        ) : (balances ?? []).length === 0 ? (
          <div className="bg-white rounded-2xl p-10 text-center border border-gray-100">
            <p className="text-gray-500 text-sm">{t('leave.noStaffYet')}</p>
          </div>
        ) : (
          <LeaveBalanceEditor
            employees={balances ?? []}
            scope="pharmacy"
            year={CURRENT_YEAR}
            onChanged={refetchBalances}
          />
        )
      )}
    </div>
  );
}
