// frontend/src/app/pharmacy/orders/page.tsx

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import api from '@/lib/api';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import PharmacyTopbar from '@/components/pharmacy/PharmacyTopbar';
import PharmacySidebar from '@/components/pharmacy/PharmacySidebar';

export default function PharmacyOrdersPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'PENDING' | 'ACCEPTED' | 'ALL'>('PENDING');

  useEffect(() => {
    fetchOrders();
  }, [filter]);

  const fetchOrders = async () => {
    try {
      const url = filter === 'ALL' ? '/orders' : `/orders?status=${filter}`;
      const res = await api.get(url);
      setOrders(res.data);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
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
                {t('pharmacy.ordersManagement')} 📦
              </h1>
              <p className="text-purple-100 text-lg">{t('pharmacy.manageAllOrders')}</p>
            </div>

            {/* Filter Tabs */}
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setFilter('PENDING')}
                className={`px-6 py-3 rounded-xl font-semibold transition-all transform hover:scale-105 ${
                  filter === 'PENDING'
                    ? 'bg-linear-to-r from-yellow-600 to-orange-600 text-white shadow-lg'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:shadow-lg'
                }`}
              >
                {t('pharmacy.pending')}
              </button>
              <button
                onClick={() => setFilter('ACCEPTED')}
                className={`px-6 py-3 rounded-xl font-semibold transition-all transform hover:scale-105 ${
                  filter === 'ACCEPTED'
                    ? 'bg-linear-to-r from-blue-600 to-cyan-600 text-white shadow-lg'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:shadow-lg'
                }`}
              >
                {t('pharmacy.accepted')}
              </button>
              <button
                onClick={() => setFilter('ALL')}
                className={`px-6 py-3 rounded-xl font-semibold transition-all transform hover:scale-105 ${
                  filter === 'ALL'
                    ? 'bg-linear-to-r from-purple-600 to-indigo-600 text-white shadow-lg'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:shadow-lg'
                }`}
              >
                {t('common.all')}
              </button>
            </div>

            {orders.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-12 text-center">
                <p className="text-6xl mb-4">🔭</p>
                <p className="text-gray-500 dark:text-gray-400 text-lg">{t('pharmacy.noOrders')}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {orders.map((order: any) => (
                  <div
                    key={order.id}
                    onClick={() => router.push(`/pharmacy/orders/${order.id}`)}
                    className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all transform hover:scale-105 cursor-pointer overflow-hidden"
                  >
                    {/* Card Header */}
                    <div className={`p-6 text-white ${
                      order.status === 'PENDING'
                        ? 'bg-linear-to-r from-yellow-500 to-orange-500'
                        : order.status === 'ACCEPTED'
                        ? 'bg-linear-to-r from-blue-500 to-cyan-500'
                        : 'bg-linear-to-r from-green-500 to-emerald-500'
                    }`}>
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <p className="text-sm opacity-90 mb-1">
                            {t('pharmacy.orderNumber')}
                          </p>
                          <p className="text-xl font-bold">
                            #{order.id.slice(0, 8)}
                          </p>
                        </div>
                        <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold">
                          {order.status}
                        </span>
                      </div>
                      <p className="text-sm opacity-90">
                        {order.patient.firstName} {order.patient.lastName}
                      </p>
                    </div>

                    {/* Card Body */}
                    <div className="p-6 space-y-4">
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                          <span>📦</span>
                          <span>{order.medications.length} {t('pharmacy.items')}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                          <span>{order.deliveryMethod === 'DELIVERY' ? '🚚' : '🏪'}</span>
                          <span>{order.deliveryMethod === 'DELIVERY' ? t('pharmacy.delivery') : t('pharmacy.pickup')}</span>
                        </div>
                        {order.prescriptionUrl && (
                          <div className="flex items-center gap-2 text-yellow-600 dark:text-yellow-400">
                            <span>📋</span>
                            <span className="font-medium">{t('pharmacy.prescriptionAttached')}</span>
                          </div>
                        )}
                        <p className="text-xs text-gray-500 dark:text-gray-400 pt-2">
                          {new Date(order.createdAt).toLocaleString()}
                        </p>
                      </div>

                      <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700">
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{t('pharmacy.total')}</p>
                          <p className="text-2xl font-bold bg-linear-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                            {order.total.toLocaleString()} RWF
                          </p>
                        </div>

                        <button className="bg-linear-to-r from-purple-600 to-indigo-600 text-white px-4 py-2 rounded-xl font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all shadow-lg text-sm">
                          {t('common.viewDetails')} →
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}