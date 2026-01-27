// frontend/src/app/verify-email/page.tsx

'use client';

import { useState, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import LanguageSwitcher from '@/components/shared/LanguageSwitcher';
import { authApi } from '@/lib/api';

export default function VerifyEmailPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';
  
  const [code, setCode] = useState(['', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) return;
    if (!/^\d*$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    if (value && index < 4) {
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
    const pastedData = e.clipboardData.getData('text').slice(0, 5);
    if (!/^\d+$/.test(pastedData)) return;

    const newCode = pastedData.split('').concat(Array(5 - pastedData.length).fill(''));
    setCode(newCode);
    
    const lastIndex = Math.min(pastedData.length, 4);
    inputRefs.current[lastIndex]?.focus();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const verificationCode = code.join('');
    
    if (verificationCode.length !== 5) {
      toast.error(t('verify.invalidCode'));
      return;
    }

    setLoading(true);

    try {
      const response = await authApi.verifyEmail({
        email: email,
        code: verificationCode,
      });

      toast.success(response.message || t('verify.success'));
      
      setTimeout(() => {
        router.push('/login');
      }, 1500);
    } catch (error: any) {
      toast.error(error.response?.data?.message || t('verify.error'));
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!email) {
      toast.error(t('verify.noEmail'));
      return;
    }
    
    setResending(true);
    try {
      await authApi.resendVerificationCode({ email });
      toast.success(t('verify.codeSent'));
      setCode(['', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } catch (error: any) {
      toast.error(error.response?.data?.message || t('verify.resendError'));
    } finally {
      setResending(false);
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
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">✉️</div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            {t('verify.title')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">{t('verify.subtitle')}</p>
        </div>

        {/* Verification Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 text-center">
              {t('verify.enterCode')}
            </label>
            <div className="flex gap-3 justify-center mb-6">
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
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={handlePaste}
                  className="w-14 h-16 text-center text-2xl font-bold border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                  disabled={loading}
                />
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || code.join('').length !== 5}
            className="w-full bg-linear-to-r from-purple-600 to-indigo-600 text-white py-4 rounded-xl font-bold hover:from-purple-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>{t('common.loading')}</span>
              </div>
            ) : (
              t('verify.verifyButton')
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="my-6 flex items-center gap-4">
          <div className="flex-1 h-px bg-gray-300 dark:bg-gray-600"></div>
          <span className="text-sm text-gray-500 dark:text-gray-400">OR</span>
          <div className="flex-1 h-px bg-gray-300 dark:bg-gray-600"></div>
        </div>

        {/* Resend Code */}
        <div className="text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            {t('verify.didntReceive')}
          </p>
          <button
            onClick={handleResendCode}
            disabled={resending}
            className="text-purple-600 dark:text-purple-400 hover:underline font-bold text-sm disabled:opacity-50"
          >
            {resending ? t('verify.resending') : t('verify.resendCode')}
          </button>
        </div>

        {/* Back to Login */}
        <div className="mt-6 text-center">
          <Link
            href="/login"
            className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
          >
            ← {t('common.back')} to Login
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