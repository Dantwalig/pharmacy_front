// frontend/src/components/pharmacy/PharmacySidebar.tsx

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import {
  HomeIcon,
  ShoppingBagIcon,
  CubeIcon,
  ChartBarIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline';

export default function PharmacySidebar() {
  const { t } = useTranslation();
  const pathname = usePathname();

  const navigation = [
    {
      name: t('pharmacy.dashboard'),
      href: '/pharmacy/dashboard',
      icon: HomeIcon,
      emoji: '🏠',
    },
    {
      name: t('pharmacy.orders'),
      href: '/pharmacy/orders',
      icon: ShoppingBagIcon,
      emoji: '📦',
    },
    {
      name: t('pharmacy.inventory'),
      href: '/pharmacy/inventory',
      icon: CubeIcon,
      emoji: '💊',
    },
    {
      name: t('pharmacy.analytics'),
      href: '/pharmacy/analytics',
      icon: ChartBarIcon,
      emoji: '📊',
    },
    {
      name: t('common.settings'),
      href: '/pharmacy/settings',
      icon: Cog6ToothIcon,
      emoji: '⚙️',
    },
  ];

  return (
    <div className="w-64 bg-linear-to-b from-purple-600 to-indigo-700 text-white min-h-screen p-6 sticky top-0">
      {/* Logo */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-2xl backdrop-blur-sm">
            💊
          </div>
          <div>
            <h1 className="text-xl font-bold">E-Vuze</h1>
            <p className="text-xs text-purple-200">{t('pharmacy.portal')}</p>
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

      {/* Bottom Info */}
      <div className="absolute bottom-6 left-6 right-6">
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
          <p className="text-sm font-semibold mb-1">{t('pharmacy.needHelp')}</p>
          <p className="text-xs text-purple-200 mb-3">{t('pharmacy.contactSupport')}</p>
          <button className="w-full bg-white text-purple-600 py-2 rounded-lg text-sm font-semibold hover:bg-purple-50 transition-colors">
            {t('pharmacy.support')}
          </button>
        </div>
      </div>
    </div>
  );
}