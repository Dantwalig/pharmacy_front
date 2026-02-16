// frontend/src/app/pharmacy/profile/page.tsx

'use client';

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import PharmacyTopbar from '@/components/pharmacy/PharmacyTopbar';
import PharmacySidebar from '@/components/pharmacy/PharmacySidebar';
import SupportBot from '@/components/pharmacy/SupportBot';
import { 
  BuildingStorefrontIcon, 
  BellIcon,
  ShieldCheckIcon,
  CreditCardIcon,
} from '@heroicons/react/24/outline';

export default function PharmacyProfilePage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'INFO' | 'NOTIFICATIONS' | 'SECURITY' | 'BILLING'>('INFO');

  const [profile, setProfile] = useState({
    name: '',
    licenseNumber: '',
    phone: '',
    email: '',
    address: '',
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await api.get('/pharmacies/me');
      const data = res.data;
      
      setProfile({
        name: data.name || '',
        licenseNumber: data.licenseNumber || '',
        phone: data.phone || '',
        email: user?.email || '',
        address: data.address || '',
      });
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    setSaving(true);

    try {
      await api.patch('/pharmacies/me', profile);
      toast.success('Profile updated successfully');
      fetchProfile();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <PharmacySidebar />
        <div className="flex-1 flex flex-col lg:ml-72">
          <PharmacyTopbar />
          <div className="flex-1 flex items-center justify-center">
            <LoadingSpinner />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <PharmacySidebar />
      <SupportBot />
      
      <div className="flex-1 flex flex-col lg:ml-72">
        <PharmacyTopbar />
        
        <main className="flex-1 p-4 lg:p-8 overflow-auto">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="bg-linear-to-r from-[#1E4D8C] via-[#2563a8] to-[#1a3d6f] rounded-2xl shadow-lg p-6 lg:p-8 text-white">
              <h1 className="text-2xl lg:text-3xl font-bold mb-2">
                Settings
              </h1>
              <p className="text-blue-100 text-sm lg:text-base">
                Manage your pharmacy settings and preferences
              </p>
            </div>

            {/* Tab Navigation */}
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setActiveTab('INFO')}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
                  activeTab === 'INFO'
                    ? 'bg-teal-500 text-white shadow-md'
                    : 'bg-white text-gray-700 hover:shadow-md'
                }`}
              >
                <BuildingStorefrontIcon className="w-5 h-5" />
                Pharmacy Info
              </button>
              <button
                onClick={() => setActiveTab('NOTIFICATIONS')}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
                  activeTab === 'NOTIFICATIONS'
                    ? 'bg-teal-500 text-white shadow-md'
                    : 'bg-white text-gray-700 hover:shadow-md'
                }`}
              >
                <BellIcon className="w-5 h-5" />
                Notifications
              </button>
              <button
                onClick={() => setActiveTab('SECURITY')}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
                  activeTab === 'SECURITY'
                    ? 'bg-teal-500 text-white shadow-md'
                    : 'bg-white text-gray-700 hover:shadow-md'
                }`}
              >
                <ShieldCheckIcon className="w-5 h-5" />
                Security
              </button>
              <button
                onClick={() => setActiveTab('BILLING')}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
                  activeTab === 'BILLING'
                    ? 'bg-teal-500 text-white shadow-md'
                    : 'bg-white text-gray-700 hover:shadow-md'
                }`}
              >
                <CreditCardIcon className="w-5 h-5" />
                Billing
              </button>
            </div>

            {/* Pharmacy Information Tab */}
            {activeTab === 'INFO' && (
              <div className="bg-white rounded-xl shadow-md p-6 lg:p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Pharmacy Information</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-700">
                      Pharmacy Name
                    </label>
                    <input
                      type="text"
                      placeholder="Enter pharmacy name"
                      value={profile.name}
                      onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-700">
                      License Number
                    </label>
                    <input
                      type="text"
                      placeholder="Enter license number"
                      value={profile.licenseNumber}
                      onChange={(e) => setProfile({ ...profile, licenseNumber: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-700">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      placeholder="+250 XXX XXX XXX"
                      value={profile.phone}
                      onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-700">
                      Email Address
                    </label>
                    <input
                      type="email"
                      placeholder="pharmacy@example.com"
                      value={profile.email}
                      disabled
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold mb-2 text-gray-700">
                      Address
                    </label>
                    <textarea
                      placeholder="Enter pharmacy address"
                      value={profile.address}
                      onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                    />
                  </div>
                </div>

                <div className="mt-8 flex justify-end">
                  <button
                    onClick={handleUpdate}
                    disabled={saving}
                    className="bg-teal-500 hover:bg-teal-600 text-white px-8 py-3 rounded-lg font-semibold transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? (
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Saving...</span>
                      </div>
                    ) : (
                      'Save Changes'
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Other Tabs - Placeholder */}
            {activeTab !== 'INFO' && (
              <div className="bg-white rounded-xl shadow-md p-12 text-center">
                <p className="text-gray-500 text-lg">Coming soon...</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}