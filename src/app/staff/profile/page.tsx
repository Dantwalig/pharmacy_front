// frontend/src/app/staff/profile/page.tsx

'use client';

import { useEffect, useState } from 'react';
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
  PHARMACIST: 'bg-violet-100 text-violet-800',
  CASHIER:    'bg-blue-100 text-blue-800',
  NURSE:      'bg-pink-100 text-pink-800',
};

export default function StaffProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<StaffProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/staff/profile/me'); // GET /staff/profile/me
        setProfile(res.data);
      } catch (error) {
        console.error('Failed to load profile:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (loading) return <div className="flex justify-center py-20"><LoadingSpinner /></div>;
  if (!profile) return <div className="text-center py-20 text-gray-500">Profile not found</div>;

  const permissions: string[] = profile.permissions?.permissions || [];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">My Profile</h1>

    {/* Identity card */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
      <div className="flex items-center gap-5 mb-6">
        <div className="w-16 h-16 bg-violet-100 dark:bg-violet-900/30 rounded-full flex items-center justify-center">
          <UserCircleIcon className="w-10 h-10 text-violet-500" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            {profile.firstName} {profile.lastName}
            </h2>
          <div className="flex items-center gap-2 mt-1">
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${ROLE_COLORS[profile.user.role] || 'bg-gray-100 text-gray-700'}`}>
              {profile.user.role}
              </span>
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                profile.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-600'
              }`}>
              {profile.status}
              </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        {[
            { label: 'Email', value: profile.user.email },
            { label: 'Phone', value: profile.phone || '—' },
            { label: 'National ID', value: profile.nationalId || '—' },
            { label: 'Gender', value: profile.gender || '—' },
            { label: 'Date of Birth', value: profile.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString() : '—' },
            { label: 'Member Since', value: new Date(profile.createdAt).toLocaleDateString() },
          ].map(({ label, value }) => (
            <div key={label}>
            <p className="text-xs text-gray-500">{label}</p>
            <p className="font-medium text-gray-900 dark:text-gray-100 mt-0.5">{value}</p>
          </div>
        ))}
        </div>
    </div>

    {/* Branch info */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
      <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-4">Branch</h3>
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-xs text-gray-500">Pharmacy</p>
          <p className="font-medium text-gray-900 dark:text-gray-100">{profile.branch.pharmacy.name}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Branch</p>
          <p className="font-medium text-gray-900 dark:text-gray-100">{profile.branch.name}</p>
        </div>
        <div className="col-span-2">
          <p className="text-xs text-gray-500">Address</p>
          <p className="font-medium text-gray-900 dark:text-gray-100">{profile.branch.address}</p>
        </div>
      </div>
    </div>

    {/* Permissions */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
      <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-4">
        My Permissions
          <span className="ml-2 text-sm font-normal text-gray-500">({permissions.length} granted)</span>
      </h3>
      {permissions.length === 0 ? (
          <p className="text-gray-400 text-sm">No permissions assigned</p>
      ) : (
          <div className="flex flex-wrap gap-2">
          {permissions.map((perm) => (
              <span key={perm} className="px-3 py-1.5 bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-400 rounded-lg text-xs font-medium">
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
      Change Password
      </button>
  </div>
);
}