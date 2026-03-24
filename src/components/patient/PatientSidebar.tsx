'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/context/AuthContext';
import {
  HomeIcon,
  MagnifyingGlassIcon,
  ShoppingCartIcon,
  ClipboardDocumentListIcon,
  BellIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  BuildingStorefrontIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

const menuItems = [
  { id: 'dashboard', nameKey: 'patient.dashboard', href: '/patient/dashboard', icon: HomeIcon },
  { id: 'search', nameKey: 'Find Pharmacy & Medicine', href: '/patient/search', icon: MagnifyingGlassIcon },
  { id: 'cart', nameKey: 'cart.title', href: '/patient/cart', icon: ShoppingCartIcon },
  { id: 'orders', nameKey: 'patient.myOrders', href: '/patient/orders', icon: ClipboardDocumentListIcon },
  { id: 'notifications', nameKey: 'common.notifications', href: '/patient/notifications', icon: BellIcon },
  { id: 'profile', nameKey: 'patient.myProfile', href: '/patient/profile', icon: UserCircleIcon },
];

interface PatientSidebarProps {
  open?: boolean;
  onClose?: () => void;
}

export default function PatientSidebar({ open = false, onClose }: PatientSidebarProps) {
  const { t } = useTranslation();
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <aside className={`
      w-64 bg-gradient-to-b from-blue-700 via-blue-800 to-blue-900 text-white min-h-screen
      fixed left-0 top-0 shadow-2xl z-40 flex flex-col
      transition-transform duration-300
      ${open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
    `}>
    <div className="p-6 border-b border-blue-600/50 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <BuildingStorefrontIcon className="w-10 h-10 text-white" />
        <div>
          <h1 className="text-2xl font-bold text-white">Evuze</h1>
          <p className="text-xs text-blue-200">{t('auth.healthcarePlatform')}</p>
        </div>
      </div>
      <button
          onClick={onClose}
          className="lg:hidden p-1 rounded-lg hover:bg-blue-600/50 transition-colors"
        >
        <XMarkIcon className="w-5 h-5" />
      </button>
    </div>

    <nav className="p-4 space-y-2 flex-1">
      {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');

          return (
            <Link
              key={item.id}
              href={item.href}
              onClick={onClose}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'bg-teal-500 text-white font-semibold shadow-lg'
                  : 'hover:bg-blue-600/50 hover:translate-x-1'
              }`}
            >
            <Icon className="w-5 h-5 shrink-0" />
            <span className="text-sm">{t(item.nameKey)}</span>
          </Link>
        );
        })}
      </nav>

    <div className="p-4 border-t border-blue-600/50">
      <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 hover:bg-blue-600/50 w-full text-left"
        >
        <ArrowRightOnRectangleIcon className="w-5 h-5 shrink-0" />
        <span className="text-sm">{t('common.logout')}</span>
      </button>
    </div>

    <div className="p-4 border-t border-blue-600/50">
      <p className="text-xs text-blue-200 text-center">
        &copy; 2026 Evuze Platform
        </p>
    </div>
  </aside>
);
}
