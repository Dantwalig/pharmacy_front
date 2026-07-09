'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Settings, CheckCircle, Pencil } from 'lucide-react';
import { InformationCircleIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { api, authApi } from '@/lib/api';
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';

const NAVY     = '#1E3A5F';
const TEAL     = '#38BDF8';
const GRADIENT = 'linear-gradient(90deg, #0284C7 0%, #38BDF8 100%)';

interface DoctorDashboard {
  doctorName:    string | null;
  specialization: string;
  hospitalName:  string | null;
}

type Tab = 'profile' | 'department' | 'changePassword';

const inputCls =
  'w-full border border-gray-200 rounded-xl px-4 text-sm text-gray-700 outline-none ' +
  'focus:ring-2 disabled:bg-white disabled:text-gray-600 transition-all min-h-11';

const labelCls = 'block text-xs font-bold text-gray-600 uppercase tracking-widest mb-2';

export default function HospitalDoctorSettingsPage() {
  const { t } = useTranslation();

  const [profile,      setProfile]      = useState<DoctorDashboard | null>(null);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState<string | null>(null);
  const [activeTab,    setActiveTab]    = useState<Tab>('profile');
  const [passwordForm, setPasswordForm] = useState({ current: '', newPass: '', confirm: '' });
  const [savingPw,     setSavingPw]     = useState(false);

  // Read email from the user cookie set at login
  const userCookie = (() => {
    try { return JSON.parse(Cookies.get('user') ?? '{}'); } catch { return {}; }
  })();
  const email = userCookie?.email ?? '—';

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<DoctorDashboard>('/doctors/dashboard');
      setProfile(res.data);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? err?.message ?? 'Failed to load profile.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchProfile(); }, [fetchProfile]);

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault();
    if (passwordForm.newPass !== passwordForm.confirm) {
      toast.error('New passwords do not match.'); return;
    }
    if (passwordForm.newPass.length < 6) {
      toast.error('Password must be at least 6 characters.'); return;
    }
    setSavingPw(true);
    try {
      await authApi.changePassword({
        currentPassword: passwordForm.current,
        newPassword:     passwordForm.newPass,
        confirmPassword: passwordForm.confirm,
      });
      toast.success('Password changed successfully.');
      setPasswordForm({ current: '', newPass: '', confirm: '' });
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Failed to change password.');
    } finally {
      setSavingPw(false);
    }
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: 'profile',        label: t('common.profile', 'Profile') },
    { key: 'department',     label: t('hospital.department', 'Department') },
    { key: 'changePassword', label: t('common.changePassword', 'Change Password') },
  ];

  const initials = profile?.doctorName
    ? profile.doctorName.split(' ').filter(Boolean).map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : '—';

  return (
    <div className="space-y-8">
      {/* Hero */}
      <div className="rounded-2xl px-6 sm:px-10 py-8 sm:py-10 flex items-center justify-between" style={{ background: '#EBF5FF' }}>
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold" style={{ color: NAVY }}>{t('hospital.settings', 'Settings')}</h1>
          <p className="mt-2 text-sm sm:text-base" style={{ color: '#0284C7' }}>
            {t('hospital.settingsSubtitle', 'Manage your profile and account preferences')}
          </p>
        </div>
        <div className="relative opacity-20 shrink-0" style={{ color: NAVY }}>
          <Settings size={72} />
          <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-1">
            <Pencil size={20} style={{ color: NAVY }} />
          </div>
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div className="flex items-center justify-between bg-red-50 border border-red-200 rounded-2xl px-5 py-4">
          <p className="text-sm text-red-700">{error}</p>
          <button onClick={fetchProfile} className="flex items-center gap-1.5 text-xs font-semibold text-red-600">
            <ArrowPathIcon className="w-4 h-4" /> Retry
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-3 overflow-x-auto pb-1">
        {tabs.map(tab => (
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

      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Doctor card */}
        <div className="w-full lg:w-72 lg:shrink-0 bg-white rounded-2xl border border-gray-100 shadow-md p-6 sm:p-7 flex flex-col items-center text-center">
          {loading ? (
            <div className="animate-pulse space-y-3 w-full">
              <div className="w-20 h-20 rounded-full bg-gray-200 mx-auto" />
              <div className="h-4 w-32 bg-gray-200 rounded mx-auto" />
              <div className="h-3 w-20 bg-gray-200 rounded mx-auto" />
            </div>
          ) : (
            <>
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center text-white text-2xl sm:text-3xl font-bold mb-4"
                style={{ background: GRADIENT }}>
                {initials}
              </div>
              <p className="font-bold text-base sm:text-lg" style={{ color: NAVY }}>{profile?.doctorName ?? '—'}</p>
              <p className="text-sm text-gray-500 mt-0.5">Doctor</p>

              <div className="w-full border-t border-gray-100 my-5" />

              <div className="w-full text-left space-y-4">
                {[
                  { label: t('common.email', 'Email'),       value: email,                           extra: 'break-all' },
                  { label: t('hospital.hospitalLabel', 'Hospital'), value: profile?.hospitalName ?? '—', teal: true },
                ].map(({ label, value, extra, teal }) => (
                  <div key={label}>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-0.5">{label}</p>
                    <p className={`text-sm ${extra ?? ''} ${teal ? 'font-semibold' : 'text-gray-700'}`} style={teal ? { color: TEAL } : {}}>
                      {value}
                    </p>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Tab content */}
        <div className="flex-1 w-full space-y-6">

          {/* PROFILE TAB */}
          {activeTab === 'profile' && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-md p-6 sm:p-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold" style={{ color: NAVY }}>{t('hospital.profileInformation', 'Profile Information')}</h2>
              </div>

              <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-6">
                <InformationCircleIcon className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-800">
                  <span className="font-semibold">Read-only:</span> Doctor profile editing requires the Hospital Admin role
                  (<code className="bg-amber-100 px-1 rounded">PATCH /api/doctors/:id</code> is HOSPITAL_ADMIN only).
                  See <code className="bg-amber-100 px-1 rounded">DOCTOR_REMAINING_PAGES_API_GAPS.md</code>.
                </p>
              </div>

              {loading ? (
                <div className="animate-pulse grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i}>
                      <div className="h-3 w-20 bg-gray-200 rounded mb-2" />
                      <div className="h-11 bg-gray-100 rounded-xl" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {[
                    { label: t('hospital.fullName', 'Full Name'),          value: profile?.doctorName ?? '—' },
                    { label: t('common.email', 'Email'),                    value: email                       },
                    { label: t('hospital.specialization', 'Specialization'),value: profile?.specialization ?? '—' },
                    { label: t('hospital.hospitalLabel', 'Hospital'),       value: profile?.hospitalName ?? '—' },
                  ].map(({ label, value }) => (
                    <div key={label}>
                      <label className={labelCls}>{label}</label>
                      <input type="text" value={value} disabled className={inputCls} readOnly />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* DEPARTMENT TAB */}
          {activeTab === 'department' && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-md p-6 sm:p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-base font-bold" style={{ color: NAVY }}>{t('hospital.departmentDetails', 'Department Details')}</h2>
                <span className="flex items-center gap-1.5 text-sm font-semibold text-emerald-600">
                  <CheckCircle size={15} /> {t('hospital.approved', 'Approved')}
                </span>
              </div>

              {loading ? (
                <div className="animate-pulse space-y-5">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex gap-6">
                      <div className="h-3 w-32 bg-gray-200 rounded" />
                      <div className="h-3 w-40 bg-gray-200 rounded" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-5">
                  {[
                    { label: t('hospital.specialization', 'Specialization'), value: profile?.specialization ?? '—' },
                    { label: t('hospital.hospitalLabel', 'Hospital'),         value: profile?.hospitalName   ?? '—' },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-6 text-sm">
                      <span className="sm:w-40 text-gray-500 font-medium shrink-0">{label}</span>
                      <span className="font-semibold text-gray-800">{value}</span>
                    </div>
                  ))}
                  <p className="text-xs text-gray-400 pt-2">
                    License number and working hours are not yet returned by <code className="bg-gray-100 px-1 rounded">GET /doctors/dashboard</code>.
                    See <code className="bg-gray-100 px-1 rounded">DOCTOR_REMAINING_PAGES_API_GAPS.md</code>.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* CHANGE PASSWORD TAB */}
          {activeTab === 'changePassword' && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-md p-6 sm:p-8">
              <h2 className="text-base font-bold mb-6" style={{ color: NAVY }}>{t('common.changePassword', 'Change Password')}</h2>
              <form onSubmit={handlePasswordChange} className="space-y-5">
                {[
                  { label: t('common.currentPassword', 'Current Password'), key: 'current' as const },
                  { label: t('hospital.newPassword', 'New Password'),        key: 'newPass' as const },
                  { label: t('hospital.confirmNewPassword','Confirm New Password'), key: 'confirm' as const },
                ].map(({ label, key }) => (
                  <div key={key}>
                    <label className={labelCls}>{label}</label>
                    <input
                      type="password"
                      value={passwordForm[key]}
                      onChange={e => setPasswordForm(p => ({ ...p, [key]: e.target.value }))}
                      className={inputCls}
                      style={{ '--tw-ring-color': TEAL } as React.CSSProperties}
                      required
                    />
                  </div>
                ))}
                <div className="mt-7">
                  <button
                    type="submit"
                    disabled={savingPw}
                    className="w-full sm:w-auto sm:px-10 min-h-11 rounded-xl text-white text-sm font-semibold hover:opacity-90 transition-all disabled:opacity-60"
                    style={{ background: GRADIENT }}
                  >
                    {savingPw ? 'Saving…' : t('hospital.confirm', 'Confirm')}
                  </button>
                </div>
              </form>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
