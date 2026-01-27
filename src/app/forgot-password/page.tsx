// frontend/src/app/forgot-password/page.tsx

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import LanguageSwitcher from '@/components/shared/LanguageSwitcher';
import { authApi } from '@/lib/api';

export default function ForgotPasswordPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await authApi.forgotPassword({ email });
      toast.success(response.message || t('forgotPassword.success'));
      
      // Redirect to reset password page with email
      setTimeout(() => {
        router.push(`/reset-password?email=${encodeURIComponent(email)}`);
      }, 1500);
    } catch (error: any) {
      toast.error(error.response?.data?.message || t('forgotPassword.error'));
    } finally {
      setLoading(false);
    }
  };

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
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-linear-to-br from-purple-100 to-indigo-100 dark:from-purple-900 dark:to-indigo-900 mb-4">
            <span className="text-4xl">🔒</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            {t('forgotPassword.title')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {t('forgotPassword.subtitle')}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2"
            >
              {t('auth.email')}
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all placeholder:text-gray-400 dark:placeholder:text-gray-500"
              placeholder="you@example.com"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-linear-to-r from-purple-600 to-indigo-600 text-white py-4 rounded-xl font-bold hover:from-purple-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>{t('common.loading')}</span>
              </div>
            ) : (
              t('forgotPassword.sendCode')
            )}
          </button>
        </form>

        {/* Info Box */}
        <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <div className="text-xl">ℹ️</div>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              {t('forgotPassword.infoText')}
            </p>
          </div>
        </div>

        {/* Back to Login */}
        <div className="mt-6 text-center">
          <Link
            href="/login"
            className="text-sm text-purple-600 dark:text-purple-400 hover:underline font-medium inline-flex items-center gap-1"
          >
            <span>←</span>
            <span>{t('forgotPassword.backToLogin')}</span>
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