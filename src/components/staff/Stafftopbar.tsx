// frontend/src/components/staff/StaffTopbar.tsx

'use client';

import { useAuth } from '@/context/AuthContext';
import { UserCircleIcon } from '@heroicons/react/24/outline';
import LanguageSwitcher from '@/components/shared/LanguageSwitcher';

const ROLE_LABELS: Record<string, { label: string; color: string }> = {
  PHARMACIST: { label: 'Pharmacist', color: 'bg-violet-100 text-violet-800' },
  CASHIER:    { label: 'Cashier',    color: 'bg-blue-100 text-blue-800' },
  NURSE:      { label: 'Nurse',      color: 'bg-pink-100 text-pink-800' },
};

export default function StaffTopbar() {
  const { user } = useAuth();
  const roleInfo = ROLE_LABELS[user?.role || ''] || { label: 'Staff', color: 'bg-gray-100 text-gray-800' };

  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-30">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-violet-700">Staff Portal</h2>
          <p className="text-xs text-gray-500">E-Vuze Healthcare Platform</p>
        </div>

        <div className="flex items-center gap-4">
          <span className={`px-3 py-1 text-xs font-semibold rounded-full ${roleInfo.color}`}>
            {roleInfo.label}
          </span>
          <LanguageSwitcher />
          <div className="flex items-center gap-2">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-gray-900">{user?.email || 'Staff'}</p>
              <p className="text-xs text-gray-500">{roleInfo.label}</p>
            </div>
            <UserCircleIcon className="w-9 h-9 text-gray-500" />
          </div>
        </div>
      </div>
    </div>
  );
}