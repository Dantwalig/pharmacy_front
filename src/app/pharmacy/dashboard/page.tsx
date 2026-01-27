// frontend/src/app/pharmacy/dashboard/page.tsx

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import api from '@/lib/api';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import PharmacyTopbar from '@/components/pharmacy/PharmacyTopbar';
import PharmacySidebar from '@/components/pharmacy/PharmacySidebar';
import { ShoppingBagIcon, CurrencyDollarIcon, ClockIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

export default function PharmacyDashboard() {
  const { t } = useTranslation();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    todayOrders: 0,
    pendingOrders: 0,
    todayRevenue: 0,
    lowStockItems: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [lowStockMeds, setLowStockMeds] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, ordersRes, inventoryRes] = await Promise.all([
        api.get('/pharmacies/stats'),
        api.get('/orders?status=PENDING&limit=5'),
        api.get('/medications?lowStock=true&limit=5'),
      ]);

      setStats(statsRes.data);
      setRecentOrders(ordersRes.data);
      setLowStockMeds(inventoryRes.data);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
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
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <PharmacySidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Topbar */}
        <PharmacyTopbar />

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-auto">
          <div className="space-y-6">
            {/* Header */}
            <div className="bg-linear-to-r from-purple-600 to-indigo-600 rounded-2xl shadow-xl p-8 text-white">
              <h1 className="text-3xl sm:text-4xl font-bold mb-2">
                {t('pharmacy.dashboard')} 💊
              </h1>
              <p className="text-purple-100 text-lg">Welcome back to your pharmacy management</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-linear-to-br from-blue-500 to-blue-600 text-white p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all transform hover:scale-105">
                <div className="flex items-center justify-between mb-3">
                  <ShoppingBagIcon className="w-10 h-10 opacity-80" />
                  <span className="text-4xl font-bold">{stats.todayOrders}</span>
                </div>
                <p className="text-sm opacity-90 font-medium">{t('pharmacy.todayOrders')}</p>
              </div>

              <div className="bg-linear-to-br from-yellow-500 to-yellow-600 text-white p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all transform hover:scale-105">
                <div className="flex items-center justify-between mb-3">
                  <ClockIcon className="w-10 h-10 opacity-80" />
                  <span className="text-4xl font-bold">{stats.pendingOrders}</span>
                </div>
                <p className="text-sm opacity-90 font-medium">{t('pharmacy.pendingOrders')}</p>
              </div>

              <div className="bg-linear-to-br from-green-500 to-green-600 text-white p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all transform hover:scale-105">
                <div className="flex items-center justify-between mb-3">
                  <CurrencyDollarIcon className="w-10 h-10 opacity-80" />
                  <span className="text-4xl font-bold">
                    {(stats.todayRevenue / 1000).toFixed(1)}K
                  </span>
                </div>
                <p className="text-sm opacity-90 font-medium">{t('pharmacy.todayRevenue')} (RWF)</p>
              </div>

              <div className="bg-linear-to-br from-red-500 to-red-600 text-white p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all transform hover:scale-105">
                <div className="flex items-center justify-between mb-3">
                  <ExclamationTriangleIcon className="w-10 h-10 opacity-80" />
                  <span className="text-4xl font-bold">{stats.lowStockItems}</span>
                </div>
                <p className="text-sm opacity-90 font-medium">{t('pharmacy.lowStockItems')}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Orders Section */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                    {t('pharmacy.pendingOrders')}
                  </h2>
                  <button
                    onClick={() => router.push('/pharmacy/orders')}
                    className="text-purple-600 dark:text-purple-400 hover:underline text-sm font-medium"
                  >
                    {t('common.viewAll')} →
                  </button>
                </div>

                {recentOrders.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-6xl mb-4">🔭</p>
                    <p className="text-gray-500 dark:text-gray-400">{t('orders.noOrders')}</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentOrders.map((order: any) => (
                      <div
                        key={order.id}
                        onClick={() => router.push(`/pharmacy/orders/${order.id}`)}
                        className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 hover:shadow-lg transition-all cursor-pointer hover:border-purple-500"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <p className="font-bold text-gray-800 dark:text-gray-100">
                              Order #{order.id.slice(0, 8)}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {order.patient.firstName} {order.patient.lastName}
                            </p>
                          </div>
                          <span className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 text-xs px-3 py-1 rounded-full font-medium">
                            {order.status}
                          </span>
                        </div>

                        <div className="space-y-1 mb-3 text-sm text-gray-600 dark:text-gray-400">
                          <p>📦 {order.medications.length} item(s)</p>
                          <p>{order.deliveryMethod === 'DELIVERY' ? '🚚 Delivery' : '🏪 Pickup'}</p>
                        </div>

                        <div className="flex justify-between items-center pt-3 border-t border-gray-200 dark:border-gray-700">
                          <span className="font-bold text-lg text-purple-600 dark:text-purple-400">
                            {order.total.toLocaleString()} RWF
                          </span>
                          <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 text-sm font-medium">
                            Process →
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Low Stock Medications */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                    {t('pharmacy.lowStockItems')} ⚠️
                  </h2>
                  <button
                    onClick={() => router.push('/pharmacy/inventory')}
                    className="text-purple-600 dark:text-purple-400 hover:underline text-sm font-medium"
                  >
                    {t('common.viewAll')} →
                  </button>
                </div>

                {lowStockMeds.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-6xl mb-4">✅</p>
                    <p className="text-gray-500 dark:text-gray-400">All medications are well stocked</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {lowStockMeds.map((med: any) => (
                      <div
                        key={med.id}
                        className="border-2 border-red-200 dark:border-red-800 rounded-xl p-4 bg-red-50 dark:bg-red-900/20"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-bold text-gray-800 dark:text-gray-100">{med.name}</h3>
                          <span className="bg-red-600 text-white text-xs px-3 py-1 rounded-full font-bold">
                            LOW
                          </span>
                        </div>

                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{med.category}</p>

                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{t('medications.stock')}</p>
                            <p className="font-bold text-red-600 dark:text-red-400 text-lg">
                              {med.quantity} units
                            </p>
                          </div>
                          <button
                            onClick={() => router.push(`/pharmacy/inventory?edit=${med.id}`)}
                            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 text-sm font-medium"
                          >
                            Restock
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}