// frontend/src/app/super-admin/profile/page.tsx

'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useTranslation } from 'react-i18next';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import SuperAdminTopbar from '@/components/super-admin/SuperAdminTopbar';
import SuperAdminSidebar from '@/components/super-admin/SuperAdminSidebar';
import {
  UserCircleIcon,
  LockClosedIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';

export default function SuperAdminProfilePage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwords.newPassword !== passwords.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (passwords.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    setChangingPassword(true);
    try {
      await api.put('/auth/change-password', {
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
        confirmPassword: passwords.confirmPassword,
      });
      
      toast.success('Password changed successfully!');
      setPasswords({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to change password');
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      <SuperAdminSidebar />

      <div className="flex-1 flex flex-col">
        <SuperAdminTopbar />

        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div>
              <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-3">
                👤 {t('common.profile')}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Manage your super admin account
              </p>
            </div>

            {/* Profile Info */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6 flex items-center gap-2">
                <UserCircleIcon className="w-6 h-6" />
                Account Information
              </h2>

              <div className="flex items-center gap-6 mb-6">
                <div className="w-20 h-20 bg-linear-to-br from-red-500 to-pink-500 rounded-full flex items-center justify-center text-white text-3xl font-bold">
                  SA
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    Super Admin
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">{user?.email}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <ShieldCheckIcon className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-green-600 dark:text-green-400">
                      Administrator Access
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Role</p>
                  <p className="font-semibold text-gray-900 dark:text-gray-100">
                    Super Administrator
                  </p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Email</p>
                  <p className="font-semibold text-gray-900 dark:text-gray-100">
                    {user?.email}
                  </p>
                </div>
              </div>
            </div>

            {/* Change Password */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6 flex items-center gap-2">
                <LockClosedIcon className="w-6 h-6" />
                Change Password
              </h2>

              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Current Password
                  </label>
                  <input
                    type="password"
                    value={passwords.currentPassword}
                    onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
                    required
                    className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={passwords.newPassword}
                    onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                    required
                    minLength={8}
                    className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={passwords.confirmPassword}
                    onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                    required
                    minLength={8}
                    className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={changingPassword}
                  className="w-full bg-linear-to-r from-purple-600 to-indigo-600 text-white py-4 rounded-xl font-bold hover:from-purple-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
                >
                  {changingPassword ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Changing Password...</span>
                    </div>
                  ) : (
                    'Change Password'
                  )}
                </button>
              </form>
            </div>

            {/* Security Notice */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-2xl p-6">
              <div className="flex gap-4">
                <ShieldCheckIcon className="w-6 h-6 text-blue-600 shrink-0" />
                <div>
                  <h3 className="font-bold text-blue-900 dark:text-blue-100 mb-2">
                    Security Recommendation
                  </h3>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    As a super administrator, it's recommended to change your password regularly
                    and use a strong password with a combination of letters, numbers, and symbols.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}