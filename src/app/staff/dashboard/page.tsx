'use client';

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { ClockIcon, CheckCircleIcon, ShoppingCartIcon } from '@heroicons/react/24/outline';

const NAVY = '#1E4D8C';
const TEAL = '#2D9B8A';

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
  branch: { name: string; pharmacy: { name: string } };
  status: string;
}

const STATUS_INFO: Record<string, { label: string; color: string; dot: string }> = {
  PENDING:     { label: 'Waiting for approval',          color: 'bg-yellow-50 text-yellow-700 border-yellow-200',  dot: 'bg-yellow-400'  },
  APPROVED:    { label: 'Active shift, clocked in',       color: 'bg-green-50 text-green-700 border-green-200',     dot: 'bg-green-400'   },
  CLOCKED_OUT: { label: 'Clock-out pending approval',     color: 'bg-orange-50 text-orange-700 border-orange-200', dot: 'bg-orange-400'  },
  COMPLETED:   { label: 'Shift completed',                color: 'bg-blue-50 text-blue-700 border-blue-200',        dot: 'bg-blue-400'    },
  REJECTED:    { label: 'Request rejected',               color: 'bg-red-50 text-red-700 border-red-200',           dot: 'bg-red-400'     },
};

export default function StaffDashboardPage() {
  const { t } = useTranslation();
  const [profile, setProfile] = useState<StaffProfile | null>(null);
  const [todayShift, setTodayShift] = useState<CurrentAttendance | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [profileRes, shiftRes] = await Promise.all([
        api.get('/staff/profile/me'),
        api.get('/attendance/my-current'),
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
      await api.post('/attendance/clock-in', {});
      toast.success(t('dashboard.clockInRequest'));
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to clock in');
    } finally { setActionLoading(false); }
  };

  const handleClockOut = async () => {
    setActionLoading(true);
    try {
      await api.post('/attendance/clock-out', {});
      toast.success(t('dashboard.clockOutRequest'));
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to clock out');
    } finally { setActionLoading(false); }
  };

  const formatTime = (d?: string) =>
    d ? new Date(d).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—';

  const now = new Date();
  const greeting = now.getHours() < 12 ? 'Good morning' : now.getHours() < 17 ? 'Good afternoon' : 'Good evening';

  if (loading) return <div className="flex justify-center py-20"><LoadingSpinner /></div>;

  const shiftInfo = todayShift ? STATUS_INFO[todayShift.status] : null;

  return (
    <div className="max-w-2xl mx-auto space-y-6">

      {/* Hero banner — navy/teal palette matching pharmacy owner */}
      <div className="rounded-2xl p-6 text-white" style={{ backgroundColor: NAVY }}>
        <p className="text-white/70 text-sm">{greeting},</p>
        <h1 className="text-2xl font-bold mt-1">
          {profile ? `${profile.firstName} ${profile.lastName}` : 'Staff'}
        </h1>
        {profile && (
          <div className="flex items-center gap-2 mt-3 text-white/70 text-sm flex-wrap">
            <span>{profile.branch.name}</span>
            <span>·</span>
            <span>{profile.branch.pharmacy.name}</span>
            <span>·</span>
            <span className="capitalize">{profile.user.role.toLowerCase()}</span>
          </div>
        )}
      </div>

      {/* Today's Shift */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
        <h2 className="font-bold text-gray-900 dark:text-gray-100 mb-4">{t('dashboard.todayShift')}</h2>

        {!todayShift ? (
          <div className="text-center py-6">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: '#F0F7F6' }}>
              <ClockIcon className="w-8 h-8" style={{ color: TEAL }} />
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-1">{t('dashboard.notClockedIn')}</p>
            <p className="text-gray-400 text-sm mb-6">{t('dashboard.clickToStart')}</p>
            <button
              onClick={handleClockIn}
              disabled={actionLoading}
              className="text-white px-8 py-3 rounded-xl font-semibold transition-all disabled:opacity-50 flex items-center gap-2 mx-auto"
              style={{ backgroundColor: TEAL }}
            >
              {actionLoading
                ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                : <ClockIcon className="w-5 h-5" />}
              Clock In
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {shiftInfo && (
              <div className={`flex items-center gap-2 px-4 py-3 rounded-xl border ${shiftInfo.color}`}>
                <span className={`w-3 h-3 rounded-full shrink-0 ${shiftInfo.dot}`} />
                <span className="font-medium text-sm">{shiftInfo.label}</span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
                <p className="text-xs text-gray-500 mb-1">{t('staff.clockIn')}</p>
                <p className="text-xl font-bold text-gray-900 dark:text-gray-100">{formatTime(todayShift.clockInTime)}</p>
                {todayShift.clockInApprover && (
                  <p className="text-xs mt-1" style={{ color: TEAL }}>
                    Approved by {todayShift.clockInApprover.firstName}
                  </p>
                )}
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
                <p className="text-xs text-gray-500 mb-1">{t('staff.clockOut')}</p>
                <p className="text-xl font-bold text-gray-900 dark:text-gray-100">{formatTime(todayShift.clockOutTime)}</p>
                {todayShift.totalHours && (
                  <p className="text-xs text-blue-600 mt-1">{todayShift.totalHours.toFixed(1)} hours worked</p>
                )}
              </div>
            </div>

            {todayShift.status === 'REJECTED' && todayShift.rejectionReason && (
              <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3">
                <p className="text-xs text-red-600 font-medium">Rejection reason: {todayShift.rejectionReason}</p>
              </div>
            )}

            {todayShift.status === 'APPROVED' && (
              <button
                onClick={handleClockOut}
                disabled={actionLoading}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-xl font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {actionLoading
                  ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  : <ClockIcon className="w-5 h-5" />}
                Clock Out
              </button>
            )}

            {todayShift.status === 'REJECTED' && (
              <button
                onClick={handleClockIn}
                disabled={actionLoading}
                className="w-full text-white py-3 rounded-xl font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                style={{ backgroundColor: TEAL }}
              >
                {actionLoading
                  ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  : <ClockIcon className="w-5 h-5" />}
                Try Again
              </button>
            )}
          </div>
        )}
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-3 gap-4">
        <a href="/staff/orders"
          className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all">
          <ShoppingCartIcon className="w-6 h-6 mb-2" style={{ color: TEAL }} />
          <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm">{t('staff.orders')}</p>
          <p className="text-xs text-gray-500 mt-1">{t('dashboard.viewBranchOrders')}</p>
        </a>
        <a href="/staff/attendance"
          className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all">
          <ClockIcon className="w-6 h-6 mb-2" style={{ color: TEAL }} />
          <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm">{t('staff.attendance')}</p>
          <p className="text-xs text-gray-500 mt-1">{t('dashboard.viewAllRecords')}</p>
        </a>
        <a href="/staff/profile"
          className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all">
          <CheckCircleIcon className="w-6 h-6 mb-2" style={{ color: TEAL }} />
          <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm">{t('staff.profile')}</p>
          <p className="text-xs text-gray-500 mt-1">{t('dashboard.viewYourDetails')}</p>
        </a>
      </div>
    </div>
  );
}
