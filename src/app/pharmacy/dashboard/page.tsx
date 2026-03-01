// frontend/src/app/pharmacy/dashboard/page.tsx

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { 
  BuildingStorefrontIcon, 
  UserGroupIcon, 
  CurrencyDollarIcon, 
  BanknotesIcon,
} from '@heroicons/react/24/outline';

export default function PharmacyOwnerDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalBranches: 0,
    totalEmployees: 0,
    monthlyRevenue: 0,
    totalRevenue: 0,
  });

  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [branchAlerts, setBranchAlerts] = useState<any[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Correct endpoint: GET /pharmacies/dashboard/stats
      const res = await api.get('/pharmacies/dashboard/stats');
      setStats(res.data.stats || res.data || stats);
      setRecentActivity(res.data.recentActivity || []);
      setBranchAlerts(res.data.branchAlerts || []);
    } catch (error) {
      console.error('Failed to fetch dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-linear-to-r from-[#1E4D8C] via-[#2563a8] to-[#1a3d6f] rounded-2xl shadow-lg p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">Owner Overview</h1>
        <p className="text-blue-100 text-base">Enterprise-level insights across all branches</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Branches */}
        <div className="bg-[#2D5F8D] text-white p-6 rounded-xl shadow-md">
          <div className="flex items-center justify-between mb-4">
            <BuildingStorefrontIcon className="w-10 h-10" />
            <span className="text-5xl font-bold">{stats.totalBranches}</span>
          </div>
          <p className="text-sm font-medium">Total Branches</p>
        </div>

        {/* Total Employees */}
        <div className="bg-teal-500 text-white p-6 rounded-xl shadow-md">
          <div className="flex items-center justify-between mb-4">
            <UserGroupIcon className="w-10 h-10" />
            <span className="text-5xl font-bold">{stats.totalEmployees}</span>
          </div>
          <p className="text-sm font-medium">Total Employees</p>
        </div>

        {/* Monthly Revenue */}
        <div className="bg-teal-500 text-white p-6 rounded-xl shadow-md">
          <div className="flex items-center justify-between mb-4">
            <CurrencyDollarIcon className="w-10 h-10" />
            <div className="text-right">
              <span className="text-4xl font-bold">
                {stats.monthlyRevenue >= 1000000
                  ? `${(stats.monthlyRevenue / 1000000).toFixed(1)}M`
                  : stats.monthlyRevenue.toLocaleString()}
              </span>
              <p className="text-sm opacity-90">RWF</p>
            </div>
          </div>
          <p className="text-sm font-medium">Monthly Revenue</p>
        </div>

        {/* Total Revenue */}
        <div className="bg-[#2D5F8D] text-white p-6 rounded-xl shadow-md">
          <div className="flex items-center justify-between mb-4">
            <BanknotesIcon className="w-10 h-10" />
            <div className="text-right">
              <span className="text-4xl font-bold">
                {stats.totalRevenue >= 1000000
                  ? `${(stats.totalRevenue / 1000000).toFixed(1)}M`
                  : stats.totalRevenue.toLocaleString()}
              </span>
              <p className="text-sm opacity-90">RWF</p>
            </div>
          </div>
          <p className="text-sm font-medium">Total Revenue</p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Branch Revenue Growth */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Monthly Branch Revenue Growth</h2>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            <p className="text-gray-400 text-sm">Chart: Line graph showing revenue trends</p>
          </div>
        </div>

        {/* Revenue by Branch */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Revenue by Branch</h2>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            <p className="text-gray-400 text-sm">Chart: Bar chart comparing branches</p>
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Inventory Distribution */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Inventory Distribution by Branch</h2>
          <div className="h-48 flex items-center justify-center bg-gray-50 rounded-lg">
            <p className="text-gray-400 text-sm">Chart: Donut chart</p>
          </div>
        </div>

        {/* Recent Manager Activity */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Recent Manager Activity</h2>
          {recentActivity.length > 0 ? (
            <div className="space-y-3">
              {recentActivity.map((activity: any) => (
                <div key={activity.id} className="flex items-start gap-3 pb-3 border-b border-gray-100 last:border-0">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-sm shrink-0">
                    {activity.manager?.split(' ').map((n: string) => n[0]).join('')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900">
                      {activity.manager} <span className="font-normal text-gray-600">— {activity.action}</span>
                    </p>
                    <p className="text-xs text-gray-500">{activity.branch} · {activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-24 text-gray-400 text-sm">
              No recent activity
            </div>
          )}
        </div>

        {/* Branch Alerts */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Branch Alerts</h2>
          {branchAlerts.length > 0 ? (
            <div className="space-y-3">
              {branchAlerts.map((alert: any) => (
                <div key={alert.id} className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <span className="px-2 py-0.5 bg-yellow-500 text-white text-xs font-bold rounded">Warning</span>
                  </div>
                  <p className="font-semibold text-gray-900 mt-2 text-sm">{alert.branch}</p>
                  <p className="text-sm text-gray-600 mt-1">{alert.message}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-24 text-gray-400 text-sm">
              No alerts
            </div>
          )}
        </div>
      </div>
    </div>
  );
}