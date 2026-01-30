// frontend/src/app/patient/profile/page.tsx

'use client';

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import PatientTopbar from '@/components/patient/PatientTopbar';
import PatientSidebar from '@/components/patient/PatientSidebar';
import { UserCircleIcon, MapPinIcon, PhoneIcon, CalendarIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';

export default function PatientProfilePage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'personal' | 'insurance'>('personal');

  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    address: '',
    dateOfBirth: '',
    gender: '',
    insuranceProvider: '',
    insurancePolicy: '',
    insuranceMemberId: '',
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await api.get('/patients/profile');
      const data = res.data;
      
      // Format date if it exists
      let formattedDate = '';
      if (data.dateOfBirth) {
        const date = new Date(data.dateOfBirth);
        formattedDate = date.toISOString().split('T')[0];
      }

      setProfile({
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        phone: data.phone || '',
        address: data.address || '',
        dateOfBirth: formattedDate,
        gender: data.gender || '',
        insuranceProvider: data.insuranceProvider || '',
        insurancePolicy: data.insurancePolicy || '',
        insuranceMemberId: data.insuranceMemberId || '',
      });
    } catch (error: any) {
      console.error('Failed to fetch profile:', error);
      
      // If 404, it means patient record doesn't exist yet
      if (error.response?.status === 404) {
        toast.error(t('profile.noProfileFound') || 'No profile found. Please fill in your information.');
      } else {
        toast.error(t('profile.fetchFailed') || 'Failed to load profile');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    setSaving(true);

    try {
      const res = await api.put('/patients/profile', profile);
      
      // Check if response has a message property
      if (res.data?.message) {
        toast.success(res.data.message);
      } else {
        toast.success(t('profile.updateSuccess') || 'Profile updated successfully!');
      }
      
      // Refresh profile data
      await fetchProfile();
    } catch (error: any) {
      console.error('Failed to update profile:', error);
      toast.error(error.response?.data?.message || t('profile.updateFailed') || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
        <PatientSidebar />
        <div className="flex-1 flex flex-col">
          <PatientTopbar />
          <div className="flex-1 flex items-center justify-center">
            <LoadingSpinner />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      <PatientSidebar />
      
      <div className="flex-1 flex flex-col">
        <PatientTopbar />
        
        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="bg-linear-to-r from-purple-600 to-indigo-600 rounded-2xl shadow-xl p-8 text-white">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <UserCircleIcon className="w-12 h-12" />
                </div>
                <div>
                  <h1 className="text-3xl sm:text-4xl font-bold mb-2">
                    {t('profile.title')} 👤
                  </h1>
                  <p className="text-purple-100 text-lg">{t('profile.subtitle')}</p>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-3">
              <button
                onClick={() => setActiveTab('personal')}
                className={`flex-1 py-4 px-6 rounded-xl font-bold text-lg transition-all transform hover:scale-105 ${
                  activeTab === 'personal'
                    ? 'bg-linear-to-r from-purple-600 to-indigo-600 text-white shadow-lg'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:shadow-lg'
                }`}
              >
                <UserCircleIcon className="w-6 h-6 inline-block mr-2" />
                {t('profile.personalInfo')}
              </button>
              <button
                onClick={() => setActiveTab('insurance')}
                className={`flex-1 py-4 px-6 rounded-xl font-bold text-lg transition-all transform hover:scale-105 ${
                  activeTab === 'insurance'
                    ? 'bg-linear-to-r from-purple-600 to-indigo-600 text-white shadow-lg'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:shadow-lg'
                }`}
              >
                <ShieldCheckIcon className="w-6 h-6 inline-block mr-2" />
                {t('profile.insuranceInfo')}
              </button>
            </div>

            {/* Personal Information Tab */}
            {activeTab === 'personal' && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 space-y-6">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">
                  {t('profile.personalInfo')}
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                      <UserCircleIcon className="w-5 h-5 inline-block mr-2" />
                      {t('auth.firstName')}
                    </label>
                    <input
                      type="text"
                      value={profile.firstName}
                      onChange={(e) =>
                        setProfile({ ...profile, firstName: e.target.value })
                      }
                      className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                      <UserCircleIcon className="w-5 h-5 inline-block mr-2" />
                      {t('auth.lastName')}
                    </label>
                    <input
                      type="text"
                      value={profile.lastName}
                      onChange={(e) =>
                        setProfile({ ...profile, lastName: e.target.value })
                      }
                      className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                      <PhoneIcon className="w-5 h-5 inline-block mr-2" />
                      {t('auth.phone')}
                    </label>
                    <input
                      type="tel"
                      value={profile.phone}
                      onChange={(e) =>
                        setProfile({ ...profile, phone: e.target.value })
                      }
                      className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                      <CalendarIcon className="w-5 h-5 inline-block mr-2" />
                      {t('profile.dateOfBirth')}
                    </label>
                    <input
                      type="date"
                      value={profile.dateOfBirth}
                      onChange={(e) =>
                        setProfile({ ...profile, dateOfBirth: e.target.value })
                      }
                      className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                      {t('profile.gender')}
                    </label>
                    <select
                      value={profile.gender}
                      onChange={(e) =>
                        setProfile({ ...profile, gender: e.target.value })
                      }
                      className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                    >
                      <option value="">{t('profile.selectGender')}</option>
                      <option value="Male">{t('profile.male')}</option>
                      <option value="Female">{t('profile.female')}</option>
                      <option value="Other">{t('profile.other')}</option>
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                      <MapPinIcon className="w-5 h-5 inline-block mr-2" />
                      {t('auth.address')}
                    </label>
                    <textarea
                      value={profile.address}
                      onChange={(e) =>
                        setProfile({ ...profile, address: e.target.value })
                      }
                      className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                      rows={3}
                    />
                  </div>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-700 rounded-xl p-4">
                  <p className="text-sm text-blue-700 dark:text-blue-400">
                    <strong>{t('profile.email')}:</strong> {user?.email}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    {t('profile.emailNotice')}
                  </p>
                </div>
              </div>
            )}

            {/* Insurance Information Tab */}
            {activeTab === 'insurance' && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 space-y-6">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">
                  {t('profile.insuranceInfo')}
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                      <ShieldCheckIcon className="w-5 h-5 inline-block mr-2" />
                      {t('checkout.insuranceProvider')}
                    </label>
                    <select
                      value={profile.insuranceProvider}
                      onChange={(e) =>
                        setProfile({ ...profile, insuranceProvider: e.target.value })
                      }
                      className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                    >
                      <option value="">{t('profile.noInsurance')}</option>
                      <option value="MMI">MMI</option>
                      <option value="RSSB">RSSB</option>
                      <option value="Sanlam">Sanlam</option>
                      <option value="RAMA">RAMA</option>
                      <option value="Radiant">Radiant</option>
                      <option value="Britam">Britam</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                      {t('checkout.policyNumber')}
                    </label>
                    <input
                      type="text"
                      value={profile.insurancePolicy}
                      onChange={(e) =>
                        setProfile({ ...profile, insurancePolicy: e.target.value })
                      }
                      className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                      placeholder="e.g., POL-123456"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                      {t('checkout.memberName')}
                    </label>
                    <input
                      type="text"
                      value={profile.insuranceMemberId}
                      onChange={(e) =>
                        setProfile({ ...profile, insuranceMemberId: e.target.value })
                      }
                      className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                      placeholder="e.g., John Doe"
                    />
                  </div>
                </div>

                <div className="bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-200 dark:border-yellow-700 rounded-xl p-4">
                  <p className="text-sm text-yellow-700 dark:text-yellow-400">
                    <strong>ℹ️ {t('profile.insuranceNotice')}</strong><br />
                    {t('profile.insuranceDesc')}
                  </p>
                </div>
              </div>
            )}

            {/* Save Button */}
            <button
              onClick={handleUpdate}
              disabled={saving}
              className="w-full bg-linear-to-r from-purple-600 to-indigo-600 text-white py-4 rounded-xl font-bold text-lg hover:from-purple-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50"
            >
              {saving ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>{t('profile.saving')}</span>
                </div>
              ) : (
                t('common.save')
              )}
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}