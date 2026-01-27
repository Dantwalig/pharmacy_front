// frontend/src/components/patient/PatientSidebar.tsx

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import {
  HomeIcon,
  ShoppingBagIcon,
  MagnifyingGlassIcon,
  ShoppingCartIcon,
  ClipboardDocumentListIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';

const menuItems = [
  { id: 'dashboard', nameKey: 'patient.dashboard', href: '/patient/dashboard', icon: HomeIcon },
  { id: 'pharmacies', nameKey: 'patient.browsePharmacies', href: '/patient/pharmacies', icon: ShoppingBagIcon },
  { id: 'medications', nameKey: 'patient.searchMedications', href: '/patient/medications', icon: MagnifyingGlassIcon },
  { id: 'cart', nameKey: 'cart.title', href: '/patient/cart', icon: ShoppingCartIcon },
  { id: 'orders', nameKey: 'patient.myOrders', href: '/patient/orders', icon: ClipboardDocumentListIcon },
  { id: 'profile', nameKey: 'patient.myProfile', href: '/patient/profile', icon: UserCircleIcon },
];

export default function PatientSidebar() {
  const { t } = useTranslation();
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-linear-to-b from-purple-700 via-purple-800 to-indigo-900 text-white min-h-screen fixed left-0 top-0 shadow-2xl z-30">
      <div className="p-6 border-b border-purple-600/50">
        <div className="flex items-center gap-3">
          <div className="text-4xl">🏥</div>
          <div>
            <h1 className="text-2xl font-bold">E-Vuze</h1>
            <p className="text-xs text-purple-200">Healthcare Platform</p>
          </div>
        </div>
      </div>

      <nav className="p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');

          return (
            <Link
              key={item.id}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'bg-white text-purple-700 font-semibold shadow-lg transform scale-105'
                  : 'hover:bg-purple-600/50 hover:translate-x-1'
              }`}
            >
              <Icon className="w-5 h-5 shrink-0" />
              <span className="text-sm">{t(item.nameKey)}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-purple-600/50">
        <p className="text-xs text-purple-200 text-center">
          © 2025 E-Vuze Platform
        </p>
      </div>
    </aside>
  );
}