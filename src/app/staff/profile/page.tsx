// frontend/src/app/staff/profile/page.tsx

'use client';

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { UserCircleIcon, LockClosedIcon } from '@heroicons/react/24/outline';

interface StaffProfile {
  id: string;
  firstName: string;
  lastName: string;
  phone?: string;
  nationalId?: string;
  gender?: string;
  dateOfBirth?: string;
  status: string;
  createdAt: string;
  user: { email: string; role: string };
  branch: {
    name: string;
    address: string;
    phone?: string;
    pharmacy: { name: string };
  };
  permissions?: { permissions: string[] };
}

const ROLE_COLORS: Record<string, string> = {
  PHARMACIST: 'bg-blue-100 text-blue-800',
  CASHIER: 'bg-blue-100 text-blue-800',
  NURSE: 'bg-blue-100 text-blue-800',
};

export default function StaffProfilePage() {
  const { t } = useTranslation();
  const router = useRouter();
  const [profile, setProfile] = useState<StaffProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ firstName: '', lastName: '', phone: '' });
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isFormDirty, setIsFormDirty] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await api.get('/staff/profile/me'); // GET /staff/profile/me
      setProfile(res.data);
      setFormData({
        firstName: res.data.firstName,
        lastName: res.data.lastName,
        phone: res.data.phone || '',
      });
    } catch (error) {
      console.error('Failed to load profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setIsFormDirty(true);
    setSaveError(null);
  };

  const handleSave = async () => {
    setSaveLoading(true);
    setSaveError(null);
    try {
      // Gap 1: Profile edit is broken. Backend update endpoint is being implemented.
      await api.put('/staff/profile/me', formData);
      toast.success(t('success.profileUpdated'));
      setIsEditing(false);
      fetchProfile();
    } catch (err: any) {
      const status = err.response?.status;
      if (status === 404 || status === 405) {
        setSaveError("Profile editing is temporarily unavailable the backend update endpoint is being implemented.");
        setIsFormDirty(false); // Disable button until next change
      } else {
        toast.error(err.response?.data?.message || t('profile2.failedToUpdate'));
      }
    } finally {
      setSaveLoading(false);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><LoadingSpinner /></div>;
  if (!profile) return <div className="text-center py-20 text-gray-500">{t('profile2.profileNotFound')}</div>;

  const permissions: string[] = profile.permissions?.permissions || [];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="rounded-2xl p-6 text-white flex justify-between items-center" style={{ backgroundColor: '#1E4D8C' }}>
        <div>
          <h1 className="text-2xl font-bold">{t('staff.profile')}</h1>
          <p className="mt-1 text-white/70">{t('profile2.yourPersonalAndBranch')}</p>
        </div>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-sm font-semibold transition-all"
          >
            {t('common.edit')}
          </button>
        )}
      </div>

      {saveError && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-xl text-sm flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
          {saveError}
        </div>
      )}

      {/* Identity card */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
        <div className="flex items-center gap-5 mb-6">
          <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ backgroundColor: '#F0F7F6' }}>
            <UserCircleIcon className="w-10 h-10" style={{ color: '#2D9B8A' }} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              {profile.firstName} {profile.lastName}
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${ROLE_COLORS[profile.user.role] || 'bg-gray-100 text-gray-700'}`}>
                {t(`roles.${profile.user.role.toLowerCase()}`, { defaultValue: profile.user.role })}
              </span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${profile.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                }`}>
                {profile.status === 'ACTIVE' ? t('common.active') : t('common.inactive')}
              </span>
            </div>
          </div>
        </div>

        {isEditing ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs text-gray-500 font-medium">{t('form.firstName')}</label>
                <input
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2"
                  style={{ '--tw-ring-color': '#2D9B8A' } as any}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-gray-500 font-medium">{t('form.lastName')}</label>
                <input
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2"
                  style={{ '--tw-ring-color': '#2D9B8A' } as any}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-gray-500 font-medium">{t('form.phone')}</label>
              <input
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2"
                style={{ '--tw-ring-color': '#2D9B8A' } as any}
              />
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => { setIsEditing(false); setSaveError(null); }}
                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium hover:bg-gray-50 transition-all"
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={handleSave}
                disabled={saveLoading || !isFormDirty}
                className="flex-1 px-4 py-2.5 rounded-xl text-white text-sm font-medium transition-all disabled:opacity-50"
                style={{ backgroundColor: '#2D9B8A' }}
              >
                {saveLoading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto" /> : t('common.save')}
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 text-sm">
            {[
              { label: t('form.email'), value: profile.user.email },
              { label: t('form.phone'), value: profile.phone || '—' },
              { label: t('form.nationalId'), value: profile.nationalId || '—' },
              { label: t('form.gender'), value: profile.gender || '—' },
              { label: t('form.dateOfBirth'), value: profile.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString() : '—' },
              { label: t('staffMgmt.memberSince'), value: new Date(profile.createdAt).toLocaleDateString() },
            ].map(({ label, value }) => (
              <div key={label}>
                <p className="text-xs text-gray-500">{label}</p>
                <p className="font-medium text-gray-900 dark:text-gray-100 mt-0.5">{value}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Branch info */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
        <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-4">{t('form.branch')}</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-xs text-gray-500">{t('form.pharmacy')}</p>
            <p className="font-medium text-gray-900 dark:text-gray-100">{profile.branch.pharmacy.name}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">{t('form.branch')}</p>
            <p className="font-medium text-gray-900 dark:text-gray-100">{profile.branch.name}</p>
          </div>
          <div className="col-span-2">
            <p className="text-xs text-gray-500">{t('form.address')}</p>
            <p className="font-medium text-gray-900 dark:text-gray-100">{profile.branch.address}</p>
          </div>
        </div>
      </div>

      {/* Permissions */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
        <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-4">
          {t('staff.myPermissions')}
          <span className="ml-2 text-sm font-normal text-gray-500">({t('staff.permissionsGranted', { count: permissions.length })})</span>
        </h3>
        {permissions.length === 0 ? (
          <p className="text-gray-400 text-sm">{t('profile2.noPermissionsAssigned')}</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {permissions.map((perm) => (
              <span key={perm} className="px-3 py-1.5 rounded-lg text-xs font-medium" style={{ backgroundColor: '#F0F7F6', color: '#2D9B8A' }}>
                {perm.replace(/_/g, ' ')}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Change password */}
      <button
        onClick={() => router.push('/staff/change-password')}
        className="w-full flex items-center justify-center gap-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 py-3 rounded-xl font-medium text-sm transition-all"
      >
        <LockClosedIcon className="w-4 h-4" />
        {t('staff.changePassword')}
      </button>
    </div>
  );
}