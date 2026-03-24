// frontend/src/app/patient/dashboard/page.tsx

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import api from '@/lib/api';
import { MagnifyingGlassIcon, ClipboardDocumentListIcon, ShoppingCartIcon } from '@heroicons/react/24/outline';
import LoadingSpinner from '@/components/shared/LoadingSpinner';

export default function PatientDashboard() {
  const { t } = useTranslation();
  const router = useRouter();
  const [stats, setStats] = useState({ totalOrders: 0, completedOrders: 0, pendingOrders: 0 });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchDashboardData(); }, []);

  const fetchDashboardData = async () => {
    try {
      const ordersRes = await api.get('/orders/my-orders');
      const orders = ordersRes.data;
      setStats({
        totalOrders: orders.length,
        completedOrders: orders.filter((o: any) => o.status === 'COMPLETED' || o.status === 'DELIVERED').length,
        pendingOrders: orders.filter((o: any) => ['PENDING', 'ACCEPTED', 'PREPARING'].includes(o.status)).length,
      });
      setRecentOrders(orders.slice(0, 5));
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      setStats({ totalOrders: 0, completedOrders: 0, pendingOrders: 0 });
      setRecentOrders([]);
    } finally { setLoading(false); }
  };

  const quickActions = [
    {
      title: 'Find Pharmacy & Medicine',
      description: 'Browse pharmacies and search medications',
      icon: MagnifyingGlassIcon,
      href: '/patient/search',
      color: 'bg-gradient-to-br from-blue-500 to-blue-700',
      hoverColor: 'hover:from-blue-600 hover:to-blue-800',
    },
    {
      title: 'View Orders',
      description: 'Track your current and past orders',
      icon: ClipboardDocumentListIcon,
      href: '/patient/orders',
      color: 'bg-gradient-to-br from-teal-500 to-teal-700',
      hoverColor: 'hover:from-teal-600 hover:to-teal-800',
    },
    {
      title: 'Shopping Cart',
      description: 'Review items in your cart',
      icon: ShoppingCartIcon,
      href: '/patient/cart',
      color: 'bg-gradient-to-br from-blue-600 to-blue-800',
      hoverColor: 'hover:from-blue-700 hover:to-blue-900',
    },
  ];

  if (loading) return <div className="min-h-screen flex items-center justify-center"><LoadingSpinner /></div>;

  return (
    <div className="space-y-6">
    <div className="bg-linear-to-r from-blue-600 to-blue-800 rounded-2xl shadow-xl p-8 text-white">
      <h1 className="text-3xl sm:text-4xl font-bold mb-2">{t('dashboard.welcomeBack')}</h1>
      <p className="text-blue-100 text-lg">{t('dashboard.manageHealthcare')}</p>
    </div>

    {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-gray-600 dark:text-gray-400 text-sm font-medium">{t('dashboard.totalOrders')}</h3>
          <span className="text-3xl"></span>
        </div>
        <p className="text-4xl font-bold text-blue-700 dark:text-blue-400">{stats.totalOrders}</p>
      </div>
      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-gray-600 dark:text-gray-400 text-sm font-medium">{t('dashboard.completed')}</h3>
          <span className="text-3xl"></span>
        </div>
        <p className="text-4xl font-bold text-teal-700 dark:text-teal-400">{stats.completedOrders}</p>
      </div>
      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-gray-600 dark:text-gray-400 text-sm font-medium">{t('dashboard.pending')}</h3>
          <span className="text-3xl">⏰</span>
        </div>
        <p className="text-4xl font-bold text-blue-700 dark:text-blue-400">{stats.pendingOrders}</p>
      </div>
    </div>

    {/* Quick Actions */}
      <div>
      <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">{t('dashboard.quickActions')}</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {quickActions.map((action, idx) => (
            <Link key={idx} href={action.href}>
            <div className={`${action.color} ${action.hoverColor} text-white p-8 rounded-2xl shadow-xl cursor-pointer transition-all duration-300 transform hover:scale-105 hover:shadow-2xl`}>
              <action.icon className="w-12 h-12 mb-4 opacity-90" />
              <h3 className="font-bold text-xl mb-2">{action.title}</h3>
              <p className="text-sm opacity-90">{action.description}</p>
            </div>
          </Link>
        ))}
        </div>
    </div>

    {/* Recent Orders */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
      <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">{t('dashboard.recentOrders')}</h2>
        <Link href="/patient/orders" className="text-blue-600 dark:text-blue-400 hover:underline text-sm font-medium">View All →</Link>
      </div>
      {recentOrders.length > 0 ? (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {recentOrders.map((order: any) => (
              <Link key={order.id} href={`/patient/orders/${order.id}`}>
              <div className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all cursor-pointer">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-bold text-gray-800 dark:text-gray-100">Order #{order.id.slice(0, 8)}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1"> {order.pharmacy.name}</p>
                  </div>
                  <div className="text-right">
                    <span className={`px-4 py-2 rounded-full text-xs font-medium ${
                        order.status === 'COMPLETED' || order.status === 'DELIVERED' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
                        order.status === 'CANCELLED' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' :
                        'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                      }`}>
                      {order.status}
                      </span>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 font-medium">{order.total.toLocaleString()} RWF</p>
                  </div>
                </div>
              </div>
            </Link>
          ))}
          </div>
      ) : (
          <div className="text-center py-12">
          <p className="text-6xl mb-4"></p>
          <p className="text-gray-500 dark:text-gray-400 mb-4">{t('dashboard.noOrdersYet')}</p>
          <p className="text-sm text-gray-400 dark:text-gray-500">{t('dashboard.startShopping')}</p>
        </div>
      )}
      </div>
  </div>
);
}