// frontend/src/app/pharmacy/dashboard/page.tsx

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import api from '@/lib/api';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import PharmacyTopbar from '@/components/pharmacy/PharmacyTopbar';
import PharmacySidebar from '@/components/pharmacy/PharmacySidebar';
import SupportBot from '@/components/pharmacy/SupportBot';
import { 
  ClipboardDocumentListIcon, 
  ClockIcon, 
  CurrencyDollarIcon, 
  ExclamationTriangleIcon 
} from '@heroicons/react/24/outline';

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
    <div className="flex min-h-screen bg-gray-50">
      <PharmacySidebar />
      <SupportBot />

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:ml-72">
        <PharmacyTopbar />

        {/* Page Content */}
        <main className="flex-1 p-8 overflow-auto">
          <div className="max-w-7xl mx-auto space-y-8">
            {/* Header Banner */}
            <div className="bg-linear-to-r from-[#1E4D8C] via-[#2563a8] to-[#1a3d6f] rounded-2xl shadow-lg p-8 text-white">
              <h1 className="text-3xl font-bold mb-2">
                {t('pharmacy.dashboard')}
              </h1>
              <p className="text-blue-100 text-base">
                Welcome back to your pharmacy management
              </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Today's Orders */}
              <div className="bg-[#2D5F8D] text-white p-6 rounded-xl shadow-md">
                <div className="flex items-center justify-between mb-4">
                  <ClipboardDocumentListIcon className="w-10 h-10" />
                  <span className="text-4xl font-bold">{stats.todayOrders}</span>
                </div>
                <p className="text-sm font-medium">Today's Orders</p>
              </div>

              {/* Pending Orders */}
              <div className="bg-teal-500 text-white p-6 rounded-xl shadow-md">
                <div className="flex items-center justify-between mb-4">
                  <ClockIcon className="w-10 h-10" />
                  <span className="text-4xl font-bold">{stats.pendingOrders}</span>
                </div>
                <p className="text-sm font-medium">Pending Orders</p>
              </div>

              {/* Today's Revenue */}
              <div className="bg-teal-500 text-white p-6 rounded-xl shadow-md">
                <div className="flex items-center justify-between mb-4">
                  <CurrencyDollarIcon className="w-10 h-10" />
                  <span className="text-4xl font-bold">
                    {(stats.todayRevenue / 1000).toFixed(1)}K
                  </span>
                </div>
                <p className="text-sm font-medium">Today's Revenue (RWF)</p>
              </div>

              {/* Low Stock Items */}
              <div className="bg-red-500 text-white p-6 rounded-xl shadow-md">
                <div className="flex items-center justify-between mb-4">
                  <ExclamationTriangleIcon className="w-10 h-10" />
                  <span className="text-4xl font-bold">{stats.lowStockItems}</span>
                </div>
                <p className="text-sm font-medium">Low Stock Items</p>
              </div>
            </div>

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Pending Orders Section */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-gray-900">
                    Pending Orders
                  </h2>
                  <button
                    onClick={() => router.push('/pharmacy/orders')}
                    className="text-teal-600 hover:text-teal-700 text-sm font-medium"
                  >
                    View All →
                  </button>
                </div>

                {recentOrders.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                      <ClipboardDocumentListIcon className="w-10 h-10 text-gray-400" />
                    </div>
                    <p className="text-gray-500 text-sm">No orders yet. Start shopping!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentOrders.map((order: any) => (
                      <div
                        key={order.id}
                        onClick={() => router.push(`/pharmacy/orders/${order.id}`)}
                        className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all cursor-pointer hover:border-teal-500"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <p className="font-semibold text-gray-900">
                              Order #{order.id.slice(0, 8)}
                            </p>
                            <p className="text-sm text-gray-600">
                              {order.patient.firstName} {order.patient.lastName}
                            </p>
                          </div>
                          <span className="bg-yellow-100 text-yellow-700 text-xs px-3 py-1 rounded-full font-medium">
                            {order.status}
                          </span>
                        </div>

                        <div className="space-y-1 mb-3 text-sm text-gray-600">
                          <p>📦 {order.medications.length} item(s)</p>
                          <p>{order.deliveryMethod === 'DELIVERY' ? '🚚 Delivery' : '🏪 Pickup'}</p>
                        </div>

                        <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                          <span className="font-bold text-lg text-teal-600">
                            {order.total.toLocaleString()} RWF
                          </span>
                          <button className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 text-sm font-medium">
                            Process →
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Low Stock Items Section */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-gray-900">
                    Low Stock Items
                  </h2>
                  <button
                    onClick={() => router.push('/pharmacy/inventory')}
                    className="text-teal-600 hover:text-teal-700 text-sm font-medium"
                  >
                    View All →
                  </button>
                </div>

                {lowStockMeds.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="w-20 h-20 mx-auto mb-4 bg-teal-50 rounded-full flex items-center justify-center">
                      <svg className="w-10 h-10 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <p className="text-gray-500 text-sm">All medications are well stocked</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {lowStockMeds.map((med: any) => (
                      <div
                        key={med.id}
                        className="border-2 border-red-200 rounded-lg p-4 bg-red-50"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold text-gray-900">{med.name}</h3>
                          <span className="bg-red-600 text-white text-xs px-3 py-1 rounded-full font-bold">
                            LOW
                          </span>
                        </div>

                        <p className="text-sm text-gray-600 mb-3">{med.category}</p>

                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-xs text-gray-500">Stock</p>
                            <p className="font-bold text-red-600 text-lg">
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