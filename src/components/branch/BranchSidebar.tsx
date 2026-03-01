// frontend/src/components/branch/BranchSidebar.tsx

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  HomeIcon,
  UserGroupIcon,
  ClipboardDocumentCheckIcon,
  ArrowRightStartOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

const navigation = [
  { name: 'Dashboard', href: '/branch/dashboard', icon: HomeIcon },
  { name: 'Staff', href: '/branch/staff', icon: UserGroupIcon },
  { name: 'Attendance', href: '/branch/attendance', icon: ClipboardDocumentCheckIcon },
];

export default function BranchSidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-emerald-700 text-white rounded-lg shadow-lg"
      >
        {isMobileMenuOpen ? <XMarkIcon className="w-6 h-6" /> : <Bars3Icon className="w-6 h-6" />}
      </button>

      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 bg-black/50 z-40" onClick={closeMobileMenu} />
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed inset-y-0 left-0 z-40 w-64
          bg-linear-to-b from-emerald-800 via-emerald-700 to-emerald-900 text-white
          transform transition-transform duration-300 ease-in-out
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          flex flex-col h-screen
        `}
      >
        {/* Logo */}
        <div className="p-6">
          <div className="mb-8">
            <h1 className="text-xl font-bold">E-Vuze</h1>
            <p className="text-xs text-emerald-200 mt-1">Branch Manager Portal</p>
          </div>

          {/* Nav */}
          <nav className="space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              const Icon = item.icon;
              return (
                <Link key={item.name} href={item.href} onClick={closeMobileMenu}>
                  <div className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    isActive ? 'bg-teal-500 text-white font-medium' : 'text-white hover:bg-white/10'
                  }`}>
                    <Icon className="w-5 h-5 shrink-0" />
                    <span className="text-sm">{item.name}</span>
                  </div>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex-1" />

        {/* Logout */}
        <div className="p-6 border-t border-white/10">
          <button
            onClick={logout}
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