// frontend/src/app/patient/orders/page.tsx

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import api from '@/lib/api';
import LoadingSpinner from '@/components/shared/LoadingSpinner';

type OrderStatus = 'PENDING' | 'ACCEPTED' | 'PREPARING' | 'OUT_FOR_DELIVERY' | 'READY_FOR_PICKUP' | 'DELIVERED' | 'CANCELLED';

export default function OrdersPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await api.get('/orders/my-orders');
      setOrders(res.data);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'PENDING':
      case 'ACCEPTED':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400';
      case 'PREPARING':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400';
      case 'OUT_FOR_DELIVERY':
        return 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400';
      case 'READY_FOR_PICKUP':
        return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400';
      case 'DELIVERED':
        return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400';
      case 'CANCELLED':
        return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300';
    }
  };

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case 'PENDING': return '⏳';
      case 'ACCEPTED': return '✅';
      case 'PREPARING': return '👨‍⚕️';
      case 'OUT_FOR_DELIVERY': return '🚚';
      case 'READY_FOR_PICKUP': return '🏪';
      case 'DELIVERED': return '✓';
      case 'CANCELLED': return '❌';
      default: return '📦';
    }
  };

  const filteredOrders = orders.filter((order: any) => {
    if (filter === 'active') {
      return !['DELIVERED', 'CANCELLED'].includes(order.status);
    }
    if (filter === 'completed') {
      return ['DELIVERED', 'CANCELLED'].includes(order.status);
    }
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-linear-to-r from-blue-600 to-cyan-600 rounded-2xl shadow-xl p-8 text-white">
        <h1 className="text-3xl sm:text-4xl font-bold mb-2">
          {t('orders.title')} 📦
        </h1>
        <p className="text-blue-100 text-lg">{t('orders.subtitle')}</p>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => setFilter('all')}
          className={`px-6 py-3 rounded-xl font-semibold transition-all transform hover:scale-105 ${
            filter === 'all'
              ? 'bg-linear-to-r from-blue-600 to-cyan-600 text-white shadow-lg'
              : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:shadow-lg'
          }`}
        >
          {t('orders.all')}
        </button>
        <button
          onClick={() => setFilter('active')}
          className={`px-6 py-3 rounded-xl font-semibold transition-all transform hover:scale-105 ${
            filter === 'active'
              ? 'bg-linear-to-r from-blue-600 to-cyan-600 text-white shadow-lg'
              : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:shadow-lg'
          }`}
        >
          {t('orders.active')}
        </button>
        <button
          onClick={() => setFilter('completed')}
          className={`px-6 py-3 rounded-xl font-semibold transition-all transform hover:scale-105 ${
            filter === 'completed'
              ? 'bg-linear-to-r from-blue-600 to-cyan-600 text-white shadow-lg'
              : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:shadow-lg'
          }`}
        >
          {t('orders.completed')}
        </button>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-12 text-center">
          <p className="text-6xl mb-4">📦</p>
          <p className="text-gray-500 dark:text-gray-400 text-lg">{t('orders.noOrders')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredOrders.map((order: any) => (
            <div
              key={order.id}
              onClick={() => router.push(`/patient/orders/${order.id}`)}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all transform hover:scale-105 cursor-pointer overflow-hidden"
            >
              {/* Card Header */}
              <div className="bg-linear-to-r from-blue-500 to-cyan-500 p-6 text-white">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-sm opacity-90 mb-1">
                      {t('orders.orderNumber')}: #{order.id.slice(0, 8)}
                    </p>
                    <p className="text-xl font-bold">
                      🏥 {order.pharmacy.name}
                    </p>
                  </div>
                  <span
                    className={`inline-block px-4 py-2 rounded-full text-sm font-bold ${getStatusColor(order.status)}`}
                  >
                    {getStatusIcon(order.status)} {order.status}
                  </span>
                </div>
                <p className="text-sm opacity-90">
                  {new Date(order.createdAt).toLocaleDateString()}
                </p>
              </div>

              {/* Card Body */}
              <div className="p-6 space-y-4">
                <div className="space-y-2">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {t('orders.items')}: {order.medications.length}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {order.medications.slice(0, 3).map((med: any) => (
                      <span
                        key={med.id}
                        className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-3 py-1 rounded-full font-medium"
                      >
                        {med.medication.name} × {med.quantity}
                      </span>
                    ))}
                    {order.medications.length > 3 && (
                      <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-1 rounded-full font-medium">
                        +{order.medications.length - 3} more
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{t('orders.total')}</p>
                    <p className="text-2xl font-bold bg-linear-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                      {order.total.toLocaleString()} RWF
                    </p>
                  </div>

                  <button className="bg-linear-to-r from-blue-600 to-cyan-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-cyan-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105">
                    {t('orders.viewDetails')} →
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}