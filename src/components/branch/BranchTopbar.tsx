// frontend/src/components/branch/BranchTopbar.tsx

'use client';

import { useAuth } from '@/context/AuthContext';
import { UserCircleIcon } from '@heroicons/react/24/outline';
import LanguageSwitcher from '@/components/shared/LanguageSwitcher';

export default function BranchTopbar() {
  const { user } = useAuth();

  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-30">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-emerald-700">Branch Management</h2>
          <p className="text-xs text-gray-500">E-Vuze Branch Portal</p>
        </div>

        <div className="flex items-center gap-4">
          <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-semibold rounded-full">
            Branch Manager
          </span>
          <LanguageSwitcher />
          <div className="flex items-center gap-2">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-gray-900">{user?.email || 'Manager'}</p>
              <p className="text-xs text-gray-500">Branch Manager</p>
            </div>
            <UserCircleIcon className="w-9 h-9 text-gray-500" />
          </div>
        </div>
      </div>
    </div>
  );
}