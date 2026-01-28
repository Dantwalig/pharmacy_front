// frontend/src/app/super-admin/settings/page.tsx

'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import SuperAdminTopbar from '@/components/super-admin/SuperAdminTopbar';
import SuperAdminSidebar from '@/components/super-admin/SuperAdminSidebar';
import {
  Cog6ToothIcon,
  BellIcon,
  ShieldCheckIcon,
  CurrencyDollarIcon,
} from '@heroicons/react/24/outline';

export default function SuperAdminSettingsPage() {
  const { t } = useTranslation();
  const [settings, setSettings] = useState({
    platformFee: 50,
    autoApprovePharmacies: false,
    emailNotifications: true,
    maintenanceMode: false,
  });

  const handleSave = () => {
    // In a real app, you'd call the API here
    toast.success('Settings saved successfully!');
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
                ⚙️ {t('common.settings')}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Manage platform settings and configurations
              </p>
            </div>

            {/* Platform Settings */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6 flex items-center gap-2">
                <CurrencyDollarIcon className="w-6 h-6" />
                Platform Settings
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Monthly Platform Fee (per pharmacy)
                  </label>
                  <input
                    type="number"
                    value={settings.platformFee}
                    onChange={(e) => setSettings({ ...settings, platformFee: Number(e.target.value) })}
                    className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Pharmacy Approval Settings */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6 flex items-center gap-2">
                <ShieldCheckIcon className="w-6 h-6" />
                Pharmacy Approval
              </h2>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-900 dark:text-gray-100">
                    Auto-approve pharmacies
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Automatically approve pharmacy registrations
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.autoApprovePharmacies}
                    onChange={(e) => setSettings({ ...settings, autoApprovePharmacies: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"></div>
                </label>
              </div>
            </div>

            {/* Notification Settings */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6 flex items-center gap-2">
                <BellIcon className="w-6 h-6" />
                Notifications
              </h2>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-gray-100">
                      Email notifications
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Receive email notifications for important events
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.emailNotifications}
                      onChange={(e) => setSettings({ ...settings, emailNotifications: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"></div>
                  </label>
                </div>
              </div>
            </div>

            {/* Maintenance Mode */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border-2 border-red-200 dark:border-red-800">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6 flex items-center gap-2">
                <Cog6ToothIcon className="w-6 h-6 text-red-600" />
                <span className="text-red-600">Danger Zone</span>
              </h2>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-900 dark:text-gray-100">
                    Maintenance Mode
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Enable maintenance mode to restrict platform access
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.maintenanceMode}
                    onChange={(e) => setSettings({ ...settings, maintenanceMode: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 dark:peer-focus:ring-red-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-red-600"></div>
                </label>
              </div>
            </div>

            {/* Save Button */}
            <button
              onClick={handleSave}
              className="w-full bg-linear-to-r from-purple-600 to-indigo-600 text-white py-4 rounded-xl font-bold hover:from-purple-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              Save Settings
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}