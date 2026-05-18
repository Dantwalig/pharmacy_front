'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import {
  LayoutDashboard, ClipboardList, GitBranch, Users, User,
  LogOut, BarChart2, Package, Bell, X, Lock, Map,
} from 'lucide-react';
import { isPatientEnabled } from '@/lib/features';

interface PharmacySidebarProps {
  onOpenSupport?: () => void; // kept for layout compat
  open?: boolean;
  onClose?: () => void;
}

export default function PharmacySidebar({ open = false, onClose }: PharmacySidebarProps) {
  const pathname = usePathname();
  const { t } = useTranslation();

  const nav = [
    { href: '/pharmacy/dashboard',     icon: LayoutDashboard, label: t('pharmacyOwner.dashboard') },
    { href: '/pharmacy/orders',        icon: ClipboardList,   label: t('pharmacyOwner.orderOverview') },
    { href: '/pharmacy/branches',      icon: GitBranch,       label: t('pharmacyOwner.branchManagement') },
    { href: '/pharmacy/map',           icon: Map,             label: 'Branch Map' },
    { href: '/pharmacy/inventory',     icon: Package,         label: t('pharmacyOwner.inventory') },
    { href: '/pharmacy/patients',      icon: Users,           label: t('pharmacyOwner.patients') + (isPatientEnabled() ? '' : ' (Soon)') },
    { href: '/pharmacy/analytics',     icon: BarChart2,       label: t('pharmacyOwner.analytics') },
    { href: '/pharmacy/notifications', icon: Bell,            label: t('pharmacyOwner.notifications') },
    { href: '/pharmacy/profile',       icon: User,            label: t('pharmacyOwner.profile') },
  ];

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 flex flex-col w-72 transition-transform duration-300 ${open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      style={{ backgroundColor: '#1E4D8C' }}
    >
      {/* Header */}
      <div className="px-6 py-7 border-b border-white/10 flex items-center justify-between shrink-0">
        <div>
          <p className="text-white text-2xl font-bold tracking-tight">E-Vuze</p>
          <p className="text-white/60 text-sm mt-0.5">{t('pharmacyOwner.portal')}</p>
        </div>
        <button onClick={onClose} className="lg:hidden p-1 rounded-lg hover:bg-white/10 transition-colors" aria-label="Close sidebar">
          <X size={18} className="text-white/70" />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-4 py-5 space-y-1">
        {nav.map(({ href, icon: Icon, label }) => {
          const active = isActive(href);
          return (
            <Link key={href} href={href} onClick={onClose}
              className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all ${active ? 'text-white shadow-lg' : 'text-white/70 hover:text-white hover:bg-white/10'}`}
              style={active ? { background: 'linear-gradient(135deg, #3BAAEF 0%, #1B72C8 100%)' } : {}}
            >
              <div className="flex items-center gap-3">
                <Icon size={18} />
                {label}
              </div>
              {href === '/pharmacy/patients' && !isPatientEnabled() && (
                <Lock size={14} className="text-white/40" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-5 pb-6 shrink-0">
        <button
          onClick={() => { localStorage.clear(); window.location.href = '/login'; }}
          className="flex items-center gap-2.5 px-2 py-2 rounded-lg text-sm font-semibold transition-all hover:opacity-80"
          style={{ color: '#F26B6B' }}
        >
          <LogOut size={17} />
          {t('common.logout')}
        </button>
      </div>
    </aside>
  );
}
