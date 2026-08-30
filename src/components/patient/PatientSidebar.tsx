'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/context/AuthContext';
import {
  HomeIcon, MagnifyingGlassIcon, ShoppingCartIcon,
  ClipboardDocumentListIcon, BellIcon, UserCircleIcon,
  ArrowRightOnRectangleIcon, XMarkIcon,
  ChevronDoubleLeftIcon, ChevronDoubleRightIcon,
} from '@heroicons/react/24/outline';
import Image from 'next/image';

const menuItems = [
  { id: 'dashboard', nameKey: 'patient.dashboard', href: '/patient/dashboard', icon: HomeIcon },
  { id: 'search', nameKey: 'patient.findPharmacyAndMedicine', href: '/patient/search', icon: MagnifyingGlassIcon },
  { id: 'cart', nameKey: 'cart.title', href: '/patient/cart', icon: ShoppingCartIcon },
  { id: 'orders', nameKey: 'patient.myOrders', href: '/patient/orders', icon: ClipboardDocumentListIcon },
  { id: 'notifications', nameKey: 'common.notifications', href: '/patient/notifications', icon: BellIcon },
  { id: 'profile', nameKey: 'patient.myProfile', href: '/patient/profile', icon: UserCircleIcon },
];

interface PatientSidebarProps {
  open?: boolean;
  onClose?: () => void;
  onOpenSupport?: () => void; // kept for layout compat
  collapsed?: boolean;
  onToggleCollapsed?: () => void;
}

export default function PatientSidebar({ open = false, onClose, collapsed = false, onToggleCollapsed }: PatientSidebarProps) {
  const { t } = useTranslation();
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();

  const handleLogout = () => { logout(); router.push('/login'); };
  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 flex flex-col w-64 transition-all duration-300 bg-brand-navy ${collapsed ? 'lg:w-20' : ''} ${open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
    >
      {/* Header */}
      <div className={`py-7 border-b border-white/10 flex items-center justify-between shrink-0 ${collapsed ? 'lg:flex-col lg:gap-3 lg:px-0 lg:justify-center' : 'px-6'}`}>
        <div className={collapsed ? 'lg:hidden' : ''}>
          <p className="text-white text-2xl font-bold tracking-tight">E-Vuze</p>
          <p className="text-white/60 text-sm mt-0.5">{t('patient.portal')}</p>
        </div>
        {collapsed && (
          <div className="hidden lg:flex w-9 h-9 rounded-full bg-white shadow-md items-center justify-center overflow-hidden shrink-0">
            <Image src="/E-Vuze Logo.svg" alt="E-Vuze" width={28} height={28} className="object-contain" />
          </div>
        )}
        <div className="flex items-center gap-1">
          <button onClick={onClose} className="lg:hidden p-1 rounded-lg hover:bg-white/10" aria-label="Close sidebar">
            <XMarkIcon className="w-[18px] h-[18px] text-white/70" />
          </button>
          <button
            onClick={onToggleCollapsed}
            className="hidden lg:flex p-1.5 rounded-lg hover:bg-white/10"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? (
              <ChevronDoubleRightIcon className="w-[18px] h-[18px] text-white/70" />
            ) : (
              <ChevronDoubleLeftIcon className="w-[18px] h-[18px] text-white/70" />
            )}
          </button>
        </div>
      </div>

      {/* Nav */}
      <nav className={`flex-1 py-5 space-y-1 ${collapsed ? 'lg:px-2.5' : 'px-4'}`}>
        {menuItems.map(({ href, nameKey, icon: Icon }) => {
          const active = isActive(href);
          const label = t(nameKey);
          return (
            <Link key={href} href={href} onClick={onClose}
              title={collapsed ? label : undefined}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${collapsed ? 'lg:justify-center lg:px-0' : ''} ${active ? 'text-white shadow-md bg-brand-teal' : 'text-white/70 hover:text-white hover:bg-white/10'}`}
            >
              <Icon className="w-[18px] h-[18px] shrink-0" />
              <span className={collapsed ? 'lg:hidden' : ''}>{label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer — logout */}
      <div className={`pb-5 shrink-0 ${collapsed ? 'lg:px-2.5' : 'px-4'}`}>
        <button
          onClick={handleLogout}
          title={collapsed ? t('common.logout') : undefined}
          className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl text-white/70 hover:text-white hover:bg-white/10 text-sm font-medium transition-all ${collapsed ? 'lg:justify-center lg:px-0' : ''}`}
        >
          <ArrowRightOnRectangleIcon className="w-[18px] h-[18px] shrink-0" />
          <span className={collapsed ? 'lg:hidden' : ''}>{t('common.logout')}</span>
        </button>
      </div>
    </aside>
  );
}
