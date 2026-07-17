//src/app/hospital/receptionist/change-password/page.tsx

'use client';

import { useTranslation } from 'react-i18next';
import { useState, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

const BLUE = '#1E3A8A';
const lightBlue = '#1E40AF';

export default function HospitalReceptionistChangePasswordPage() {
  const { t } = useTranslation();

  // Form state
  const { user } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ [k: string]: string }>({});

  // Password requirement checks
  const checks = useMemo(() => {
    const hasMinLength = newPassword.length >= 8;
    const hasUpper = /[A-Z]/.test(newPassword);
    const hasLower = /[a-z]/.test(newPassword);
    const hasNumber = /[0-9]/.test(newPassword);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>_\-+=\\[\];'`~]/.test(newPassword);
    return { hasMinLength, hasUpper, hasLower, hasNumber, hasSpecial };
  }, [newPassword]);

  const strengthScore = useMemo(() => {
    return [
      checks.hasMinLength,
      checks.hasUpper,
      checks.hasLower,
      checks.hasNumber,
      checks.hasSpecial,
    ].reduce((s, v) => s + (v ? 1 : 0), 0);
  }, [checks]);

  const strengthLabel = useMemo(() => {
    if (newPassword.length === 0) return 'Empty';
    if (strengthScore <= 2) return 'Weak';
    if (strengthScore === 3 || strengthScore === 4) return 'Fair';
    if (strengthScore === 5) return 'Strong';
    return 'Empty';
  }, [strengthScore, newPassword.length]);

  const strengthColor = useMemo(() => {
    switch (strengthLabel) {
      case 'Weak':
        return 'bg-red-400';
      case 'Fair':
        return 'bg-amber-400';
      case 'Strong':
        return 'bg-emerald-500';
      default:
        return 'bg-gray-200';
    }
  }, [strengthLabel]);

  const resetForm = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setErrors({});
  };

  const validate = () => {
    const err: { [k: string]: string } = {};
    if (!currentPassword) err.currentPassword = t('hospital.errEnterCurrent');
    if (!newPassword) err.newPassword = t('hospital.errEnterNew');
    if (newPassword && strengthScore < 4) err.newPassword = t('hospital.errComplexity');
    if (confirmPassword !== newPassword) err.confirmPassword = t('hospital.errMismatch');
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const onSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      if (!user) throw new Error('Not logged in');
      await api.post('/auth/change-password', {
        currentPassword,
        newPassword
      });
      toast.success(t('hospital.alertUpdated'));
      resetForm();
    } catch (err) {
      toast.error(t('hospital.alertUpdateFailed'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Hero Header */}
      <div className="rounded-2xl p-8" style={{ background: '#EBF5FF' }}>
        <h1 className="text-3xl font-extrabold" style={{ color: BLUE }}>
          {t('hospital.changePasswordTitle', 'Change Password')}
        </h1>
        <p className="mt-1 text-sm" style={{ color: lightBlue }}>
          {t('hospital.changePasswordSubtitle', 'Update your password to ensure account security.')}
        </p>
      </div>

      <div className="max-w-2xl mx-auto">
        <form onSubmit={onSubmit} className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold mb-4">{t('hospital.updatePassword')}</h3>

          {/* Current Password */}
          <label className="block text-xs font-medium text-gray-600">{t('hospital.currentPasswordRequired')}</label>
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder={t('hospital.currentPasswordPlaceholder')}
            className={`mt-2 w-full rounded-lg border ${errors.currentPassword ? 'border-red-300' : 'border-gray-200'} px-3 py-2 text-sm bg-white`}
            aria-invalid={!!errors.currentPassword}
          />
          {errors.currentPassword && <p className="text-xs text-red-600 mt-1">{errors.currentPassword}</p>}

          {/* New Password */}
          <div className="mt-4">
            <label className="block text-xs font-medium text-gray-600">{t('hospital.newPasswordRequired')}</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder={t('hospital.newPasswordPlaceholder')}
              className={`mt-2 w-full rounded-lg border ${errors.newPassword ? 'border-red-300' : 'border-gray-200'} px-3 py-2 text-sm bg-white`}
              aria-invalid={!!errors.newPassword}
            />
            <div className="mt-2 text-xs text-gray-500 flex items-center justify-between">
              <span>{t('hospital.passwordStrength')} <span className="font-medium text-gray-700 ml-1">{t(`hospital.strength${strengthLabel}`)}</span></span>
            </div>

            <div className="mt-2 h-2 w-full rounded-full bg-gray-200 overflow-hidden">
              <div className={`h-full ${strengthColor}`}
                style={{ width: `${(strengthScore / 5) * 100}%`, transition: 'width .2s' }}
              />
            </div>

            {errors.newPassword && <p className="text-xs text-red-600 mt-1">{errors.newPassword}</p>}
          </div>

          {/* Confirm Password */}
          <div className="mt-4">
            <label className="block text-xs font-medium text-gray-600">{t('hospital.confirmPasswordRequired')}</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder={t('hospital.confirmPasswordPlaceholder')}
              className={`mt-2 w-full rounded-lg border ${errors.confirmPassword ? 'border-red-300' : 'border-gray-200'} px-3 py-2 text-sm bg-white`}
              aria-invalid={!!errors.confirmPassword}
            />
            {errors.confirmPassword && <p className="text-xs text-red-600 mt-1">{errors.confirmPassword}</p>}
          </div>

          <div className="mt-4 rounded-lg border border-gray-100 bg-gray-50 p-4 text-sm text-gray-700">
            <div className="font-medium mb-2">{t('hospital.passwordRequirementsTitle')}</div>
            <ul className="list-disc pl-5 space-y-1">
              <li className={checks.hasMinLength ? 'text-gray-700' : 'text-gray-400'}>{t('hospital.reqMinLength')}</li>
              <li className={checks.hasUpper && checks.hasLower ? 'text-gray-700' : 'text-gray-400'}>{t('hospital.reqCase')}</li>
              <li className={checks.hasNumber ? 'text-gray-700' : 'text-gray-400'}>{t('hospital.reqNumber')}</li>
              <li className={checks.hasSpecial ? 'text-gray-700' : 'text-gray-400'}>{t('hospital.reqSpecial')}</li>
            </ul>
          </div>

          {/* Actions */}
          <div className="mt-6 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={resetForm} disabled={submitting}
              className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              {t('common.cancel')}
            </button>

            <button
              type="submit" disabled={submitting}
              className="rounded-lg bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 text-sm font-semibold"
            >
              {submitting ? t('hospital.updating') : t('hospital.updatePassword')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}