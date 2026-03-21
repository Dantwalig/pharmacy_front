// frontend/src/app/pharmacy/notifications/page.tsx

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
  ShoppingCartIcon,
  ExclamationTriangleIcon,
  BellIcon,
  CubeIcon,
  CheckCircleIcon,
  UserGroupIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  orderId?: string;
}

export default function PharmacyNotificationsPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<'ALL' | 'ORDERS' | 'INVENTORY' | 'OTHER'>('ALL');

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications?userType=pharmacy');
      setNotifications(res.data);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(notifications.map(n => 
      n.id === id ? { ...n, isRead: true } : n
      ));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.put('/notifications/read-all?userType=pharmacy');
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
      toast.success('All notifications marked as read');
    } catch (error) {
      toast.error('Failed to mark all as read');
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'ORDER_PLACED':
      case 'ORDER_ACCEPTED':
      case 'ORDER_CANCELLED':
        return ShoppingCartIcon;
      case 'LOW_STOCK':
      case 'OUT_OF_STOCK':
        return ExclamationTriangleIcon;
      case 'INVENTORY_UPDATED':
        return CubeIcon;
      case 'ORDER_COMPLETED':
        return CheckCircleIcon;
      case 'NEW_CUSTOMER':
        return UserGroupIcon;
      default:
        return BellIcon;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'ORDER_PLACED':
        return { bg: 'bg-blue-50', icon: 'text-blue-600', border: 'border-blue-500' };
      case 'LOW_STOCK':
      case 'OUT_OF_STOCK':
        return { bg: 'bg-red-50', icon: 'text-red-600', border: 'border-red-500' };
      case 'ORDER_COMPLETED':
        return { bg: 'bg-green-50', icon: 'text-green-600', border: 'border-green-500' };
      default:
        return { bg: 'bg-gray-50', icon: 'text-gray-600', border: 'border-gray-500' };
    }
  };

  const getNotificationType = (type: string) => {
    if (['ORDER_PLACED', 'ORDER_ACCEPTED', 'ORDER_CANCELLED', 'ORDER_COMPLETED'].includes(type)) {
      return 'order';
    }
    if (['LOW_STOCK', 'OUT_OF_STOCK', 'INVENTORY_UPDATED'].includes(type)) {
      return 'inventory';
    }
    return 'other';
  };

  const filteredNotifications = notifications.filter((notif) => {
    if (filter === 'ALL') return true;
    const type = getNotificationType(notif.type);
    if (filter === 'ORDERS') return type === 'order';
    if (filter === 'INVENTORY') return type === 'inventory';
    if (filter === 'OTHER') return type === 'other';
    return true;
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;
  const orderCount = notifications.filter(n => getNotificationType(n.type) === 'order').length;
  const inventoryCount = notifications.filter(n => getNotificationType(n.type) === 'inventory').length;
  const otherCount = notifications.filter(n => getNotificationType(n.type) === 'other').length;

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
            <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
              <p className="text-gray-600">You have {unreadCount} unread notifications</p>
            </div>
            <div className="flex gap-3">
              <button 
                  onClick={markAllAsRead}
                  className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium hover:bg-gray-100 rounded-lg transition-colors"
                >
                Mark all as read
                </button>
            </div>
          </div>

          {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white border-l-4 border-blue-500 rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-4xl font-bold text-gray-900">{orderCount}</p>
                  <p className="text-sm text-gray-600 mt-1">Order Notifications</p>
                </div>
                <ShoppingCartIcon className="w-12 h-12 text-blue-500" />
              </div>
            </div>

            <div className="bg-white border-l-4 border-red-500 rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-4xl font-bold text-gray-900">{inventoryCount}</p>
                  <p className="text-sm text-gray-600 mt-1">Stock Alerts</p>
                </div>
                <ExclamationTriangleIcon className="w-12 h-12 text-red-500" />
              </div>
            </div>

            <div className="bg-white border-l-4 border-teal-500 rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-4xl font-bold text-gray-900">{unreadCount}</p>
                  <p className="text-sm text-gray-600 mt-1">Unread</p>
                </div>
                <BellIcon className="w-12 h-12 text-teal-500" />
              </div>
            </div>
          </div>

          {/* Filter Tabs */}
            <div className="flex flex-wrap gap-3 border-b border-gray-200 pb-4">
            <button
                onClick={() => setFilter('ALL')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                  filter === 'ALL'
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
              <BellIcon className="w-4 h-4" />
              All ({notifications.length})
              </button>
            <button
                onClick={() => setFilter('ORDERS')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                  filter === 'ORDERS'
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
              <ShoppingCartIcon className="w-4 h-4" />
              Orders ({orderCount})
              </button>
            <button
                onClick={() => setFilter('INVENTORY')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                  filter === 'INVENTORY'
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
              <CubeIcon className="w-4 h-4" />
              Inventory ({inventoryCount})
              </button>
            <button
                onClick={() => setFilter('OTHER')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                  filter === 'OTHER'
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
              <UserGroupIcon className="w-4 h-4" />
              Other ({otherCount})
              </button>
          </div>

          {/* Notifications List */}
            <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900">All Notifications</h2>
              
            {filteredNotifications.length === 0 ? (
                <div className="bg-white rounded-xl shadow-md p-16 text-center">
                <BellIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">No notifications yet</p>
              </div>
            ) : (
                filteredNotifications.map((notif) => {
                  const Icon = getNotificationIcon(notif.type);
                  const colors = getNotificationColor(notif.type);
                  
                  return (
                    <div
                      key={notif.id}
                      onClick={() => {
                        if (!notif.isRead) markAsRead(notif.id);
                        if (notif.orderId) router.push(`/pharmacy/orders/${notif.orderId}`);
                      }}
                      className={`${colors.bg} ${!notif.isRead ? 'border-l-4 ' + colors.border : 'border border-gray-200'} rounded-lg p-6 hover:shadow-md transition-all cursor-pointer relative`}
                    >
                    <div className="flex gap-4">
                      <div className={`w-12 h-12 rounded-lg ${colors.bg} flex items-center justify-center shrink-0`}>
                        <Icon className={`w-6 h-6 ${colors.icon}`} />
                      </div>
                        
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-gray-900">{notif.title}</h3>
                            {!notif.isRead && (
                                <span className="bg-teal-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                                New
                                </span>
                            )}
                            </div>
                        </div>
                        <p className="text-gray-700 mb-3">{notif.message}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(notif.createdAt).toLocaleString()}
                          </p>
                      </div>
                    </div>
                  </div>
                );
                })
              )}
            </div>
        </div>
      </main>
    </div>
  </div>
);
}