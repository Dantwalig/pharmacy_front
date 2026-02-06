// frontend/src/app/pharmacy/analytics/page.tsx

'use client';

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import api from '@/lib/api';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import PharmacyTopbar from '@/components/pharmacy/PharmacyTopbar';
import PharmacySidebar from '@/components/pharmacy/PharmacySidebar';
import SupportBot from '@/components/pharmacy/SupportBot';
import { 
  CurrencyDollarIcon, 
  ShoppingCartIcon, 
  ArrowTrendingUpIcon, 
  CubeIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

export default function PharmacyAnalyticsPage() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    avgOrderValue: 0,
    itemsSold: 0,
    revenueChange: 0,
    ordersChange: 0,
    avgValueChange: 0,
    itemsChange: 0,
  });

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const res = await api.get('/pharmacies/analytics');
      setStats(res.data);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatChange = (change: number) => {
    if (change > 0) return `+${change}%`;
    if (change < 0) return `${change}%`;
    return '0%';
  };

  const getChangeColor = (change: number) => {
    if (change > 0) return 'text-green-600';
    if (change < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <PharmacySidebar />
      <SupportBot />

      <div className="flex-1 flex flex-col lg:ml-72">
        <PharmacyTopbar />

        <main className="flex-1 p-4 lg:p-8 overflow-auto">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="bg-linear-to-r from-[#1E4D8C] via-[#2563a8] to-[#1a3d6f] rounded-2xl shadow-lg p-6 lg:p-8 text-white">
              <h1 className="text-2xl lg:text-3xl font-bold mb-2">
                Analytics
              </h1>
              <p className="text-blue-100 text-sm lg:text-base">
                Track your pharmacy's performance this month
              </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Total Revenue */}
              <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center">
                    <CurrencyDollarIcon className="w-6 h-6 text-teal-600" />
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
                <p className="text-3xl font-bold text-gray-900 mb-2">
                  {stats.totalRevenue.toLocaleString()} RWF
                </p>
                <p className={`text-sm font-medium ${getChangeColor(stats.revenueChange)}`}>
                  {formatChange(stats.revenueChange)} from last month
                </p>
              </div>

              {/* Total Orders */}
              <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <ShoppingCartIcon className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-1">Total Orders</p>
                <p className="text-3xl font-bold text-gray-900 mb-2">{stats.totalOrders}</p>
                <p className={`text-sm font-medium ${getChangeColor(stats.ordersChange)}`}>
                  {formatChange(stats.ordersChange)} from last month
                </p>
              </div>

              {/* Avg Order Value */}
              <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <ArrowTrendingUpIcon className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-1">Avg. Order Value</p>
                <p className="text-3xl font-bold text-gray-900 mb-2">
                  {stats.avgOrderValue.toLocaleString()} RWF
                </p>
                <p className={`text-sm font-medium ${getChangeColor(stats.avgValueChange)}`}>
                  {formatChange(stats.avgValueChange)} from last month
                </p>
              </div>

              {/* Items Sold */}
              <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <CubeIcon className="w-6 h-6 text-green-600" />
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-1">Items Sold</p>
                <p className="text-3xl font-bold text-gray-900 mb-2">{stats.itemsSold}</p>
                <p className={`text-sm font-medium ${getChangeColor(stats.itemsChange)}`}>
                  {formatChange(stats.itemsChange)} from last month
                </p>
              </div>
            </div>

            {/* Performance Summary */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Monthly Performance</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm text-gray-600">Revenue Growth</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stats.totalRevenue.toLocaleString()} RWF
                    </p>
                  </div>
                  <div className={`text-right ${getChangeColor(stats.revenueChange)}`}>
                    <p className="text-2xl font-bold">{formatChange(stats.revenueChange)}</p>
                    <p className="text-sm">vs last month</p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm text-gray-600">Order Growth</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalOrders} orders</p>
                  </div>
                  <div className={`text-right ${getChangeColor(stats.ordersChange)}`}>
                    <p className="text-2xl font-bold">{formatChange(stats.ordersChange)}</p>
                    <p className="text-sm">vs last month</p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm text-gray-600">Customer Value</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stats.avgOrderValue.toLocaleString()} RWF
                    </p>
                  </div>
                  <div className={`text-right ${getChangeColor(stats.avgValueChange)}`}>
                    <p className="text-2xl font-bold">{formatChange(stats.avgValueChange)}</p>
                    <p className="text-sm">avg per order</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Charts Placeholder */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-6">
              {/* Revenue Overview */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Revenue Overview</h2>
                <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <ChartBarIcon className="w-16 h-16 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500">Charts coming soon</p>
                  </div>
                </div>
              </div>

              {/* Order Trends */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Order Trends</h2>
                <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <ArrowTrendingUpIcon className="w-16 h-16 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500">Charts coming soon</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}