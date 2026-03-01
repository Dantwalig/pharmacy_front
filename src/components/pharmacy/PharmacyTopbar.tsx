// frontend/src/components/pharmacy/PharmacyTopbar.tsx

'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useTranslation } from 'react-i18next';
import {
  BellIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';
import LanguageSwitcher from '@/components/shared/LanguageSwitcher';

export default function PharmacyTopbar() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const router = useRouter();
  const [showNotifications, setShowNotifications] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  const notifications = [
    { id: 1, type: 'order', message: 'New order received', time: '5 min ago' },
    { id: 2, type: 'stock', message: 'Low stock alert: Paracetamol', time: '1 hour ago' },
    { id: 3, type: 'system', message: 'System update available', time: '2 hours ago' },
  ];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="bg-white border-b border-gray-200 px-8 py-4 sticky top-0 z-30">
      <div className="flex items-center justify-between">
        {/* Left: Title */}
        <div>
          <h2 className="text-xl font-medium text-teal-600">E-Vuze Pharmacy</h2>
          <p className="text-sm text-gray-600">Manage Your Pharmacy</p>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-6">
          {/* Language Switcher */}
          <div className="flex items-center gap-2">
            <button className="px-3 py-1 text-sm font-medium bg-[#2D5F8D] text-white rounded-lg">
              Pharmacy Owner
            </button>
            <LanguageSwitcher />
          </div>

          {/* Notifications */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
            >
              <BellIcon className="w-6 h-6" />
              {notifications.length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
                <div className="px-4 py-3 border-b border-gray-200">
                  <h3 className="font-semibold text-gray-900">Notifications</h3>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications.length > 0 ? (
                    notifications.map((notif) => (
                      <div
                        key={notif.id}
                        className="px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors border-b border-gray-100 last:border-0"
                      >
                        <p className="text-sm text-gray-900 font-medium">
                          {notif.message}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {notif.time}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="px-4 py-8 text-center">
                      <p className="text-gray-500">No notifications</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Profile */}
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-semibold text-gray-900">
                {(user as any)?.pharmacy?.name || 'Pharmacy'}
              </p>
              <p className="text-xs text-gray-500">Pharmacy Owner</p>
            </div>
            <button className="p-1">
              <UserCircleIcon className="w-9 h-9 text-gray-600" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}