'use client';

import { useTranslation } from 'react-i18next';
import { BellIcon, ShoppingCartIcon, Bars3Icon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import LanguageSwitcher from '@/components/shared/LanguageSwitcher';
import UserAccountBlock from '@/components/shared/UserAccountBlock';
import { useCart } from '@/context/CartContext';
import { useUnreadNotifications } from '@/hooks/useUnreadNotifications';

interface PatientTopbarProps {
  onMenuClick?: () => void;
}

export default function PatientTopbar({ onMenuClick }: PatientTopbarProps) {
  const { t } = useTranslation();
  const { getItemCount } = useCart();
  const { unreadCount } = useUnreadNotifications('patient');

  const cartCount = getItemCount();

  return (
    <header className="sticky top-0 z-30 h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-6">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          aria-label="Open sidebar"
        >
          <Bars3Icon className="w-[18px] h-[18px] text-gray-600" />
        </button>
        <p className="text-base font-semibold text-brand-teal">
          {t('topbar.eVuzeHealthcare')}
        </p>
      </div>

      <div className="flex items-center gap-2 lg:gap-3">
        <LanguageSwitcher />

        <Link href="/patient/cart">
          <button
            className="relative p-2 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="View shopping cart"
          >
            <ShoppingCartIcon className="w-[18px] h-[18px] text-gray-600" />
            {cartCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold bg-brand-teal">
                {cartCount}
              </span>
            )}
          </button>
        </Link>

        <Link href="/patient/notifications">
          <button
            className="relative p-2 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Notifications"
          >
            <BellIcon className="w-[18px] h-[18px] text-gray-600" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full" style={{ backgroundColor: '#EF4444' }} />
            )}
          </button>
        </Link>

        <UserAccountBlock />
      </div>
    </header>
  );
}
