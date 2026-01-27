// frontend/src/components/super-admin/SuperAdminSidebar.tsx

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import {
  HomeIcon,
  BuildingStorefrontIcon,
  UserGroupIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';

export default function SuperAdminSidebar() {
  const { t } = useTranslation();
  const pathname = usePathname();

  const navigation = [
    {
      name: t('superAdmin.dashboard'),
      href: '/super-admin/dashboard',
      icon: HomeIcon,
      emoji: '👑',
    },
    {
      name: t('superAdmin.pharmacies'),
      href: '/super-admin/pharmacies',
      icon: BuildingStorefrontIcon,
      emoji: '🏥',
    },
    {
      name: t('superAdmin.patients'),
      href: '/super-admin/patients',
      icon: UserGroupIcon,
      emoji: '👥',
    },
    {
      name: t('superAdmin.analytics'),
      href: '/super-admin/analytics',
      icon: ChartBarIcon,
      emoji: '📊',
    },
    {
      name: t('common.settings'),
      href: '/super-admin/settings',
      icon: Cog6ToothIcon,
      emoji: '⚙️',
    },
  ];

  return (
    <div className="w-64 bg-linear-to-b from-red-600 to-pink-700 text-white min-h-screen p-6 sticky top-0">
      {/* Logo */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-2xl backdrop-blur-sm">
            <ShieldCheckIcon className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold">E-Vuze</h1>
            <p className="text-xs text-red-200">{t('superAdmin.portal')}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="space-y-2">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          const Icon = item.icon;

          return (
            <Link key={item.name} href={item.href}>
              <div
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'bg-white/20 shadow-lg backdrop-blur-sm transform scale-105'
                    : 'hover:bg-white/10 hover:transform hover:scale-105'
                }`}
              >
                <span className="text-2xl">{item.emoji}</span>
                <span className="font-medium">{item.name}</span>
              </div>
            </Link>
          );
        })}
      </nav>

      {/* System Status */}
      <div className="absolute bottom-6 left-6 right-6">
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <p className="text-sm font-semibold">{t('superAdmin.systemStatus')}</p>
          </div>
          <p className="text-xs text-red-200">{t('superAdmin.allSystemsOperational')}</p>
        </div>
      </div>
    </div>
  );
}