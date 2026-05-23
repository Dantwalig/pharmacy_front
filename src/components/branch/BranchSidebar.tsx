'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { LayoutDashboard, Users, Clock, Lock, LogOut, X, BarChart2, Package, ArrowLeftRight, Map } from 'lucide-react';

interface BranchSidebarProps {
  open?: boolean;
  onClose?: () => void;
  onOpenSupport?: () => void; // kept for layout compat, no longer renders a button
}

export default function BranchSidebar({ open = false, onClose }: BranchSidebarProps) {
  const pathname = usePathname();
  const { t } = useTranslation();

  const nav = [
    { href: '/branch/dashboard',       icon: LayoutDashboard, label: t('branch.dashboard') },
    { href: '/branch/staff',           icon: Users,           label: t('branch.staff') },
    { href: '/branch/attendance',      icon: Clock,           label: t('branch.attendance') },
    { href: '/branch/analytics',       icon: BarChart2,       label: t('branch.analytics') },
    { href: '/branch/inventory',       icon: Package,         label: t('branch.inventory') },
    { href: '/branch/transfers',       icon: ArrowLeftRight,  label: t('branch.transfers') },
    { href: '/branch/map',             icon: Map,             label: t('extras.branch.networkMapTitle') },
    { href: '/branch/change-password', icon: Lock,            label: t('branch.changePassword') },
  ];

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 flex flex-col w-64 transition-transform duration-300 ${open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      style={{ backgroundColor: '#1E4D8C' }}
    >
      {/* Header */}
      <div className="px-6 py-7 border-b border-white/10 flex items-center justify-between shrink-0">
        <div>
          <p className="text-white text-2xl font-bold tracking-tight">E-Vuze</p>
          <p className="text-white/60 text-sm mt-0.5">{t('branch.portal')}</p>
        </div>
        <button onClick={onClose} className="lg:hidden p-1 rounded-lg hover:bg-white/10" aria-label="Close sidebar">
          <X size={18} className="text-white/70" />
        </button>
      </div>

      {/* Nav — no overflow-y-auto so sidebar never scrolls */}
      <nav className="flex-1 px-4 py-5 space-y-1">
        {nav.map(({ href, icon: Icon, label }) => {
          const active = isActive(href);
          return (
            <Link key={href} href={href} onClick={onClose}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${active ? 'text-white shadow-md' : 'text-white/70 hover:text-white hover:bg-white/10'}`}
              style={active ? { backgroundColor: '#2D9B8A' } : {}}
            >
              <Icon size={18} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Footer — just logout */}
      <div className="px-4 pb-5 shrink-0">
        <button
          onClick={() => { localStorage.clear(); window.location.href = '/login'; }}
          className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-white/70 hover:text-white hover:bg-white/10 text-sm font-medium"
        >
          <LogOut size={18} />
          {t('common.logout')}
        </button>
      </div>
    </aside>
  );
}
