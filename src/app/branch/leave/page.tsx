// frontend/src/app/branch/leave/page.tsx

'use client';

import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import api from '@/lib/api';
import { useFetch } from '@/hooks/useFetch';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import LeaveRequestForm from '@/components/shared/LeaveRequestForm';
import LeaveHistoryList from '@/components/shared/LeaveHistoryList';
import LeaveBalanceSummary from '@/components/shared/LeaveBalanceSummary';
import LeaveReviewList from '@/components/shared/LeaveReviewList';
import LeaveBalanceEditor from '@/components/shared/LeaveBalanceEditor';
import { EmployeeLeaveBalances, LeaveBalanceEntry, LeaveRequest } from '@/types/leave';

type Tab = 'my-leave' | 'team-requests' | 'set-days';

const CURRENT_YEAR = new Date().getFullYear();

export default function BranchLeavePage() {
  const { t } = useTranslation();
  const [tab, setTab] = useState<Tab>('team-requests');
  const [myLeaveTab, setMyLeaveTab] = useState<'request' | 'history'>('request');

  // My own leave (as the branch manager — reviewed by the pharmacy owner)
  const fetchMyRequests = useCallback(async (signal: AbortSignal) => {
    const res = await api.get('/leave/my-requests', { signal });
    return res.data as LeaveRequest[];
  }, []);
  const { data: myRequests, loading: loadingMyRequests, refetch: refetchMyRequests } =
    useFetch<LeaveRequest[]>(fetchMyRequests, []);

  const fetchMyBalances = useCallback(async (signal: AbortSignal) => {
    const res = await api.get('/leave/my-balances', { signal });
    return res.data as LeaveBalanceEntry[];
  }, []);
  const { data: myBalances, loading: loadingMyBalances, refetch: refetchMyBalances } =
    useFetch<LeaveBalanceEntry[]>(fetchMyBalances, []);

  // My branch's staff leave requests (I approve/reject these)
  const fetchTeamRequests = useCallback(async (signal: AbortSignal) => {
    const res = await api.get('/leave/branch/requests', { signal });
    return res.data as LeaveRequest[];
  }, []);
  const { data: teamRequests, loading: loadingTeamRequests, refetch: refetchTeamRequests } =
    useFetch<LeaveRequest[]>(fetchTeamRequests, []);

  // My branch's staff leave balances (I configure these)
  const fetchTeamBalances = useCallback(async (signal: AbortSignal) => {
    const res = await api.get(`/leave/branch/balances?year=${CURRENT_YEAR}`, { signal });
    return res.data as EmployeeLeaveBalances[];
  }, []);
  const { data: teamBalances, loading: loadingTeamBalances, refetch: refetchTeamBalances } =
    useFetch<EmployeeLeaveBalances[]>(fetchTeamBalances, []);

  const refreshMyLeave = () => { refetchMyRequests(); refetchMyBalances(); };
  const refreshTeam = () => { refetchTeamRequests(); refetchTeamBalances(); };

  const pendingCount = (teamRequests ?? []).filter((r) => r.status === 'PENDING').length;

  return (
    <div className="max-w-5xl mx-auto space-y-5 p-4 lg:p-6">
      {/* Hero */}
      <div className="rounded-2xl p-6 lg:p-8 text-white bg-brand-navy">
        <h1 className="text-2xl lg:text-3xl font-bold">{t('leave.managerPageTitle')}</h1>
        <p className="mt-1 text-white/70">{t('leave.managerPageSubtitle')}</p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setTab('team-requests')}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
            tab === 'team-requests' ? 'bg-brand-teal text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
          }`}
        >
          {t('leave.tabTeamRequests')}{pendingCount > 0 ? ` (${pendingCount})` : ''}
        </button>
        <button
          onClick={() => setTab('set-days')}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
            tab === 'set-days' ? 'bg-brand-teal text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
          }`}
        >
          {t('leave.tabSetDays')}
        </button>
        <button
          onClick={() => setTab('my-leave')}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
            tab === 'my-leave' ? 'bg-brand-teal text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
          }`}
        >
          {t('leave.tabMyLeave')}
        </button>
      </div>

      {/* Team requests (approve/reject own branch staff) */}
      {tab === 'team-requests' && (
        loadingTeamRequests ? (
          <div className="flex justify-center py-12"><LoadingSpinner /></div>
        ) : (
          <LeaveReviewList requests={teamRequests ?? []} onChanged={refreshTeam} />
        )
      )}

      {/* Set annual/other leave day allocations for own branch staff */}
      {tab === 'set-days' && (
        loadingTeamBalances ? (
          <div className="flex justify-center py-12"><LoadingSpinner /></div>
        ) : (teamBalances ?? []).length === 0 ? (
          <div className="bg-white rounded-2xl p-10 text-center border border-gray-100">
            <p className="text-gray-500 text-sm">{t('leave.noStaffYet')}</p>
          </div>
        ) : (
          <LeaveBalanceEditor
            employees={teamBalances ?? []}
            scope="branch"
            year={CURRENT_YEAR}
            onChanged={refreshTeam}
          />
        )
      )}

      {/* My own leave — reviewed by the pharmacy owner */}
      {tab === 'my-leave' && (
        <div className="space-y-5">
          {loadingMyBalances ? (
            <div className="flex justify-center py-8"><LoadingSpinner /></div>
          ) : (
            <LeaveBalanceSummary balances={myBalances ?? []} />
          )}

          <div className="flex gap-2">
            {(['request', 'history'] as const).map((k) => (
              <button
                key={k}
                onClick={() => setMyLeaveTab(k)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  myLeaveTab === k ? 'bg-brand-navy text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                {k === 'request' ? t('leave.tabRequest') : t('leave.tabHistory')}
              </button>
            ))}
          </div>

          {myLeaveTab === 'request' ? (
            <LeaveRequestForm onSubmitted={refreshMyLeave} />
          ) : loadingMyRequests ? (
            <div className="flex justify-center py-12"><LoadingSpinner /></div>
          ) : (
            <LeaveHistoryList requests={myRequests ?? []} onChanged={refreshMyLeave} />
          )}
        </div>
      )}
    </div>
  );
}
