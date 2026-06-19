'use client';

import { useState, useRef } from 'react';
import { Settings, CheckCircle, Pencil, Camera } from 'lucide-react';
import { MOCK_HOSPITAL_SETTINGS } from '@/mock/hospital/settings';

const NAVY     = '#1E3A5F';
const TEAL     = '#38BDF8';
const GRADIENT = 'linear-gradient(90deg, #0284C7 0%, #38BDF8 100%)';

const mockNurse = {
  name:          'Claudine Umutoni',
  initials:      'CU',
  role:          'Registered Nurse',
  email:         'claudine.umutoni@evuze.rw',
  phone:         '+250789384713',
  hospital:      MOCK_HOSPITAL_SETTINGS.hospitalName,
  specialization:'Medical Surgery',
  licenseNumber: 'xxxx-xxxx-xxxx',
  workingHours:  '10 AM - 5PM',
  status:        'APPROVED' as const,
};

type Tab = 'profile' | 'department' | 'changePassword';

const inputCls =
  'w-full border border-gray-200 rounded-xl px-4 text-sm text-gray-700 outline-none ' +
  'focus:ring-2 disabled:bg-white disabled:text-gray-600 transition-all ' +
  'min-h-11';

const labelCls = 'block text-xs font-bold text-gray-600 uppercase tracking-widest mb-2';

export default function NurseSettingsPage() {
  const [activeTab,      setActiveTab]      = useState<Tab>('profile');
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileForm,    setProfileForm]    = useState({
    fullName:       mockNurse.name,
    email:          mockNurse.email,
    phone:          mockNurse.phone,
    specialization: mockNurse.specialization,
  });
  const [passwordForm, setPasswordForm] = useState({
    current: '',
    newPass: '',
    confirm: '',
  });
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setAvatarUrl(URL.createObjectURL(file));
  };

  const tabs: { key: Tab; label: string }[] = [
    { key: 'profile',        label: 'Profile' },
    { key: 'department',     label: 'Department' },
    { key: 'changePassword', label: 'Change Password' },
  ];

  return (
    <div className="space-y-8">

      {/* Hero header */}
      <div
        className="rounded-2xl px-6 sm:px-10 py-8 sm:py-10 flex items-center justify-between"
        style={{ background: '#EBF5FF' }}
      >
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold" style={{ color: NAVY }}>Settings</h1>
          <p className="mt-2 text-sm sm:text-base" style={{ color: TEAL }}>
            Manage your account and preferences
          </p>
        </div>
        <div className="relative opacity-20 shrink-0" style={{ color: NAVY }}>
          <Settings size={72} />
          <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-1">
            <Pencil size={20} style={{ color: NAVY }} />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className="shrink-0 whitespace-nowrap px-5 py-2 rounded-full text-sm font-semibold transition-all min-h-[38px]"
            style={
              activeTab === tab.key
                ? { background: GRADIENT, color: '#fff' }
                : { background: '#fff', color: '#6b7280', border: '1px solid #d1d5db' }
            }
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Body */}
      <div className="flex flex-col lg:flex-row gap-6 items-start">

        {/* Nurse card */}
        <div className="w-full lg:w-72 lg:shrink-0 bg-white rounded-2xl border border-gray-100 shadow-md p-6 sm:p-7 flex flex-col items-center text-center">
          <div className="relative mb-4">
            <div
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center text-white text-2xl sm:text-3xl font-bold overflow-hidden"
              style={{ background: GRADIENT }}
            >
              {avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={avatarUrl} alt={mockNurse.name} className="w-full h-full object-cover" />
              ) : (
                mockNurse.initials
              )}
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              aria-label="Change profile photo"
              className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-white shadow-md border border-gray-100 flex items-center justify-center hover:bg-gray-50 transition-colors"
            >
              <Camera size={15} style={{ color: NAVY }} />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden"
            />
          </div>
          <p className="font-bold text-base sm:text-lg" style={{ color: NAVY }}>{mockNurse.name}</p>
          <p className="text-sm text-gray-500 mt-0.5">{mockNurse.role}</p>

          <div className="w-full border-t border-gray-100 my-5" />

          <div className="w-full text-left space-y-4">
            {[
              { label: 'Email',        value: mockNurse.email,    extra: 'break-all' },
              { label: 'Phone Number', value: mockNurse.phone,    extra: '' },
              { label: 'Hospital',     value: mockNurse.hospital, teal: true },
            ].map(({ label, value, extra, teal }) => (
              <div key={label}>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-0.5">{label}</p>
                <p
                  className={`text-sm ${extra} ${teal ? 'font-semibold' : 'text-gray-700'}`}
                  style={teal ? { color: TEAL } : {}}
                >
                  {value}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Tab content */}
        <div className="flex-1 w-full space-y-6">

          {/* Profile Tab*/}
          {activeTab === 'profile' && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-md p-6 sm:p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-base font-bold" style={{ color: NAVY }}>Profile Information</h2>
                  <button
                    onClick={() => setEditingProfile(!editingProfile)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 min-h-11"
                    style={{ background: GRADIENT }}
                  >
                    <Pencil size={14} />
                    {editingProfile ? 'Cancel' : 'Edit Profile'}
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {[
                    { label: 'Full Name',      key: 'fullName'       as const },
                    { label: 'Email',          key: 'email'          as const },
                    { label: 'Phone Number',   key: 'phone'          as const },
                    { label: 'Specialization', key: 'specialization' as const },
                  ].map(({ label, key }) => (
                    <div key={key}>
                      <label className={labelCls}>{label}</label>
                      <input
                        type="text"
                        value={profileForm[key]}
                        disabled={!editingProfile}
                        onChange={(e) => setProfileForm((p) => ({ ...p, [key]: e.target.value }))}
                        className={inputCls}
                        style={{ '--tw-ring-color': TEAL } as React.CSSProperties}
                      />
                    </div>
                  ))}
                </div>

              {editingProfile && (
                <div className="mt-6 flex justify-end">
                  <button
                    onClick={() => setEditingProfile(false)}
                    className="w-full sm:w-auto px-8 min-h-11 rounded-xl text-white text-sm font-semibold hover:opacity-90 transition-all"
                    style={{ background: GRADIENT }}
                  >
                    Save Changes
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Department Tab */}
          {activeTab === 'department' && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-md p-6 sm:p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-base font-bold" style={{ color: NAVY }}>Department Details</h2>
                <span className="flex items-center gap-1.5 text-sm font-semibold text-emerald-600">
                  <CheckCircle size={15} />
                  APPROVED
                </span>
              </div>
              <div className="space-y-5">
                {[
                  { label: 'Specialization', value: mockNurse.specialization },
                  { label: 'License number', value: mockNurse.licenseNumber },
                  { label: 'Hospital',       value: mockNurse.hospital },
                  { label: 'Working hours',  value: mockNurse.workingHours },
                ].map(({ label, value }) => (
                  <div key={label} className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-6 text-sm">
                    <span className="sm:w-40 text-gray-500 font-medium shrink-0">{label}</span>
                    <span className="font-semibold text-gray-800">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CHANGE PASSWORD TAB */}
          {activeTab === 'changePassword' && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-md p-6 sm:p-8">
              <h2 className="text-base font-bold mb-6" style={{ color: NAVY }}>Change Password</h2>
              <div className="space-y-5">
                {[
                  { label: 'Current Password',     key: 'current' as const },
                  { label: 'New Password',         key: 'newPass' as const },
                  { label: 'Confirm New Password', key: 'confirm' as const },
                ].map(({ label, key }) => (
                  <div key={key}>
                    <label className={labelCls}>{label}</label>
                    <input
                      type="password"
                      value={passwordForm[key]}
                      onChange={(e) => setPasswordForm((p) => ({ ...p, [key]: e.target.value }))}
                      className={inputCls}
                      style={{ '--tw-ring-color': TEAL } as React.CSSProperties}
                    />
                  </div>
                ))}
              </div>
              <div className="mt-7">
                {/* Full-width on mobile, auto-width on sm+ */}
                <button
                  className="w-full sm:w-auto sm:px-10 min-h-11 rounded-xl text-white text-sm font-semibold hover:opacity-90 transition-all"
                  style={{ background: GRADIENT }}
                >
                  Confirm
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
