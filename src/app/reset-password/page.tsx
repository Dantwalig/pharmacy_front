// frontend/src/app/reset-password/page.tsx

'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import LanguageSwitcher from '@/components/shared/LanguageSwitcher';
import api from '@/lib/api';

// Separate component that uses useSearchParams
function ResetPasswordForm() {
  const { t } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email');
  
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (!email) {
      toast.error(t('resetPassword.noEmail'));
      router.push('/forgot-password');
    }
  }, [email, router, t]);

  const handleCodeChange = (index: number, value: string) => {
    if (value.length > 1) return;
    if (!/^\d*$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    if (!/^\d+$/.test(pastedData)) return;

    const newCode = pastedData.split('').concat(Array(6 - pastedData.length).fill(''));
    setCode(newCode);
    
    const lastIndex = Math.min(pastedData.length, 5);
    inputRefs.current[lastIndex]?.focus();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const resetCode = code.join('');
    
    if (resetCode.length !== 6) {
      toast.error(t('resetPassword.invalidCode'));
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error(t('resetPassword.passwordMismatch'));
      return;
    }

    if (newPassword.length < 8) {
      toast.error(t('resetPassword.passwordTooShort'));
      return;
    }

    setLoading(true);

    try {
      const response = await api.post('/auth/reset-password', {
        email: email!,
        resetCode,
        newPassword,
        confirmPassword,
      });

      toast.success(response.data.message || t('resetPassword.success'));
      
      // Redirect to login
      setTimeout(() => {
        router.push('/login');
      }, 1500);
    } catch (error: any) {
      toast.error(error.response?.data?.message || t('resetPassword.error'));
    } finally {
      setLoading(false);
    }
  };

  if (!email) {
    return null;
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-purple-600 via-indigo-600 to-blue-600 flex items-center justify-center px-4 py-8 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
      </div>

      {/* Language Switcher - Top Right */}
      <div className="absolute top-6 right-6 z-20">
        <LanguageSwitcher />
      </div>

      {/* Main Card */}
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 relative z-10">
        {/* Icon */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-linear-to-br from-green-100 to-emerald-100 dark:from-green-900 dark:to-emerald-900 mb-4">
            <span className="text-4xl">🔓</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            {t('resetPassword.title')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {t('resetPassword.subtitle')}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Reset Code Input */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              {t('resetPassword.resetCode')}
            </label>
            <div className="flex gap-2 justify-center mb-4">
              {code.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => {
                    inputRefs.current[index] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleCodeChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={handlePaste}
                  className="w-12 h-14 text-center text-2xl font-bold border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                  disabled={loading}
                />
              ))}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
              {t('resetPassword.codeHint')}
            </p>
          </div>

          {/* New Password */}
          <div>
            <label
              htmlFor="newPassword"
              className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2"
            >
              {t('resetPassword.newPassword')}
            </label>
            <div className="relative">
              <input
                id="newPassword"
                type={showPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={8}
                className="w-full px-4 py-3 pr-12 border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all placeholder:text-gray-400 dark:placeholder:text-gray-500"
                placeholder="Min 8 characters"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2"
            >
              {t('resetPassword.confirmPassword')}
            </label>
            <input
              id="confirmPassword"
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={8}
              className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all placeholder:text-gray-400 dark:placeholder:text-gray-500"
              placeholder="Confirm password"
            />
          </div>

          {/* Password Requirements */}
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
            <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
              {t('resetPassword.passwordRequirements')}
            </p>
            <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
              <li className="flex items-center gap-2">
                <span className={newPassword.length >= 8 ? 'text-green-500' : 'text-gray-400'}>
                  {newPassword.length >= 8 ? '✓' : '○'}
                </span>
                <span>{t('resetPassword.minLength')}</span>
              </li>
              <li className="flex items-center gap-2">
                <span className={/[A-Z]/.test(newPassword) ? 'text-green-500' : 'text-gray-400'}>
                  {/[A-Z]/.test(newPassword) ? '✓' : '○'}
                </span>
                <span>{t('resetPassword.uppercase')}</span>
              </li>
              <li className="flex items-center gap-2">
                <span className={/[a-z]/.test(newPassword) ? 'text-green-500' : 'text-gray-400'}>
                  {/[a-z]/.test(newPassword) ? '✓' : '○'}
                </span>
                <span>{t('resetPassword.lowercase')}</span>
              </li>
              <li className="flex items-center gap-2">
                <span className={/\d|[@$!%*?&#]/.test(newPassword) ? 'text-green-500' : 'text-gray-400'}>
                  {/\d|[@$!%*?&#]/.test(newPassword) ? '✓' : '○'}
                </span>
                <span>{t('resetPassword.numberOrSymbol')}</span>
              </li>
            </ul>
          </div>

          <button
            type="submit"
            disabled={loading || code.join('').length !== 6}
            className="w-full bg-linear-to-r from-green-600 to-emerald-600 text-white py-4 rounded-xl font-bold hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>{t('common.loading')}</span>
              </div>
            ) : (
              t('resetPassword.resetButton')
            )}
          </button>
        </form>

        {/* Back to Login */}
        <div className="mt-6 text-center">
          <Link
            href="/login"
            className="text-sm text-purple-600 dark:text-purple-400 hover:underline font-medium inline-flex items-center gap-1"
          >
            <span>←</span>
            <span>{t('resetPassword.backToLogin')}</span>
          </Link>
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-4 left-0 right-0 text-center text-white text-sm opacity-75">
        © 2025 E-Vuze Healthcare Platform. All rights reserved.
      </div>
    </div>
  );
}

// Main component with Suspense boundary
export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-linear-to-br from-purple-600 via-indigo-600 to-blue-600 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}