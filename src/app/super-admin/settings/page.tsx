// frontend/src/app/super-admin/settings/page.tsx
'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { ShieldCheckIcon, LockClosedIcon, BellIcon, CurrencyDollarIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

type Tab = 'account' | 'security' | 'notifications' | 'platform';

export default function SuperAdminSettingsPage() {
  const { user } = useAuth();
  const [tab, setTab] = useState<Tab>('account');
  const [saving, setSaving] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [platformFee, setPlatformFee] = useState('50');

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) { toast.error('Passwords do not match'); return; }
    if (passwords.newPassword.length < 8) { toast.error('Minimum 8 characters'); return; }
    setSaving(true);
    try {
      await api.put('/auth/change-password', passwords);
      toast.success('Password changed successfully!');
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally { setSaving(false); }
  };

  const handleSavePlatformFee = async () => {
    setSaving(true);
    try {
      await api.put('/super-admin/settings/platform-fee', { fee: parseFloat(platformFee) });
      toast.success('Platform fee updated!');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update');
    } finally { setSaving(false); }
  };

  const inputCls = "w-full px-3 py-2.5 border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none text-sm";
  const tabs = [
    { id: 'account' as const, label: 'Account', icon: ShieldCheckIcon },
    { id: 'security' as const, label: 'Security', icon: LockClosedIcon },
    { id: 'notifications' as const, label: 'Notifications', icon: BellIcon },
    { id: 'platform' as const, label: 'Platform', icon: CurrencyDollarIcon },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">⚙️ Settings</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Manage platform and account settings</p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setTab(id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${tab === id ? 'bg-red-600 text-white shadow' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:shadow-md'}`}>
            <Icon className="w-4 h-4" /> {label}
          </button>
        ))}
      </div>

      {/* Account Tab */}
      {tab === 'account' && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6">
          <h2 className="text-base font-bold text-gray-900 dark:text-gray-100 mb-6 border-b dark:border-gray-700 pb-3">Account Information</h2>
          <div className="flex items-center gap-5 mb-6">
            <div className="w-16 h-16 bg-linear-to-br from-red-500 to-pink-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">SA</div>
            <div>
              <p className="font-bold text-gray-900 dark:text-gray-100 text-lg">Super Administrator</p>
              <p className="text-gray-500 text-sm">{user?.email}</p>
              <div className="flex items-center gap-1 mt-1 text-green-600">
                <ShieldCheckIcon className="w-4 h-4" />
                <span className="text-xs font-medium">Full System Access</span>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Role</p>
              <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm">Super Administrator</p>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Email</p>
              <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm">{user?.email}</p>
            </div>
          </div>
        </div>
      )}

      {/* Security Tab */}
      {tab === 'security' && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6">
          <h2 className="text-base font-bold text-gray-900 dark:text-gray-100 mb-6 border-b dark:border-gray-700 pb-3">Change Password</h2>
          <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
            {[
              { field: 'currentPassword', label: 'Current Password' },
              { field: 'newPassword', label: 'New Password' },
              { field: 'confirmPassword', label: 'Confirm New Password' },
            ].map(({ field, label }) => (
              <div key={field}>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">{label}</label>
                <div className="relative">
                  <input type={showPwd ? 'text' : 'password'} required
                    value={(passwords as any)[field]}
                    onChange={e => setPasswords({ ...passwords, [field]: e.target.value })}
                    className={`${inputCls} pr-10`} />
                  <button type="button" onClick={() => setShowPwd(!showPwd)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    {showPwd ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            ))}
            <button type="submit" disabled={saving}
              className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-semibold disabled:opacity-50">
              {saving ? 'Changing...' : 'Change Password'}
            </button>
          </form>
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-xl">
            <div className="flex gap-3">
              <ShieldCheckIcon className="w-5 h-5 text-blue-600 shrink-0" />
              <p className="text-xs text-blue-700 dark:text-blue-300">
                As a super administrator, use a strong password with uppercase, lowercase, numbers and symbols. Change it regularly.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Notifications Tab */}
      {tab === 'notifications' && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6">
          <h2 className="text-base font-bold text-gray-900 dark:text-gray-100 mb-6 border-b dark:border-gray-700 pb-3">Notification Preferences</h2>
          <div className="space-y-3">
            {[
              { label: 'New pharmacy applications', desc: 'When a pharmacy submits for approval' },
              { label: 'Order alerts', desc: 'Unusual order activity on the platform' },
              { label: 'Revenue reports', desc: 'Weekly revenue summaries' },
              { label: 'System alerts', desc: 'Critical system status updates' },
            ].map(item => (
              <div key={item.label} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div>
                  <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">{item.label}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{item.desc}</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" defaultChecked className="sr-only peer" />
                  <div className="w-10 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                </label>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Platform Tab */}
      {tab === 'platform' && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6 space-y-6">
          <h2 className="text-base font-bold text-gray-900 dark:text-gray-100 border-b dark:border-gray-700 pb-3">Platform Configuration</h2>

          <div className="max-w-sm">
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Monthly Fee per Pharmacy (USD)
            </label>
            <div className="flex gap-3">
              <input type="number" min="0" step="0.01" value={platformFee}
                onChange={e => setPlatformFee(e.target.value)}
                className={inputCls} />
              <button onClick={handleSavePlatformFee} disabled={saving}
                className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium disabled:opacity-50 whitespace-nowrap">
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">This fee is charged to each approved pharmacy monthly.</p>
          </div>

          <div className="max-w-sm">
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Platform Status</label>
            <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 rounded-lg">
              <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse"></div>
              <p className="text-sm font-semibold text-green-700 dark:text-green-400">All Systems Operational</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}