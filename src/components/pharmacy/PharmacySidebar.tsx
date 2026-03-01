// frontend/src/components/pharmacy/PharmacySidebar.tsx

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/context/AuthContext';
import {
  HomeIcon,
  ClipboardDocumentListIcon,
  BuildingStorefrontIcon,
  UserGroupIcon,
  UserCircleIcon,
  ArrowRightStartOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

export default function PharmacySidebar() {
  const { t } = useTranslation();
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigation = [
    {
      name: 'Dashboard',
      href: '/pharmacy/dashboard',
      icon: HomeIcon,
    },
    {
      name: 'Order Overview',
      href: '/pharmacy/orders',
      icon: ClipboardDocumentListIcon,
    },
    {
      name: 'Branch Management',
      href: '/pharmacy/branches',
      icon: BuildingStorefrontIcon,
    },
    {
      name: 'Employees',
      href: '/pharmacy/employees',
      icon: UserGroupIcon,
    },
    {
      name: 'Profile',
      href: '/pharmacy/profile',
      icon: UserCircleIcon,
    },
  ];

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-[#1E4D8C] text-white rounded-lg shadow-lg"
      >
        {isMobileMenuOpen ? (
          <XMarkIcon className="w-6 h-6" />
        ) : (
          <Bars3Icon className="w-6 h-6" />
        )}
      </button>

      {/* Overlay for mobile */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={closeMobileMenu}
        />
      )}

      {/* Sidebar - Fixed Height, No Scroll */}
      <div
        className={`
          fixed inset-y-0 left-0 z-40 w-72
          bg-linear-to-b from-[#1E4D8C] via-[#2563a8] to-[#1a3d6f] text-white
          transform transition-transform duration-300 ease-in-out
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          flex flex-col h-screen
        `}
      >
        {/* Top Section */}
        <div className="p-6">
          {/* Logo */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold">E-Vuze</h1>
            <p className="text-sm text-blue-200">Pharmacy Portal</p>
          </div>

          {/* Navigation */}
          <nav className="space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              const Icon = item.icon;

              return (
                <Link key={item.name} href={item.href} onClick={closeMobileMenu}>
                  <div
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                      isActive
                        ? 'bg-teal-500 text-white font-medium'
                        : 'text-white hover:bg-white/10'
                    }`}
                  >
                    <Icon className="w-5 h-5 shrink-0" />
                    <span className="text-sm">{item.name}</span>
                  </div>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Spacer to push logout to bottom */}
        <div className="flex-1"></div>

        {/* Bottom Section - Logout */}
        <div className="p-6 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-white hover:bg-white/10 rounded-lg transition-all"
          >
            <ArrowRightStartOnRectangleIcon className="w-5 h-5 shrink-0" />
            <span className="text-sm">Logout</span>
          </button>
        </div>
      </div>
    </>
  );
}