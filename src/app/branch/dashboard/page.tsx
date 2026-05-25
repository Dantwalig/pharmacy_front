'use client';

import { useFetch } from '@/hooks/useFetch';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { getErrorMessage } from '@/lib/errorHandler';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import {
  UserGroupIcon,
  ClipboardDocumentCheckIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';

interface AttendanceSummary {
  total: number;
  pending: number;
  approved: number;
  completed: number;
  rejected: number;
  totalHoursWorked: number;
}

interface PendingAttendance {
  id: string;
  status: string;
  clockInTime: string;
  clockOutTime?: string;
  staff: {
    firstName: string;
    lastName: string;
    user: { email: string; role: string };
  };
}

export default function BranchDashboardPage() {
  const { t } = useTranslation();
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchDashboardData = useCallback(
    async (signal: AbortSignal) => {
      const [summaryRes, clockInsRes, clockOutsRes, staffRes] = await Promise.all([
        api.get('/attendance/summary', { signal }),
        api.get('/attendance/pending-clock-ins', { signal }),
        api.get('/attendance/pending-clock-outs', { signal }),
        api.get('/staff', { signal }),
      ]);

      return {
        summary: summaryRes.data,
        pendingClockIns: clockInsRes.data,
        pendingClockOuts: clockOutsRes.data,
        staffCount: Array.isArray(staffRes.data) ? staffRes.data.length : 0,
      };
    },
    []
  );

  const { data, loading, error, refetch } = useFetch<{
    summary: AttendanceSummary | null;
    pendingClockIns: PendingAttendance[];
    pendingClockOuts: PendingAttendance[];
    staffCount: number;
  }>(fetchDashboardData, []);

  const summary = data?.summary ?? null;
  const pendingClockIns = data?.pendingClockIns ?? [];
  const pendingClockOuts = data?.pendingClockOuts ?? [];
  const staffCount = data?.staffCount ?? 0;

  useEffect(() => {
    if (error) toast.error(t('errors.failedToLoadDashboard'));
  }, [error, t]);

  const approveClockIn = async (id: string) => {
    setActionLoading(id);
    try {
      await api.put(`/attendance/${id}/approve-clock-in`, {});
      toast.success(t('success.clockInApproved'));
      await refetch();
    } catch (error: unknown) {
      toast.error(getErrorMessage(error));
    } finally { setActionLoading(null); }
  };

  const rejectClockIn = async (id: string) => {
    setActionLoading(id + '-reject');
    try {
      await api.put(`/attendance/${id}/reject-clock-in`, { reason: t('dashboard.rejectedByManager') });
      toast.success(t('success.clockInRejected'));
      await refetch();
    } catch (error: unknown) {
      toast.error(getErrorMessage(error));
    } finally { setActionLoading(null); }
  };

  const approveClockOut = async (id: string) => {
    setActionLoading(id + '-out');
    try {
      await api.put(`/attendance/${id}/approve-clock-out`, {});
      toast.success(t('success.clockOutApproved'));
      await refetch();
    } catch (error: unknown) {
      toast.error(getErrorMessage(error));
    } finally { setActionLoading(null); }
  };

  const rejectClockOut = async (id: string) => {
    setActionLoading(id + '-out-reject');
    try {
      await api.put(`/attendance/${id}/reject-clock-out`, { reason: t('dashboard.rejectedByManager') });
      toast.success(t('success.clockOutRejected'));
      await refetch();
    } catch (error: unknown) {
      toast.error(getErrorMessage(error));
    } finally { setActionLoading(null); }
  };

  const formatTime = (dateStr: string) =>
    new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  if (loading) return <div className="flex justify-center py-20"><LoadingSpinner /></div>;

  const statCards = [
    { label: t('dashboard.totalStaff'),       value: staffCount,                                          icon: UserGroupIcon,            dark: false },
    { label: t('dashboard.pendingApprovals'), value: pendingClockIns.length + pendingClockOuts.length,    icon: ClockIcon,                dark: false },
    { label: t('dashboard.activeToday'),      value: summary?.approved ?? 0,                              icon: ClipboardDocumentCheckIcon, dark: false },
    { label: t('dashboard.hoursWorked'),      value: `${(summary?.totalHoursWorked ?? 0).toFixed(1)}h`,  icon: CheckCircleIcon,          dark: true  },
  ];

  return (
    <div className="space-y-6">
      <div className="rounded-2xl p-6 lg:p-8 text-white bg-brand-navy">
        <h1 className="text-2xl lg:text-3xl font-bold">{t('dashboard.branchDashboard')}</h1>
        <p className="mt-1 text-white/70">{t('dashboard.todayOverview')}</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((s) => {
          const Icon = s.icon;
          return (
            <div
              key={s.label}
              className={`rounded-2xl p-5 flex items-center justify-between ${s.dark ? 'bg-brand-navy' : 'bg-brand-teal'}`}
            >
              <div>
                <p className="text-white/80 text-sm">{s.label}</p>
                <p className="text-white text-2xl font-bold mt-1">{s.value}</p>
              </div>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-white/15">
                <Icon className="w-5 h-5 text-white" />
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Pending Clock-Ins */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="p-5 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
            <h2 className="font-bold text-gray-900 dark:text-gray-100">{t('dashboard.pendingClockIns')}</h2>
            <span className="w-6 h-6 text-xs font-bold rounded-full flex items-center justify-center text-white bg-brand-teal">
              {pendingClockIns.length}
            </span>
          </div>
          {pendingClockIns.length === 0 ? (
            <p className="p-6 text-center text-gray-400 text-sm">{t('dashboard.noPendingClockIns')}</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-gray-50/50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400">
                  <tr>
                    <th scope="col" className="px-5 py-3 font-medium text-xs uppercase tracking-wider">{t('common.name')}</th>
                    <th scope="col" className="px-5 py-3 font-medium text-xs uppercase tracking-wider">{t('form.role')}</th>
                    <th scope="col" className="px-5 py-3 font-medium text-xs uppercase tracking-wider">{t('staff.clockIn')}</th>
                    <th scope="col" className="px-5 py-3 font-medium text-xs uppercase tracking-wider text-right">{t('common.actions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {pendingClockIns.map((record) => (
                    <tr key={record.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/50 transition-colors">
                      <td className="px-5 py-4">
                        <span className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
                          {record.staff.firstName} {record.staff.lastName}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-xs text-gray-500 capitalize">
                        {record.staff.user.role.toLowerCase()}
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-600 dark:text-gray-300">
                        {formatTime(record.clockInTime)}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => approveClockIn(record.id)}
                            disabled={!!actionLoading}
                            className="p-1.5 rounded-lg transition-all disabled:opacity-50 bg-white border border-brand-teal text-brand-teal hover:bg-gray-50"
                            title={t('branch.approve')}
                            aria-label={`Approve clock in for ${record.staff.firstName} ${record.staff.lastName}`}
                          >
                            <CheckCircleIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => rejectClockIn(record.id)}
                            disabled={!!actionLoading}
                            className="p-1.5 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-all disabled:opacity-50"
                            title={t('branch.reject')}
                            aria-label={`Reject clock in for ${record.staff.firstName} ${record.staff.lastName}`}
                          >
                            <XCircleIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pending Clock-Outs */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="p-5 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
            <h2 className="font-bold text-gray-900 dark:text-gray-100">{t('dashboard.pendingClockOuts')}</h2>
            <span className="w-6 h-6 text-xs font-bold rounded-full flex items-center justify-center text-white bg-brand-teal">
              {pendingClockOuts.length}
            </span>
          </div>
          {pendingClockOuts.length === 0 ? (
            <p className="p-6 text-center text-gray-400 text-sm">{t('dashboard.noPendingClockOuts')}</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-gray-50/50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400">
                  <tr>
                    <th scope="col" className="px-5 py-3 font-medium text-xs uppercase tracking-wider">{t('common.name')}</th>
                    <th scope="col" className="px-5 py-3 font-medium text-xs uppercase tracking-wider">{t('form.role')}</th>
                    <th scope="col" className="px-5 py-3 font-medium text-xs uppercase tracking-wider">{t('staff.clockOut')}</th>
                    <th scope="col" className="px-5 py-3 font-medium text-xs uppercase tracking-wider text-right">{t('common.actions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {pendingClockOuts.map((record) => (
                    <tr key={record.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/50 transition-colors">
                      <td className="px-5 py-4">
                        <span className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
                          {record.staff.firstName} {record.staff.lastName}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-xs text-gray-500 capitalize">
                        {record.staff.user.role.toLowerCase()}
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-600 dark:text-gray-300">
                        {record.clockOutTime ? formatTime(record.clockOutTime) : '—'}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => approveClockOut(record.id)}
                            disabled={!!actionLoading}
                            className="p-1.5 rounded-lg transition-all disabled:opacity-50 bg-white border border-brand-teal text-brand-teal hover:bg-gray-50"
                            title={t('branch.approve')}
                            aria-label={`Approve clock out for ${record.staff.firstName} ${record.staff.lastName}`}
                          >
                            <CheckCircleIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => rejectClockOut(record.id)}
                            disabled={!!actionLoading}
                            className="p-1.5 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-all disabled:opacity-50"
                            title={t('branch.reject')}
                            aria-label={`Reject clock out for ${record.staff.firstName} ${record.staff.lastName}`}
                          >
                            <XCircleIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
