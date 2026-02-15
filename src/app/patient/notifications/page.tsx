// frontend/src/app/patient/notifications/page.tsx

'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BellIcon, ClipboardDocumentListIcon, ClockIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

type NotificationCategory = 'all' | 'orders' | 'reminders' | 'alerts';

interface Notification {
  id: string;
  category: 'orders' | 'reminders' | 'alerts';
  icon: string;
  title: string;
  message: string;
  time: string;
  isNew: boolean;
}

export default function NotificationsPage() {
  const { t } = useTranslation();
  const [activeCategory, setActiveCategory] = useState<NotificationCategory>('all');

  const mockNotifications: Notification[] = [
    {
      id: '1',
      category: 'orders',
      icon: '📦',
      title: 'Order Confirmed',
      message: 'Your order #ORD-2024-001 has been confirmed by MediCare Pharmacy.',
      time: '2 minutes ago',
      isNew: true,
    },
    {
      id: '2',
      category: 'orders',
      icon: '✅',
      title: 'Order Ready for Pickup',
      message: 'Your order #ORD-2024-002 is ready for pickup at HealthPlus Pharmacy.',
      time: '1 hour ago',
      isNew: true,
    },
    {
      id: '3',
      category: 'reminders',
      icon: '⏰',
      title: 'Medication Reminder',
      message: 'Time to take your medication: Paracetamol 500mg',
      time: '3 hours ago',
      isNew: false,
    },
    {
      id: '4',
      category: 'reminders',
      icon: '💊',
      title: 'Prescription Renewal',
      message: 'Your prescription for Amoxicillin will expire in 3 days.',
      time: '1 day ago',
      isNew: false,
    },
    {
      id: '5',
      category: 'alerts',
      icon: '⚠️',
      title: 'Stock Alert',
      message: 'Ibuprofen 400mg is now back in stock at CarePoint Pharmacy.',
      time: '2 days ago',
      isNew: false,
    },
    {
      id: '6',
      category: 'alerts',
      icon: '🔔',
      title: 'New Promotion',
      message: 'Get 10% off on all vitamins this week at HealthFirst Pharmacy.',
      time: '3 days ago',
      isNew: false,
    },
  ];

  const filteredNotifications = activeCategory === 'all'
    ? mockNotifications
    : mockNotifications.filter((n) => n.category === activeCategory);

  const getCategoryCount = (category: NotificationCategory) => {
    if (category === 'all') return mockNotifications.length;
    return mockNotifications.filter((n) => n.category === category).length;
  };

  const unreadCount = mockNotifications.filter((n) => n.isNew).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">
              Notifications
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              You have {unreadCount} unread notifications
            </p>
          </div>
          <button className="text-blue-600 dark:text-blue-400 hover:underline font-medium">
            Mark all as read
          </button>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap gap-3 mt-6">
          <button
            onClick={() => setActiveCategory('all')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${
              activeCategory === 'all'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            <BellIcon className="w-5 h-5" />
            All ({getCategoryCount('all')})
          </button>
          <button
            onClick={() => setActiveCategory('orders')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${
              activeCategory === 'orders'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            <ClipboardDocumentListIcon className="w-5 h-5" />
            Orders ({getCategoryCount('orders')})
          </button>
          <button
            onClick={() => setActiveCategory('reminders')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${
              activeCategory === 'reminders'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            <ClockIcon className="w-5 h-5" />
            Reminders ({getCategoryCount('reminders')})
          </button>
          <button
            onClick={() => setActiveCategory('alerts')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${
              activeCategory === 'alerts'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            <ExclamationTriangleIcon className="w-5 h-5" />
            Alerts ({getCategoryCount('alerts')})
          </button>
        </div>
      </div>

      {/* Notifications Section */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">
            All Notifications
          </h2>
        </div>

        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {filteredNotifications.map((notification) => (
            <div
              key={notification.id}
              className={`p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all cursor-pointer ${
                notification.isNew ? 'bg-teal-50 dark:bg-teal-900/20' : ''
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center shrink-0">
                  <span className="text-2xl">{notification.icon}</span>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-800 dark:text-gray-100 mb-1">
                        {notification.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {notification.message}
                      </p>
                    </div>
                    {notification.isNew && (
                      <span className="px-3 py-1 bg-teal-500 text-white text-xs font-semibold rounded-full shrink-0">
                        New
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                    {notification.time}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredNotifications.length === 0 && (
          <div className="p-12 text-center">
            <p className="text-6xl mb-4">🔔</p>
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              No notifications in this category
            </p>
          </div>
        )}
      </div>
    </div>
  );
}