// frontend/src/app/staff/dashboard/page.tsx

'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { ClockIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';

interface CurrentAttendance {
  id: string;
  status: 'PENDING' | 'APPROVED' | 'CLOCKED_OUT' | 'COMPLETED' | 'REJECTED';
  clockInTime: string;
  clockOutTime?: string;
  totalHours?: number;
  clockInApprover?: { firstName: string; lastName: string };
  rejectionReason?: string;
}

interface StaffProfile {
  firstName: string;
  lastName: string;
  user: { email: string; role: string };
  branch: {
    name: string;
    pharmacy: { name: string };
  };
  status: string;
}

const STATUS_INFO: Record<string, { label: string; color: string; icon: string }> = {
  PENDING:     { label: 'Waiting for approval', color: 'bg-yellow-50 text-yellow-700 border-yellow-200', icon: '⏳' },
  APPROVED:    { label: 'Active shift — clocked in', color: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: '✅' },
  CLOCKED_OUT: { label: 'Clock-out pending approval', color: 'bg-orange-50 text-orange-700 border-orange-200', icon: '🔄' },
  COMPLETED:   { label: 'Shift completed', color: 'bg-blue-50 text-blue-700 border-blue-200', icon: '🏁' },
  REJECTED:    { label: 'Request rejected', color: 'bg-red-50 text-red-700 border-red-200', icon: '❌' },
};

export default function StaffDashboardPage() {
  const [profile, setProfile] = useState<StaffProfile | null>(null);
  const [todayShift, setTodayShift] = useState<CurrentAttendance | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [profileRes, shiftRes] = await Promise.all([
        api.get('/staff/profile/me'),    // GET /staff/profile/me
        api.get('/attendance/my-current'), // GET /attendance/my-current
      ]);
      setProfile(profileRes.data);
      setTodayShift(shiftRes.data);
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClockIn = async () => {
    setActionLoading(true);
    try {
      await api.post('/attendance/clock-in', {}); // POST /attendance/clock-in
      toast.success('Clock-in request submitted! Waiting for manager approval.');
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to clock in');
    } finally {
      setActionLoading(false);
    }
  };

  const handleClockOut = async () => {
    setActionLoading(true);
    try {
      await api.post('/attendance/clock-out', {}); // POST /attendance/clock-out
      toast.success('Clock-out request submitted! Waiting for manager approval.');
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to clock out');
    } finally {
      setActionLoading(false);
    }
  };

  const formatTime = (dateStr?: string) =>
    dateStr ? new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—';

  const now = new Date();
  const greeting = now.getHours() < 12 ? 'Good morning' : now.getHours() < 17 ? 'Good afternoon' : 'Good evening';

  if (loading) return <div className="flex justify-center py-20"><LoadingSpinner /></div>;

  const shiftInfo = todayShift ? STATUS_INFO[todayShift.status] : null;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Greeting */}
      <div className="bg-linear-to-r from-violet-600 to-violet-800 rounded-2xl p-6 text-white">
        <p className="text-violet-200 text-sm">{greeting},</p>
        <h1 className="text-2xl font-bold mt-1">
          {profile ? `${profile.firstName} ${profile.lastName}` : 'Staff'}
        </h1>
        {profile && (
          <div className="flex items-center gap-2 mt-3 text-violet-200 text-sm">
            <span>{profile.branch.name}</span>
            <span>·</span>
            <span>{profile.branch.pharmacy.name}</span>
            <span>·</span>
            <span className="capitalize">{profile.user.role.toLowerCase()}</span>
          </div>
        )}
      </div>

      {/* Today's Shift Status */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
        <h2 className="font-bold text-gray-900 dark:text-gray-100 mb-4">Today's Shift</h2>

        {!todayShift ? (
          // No shift yet - show clock in button
          <div className="text-center py-6">
            <div className="w-16 h-16 bg-violet-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <ClockIcon className="w-8 h-8 text-violet-500" />
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-1">You haven't clocked in today</p>
            <p className="text-gray-400 text-sm mb-6">Click below to start your shift</p>
            <button
              onClick={handleClockIn}
              disabled={actionLoading}
              className="bg-violet-600 hover:bg-violet-700 text-white px-8 py-3 rounded-xl font-semibold transition-all disabled:opacity-50 flex items-center gap-2 mx-auto"
            >
              {actionLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <ClockIcon className="w-5 h-5" />
              )}
              Clock In
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Status badge */}
            {shiftInfo && (
              <div className={`flex items-center gap-2 px-4 py-3 rounded-xl border ${shiftInfo.color}`}>
                <span className="text-xl">{shiftInfo.icon}</span>
                <span className="font-medium text-sm">{shiftInfo.label}</span>
              </div>
            )}

            {/* Times */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
                <p className="text-xs text-gray-500 mb-1">Clock In</p>
                <p className="text-xl font-bold text-gray-900 dark:text-gray-100">{formatTime(todayShift.clockInTime)}</p>
                {todayShift.clockInApprover && (
                  <p className="text-xs text-emerald-600 mt-1">
                    ✓ Approved by {todayShift.clockInApprover.firstName}
                  </p>
                )}
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
                <p className="text-xs text-gray-500 mb-1">Clock Out</p>
                <p className="text-xl font-bold text-gray-900 dark:text-gray-100">{formatTime(todayShift.clockOutTime)}</p>
                {todayShift.totalHours && (
                  <p className="text-xs text-blue-600 mt-1">
                    {todayShift.totalHours.toFixed(1)} hours worked
                  </p>
                )}
              </div>
            </div>

            {/* Rejection reason */}
            {todayShift.status === 'REJECTED' && todayShift.rejectionReason && (
              <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3">
                <p className="text-xs text-red-600 font-medium">Rejection reason: {todayShift.rejectionReason}</p>
              </div>
            )}

            {/* Clock out button if currently approved */}
            {todayShift.status === 'APPROVED' && (
              <button
                onClick={handleClockOut}
                disabled={actionLoading}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-xl font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {actionLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <ClockIcon className="w-5 h-5" />
                )}
                Clock Out
              </button>
            )}

            {/* Clock in again if rejected */}
            {todayShift.status === 'REJECTED' && (
              <button
                onClick={handleClockIn}
                disabled={actionLoading}
                className="w-full bg-violet-600 hover:bg-violet-700 text-white py-3 rounded-xl font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {actionLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <ClockIcon className="w-5 h-5" />
                )}
                Try Again
              </button>
            )}
          </div>
        )}
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-2 gap-4">
        <a href="/staff/attendance" className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all group">
          <ClockIcon className="w-6 h-6 text-violet-500 mb-2" />
          <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm group-hover:text-violet-600">Attendance History</p>
          <p className="text-xs text-gray-500 mt-1">View all your records</p>
        </a>
        <a href="/staff/profile" className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all group">
          <CheckCircleIcon className="w-6 h-6 text-violet-500 mb-2" />
          <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm group-hover:text-violet-600">My Profile</p>
          <p className="text-xs text-gray-500 mt-1">View your details</p>
        </a>
      </div>
    </div>
  );
}