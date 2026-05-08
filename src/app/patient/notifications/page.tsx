// frontend/src/app/patient/notifications/page.tsx

'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import {
  BellIcon,
  ClipboardDocumentListIcon,
  ExclamationTriangleIcon,
  CheckIcon,
  TrashIcon,
  EllipsisVerticalIcon,
  TruckIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';

const POLL_INTERVAL_MS = 30_000;

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

const getCategory = (type: string): Omit<NotificationCategory, 'all'> => {
  if (type.startsWith('ORDER_'))        return 'orders';
  if (type.startsWith('PRESCRIPTION_')) return 'prescriptions';
  return 'alerts';
};

const getIconConfig = (type: string) => {
  switch (type) {
    case 'ORDER_OUT_FOR_DELIVERY':
      return { Icon: TruckIcon,                bg: 'bg-blue-50',   color: 'text-blue-600' };
    case 'ORDER_PLACED':
    case 'ORDER_ACCEPTED':
    case 'ORDER_PREPARING':
    case 'ORDER_READY_FOR_PICKUP':
    case 'ORDER_DELIVERED':
    case 'ORDER_CANCELLED':
      return { Icon: ClipboardDocumentListIcon, bg: 'bg-blue-50',   color: 'text-blue-600' };
    case 'PRESCRIPTION_APPROVED':
    case 'PRESCRIPTION_REJECTED':
      return { Icon: DocumentTextIcon,          bg: 'bg-orange-50', color: 'text-orange-500' };
    default:
      return { Icon: BellIcon,                  bg: 'bg-gray-100',  color: 'text-gray-500' };
  }
};

const getCategoryLabel = (type: string) => {
  if (type.startsWith('ORDER_'))        return { label: 'ORDER UPDATE', cls: 'text-orange-500' };
  if (type.startsWith('PRESCRIPTION_')) return { label: 'PRESCRIPTION', cls: 'text-teal-600'   };
  return                                       { label: 'ALERT',        cls: 'text-red-500'    };
};

export default function PatientNotificationsPage() {
  const { t } = useTranslation();
  const router = useRouter();

  const [notifications, setNotifications]   = useState<Notification[]>([]);
  const [loading, setLoading]               = useState(true);
  const [refreshing, setRefreshing]         = useState(false);
  const [activeCategory, setActiveCategory] = useState<NotificationCategory>('all');
  const [openMenuId, setOpenMenuId]         = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchNotifications = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else         setRefreshing(true);
    try {
      const res = await api.get('/notifications?userType=patient');
      setNotifications(res.data);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications(false);
    intervalRef.current = setInterval(() => fetchNotifications(true), POLL_INTERVAL_MS);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [fetchNotifications]);

  const markAsRead = async (id: string) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch { /* silent */ }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/notifications/${id}`);
      setNotifications(prev => prev.filter(n => n.id !== id));
      toast.success('Notification deleted');
    } catch {
      toast.error('Failed to delete notification');
    }
    setOpenMenuId(null);
  };

  const handleMarkAllAsRead = async () => {
    try {
      await api.put('/notifications/read-all?userType=patient');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      toast.success(t('success.allNotificationsRead'));
    } catch {
      toast.error(t('success.notificationsReadFailed'));
    }
  };

  const filteredNotifications = activeCategory === 'all'
    ? notifications
    : notifications.filter(n => getCategory(n.type) === activeCategory);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const getCategoryCount = (cat: NotificationCategory) =>
    cat === 'all'
      ? notifications.length
      : notifications.filter(n => getCategory(n.type) === cat).length;

  const formatTime = (dateStr: string) => {
    const diffMs    = Date.now() - new Date(dateStr).getTime();
    const diffMins  = Math.floor(diffMs / 60_000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays  = Math.floor(diffHours / 24);
    if (diffMins < 1)   return 'Just now';
    if (diffMins < 60)  return `${diffMins} min${diffMins !== 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
  };

  if (loading) return <div className="flex justify-center py-20"><LoadingSpinner /></div>;

  const tabs: { id: NotificationCategory; label: string; Icon: React.ElementType }[] = [
    { id: 'all',           label: 'All',           Icon: BellIcon                  },
    { id: 'orders',        label: 'Orders',        Icon: ClipboardDocumentListIcon },
    { id: 'prescriptions', label: 'Prescriptions', Icon: DocumentTextIcon          },
    { id: 'alerts',        label: 'Alerts',        Icon: ExclamationTriangleIcon   },
  ];

  const sectionTitle =
    activeCategory === 'all'            ? 'All Notifications'
    : activeCategory === 'orders'       ? 'Order Notifications'
    : activeCategory === 'prescriptions'? 'Prescription Notifications'
    : 'Alert Notifications';

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-10">

      {/* ── Header card ─────────────────────────────────── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
        <div className="flex items-start justify-between gap-4 mb-1">
          <h1 className="text-3xl md:text-4xl font-extrabold text-[#1E3A5F]">
            Notifications
          </h1>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-[#1E3A5F] text-[#1E3A5F] font-semibold text-sm hover:bg-[#1E3A5F] hover:text-white transition-all shrink-0"
            >
              <CheckIcon className="w-4 h-4" />
              Mark all as read
            </button>
          )}
        </div>

        <p className="text-[#2D9B8A] font-medium mb-6">
          {unreadCount > 0
            ? `You have ${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}`
            : "You're all caught up!"}
          {refreshing && (
            <span className="ml-2 text-gray-400 text-sm animate-pulse">Refreshing…</span>
          )}
        </p>

        {/* Category tabs */}
        <div className="flex flex-wrap gap-3">
          {tabs.map(({ id, label, Icon }) => {
            const count    = getCategoryCount(id);
            const isActive = activeCategory === id;
            return (
              <button
                key={id}
                onClick={() => setActiveCategory(id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all border-2 ${
                  isActive
                    ? 'bg-[#1E3A5F] text-white border-[#1E3A5F] shadow-md'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-[#1E3A5F] hover:text-[#1E3A5F]'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Notifications list ───────────────────────────── */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">{sectionTitle}</h2>

        {filteredNotifications.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-16 text-center">
            <BellIcon className="w-14 h-14 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg font-medium">
              {notifications.length === 0
                ? 'No notifications yet'
                : 'No notifications in this category'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredNotifications.map(notification => {
              const { Icon, bg, color } = getIconConfig(notification.type);
              const { label: catLabel, cls: catCls } = getCategoryLabel(notification.type);
              const isOrder        = notification.type.startsWith('ORDER_');
              const isDelivery     = notification.type === 'ORDER_OUT_FOR_DELIVERY';
              const isPrescription = notification.type.startsWith('PRESCRIPTION_');
              const isUnread       = !notification.isRead;

              return (
                <div
                  key={notification.id}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 md:p-6 relative cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => { if (isUnread) markAsRead(notification.id); }}
                >
                  <div className="flex gap-4">
                    {/* Icon square */}
                    <div className={`w-12 h-12 ${bg} rounded-xl flex items-center justify-center shrink-0 mt-0.5`}>
                      <Icon className={`w-6 h-6 ${color}`} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      {/* Category label + timestamp */}
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs font-bold tracking-widest uppercase ${catCls}`}>
                          {catLabel}
                        </span>
                        <span className="text-gray-300 text-xs">·</span>
                        <span className="text-xs text-gray-400 uppercase tracking-wide font-medium">
                          {formatTime(notification.createdAt)}
                        </span>
                      </div>

                      {/* Title */}
                      <h3 className="font-bold text-gray-900 text-base leading-snug mb-1">
                        {notification.title}
                      </h3>

                      {/* Message */}
                      <p className="text-sm text-gray-500 leading-relaxed mb-4">
                        {notification.message}
                      </p>

                      {/* Action buttons */}
                      <div className="flex flex-wrap gap-3">
                        {isDelivery && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (notification.orderId) router.push(`/patient/orders/${notification.orderId}`);
                            }}
                            className="px-5 py-2 rounded-xl bg-[#1E3A5F] text-white text-sm font-semibold hover:bg-[#162d4a] transition-colors"
                          >
                            Track Courier
                          </button>
                        )}
                        {isOrder && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (notification.orderId) router.push(`/patient/orders/${notification.orderId}`);
                            }}
                            className={`px-5 py-2 rounded-xl text-sm font-semibold transition-colors border-2 ${
                              isDelivery
                                ? 'border-gray-200 text-gray-700 hover:border-[#1E3A5F] hover:text-[#1E3A5F] bg-white'
                                : 'bg-[#1E3A5F] text-white border-[#1E3A5F] hover:bg-[#162d4a]'
                            }`}
                          >
                            View Order
                          </button>
                        )}
                        {isPrescription && (
                          <>
                            <button
                              onClick={(e) => { e.stopPropagation(); router.push('/patient/medications'); }}
                              className="px-5 py-2 rounded-xl bg-[#1E3A5F] text-white text-sm font-semibold hover:bg-[#162d4a] transition-colors"
                            >
                              View Prescription
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); router.push('/patient/pharmacies'); }}
                              className="px-5 py-2 rounded-xl border-2 border-gray-200 text-gray-700 text-sm font-semibold hover:border-[#1E3A5F] hover:text-[#1E3A5F] transition-colors bg-white"
                            >
                              Find Pharmacy
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Right column: unread dot + action */}
                    <div className="flex flex-col items-center gap-3 shrink-0">
                      {isUnread && (
                        <span className="w-3 h-3 rounded-full bg-blue-500 shadow-sm shadow-blue-300" />
                      )}
                      {isUnread ? (
                        <div className="relative">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenMenuId(openMenuId === notification.id ? null : notification.id);
                            }}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                          >
                            <EllipsisVerticalIcon className="w-5 h-5" />
                          </button>
                          {openMenuId === notification.id && (
                            <div className="absolute right-0 top-full mt-1 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-10 min-w-[160px]">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  markAsRead(notification.id);
                                  setOpenMenuId(null);
                                }}
                                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                              >
                                Mark as read
                              </button>
                              <button
                                onClick={(e) => { e.stopPropagation(); handleDelete(notification.id); }}
                                className="w-full px-4 py-2 text-left text-sm text-red-500 hover:bg-red-50"
                              >
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
                      ) : (
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDelete(notification.id); }}
                          className="p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                        >
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
