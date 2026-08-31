// frontend/src/app/staff/leave/page.tsx

'use client';

import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { useFetch } from '@/hooks/useFetch';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import LeaveRequestForm from '@/components/shared/LeaveRequestForm';
import LeaveHistoryList from '@/components/shared/LeaveHistoryList';
import LeaveBalanceSummary from '@/components/shared/LeaveBalanceSummary';
import { LeaveBalanceEntry, LeaveRequest } from '@/types/leave';

type Tab = 'request' | 'history';

export default function StaffLeavePage() {
  const { t } = useTranslation();
  const [tab, setTab] = useState<Tab>('request');

  const fetchRequests = useCallback(async (signal: AbortSignal) => {
    const res = await api.get('/leave/my-requests', { signal });
    return res.data as LeaveRequest[];
  }, []);
  const { data: requests, loading: loadingRequests, error: requestsError, refetch: refetchRequests } =
    useFetch<LeaveRequest[]>(fetchRequests, []);

  const fetchBalances = useCallback(async (signal: AbortSignal) => {
    const res = await api.get('/leave/my-balances', { signal });
    return res.data as LeaveBalanceEntry[];
  }, []);
  const { data: balances, loading: loadingBalances, refetch: refetchBalances } =
    useFetch<LeaveBalanceEntry[]>(fetchBalances, []);

  useState(() => {
    if (requestsError) toast.error(t('leave.failedToLoad'));
  });

  const refreshAll = () => {
    refetchRequests();
    refetchBalances();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-5 p-4 lg:p-6">
      {/* Hero */}
      <div className="rounded-2xl p-6 lg:p-8 text-white bg-brand-navy">
        <h1 className="text-2xl lg:text-3xl font-bold">{t('leave.pageTitle')}</h1>
        <p className="mt-1 text-white/70">{t('leave.pageSubtitle')}</p>
      </div>

      {/* Balances */}
      {loadingBalances ? (
        <div className="flex justify-center py-8"><LoadingSpinner /></div>
      ) : (
        <LeaveBalanceSummary balances={balances ?? []} />
      )}

      {/* Tabs */}
      <div className="flex gap-2">
        {(['request', 'history'] as Tab[]).map((tKey) => (
          <button
            key={tKey}
            onClick={() => setTab(tKey)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              tab === tKey ? 'bg-brand-teal text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {tKey === 'request' ? t('leave.tabRequest') : t('leave.tabHistory')}
          </button>
        ))}
      </div>

      {tab === 'request' ? (
        <LeaveRequestForm onSubmitted={refreshAll} />
      ) : loadingRequests ? (
        <div className="flex justify-center py-12"><LoadingSpinner /></div>
      ) : (
        <LeaveHistoryList requests={requests ?? []} onChanged={refreshAll} />
      )}
    </div>
  );
}
