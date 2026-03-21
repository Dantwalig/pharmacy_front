// frontend/src/app/branch/dashboard/page.tsx

'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
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
  const [summary, setSummary] = useState<AttendanceSummary | null>(null);
  const [pendingClockIns, setPendingClockIns] = useState<PendingAttendance[]>([]);
  const [pendingClockOuts, setPendingClockOuts] = useState<PendingAttendance[]>([]);
  const [staffCount, setStaffCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [summaryRes, clockInsRes, clockOutsRes, staffRes] = await Promise.all([
        api.get('/attendance/summary'),           // GET /attendance/summary
        api.get('/attendance/pending-clock-ins'), // GET /attendance/pending-clock-ins
        api.get('/attendance/pending-clock-outs'),// GET /attendance/pending-clock-outs
        api.get('/staff'),                        // GET /staff
      ]);
      setSummary(summaryRes.data);
      setPendingClockIns(clockInsRes.data);
      setPendingClockOuts(clockOutsRes.data);
      setStaffCount(Array.isArray(staffRes.data) ? staffRes.data.length : 0);
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const approveClockIn = async (id: string) => {
    setActionLoading(id);
    try {
      await api.put(`/attendance/${id}/approve-clock-in`, {}); // PUT /attendance/:id/approve-clock-in
      toast.success('Clock-in approved');
      setPendingClockIns(prev => prev.filter(r => r.id !== id));
      setSummary(prev => prev ? { ...prev, pending: prev.pending - 1, approved: prev.approved + 1 } : prev);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to approve');
    } finally {
      setActionLoading(null);
    }
  };

  const rejectClockIn = async (id: string) => {
    setActionLoading(id + '-reject');
    try {
      await api.put(`/attendance/${id}/reject-clock-in`, { reason: 'Rejected by manager' }); // PUT /attendance/:id/reject-clock-in
      toast.success('Clock-in rejected');
      setPendingClockIns(prev => prev.filter(r => r.id !== id));
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to reject');
    } finally {
      setActionLoading(null);
    }
  };

  const approveClockOut = async (id: string) => {
    setActionLoading(id + '-out');
    try {
      await api.put(`/attendance/${id}/approve-clock-out`, {}); // PUT /attendance/:id/approve-clock-out
      toast.success('Clock-out approved');
      setPendingClockOuts(prev => prev.filter(r => r.id !== id));
      setSummary(prev => prev ? { ...prev, completed: prev.completed + 1 } : prev);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to approve');
    } finally {
      setActionLoading(null);
    }
  };

  const rejectClockOut = async (id: string) => {
    setActionLoading(id + '-out-reject');
    try {
      await api.put(`/attendance/${id}/reject-clock-out`, { reason: 'Rejected by manager' }); // PUT /attendance/:id/reject-clock-out
      toast.success('Clock-out rejected');
      setPendingClockOuts(prev => prev.filter(r => r.id !== id));
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to reject');
    } finally {
      setActionLoading(null);
    }
  };

  const formatTime = (dateStr: string) =>
  new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  if (loading) return <div className="flex justify-center py-20"><LoadingSpinner /></div>;

  const statCards = [
    { label: 'Total Staff', value: staffCount, icon: UserGroupIcon, color: 'bg-emerald-50 text-emerald-700' },
    { label: 'Pending Approvals', value: (pendingClockIns.length + pendingClockOuts.length), icon: ClockIcon, color: 'bg-yellow-50 text-yellow-700' },
    { label: 'Active Today', value: summary?.approved ?? 0, icon: ClipboardDocumentCheckIcon, color: 'bg-blue-50 text-blue-700' },
    { label: 'Hours Worked', value: `${(summary?.totalHoursWorked ?? 0).toFixed(1)}h`, icon: CheckCircleIcon, color: 'bg-violet-50 text-violet-700' },
  ];

  return (
    <div className="space-y-6">
    {/* Header */}
      <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Branch Dashboard</h1>
      <p className="text-sm text-gray-500 mt-1">Today's overview and pending approvals</p>
    </div>

    {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${stat.color}`}>
              <Icon className="w-5 h-5" />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stat.value}</p>
            <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
          </div>
        );
        })}
      </div>

    <div className="grid lg:grid-cols-2 gap-6">
      {/* Pending Clock-Ins */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="p-5 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
          <h2 className="font-bold text-gray-900 dark:text-gray-100">Pending Clock-Ins</h2>
          <span className="w-6 h-6 bg-yellow-100 text-yellow-800 text-xs font-bold rounded-full flex items-center justify-center">
            {pendingClockIns.length}
            </span>
        </div>
        <div className="divide-y divide-gray-100 dark:divide-gray-700">
          {pendingClockIns.length === 0 ? (
              <p className="p-6 text-center text-gray-400 text-sm">No pending clock-ins</p>
          ) : (
              pendingClockIns.map((record) => (
                <div key={record.id} className="p-4 flex items-center justify-between gap-3">
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                    {record.staff.firstName} {record.staff.lastName}
                    </p>
                  <p className="text-xs text-gray-500">{record.staff.user.role.toLowerCase()} · {formatTime(record.clockInTime)}</p>
                </div>
                <div className="flex gap-2">
                  <button
                      onClick={() => approveClockIn(record.id)}
                      disabled={!!actionLoading}
                      className="p-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 rounded-lg transition-all disabled:opacity-50"
                      title="Approve"
                    >
                    <CheckCircleIcon className="w-4 h-4" />
                  </button>
                  <button
                      onClick={() => rejectClockIn(record.id)}
                      disabled={!!actionLoading}
                      className="p-1.5 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-all disabled:opacity-50"
                      title="Reject"
                    >
                    <XCircleIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
            )}
          </div>
      </div>

      {/* Pending Clock-Outs */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="p-5 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
          <h2 className="font-bold text-gray-900 dark:text-gray-100">Pending Clock-Outs</h2>
          <span className="w-6 h-6 bg-yellow-100 text-yellow-800 text-xs font-bold rounded-full flex items-center justify-center">
            {pendingClockOuts.length}
            </span>
        </div>
        <div className="divide-y divide-gray-100 dark:divide-gray-700">
          {pendingClockOuts.length === 0 ? (
              <p className="p-6 text-center text-gray-400 text-sm">No pending clock-outs</p>
          ) : (
              pendingClockOuts.map((record) => (
                <div key={record.id} className="p-4 flex items-center justify-between gap-3">
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                    {record.staff.firstName} {record.staff.lastName}
                    </p>
                  <p className="text-xs text-gray-500">
                    {record.staff.user.role.toLowerCase()} · out: {record.clockOutTime ? formatTime(record.clockOutTime) : '—'}
                    </p>
                </div>
                <div className="flex gap-2">
                  <button
                      onClick={() => approveClockOut(record.id)}
                      disabled={!!actionLoading}
                      className="p-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 rounded-lg transition-all disabled:opacity-50"
                      title="Approve"
                    >
                    <CheckCircleIcon className="w-4 h-4" />
                  </button>
                  <button
                      onClick={() => rejectClockOut(record.id)}
                      disabled={!!actionLoading}
                      className="p-1.5 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-all disabled:opacity-50"
                      title="Reject"
                    >
                    <XCircleIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
            )}
          </div>
      </div>
    </div>
  </div>
);
}