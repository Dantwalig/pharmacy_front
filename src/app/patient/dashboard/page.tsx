// frontend/src/app/patient/dashboard/page.tsx

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import api from '@/lib/api';
import {
  ShoppingBagIcon,
  MagnifyingGlassIcon,
  ClipboardDocumentListIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import LoadingSpinner from '@/components/shared/LoadingSpinner';

export default function PatientDashboard() {
  const { t } = useTranslation();
  const [stats, setStats] = useState({
    totalOrders: 0,
    completedOrders: 0,
    pendingOrders: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [patientName, setPatientName] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const ordersRes = await api.get('/orders/my-orders');
      const orders = ordersRes.data;

      setStats({
        totalOrders: orders.length,
        completedOrders: orders.filter((o: any) => o.status === 'COMPLETED').length,
        pendingOrders: orders.filter((o: any) => ['PENDING', 'ACCEPTED', 'PREPARING'].includes(o.status)).length,
      });

      setRecentOrders(orders.slice(0, 5));
      
      // Get patient name from user profile
      const profileRes = await api.get('/patients/profile');
      setPatientName(`${profileRes.data.firstName} ${profileRes.data.lastName}`);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    {
      title: t('patient.browsePharmacies'),
      description: t('pharmacies.subtitle'),
      icon: ShoppingBagIcon,
      href: '/patient/pharmacies',
      color: 'bg-gradient-to-br from-blue-400 to-blue-600',
      hoverColor: 'hover:from-blue-500 hover:to-blue-700',
    },
    {
      title: t('patient.searchMedications'),
      description: t('medications.subtitle'),
      icon: MagnifyingGlassIcon,
      href: '/patient/medications',
      color: 'bg-gradient-to-br from-green-400 to-green-600',
      hoverColor: 'hover:from-green-500 hover:to-green-700',
    },
    {
      title: t('patient.myOrders'),
      description: t('orders.title'),
      icon: ClipboardDocumentListIcon,
      href: '/patient/orders',
      color: 'bg-gradient-to-br from-purple-400 to-purple-600',
      hoverColor: 'hover:from-purple-500 hover:to-purple-700',
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-linear-to-r from-purple-600 to-indigo-600 rounded-2xl shadow-xl p-8 text-white">
        <h1 className="text-3xl sm:text-4xl font-bold mb-2">
          {t('patientDashboard.welcomeBack', { name: patientName || 'Patient' })} 👋
        </h1>
        <p className="text-purple-100 text-lg">{t('patientDashboard.todayHealth')}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105">
          <h3 className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-2">
            {t('patientDashboard.totalAppointments')}
          </h3>
          <p className="text-4xl font-bold text-purple-600 dark:text-purple-400">{stats.totalOrders}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105">
          <h3 className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-2">
            {t('patientDashboard.completed')}
          </h3>
          <p className="text-4xl font-bold text-green-600 dark:text-green-400">{stats.completedOrders}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105">
          <h3 className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-2">
            {t('patientDashboard.upcoming')}
          </h3>
          <p className="text-4xl font-bold text-blue-600 dark:text-blue-400">{stats.pendingOrders}</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">
          {t('patientDashboard.quickActions')}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {quickActions.map((action, idx) => (
            <Link key={idx} href={action.href}>
              <div
                className={`${action.color} ${action.hoverColor} text-white p-8 rounded-2xl shadow-xl cursor-pointer transition-all duration-300 transform hover:scale-105 hover:shadow-2xl`}
              >
                <action.icon className="w-12 h-12 mb-4 opacity-90" />
                <h3 className="font-bold text-xl mb-2">{action.title}</h3>
                <p className="text-sm opacity-90">{action.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
            {t('orders.title')}
          </h2>
          <Link href="/patient/orders" className="text-purple-600 dark:text-purple-400 hover:underline text-sm font-medium">
            {t('common.viewAll')} →
          </Link>
        </div>

        {recentOrders.length > 0 ? (
          <div className="space-y-4">
            {recentOrders.map((order: any) => (
              <Link key={order.id} href={`/patient/orders/${order.id}`}>
                <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-5 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all hover:shadow-md cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-bold text-gray-800 dark:text-gray-100">
                        {t('orders.orderNumber')} #{order.id.slice(0, 8)}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        🏥 {order.pharmacy.name}
                      </p>
                    </div>
                    <div className="text-right">
                      <span
                        className={`px-4 py-2 rounded-full text-xs font-medium inline-flex items-center gap-1 ${
                          order.status === 'COMPLETED'
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                            : order.status === 'CANCELLED'
                            ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                            : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                        }`}
                      >
                        {order.status === 'COMPLETED' && <CheckCircleIcon className="w-4 h-4" />}
                        {order.status}
                      </span>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 font-medium">
                        {order.total.toLocaleString()} RWF
                      </p>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-6xl mb-4">🛒</p>
            <p className="text-gray-500 dark:text-gray-400">{t('orders.noOrders')}</p>
          </div>
        )}
      </div>
    </div>
  );
}