// frontend/src/components/patient/PatientTopbar.tsx

'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { ShoppingCartIcon, BellIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import LanguageSwitcher from '@/components/shared/LanguageSwitcher';

export default function PatientTopbar() {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const { getItemCount } = useCart();
  const router = useRouter();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);

  const cartCount = getItemCount();

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const notifications = [
    {
      id: '1',
      title: t('patient.topbar.newMessage', { doctor: 'Dr. Sarah Johnson' }),
      message: 'Your prescription is ready',
      time: '5 min ago',
      read: false,
    },
    {
      id: '2',
      title: t('patient.topbar.prescriptionReady'),
      message: 'Care Pharmacy has your order ready',
      time: '1 hour ago',
      read: true,
    },
  ];

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm px-6 py-4 flex items-center justify-between sticky top-0 z-40">
      <div className="flex items-center gap-2">
        <span className="text-2xl">🏥</span>
      </div>

      <div className="text-xl font-bold text-purple-700 dark:text-purple-400 text-center">
        {t('patient.topbar.title')}
      </div>

      <div className="flex items-center gap-6">
        {/* Language Switcher */}
        <LanguageSwitcher />

        {/* Notifications */}
        <div className="relative" ref={notificationRef}>
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowDropdown(false);
            }}
            className="relative focus:outline-none hover:bg-gray-100 dark:hover:bg-gray-700 p-2 rounded-full transition-colors"
          >
            <BellIcon className="w-6 h-6 text-gray-600 dark:text-gray-300" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50 max-h-96 overflow-hidden">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                <h3 className="font-semibold text-gray-800 dark:text-gray-100">{t('common.notifications')}</h3>
              </div>

              <div className="divide-y divide-gray-100 dark:divide-gray-700 max-h-80 overflow-y-auto">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors ${
                      !notification.read ? 'bg-purple-50 dark:bg-purple-900/20' : ''
                    }`}
                  >
                    <div className="flex gap-3">
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm ${!notification.read ? 'font-semibold' : 'font-medium'} text-gray-800 dark:text-gray-100`}>
                          {notification.title}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{notification.message}</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{notification.time}</p>
                      </div>
                      {!notification.read && (
                        <span className="w-2 h-2 bg-purple-600 rounded-full mt-1 shrink-0"></span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Cart Icon */}
        <Link href="/patient/cart" className="relative">
          <button className="relative focus:outline-none hover:bg-gray-100 dark:hover:bg-gray-700 p-2 rounded-full transition-colors">
            <ShoppingCartIcon className="w-6 h-6 text-gray-600 dark:text-gray-300" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-purple-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                {cartCount}
              </span>
            )}
          </button>
        </Link>

        {/* User Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => {
              setShowDropdown(!showDropdown);
              setShowNotifications(false);
            }}
            className="flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-700 px-3 py-2 rounded-lg transition-colors"
          >
            <span className="font-medium text-gray-800 dark:text-gray-200">{user?.email || 'Patient'}</span>
            <span className="text-sm">▼</span>
          </button>

          {showDropdown && (
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50">
              <div className="py-1">
                <Link
                  href="/patient/profile"
                  onClick={() => setShowDropdown(false)}
                  className="w-full px-4 py-2 text-sm text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                >
                  <span>👤</span> {t('common.profile')}
                </Link>
                <div className="border-t border-gray-100 dark:border-gray-700 my-1"></div>
                <button
                  onClick={() => {
                    logout();
                    setShowDropdown(false);
                  }}
                  className="w-full px-4 py-2 text-sm text-left text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
                >
                  <span>🚪</span> {t('common.logout')}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}