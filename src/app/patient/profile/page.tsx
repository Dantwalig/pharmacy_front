// frontend/src/app/patient/profile/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { UserCircleIcon, LockClosedIcon, BellIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

type Tab = 'profile' | 'security' | 'notifications';

export default function PatientProfilePage() {
  const { user } = useAuth();
  const [tab, setTab] = useState<Tab>('profile');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({ firstName: '', lastName: '', phone: '', address: '', dateOfBirth: '', gender: 'MALE' });
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [showPwd, setShowPwd] = useState(false);

  useEffect(() => { fetchProfile(); }, []);

  const fetchProfile = async () => {
    try {
      // Correct endpoint: GET /patients/profile
      const res = await api.get('/patients/profile');
      const d = res.data;
      setProfile({
        firstName: d.firstName || '', lastName: d.lastName || '',
        phone: d.phone || '', address: d.address || '',
        dateOfBirth: d.dateOfBirth ? new Date(d.dateOfBirth).toISOString().split('T')[0] : '',
        gender: d.gender || 'MALE',
      });
    } catch { toast.error('Failed to load profile'); }
    finally { setLoading(false); }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try {
      // Correct endpoint: PUT /patients/profile
      await api.put('/patients/profile', profile);
      toast.success('Profile updated!');
    } catch (err: any) { toast.error(err.response?.data?.message || 'Update failed'); }
    finally { setSaving(false); }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) { toast.error('Passwords do not match'); return; }
    if (passwords.newPassword.length < 8) { toast.error('Min 8 characters'); return; }
    setSaving(true);
    try {
      await api.put('/auth/change-password', passwords);
      toast.success('Password changed!');
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err: any) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  const inputCls = "w-full px-3 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none text-sm";

  if (loading) return <div className="flex justify-center py-20"><LoadingSpinner /></div>;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="bg-linear-to-r from-blue-600 to-blue-800 rounded-2xl p-8 text-white">
        <h1 className="text-3xl font-bold mb-1">My Profile</h1>
        <p className="text-blue-100 text-sm">Manage your account settings</p>
      </div>

      {/* Tab Nav */}
      <div className="flex gap-2 flex-wrap">
        {([
          { id: 'profile', label: 'Profile Info', icon: UserCircleIcon },
          { id: 'security', label: 'Security', icon: LockClosedIcon },
          { id: 'notifications', label: 'Notifications', icon: BellIcon },
        ] as const).map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setTab(id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${tab === id ? 'bg-teal-500 text-white shadow' : 'bg-white text-gray-700 hover:shadow-md'}`}>
            <Icon className="w-4 h-4" /> {label}
          </button>
        ))}
      </div>

      {/* Profile Tab */}
      {tab === 'profile' && (
        <form onSubmit={handleSaveProfile} className="bg-white rounded-2xl shadow p-6 space-y-4">
          {/* Avatar */}
          <div className="flex items-center gap-4 pb-4 border-b">
            <div className="w-16 h-16 bg-linear-to-br from-blue-500 to-teal-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
              {profile.firstName?.charAt(0)}{profile.lastName?.charAt(0)}
            </div>
            <div>
              <p className="font-bold text-gray-900">{profile.firstName} {profile.lastName}</p>
              <p className="text-sm text-gray-500">{user?.email}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">First Name</label>
              <input type="text" value={profile.firstName} onChange={e => setProfile({...profile, firstName: e.target.value})} className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Last Name</label>
              <input type="text" value={profile.lastName} onChange={e => setProfile({...profile, lastName: e.target.value})} className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Phone</label>
              <input type="tel" value={profile.phone} onChange={e => setProfile({...profile, phone: e.target.value})} className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Date of Birth</label>
              <input type="date" value={profile.dateOfBirth} onChange={e => setProfile({...profile, dateOfBirth: e.target.value})} className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Gender</label>
              <select value={profile.gender} onChange={e => setProfile({...profile, gender: e.target.value})} className={inputCls}>
                <option value="MALE">Male</option><option value="FEMALE">Female</option><option value="OTHER">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Email (read-only)</label>
              <input type="email" value={user?.email || ''} disabled className={`${inputCls} bg-gray-100 text-gray-500 cursor-not-allowed`} />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Address</label>
            <textarea value={profile.address} onChange={e => setProfile({...profile, address: e.target.value})} rows={2} className={`${inputCls} resize-none`} />
          </div>
          <div className="flex justify-end">
            <button type="submit" disabled={saving}
              className="px-6 py-2.5 bg-teal-500 hover:bg-teal-600 text-white rounded-lg text-sm font-semibold disabled:opacity-50 flex items-center gap-2">
              {saving ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/>Saving...</> : 'Save Changes'}
            </button>
          </div>
        </form>
      )}

      {/* Security Tab */}
      {tab === 'security' && (
        <form onSubmit={handleChangePassword} className="bg-white rounded-2xl shadow p-6 space-y-4">
          <h2 className="text-base font-bold text-gray-900 border-b pb-3">Change Password</h2>
          {['currentPassword', 'newPassword', 'confirmPassword'].map((field, i) => (
            <div key={field}>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                {['Current Password','New Password','Confirm New Password'][i]}
              </label>
              <div className="relative">
                <input type={showPwd ? 'text' : 'password'} required minLength={field !== 'currentPassword' ? 8 : 1}
                  value={(passwords as any)[field]}
                  onChange={e => setPasswords({...passwords, [field]: e.target.value})}
                  className={`${inputCls} pr-10`} />
                <button type="button" onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  {showPwd ? <EyeSlashIcon className="w-4 h-4"/> : <EyeIcon className="w-4 h-4"/>}
                </button>
              </div>
            </div>
          ))}
          <div className="flex justify-end">
            <button type="submit" disabled={saving}
              className="px-6 py-2.5 bg-teal-500 hover:bg-teal-600 text-white rounded-lg text-sm font-semibold disabled:opacity-50">
              {saving ? 'Changing...' : 'Change Password'}
            </button>
          </div>
        </form>
      )}

      {/* Notifications Tab */}
      {tab === 'notifications' && (
        <div className="bg-white rounded-2xl shadow p-6 space-y-4">
          <h2 className="text-base font-bold text-gray-900 border-b pb-3">Notification Preferences</h2>
          {[
            { label: 'Order status updates', desc: 'Get notified when your order status changes' },
            { label: 'Prescription verification', desc: 'Alerts when your prescription is reviewed' },
            { label: 'Auto-refill reminders', desc: '3 days before your next refill is due' },
            { label: 'Promotions & offers', desc: 'Special deals from pharmacies near you' },
          ].map(item => (
            <div key={item.label} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm font-semibold text-gray-800">{item.label}</p>
                <p className="text-xs text-gray-500">{item.desc}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" defaultChecked className="sr-only peer" />
                <div className="w-10 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-500"></div>
              </label>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}