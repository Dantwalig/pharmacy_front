'use client';

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { getErrorMessage } from '@/lib/errorHandler';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import {
  PencilSquareIcon,
  DocumentTextIcon,
  PhotoIcon,
  EyeIcon,
  ExclamationCircleIcon,
  CheckIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

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
  licenseUrl?: string;
  licenseExpiry?: string;
  nationalIdExpiry?: string;
  user: { email: string; role: string };
  branch: {
    name: string;
    address: string;
    phone?: string;
    pharmacy: { name: string };
  };
  permissions?: { permissions: string[] };
}

interface EditForm {
  firstName: string;
  lastName: string;
  phone: string;
}

function ReadField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">{label}</p>
      <div className="px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800 font-medium">
        {value}
      </div>
    </div>
  );
}

function EditField({
  label, value, onChange, disabled = false,
}: {
  label: string; value: string; onChange: (v: string) => void; disabled?: boolean;
}) {
  return (
    <div>
      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">{label}</p>
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        disabled={disabled}
        className="w-full px-3 py-2.5 bg-white border-2 border-blue-300 rounded-lg text-sm text-gray-800 font-medium outline-none focus:border-blue-500 disabled:bg-gray-50 disabled:border-gray-200 disabled:text-gray-500"
      />
    </div>
  );
}

export default function StaffProfilePage() {
  const { t } = useTranslation();
  const [profile, setProfile]       = useState<StaffProfile | null>(null);
  const [loading, setLoading]       = useState(true);
  const [isEditing, setIsEditing]   = useState(false);
  const [saving, setSaving]         = useState(false);
  const [form, setForm]             = useState<EditForm>({ firstName: '', lastName: '', phone: '' });

  useEffect(() => {
    api.get('/staff/profile/me')
      .then(res => {
        setProfile(res.data);
        setForm({
          firstName: res.data.firstName ?? '',
          lastName:  res.data.lastName  ?? '',
          phone:     res.data.phone     ?? '',
        });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleEdit = () => {
    if (!profile) return;
    setForm({ firstName: profile.firstName, lastName: profile.lastName, phone: profile.phone ?? '' });
    setIsEditing(true);
  };

  const handleCancel = () => setIsEditing(false);

  const handleSave = async () => {
    if (!form.firstName.trim() || !form.lastName.trim()) {
      toast.error('First name and last name are required.');
      return;
    }
    setSaving(true);
    try {
      const res = await api.put('/staff/profile/me', {
        firstName: form.firstName.trim(),
        lastName:  form.lastName.trim(),
        phone:     form.phone.trim() || undefined,
      });
      setProfile(res.data);
      setIsEditing(false);
      toast.success('Profile updated successfully.');
    } catch (error: unknown) {
      toast.error(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><LoadingSpinner /></div>;
  if (!profile) return <div className="text-center py-20 text-gray-500">{t('profile2.profileNotFound')}</div>;

  const initials    = `${profile.firstName[0] ?? ''}${profile.lastName[0] ?? ''}`.toUpperCase();
  const memberSince = new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  const isApproved  = profile.status === 'ACTIVE';
  const roleLabel   = profile.user.role.charAt(0) + profile.user.role.slice(1).toLowerCase();

  const documents = [
    {
      label:  'Pharmacist License',
      expiry: profile.licenseExpiry
        ? `Expires: ${new Date(profile.licenseExpiry).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
        : 'Expires: —',
      url:  profile.licenseUrl ?? null,
      icon: DocumentTextIcon,
    },
    {
      label:  'National ID Certificate',
      expiry: profile.nationalIdExpiry
        ? `Expired: ${new Date(profile.nationalIdExpiry).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
        : profile.nationalId ? `ID: ${profile.nationalId}` : 'No document on file',
      url:  null,
      icon: PhotoIcon,
    },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-5 p-4 lg:p-6">

      {/* ── Hero ── */}
      <div
        className="rounded-2xl px-8 py-8"
        style={{ background: 'linear-gradient(135deg, #DBEAFE 0%, #EFF6FF 100%)' }}
      >
        <h1 className="text-3xl font-extrabold text-gray-900">My Profile</h1>
        <p className="mt-1 text-gray-500 text-sm">
          {profile.branch.pharmacy.name} / {roleLabel}
        </p>
      </div>

      {/* ── Two-column layout ── */}
      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-5 items-start">

        {/* ── Left: Identity card ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col items-center text-center">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center text-white text-2xl font-bold mb-3 relative"
            style={{ background: 'linear-gradient(135deg, #0284C7 0%, #38BDF8 100%)' }}
          >
            {initials}
            <span className="absolute bottom-0 right-0 w-6 h-6 bg-white rounded-full flex items-center justify-center border-2 border-white shadow">
              <span className="w-3.5 h-3.5 rounded-full bg-blue-400 flex items-center justify-center">
                <EyeIcon className="w-2 h-2 text-white" />
              </span>
            </span>
          </div>

          <p className="font-bold text-gray-900 text-base">{profile.firstName} {profile.lastName}</p>
          <p className="text-gray-400 text-sm mt-0.5">{roleLabel}</p>

          <span className="inline-flex items-center gap-1.5 mt-2 px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
            {isApproved ? t('common.active') : profile.status}
          </span>

          <div className="mt-5 w-full space-y-3 text-sm">
            <div>
              <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">{t('form.pharmacy')}</p>
              <p className="font-semibold text-gray-800 mt-0.5">{profile.branch.pharmacy.name}</p>
            </div>
            <div>
              <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">{t('form.branch')}</p>
              <p className="font-semibold text-gray-800 mt-0.5">{profile.branch.name}</p>
            </div>
            {(profile.phone || profile.branch.phone) && (
              <div>
                <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">{t('form.phone')}</p>
                <p className="font-semibold text-gray-800 mt-0.5">{profile.phone || profile.branch.phone}</p>
              </div>
            )}
          </div>
        </div>

        {/* ── Right: stacked cards ── */}
        <div className="space-y-5">

          {/* Personal Information */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-gray-900 text-base">Personal Information</h2>

              {isEditing ? (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCancel}
                    disabled={saving}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                  >
                    <XMarkIcon className="w-3.5 h-3.5" />
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-white text-xs font-semibold disabled:opacity-50 transition-opacity hover:opacity-90"
                    style={{ background: 'linear-gradient(93.49deg, #0284C7 0%, #38BDF8 102.32%)' }}
                  >
                    {saving
                      ? <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      : <CheckIcon className="w-3.5 h-3.5" />}
                    Save
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleEdit}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-white text-xs font-semibold transition-opacity hover:opacity-90"
                  style={{ background: 'linear-gradient(93.49deg, #0284C7 0%, #38BDF8 102.32%)' }}
                >
                  <PencilSquareIcon className="w-3.5 h-3.5" />
                  Edit Profile
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {isEditing ? (
                <>
                  <EditField label="First Name"    value={form.firstName} onChange={v => setForm(f => ({ ...f, firstName: v }))} />
                  <EditField label="Last Name"     value={form.lastName}  onChange={v => setForm(f => ({ ...f, lastName: v }))} />
                  <EditField label="Phone Number"  value={form.phone}     onChange={v => setForm(f => ({ ...f, phone: v }))} />
                  <EditField label="Email Address" value={profile.user.email} onChange={() => {}} disabled />
                </>
              ) : (
                <>
                  <ReadField label="Full Name"     value={`${profile.firstName} ${profile.lastName}`} />
                  <ReadField label="Email Address" value={profile.user.email} />
                  <ReadField label="Phone Number"  value={profile.phone || '—'} />
                  <ReadField label="Role"          value={roleLabel} />
                </>
              )}
            </div>
          </div>

          {/* Registration Details */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-gray-900 text-base">Registration Details</h2>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                isApproved ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${isApproved ? 'bg-green-500' : 'bg-yellow-500'}`} />
                {isApproved ? 'Approved' : 'Pending'}
              </span>
            </div>

            <div className="space-y-0 text-sm divide-y divide-gray-50">
              {[
                { label: 'Pharmacy Name', value: profile.branch.pharmacy.name },
                { label: 'Branch',        value: profile.branch.name },
                { label: 'Member Since',  value: memberSince },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between py-2.5">
                  <p className="text-gray-400 font-medium">{label}</p>
                  <p className="font-semibold text-gray-800">{value}</p>
                </div>
              ))}
              <div className="flex items-center justify-between py-2.5">
                <p className="text-gray-400 font-medium">License Status</p>
                <p className={`font-semibold ${isApproved ? 'text-gray-800' : 'text-orange-500'}`}>
                  {isApproved ? 'Valid' : 'Action Required'}
                </p>
              </div>
            </div>
          </div>

          {/* Submitted Documents */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="font-bold text-gray-900 text-base mb-4">Submitted Documents</h2>

            <div className="space-y-3">
              {documents.map(({ label, expiry, url, icon: Icon }) => (
                <div key={label} className="flex items-center justify-between p-3 rounded-xl border border-gray-100 bg-gray-50/50">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-blue-50">
                      <Icon className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{label}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{expiry}</p>
                    </div>
                  </div>
                  {url ? (
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-blue-200 text-blue-500 text-xs font-semibold hover:bg-blue-50 transition-colors"
                    >
                      <EyeIcon className="w-3.5 h-3.5" />
                      View
                    </a>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gray-200 text-gray-400 text-xs font-semibold">
                      <EyeIcon className="w-3.5 h-3.5" />
                      View
                    </span>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-4 flex items-start gap-2 px-4 py-3 rounded-xl bg-yellow-50 border border-yellow-100">
              <ExclamationCircleIcon className="w-4 h-4 text-yellow-500 shrink-0 mt-0.5" />
              <p className="text-xs text-yellow-700">
                Registration documents cannot be edited. Contact support to update.
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
