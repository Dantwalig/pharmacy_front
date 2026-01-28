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
import { 
  BuildingStorefrontIcon, 
  MapPinIcon, 
  PhoneIcon, 
  CalendarIcon,
  DocumentTextIcon,
  UserCircleIcon
} from '@heroicons/react/24/outline';

export default function PharmacyProfilePage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [profile, setProfile] = useState({
    name: '',
    representativeName: '',
    phone: '',
    address: '',
    latitude: 0,
    longitude: 0,
    dateOfIncorporation: '',
    rdbCertificate: '',
    pharmacyLicense: '',
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await api.get('/pharmacies/me');
      const data = res.data;
      
      // Format date if it exists
      let formattedDate = '';
      if (data.dateOfIncorporation) {
        const date = new Date(data.dateOfIncorporation);
        formattedDate = date.toISOString().split('T')[0];
      }

      setProfile({
        name: data.name || '',
        representativeName: data.representativeName || '',
        phone: data.phone || '',
        address: data.address || '',
        latitude: data.latitude || 0,
        longitude: data.longitude || 0,
        dateOfIncorporation: formattedDate,
        rdbCertificate: data.rdbCertificate || '',
        pharmacyLicense: data.pharmacyLicense || '',
      });
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      toast.error(t('profile.fetchFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    setSaving(true);

    try {
      // Prepare data - convert string coordinates to numbers
      const updateData = {
        ...profile,
        latitude: parseFloat(profile.latitude.toString()) || 0,
        longitude: parseFloat(profile.longitude.toString()) || 0,
      };

      await api.patch('/pharmacies/me', updateData);
      toast.success(t('profile.updateSuccess'));
      
      // Refresh profile data
      fetchProfile();
    } catch (error: any) {
      toast.error(error.response?.data?.message || t('profile.updateFailed'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
        <PharmacySidebar />
        <div className="flex-1 flex flex-col">
          <PharmacyTopbar />
          <div className="flex-1 flex items-center justify-center">
            <LoadingSpinner />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      <PharmacySidebar />
      
      <div className="flex-1 flex flex-col">
        <PharmacyTopbar />
        
        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="bg-linear-to-r from-green-600 to-emerald-600 rounded-2xl shadow-xl p-8 text-white">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <BuildingStorefrontIcon className="w-12 h-12" />
                </div>
                <div>
                  <h1 className="text-3xl sm:text-4xl font-bold mb-2">
                    {t('profile.title')} 💊
                  </h1>
                  <p className="text-green-100 text-lg">{t('profile.pharmacySubtitle')}</p>
                </div>
              </div>
            </div>

            {/* Basic Information */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 space-y-6">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">
                {t('profile.basicInfo')}
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                    <BuildingStorefrontIcon className="w-5 h-5 inline-block mr-2" />
                    {t('pharmacy.pharmacyName')}
                  </label>
                  <input
                    type="text"
                    value={profile.name}
                    onChange={(e) =>
                      setProfile({ ...profile, name: e.target.value })
                    }
                    className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                    required
                  />
                  <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                    ⚠️ {t('profile.requiresAdminApproval')}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                    <UserCircleIcon className="w-5 h-5 inline-block mr-2" />
                    {t('pharmacy.representativeName')}
                  </label>
                  <input
                    type="text"
                    value={profile.representativeName}
                    onChange={(e) =>
                      setProfile({ ...profile, representativeName: e.target.value })
                    }
                    className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                    required
                  />
                  <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                    ⚠️ {t('profile.requiresAdminApproval')}
                  </p>
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
                    className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                    <CalendarIcon className="w-5 h-5 inline-block mr-2" />
                    {t('pharmacy.dateOfIncorporation')}
                  </label>
                  <input
                    type="date"
                    value={profile.dateOfIncorporation}
                    onChange={(e) =>
                      setProfile({ ...profile, dateOfIncorporation: e.target.value })
                    }
                    className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                    required
                  />
                  <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                    ⚠️ {t('profile.requiresAdminApproval')}
                  </p>
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
                    className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                    rows={3}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                    {t('pharmacy.latitude')}
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={profile.latitude}
                    onChange={(e) =>
                      setProfile({ ...profile, latitude: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                    placeholder="-1.9536"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                    {t('pharmacy.longitude')}
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={profile.longitude}
                    onChange={(e) =>
                      setProfile({ ...profile, longitude: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                    placeholder="30.0606"
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

            {/* Documents Section */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 space-y-6">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">
                {t('profile.documents')}
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                    <DocumentTextIcon className="w-5 h-5 inline-block mr-2" />
                    {t('pharmacy.rdbCertificate')}
                  </label>
                  <input
                    type="text"
                    value={profile.rdbCertificate}
                    onChange={(e) =>
                      setProfile({ ...profile, rdbCertificate: e.target.value })
                    }
                    className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                    placeholder="URL to RDB Certificate"
                    required
                  />
                  <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                    ⚠️ {t('profile.requiresAdminApproval')}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                    <DocumentTextIcon className="w-5 h-5 inline-block mr-2" />
                    {t('pharmacy.pharmacyLicense')}
                  </label>
                  <input
                    type="text"
                    value={profile.pharmacyLicense}
                    onChange={(e) =>
                      setProfile({ ...profile, pharmacyLicense: e.target.value })
                    }
                    className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                    placeholder="URL to Pharmacy License"
                    required
                  />
                  <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                    ⚠️ {t('profile.requiresAdminApproval')}
                  </p>
                </div>
              </div>

              <div className="bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-200 dark:border-yellow-700 rounded-xl p-4">
                <p className="text-sm text-yellow-700 dark:text-yellow-400">
                  <strong>⚠️ {t('profile.adminApprovalNotice')}</strong><br />
                  {t('profile.adminApprovalDesc')}
                </p>
              </div>
            </div>

            {/* Save Button */}
            <button
              onClick={handleUpdate}
              disabled={saving}
              className="w-full bg-linear-to-r from-green-600 to-emerald-600 text-white py-4 rounded-xl font-bold text-lg hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50"
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