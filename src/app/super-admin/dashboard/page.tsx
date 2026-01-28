// frontend/src/app/super-admin/dashboard/page.tsx

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import SuperAdminTopbar from '@/components/super-admin/SuperAdminTopbar';
import SuperAdminSidebar from '@/components/super-admin/SuperAdminSidebar';
import {
  BuildingStorefrontIcon,
  UserGroupIcon,
  ShoppingCartIcon,
  CurrencyDollarIcon,
  ClockIcon,
  CheckCircleIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';

interface Analytics {
  totalPatients: number;
  totalPharmacies: number;
  approvedPharmacies: number;
  pendingPharmacies: number;
  totalOrders: number;
  completedOrders: number;
  totalRevenue: number;
  platformRevenue: number;
  platformFeePerPharmacy: number;
}

export default function SuperAdminDashboard() {
  const { t } = useTranslation();
  const router = useRouter();
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [pendingPharmacies, setPendingPharmacies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [analyticsRes, pendingRes] = await Promise.all([
        api.get('/super-admin/analytics'),
        api.get('/super-admin/pharmacies/pending'),
      ]);
      
      setAnalytics(analyticsRes.data);
      setPendingPharmacies(pendingRes.data);
    } catch (error: any) {
      console.error('Failed to fetch dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <LoadingSpinner />
      </div>
    );
  }

  const stats = [
    {
      name: t('superAdmin.totalPharmacies'),
      value: analytics?.totalPharmacies || 0,
      icon: BuildingStorefrontIcon,
      color: 'bg-gradient-to-br from-purple-500 to-purple-600',
      textColor: 'text-purple-600',
      bgColor: 'bg-purple-100 dark:bg-purple-900/30',
    },
    {
      name: t('superAdmin.pendingPharmacies'),
      value: analytics?.pendingPharmacies || 0,
      icon: ClockIcon,
      color: 'bg-gradient-to-br from-yellow-500 to-yellow-600',
      textColor: 'text-yellow-600',
      bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
      action: () => router.push('/super-admin/pharmacies?filter=pending'),
    },
    {
      name: t('superAdmin.totalPatients'),
      value: analytics?.totalPatients || 0,
      icon: UserGroupIcon,
      color: 'bg-gradient-to-br from-blue-500 to-blue-600',
      textColor: 'text-blue-600',
      bgColor: 'bg-blue-100 dark:bg-blue-900/30',
    },
    {
      name: t('superAdmin.platformRevenue'),
      value: `$${analytics?.platformRevenue?.toLocaleString() || 0}`,
      icon: CurrencyDollarIcon,
      color: 'bg-gradient-to-br from-green-500 to-green-600',
      textColor: 'text-green-600',
      bgColor: 'bg-green-100 dark:bg-green-900/30',
    },
  ];

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
            <div>
              <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-3">
                👑 {t('superAdmin.title')}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Welcome back, Super Admin! Here's what's happening today.
              </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat) => {
                const Icon = stat.icon;
                return (
                  <div
                    key={stat.name}
                    onClick={stat.action}
                    className={`bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 transition-all transform hover:scale-105 hover:shadow-xl ${
                      stat.action ? 'cursor-pointer' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className={`${stat.bgColor} p-3 rounded-xl`}>
                        <Icon className={`w-6 h-6 ${stat.textColor}`} />
                      </div>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                      {stat.value}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{stat.name}</p>
                  </div>
                );
              })}
            </div>

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Pending Pharmacies */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                    ⏳ {t('superAdmin.pendingPharmacies')}
                  </h2>
                  <button
                    onClick={() => router.push('/super-admin/pharmacies?filter=pending')}
                    className="text-sm text-purple-600 dark:text-purple-400 hover:underline font-medium"
                  >
                    {t('superAdmin.viewAll')}
                  </button>
                </div>

                {pendingPharmacies.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-6xl mb-4">✅</p>
                    <p className="text-gray-500 dark:text-gray-400">
                      No pending applications
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {pendingPharmacies.slice(0, 5).map((pharmacy) => (
                      <div
                        key={pharmacy.id}
                        onClick={() => router.push('/super-admin/pharmacies?filter=pending')}
                        className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-linear-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center text-white font-bold">
                            {pharmacy.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-gray-100">
                              {pharmacy.name}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {pharmacy.user.email}
                            </p>
                          </div>
                        </div>
                        <span className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded-full text-xs font-semibold">
                          Pending
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Quick Stats */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6 flex items-center gap-2">
                  📊 Platform Overview
                </h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                    <div className="flex items-center gap-3">
                      <CheckCircleIcon className="w-6 h-6 text-green-500" />
                      <span className="text-gray-700 dark:text-gray-300">
                        Approved Pharmacies
                      </span>
                    </div>
                    <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      {analytics?.approvedPharmacies || 0}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                    <div className="flex items-center gap-3">
                      <ShoppingCartIcon className="w-6 h-6 text-blue-500" />
                      <span className="text-gray-700 dark:text-gray-300">
                        Total Orders
                      </span>
                    </div>
                    <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      {analytics?.totalOrders || 0}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                    <div className="flex items-center gap-3">
                      <CheckCircleIcon className="w-6 h-6 text-purple-500" />
                      <span className="text-gray-700 dark:text-gray-300">
                        Completed Orders
                      </span>
                    </div>
                    <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      {analytics?.completedOrders || 0}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-linear-to-r from-green-500 to-emerald-500 rounded-xl text-white">
                    <div className="flex items-center gap-3">
                      <CurrencyDollarIcon className="w-6 h-6" />
                      <span>Total Revenue</span>
                    </div>
                    <span className="text-2xl font-bold">
                      ${analytics?.totalRevenue?.toLocaleString() || 0}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* System Status */}
            <div className="bg-linear-to-r from-green-500 to-emerald-500 rounded-2xl shadow-lg p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                    <CheckCircleIcon className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">{t('superAdmin.systemStatus')}</h3>
                    <p className="text-green-100">{t('superAdmin.allSystemsOperational')}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium">Live</span>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}