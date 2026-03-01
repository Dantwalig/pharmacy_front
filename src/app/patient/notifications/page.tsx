// frontend/src/app/patient/notifications/page.tsx

'use client';

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { BellIcon, ClipboardDocumentListIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

type NotificationCategory = 'all' | 'orders' | 'prescriptions' | 'alerts';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  orderId?: string;
  createdAt: string;
}

// Map backend NotificationType to frontend category
const getCategory = (type: string): Omit<NotificationCategory, 'all'> => {
  if (type.startsWith('ORDER_')) return 'orders';
  if (type.startsWith('PRESCRIPTION_')) return 'prescriptions';
  return 'alerts';
};

const getIcon = (type: string): string => {
  switch (type) {
    case 'ORDER_PLACED': return '📦';
    case 'ORDER_ACCEPTED': return '✅';
    case 'ORDER_PREPARING': return '👨‍⚕️';
    case 'ORDER_OUT_FOR_DELIVERY': return '🚚';
    case 'ORDER_READY_FOR_PICKUP': return '🏪';
    case 'ORDER_DELIVERED': return '✔️';
    case 'ORDER_CANCELLED': return '❌';
    case 'PRESCRIPTION_APPROVED': return '✅';
    case 'PRESCRIPTION_REJECTED': return '⚠️';
    default: return '🔔';
  }
};

export default function PatientNotificationsPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<NotificationCategory>('all');

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      // Correct endpoint: GET /notifications?userType=patient
      const res = await api.get('/notifications?userType=patient');
      setNotifications(res.data);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notification: Notification) => {
    if (!notification.isRead) {
      try {
        // PUT /notifications/:id/read
        await api.put(`/notifications/${notification.id}/read`);
        setNotifications(prev =>
          prev.map(n => n.id === notification.id ? { ...n, isRead: true } : n)
        );
      } catch (error) {
        console.error('Failed to mark as read:', error);
      }
    }
    // Navigate to order if linked
    if (notification.orderId) {
      router.push(`/patient/orders/${notification.orderId}`);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      // PUT /notifications/read-all?userType=patient
      await api.put('/notifications/read-all?userType=patient');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      toast.success('All notifications marked as read');
    } catch (error) {
      toast.error('Failed to mark all as read');
    }
  };

  const filteredNotifications = activeCategory === 'all'
    ? notifications
    : notifications.filter(n => getCategory(n.type) === activeCategory);

  const unreadCount = notifications.filter(n => !n.isRead).length;
  const getCategoryCount = (cat: NotificationCategory) =>
    cat === 'all' ? notifications.length : notifications.filter(n => getCategory(n.type) === cat).length;

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  };

  if (loading) return <div className="flex justify-center py-20"><LoadingSpinner /></div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">Notifications</h1>
            <p className="text-gray-600 dark:text-gray-400">
              You have {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
            </p>
          </div>
          {unreadCount > 0 && (
            <button onClick={handleMarkAllAsRead} className="text-blue-600 dark:text-blue-400 hover:underline font-medium text-sm">
              Mark all as read
            </button>
          )}
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap gap-3 mt-6">
          {([
            { id: 'all', label: 'All', icon: BellIcon },
            { id: 'orders', label: 'Orders', icon: ClipboardDocumentListIcon },
            { id: 'prescriptions', label: 'Prescriptions', icon: ClipboardDocumentListIcon },
            { id: 'alerts', label: 'Alerts', icon: ExclamationTriangleIcon },
          ] as const).map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setActiveCategory(id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${
                activeCategory === id
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}>
              <Icon className="w-5 h-5" />
              {label} ({getCategoryCount(id)})
            </button>
          ))}
        </div>
      </div>

      {/* Notifications List */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">
            {activeCategory === 'all' ? 'All Notifications' : `${activeCategory.charAt(0).toUpperCase() + activeCategory.slice(1)} Notifications`}
          </h2>
        </div>

        {filteredNotifications.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-6xl mb-4">🔔</p>
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              {notifications.length === 0 ? 'No notifications yet' : 'No notifications in this category'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                onClick={() => handleMarkAsRead(notification)}
                className={`p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all cursor-pointer ${
                  !notification.isRead ? 'bg-teal-50 dark:bg-teal-900/20' : ''
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center shrink-0">
                    <span className="text-2xl">{getIcon(notification.type)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-800 dark:text-gray-100 mb-1">{notification.title}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{notification.message}</p>
                      </div>
                      {!notification.isRead && (
                        <span className="px-3 py-1 bg-teal-500 text-white text-xs font-semibold rounded-full shrink-0">
                          New
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-2">
                      <p className="text-xs text-gray-500 dark:text-gray-500">{formatTime(notification.createdAt)}</p>
                      {notification.orderId && (
                        <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">View order →</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}