// frontend/src/app/super-admin/dashboard/page.tsx

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import api from '@/lib/api';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import SuperAdminTopbar from '@/components/super-admin/SuperAdminTopbar';
import SuperAdminSidebar from '@/components/super-admin/SuperAdminSidebar';
import {
  BuildingStorefrontIcon,
  UserGroupIcon,
  ShoppingBagIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';

export default function SuperAdminDashboard() {
  const { t } = useTranslation();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [graphFilter, setGraphFilter] = useState<'all' | 'approved' | 'pending' | 'rejected'>('all');
  const [stats, setStats] = useState({
    totalPharmacies: 0,
    pendingPharmacies: 0,
    approvedPharmacies: 0,
    rejectedPharmacies: 0,
    totalPatients: 0,
    totalOrders: 0,
    platformRevenue: 0,
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await api.get('/super-admin/stats');
      setStats({
        totalPharmacies: res.data.totalPharmacies || 0,
        pendingPharmacies: res.data.pendingPharmacies || 0,
        approvedPharmacies: res.data.approvedPharmacies || 0,
        rejectedPharmacies: res.data.rejectedPharmacies || 0,
        totalPatients: res.data.totalPatients || 0,
        totalOrders: res.data.totalOrders || 0,
        platformRevenue: res.data.platformRevenue || 0,
      });
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const getGraphData = () => {
    switch (graphFilter) {
      case 'approved':
        return [
          { name: t('superAdmin.approved'), value: stats.approvedPharmacies, color: 'bg-green-500', textColor: 'text-green-700 dark:text-green-400' }
        ];
      case 'pending':
        return [
          { name: t('superAdmin.pending'), value: stats.pendingPharmacies, color: 'bg-yellow-500', textColor: 'text-yellow-700 dark:text-yellow-400' }
        ];
      case 'rejected':
        return [
          { name: t('superAdmin.rejected'), value: stats.rejectedPharmacies, color: 'bg-red-500', textColor: 'text-red-700 dark:text-red-400' }
        ];
      default:
        return [
          { name: t('superAdmin.approved'), value: stats.approvedPharmacies, color: 'bg-green-500', textColor: 'text-green-700 dark:text-green-400' },
          { name: t('superAdmin.pending'), value: stats.pendingPharmacies, color: 'bg-yellow-500', textColor: 'text-yellow-700 dark:text-yellow-400' },
          { name: t('superAdmin.rejected'), value: stats.rejectedPharmacies, color: 'bg-red-500', textColor: 'text-red-700 dark:text-red-400' },
        ];
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  const graphData = getGraphData();
  const maxValue = Math.max(...graphData.map(d => d.value), 1);

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <SuperAdminSidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Topbar */}
        <SuperAdminTopbar />

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-auto">
          <div className="space-y-6">
            {/* Header */}
            <div className="bg-linear-to-r from-purple-600 to-indigo-600 rounded-2xl shadow-xl p-8 text-white">
              <h1 className="text-3xl sm:text-4xl font-bold mb-2">
                {t('superAdmin.dashboard')} 👑
              </h1>
              <p className="text-purple-100 text-lg">{t('superAdmin.title')}</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-linear-to-br from-purple-500 to-purple-600 text-white p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all transform hover:scale-105">
                <div className="flex items-center justify-between mb-3">
                  <BuildingStorefrontIcon className="w-10 h-10 opacity-80" />
                  <span className="text-4xl font-bold">{stats.totalPharmacies}</span>
                </div>
                <p className="text-sm opacity-90 font-medium">{t('superAdmin.totalPharmacies')}</p>
              </div>

              <div className="bg-linear-to-br from-yellow-500 to-yellow-600 text-white p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all transform hover:scale-105">
                <div className="flex items-center justify-between mb-3">
                  <BuildingStorefrontIcon className="w-10 h-10 opacity-80" />
                  <span className="text-4xl font-bold">{stats.pendingPharmacies}</span>
                </div>
                <p className="text-sm opacity-90 font-medium">{t('superAdmin.pendingPharmacies')}</p>
              </div>

              <div className="bg-linear-to-br from-blue-500 to-blue-600 text-white p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all transform hover:scale-105">
                <div className="flex items-center justify-between mb-3">
                  <UserGroupIcon className="w-10 h-10 opacity-80" />
                  <span className="text-4xl font-bold">{stats.totalPatients}</span>
                </div>
                <p className="text-sm opacity-90 font-medium">{t('superAdmin.totalPatients')}</p>
              </div>

              <div className="bg-linear-to-br from-green-500 to-green-600 text-white p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all transform hover:scale-105">
                <div className="flex items-center justify-between mb-3">
                  <CurrencyDollarIcon className="w-10 h-10 opacity-80" />
                  <span className="text-4xl font-bold">{(stats.platformRevenue / 1000).toFixed(1)}K</span>
                </div>
                <p className="text-sm opacity-90 font-medium">{t('superAdmin.platformRevenue')} (RWF)</p>
              </div>
            </div>

            {/* Graph Section */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div className="flex items-center gap-3">
                  <ChartBarIcon className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                    {t('superAdmin.analytics')}
                  </h2>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setGraphFilter('all')}
                    className={`px-4 py-2 rounded-lg font-medium transition-all transform hover:scale-105 ${
                      graphFilter === 'all'
                        ? 'bg-purple-600 text-white shadow-lg'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                    }`}
                  >
                    {t('superAdmin.all')}
                  </button>
                  <button
                    onClick={() => setGraphFilter('approved')}
                    className={`px-4 py-2 rounded-lg font-medium transition-all transform hover:scale-105 ${
                      graphFilter === 'approved'
                        ? 'bg-green-600 text-white shadow-lg'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                    }`}
                  >
                    {t('superAdmin.approved')}
                  </button>
                  <button
                    onClick={() => setGraphFilter('pending')}
                    className={`px-4 py-2 rounded-lg font-medium transition-all transform hover:scale-105 ${
                      graphFilter === 'pending'
                        ? 'bg-yellow-600 text-white shadow-lg'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                    }`}
                  >
                    {t('superAdmin.pending')}
                  </button>
                  <button
                    onClick={() => setGraphFilter('rejected')}
                    className={`px-4 py-2 rounded-lg font-medium transition-all transform hover:scale-105 ${
                      graphFilter === 'rejected'
                        ? 'bg-red-600 text-white shadow-lg'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                    }`}
                  >
                    {t('superAdmin.rejected')}
                  </button>
                </div>
              </div>

              {/* Bar Chart */}
              <div className="space-y-6">
                {graphData.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-4">
                    <div className={`w-32 text-sm font-bold ${item.textColor}`}>
                      {item.name}
                    </div>
                    <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-10 overflow-hidden shadow-inner">
                      <div
                        className={`${item.color} h-full rounded-full flex items-center justify-end pr-6 text-white font-bold text-sm transition-all duration-700 ease-out shadow-lg`}
                        style={{ width: `${maxValue > 0 ? (item.value / maxValue) * 100 : 0}%`, minWidth: item.value > 0 ? '60px' : '0' }}
                      >
                        {item.value}
                      </div>
                    </div>
                    <div className="w-24 text-right">
                      <span className={`text-sm font-bold ${item.textColor}`}>
                        {stats.totalPharmacies > 0 ? ((item.value / stats.totalPharmacies) * 100).toFixed(1) : 0}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Summary Stats */}
              <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">{stats.totalPharmacies}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{t('superAdmin.totalPharmacies')}</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.approvedPharmacies}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{t('superAdmin.approved')}</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{stats.pendingPharmacies}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{t('superAdmin.pending')}</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.rejectedPharmacies}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{t('superAdmin.rejected')}</p>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <button
                onClick={() => router.push('/super-admin/pharmacies?filter=pending')}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all transform hover:scale-105 p-6 text-left"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 bg-yellow-100 dark:bg-yellow-900/30 rounded-xl flex items-center justify-center">
                    <BuildingStorefrontIcon className="w-7 h-7 text-yellow-600 dark:text-yellow-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800 dark:text-gray-100 text-lg">
                      {t('superAdmin.pendingPharmacies')}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {stats.pendingPharmacies} {t('superAdmin.pending').toLowerCase()}
                    </p>
                  </div>
                </div>
                <p className="text-purple-600 dark:text-purple-400 font-semibold">
                  {t('common.viewDetails')} →
                </p>
              </button>

              <button
                onClick={() => router.push('/super-admin/pharmacies?filter=approved')}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all transform hover:scale-105 p-6 text-left"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                    <ShoppingBagIcon className="w-7 h-7 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800 dark:text-gray-100 text-lg">
                      {t('superAdmin.approved')}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {t('superAdmin.viewAll')} {stats.approvedPharmacies}
                    </p>
                  </div>
                </div>
                <p className="text-purple-600 dark:text-purple-400 font-semibold">
                  {t('common.viewDetails')} →
                </p>
              </button>

              <button
                onClick={() => router.push('/super-admin/pharmacies')}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all transform hover:scale-105 p-6 text-left"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
                    <BuildingStorefrontIcon className="w-7 h-7 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800 dark:text-gray-100 text-lg">
                      {t('superAdmin.pharmacyManagement')}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {t('superAdmin.viewAll')}
                    </p>
                  </div>
                </div>
                <p className="text-purple-600 dark:text-purple-400 font-semibold">
                  {t('common.viewAll')} →
                </p>
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}