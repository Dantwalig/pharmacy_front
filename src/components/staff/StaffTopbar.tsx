'use client';

import { useTranslation } from 'react-i18next';

import { Bars3Icon } from '@heroicons/react/24/outline';
import LanguageSwitcher from '@/components/shared/LanguageSwitcher';
import WorkspaceSwitcher from '@/components/branch/WorkspaceSwitcher';
import UserAccountBlock from '@/components/shared/UserAccountBlock';

interface StaffTopbarProps {
  onMenuClick?: () => void;
}

export default function StaffTopbar({
  onMenuClick }: StaffTopbarProps) {
  const { t } = useTranslation();

  return (
    <div className="bg-white border-b border-gray-200 px-4 lg:px-6 py-4 sticky top-0 z-30">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Open sidebar"
          >
            <Bars3Icon className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h2 className="text-lg font-semibold text-violet-700">{t('topbar.staffPortal')}</h2>
            <p className="text-xs text-gray-500 hidden sm:block">{t('topbar.eVuzeHealthcare')}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <WorkspaceSwitcher />
          <LanguageSwitcher />
          <UserAccountBlock />
        </div>
      </div>
    </div>
  );
}
