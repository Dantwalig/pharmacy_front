// frontend/src/app/verify-email/page.tsx
'use client';

import { useState, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { authApi } from '@/lib/api';
import LanguageSwitcher from '@/components/shared/LanguageSwitcher';
import { EnvelopeIcon, ShieldCheckIcon, MapPinIcon, ClockIcon, UserGroupIcon } from '@heroicons/react/24/outline';

function VerifyEmailForm() {
  const { t } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';

  const [code, setCode] = useState(['', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (idx: number, val: string) => {
    if (val.length > 1 || !/^\d*$/.test(val)) return;
    const next = [...code]; next[idx] = val; setCode(next);
    if (val && idx < 4) inputRefs.current[idx + 1]?.focus();
  };
  const handleKeyDown = (idx: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !code[idx] && idx > 0) inputRefs.current[idx - 1]?.focus();
  };
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const p = e.clipboardData.getData('text').slice(0, 5);
    if (!/^\d+$/.test(p)) return;
    setCode(p.split('').concat(Array(5 - p.length).fill('')));
    inputRefs.current[Math.min(p.length, 4)]?.focus();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const codeStr = code.join('');
    if (codeStr.length !== 5) { toast.error(t('verify.invalidCode')); return; }
    setLoading(true);
    try {
      const res = await authApi.verifyEmail({ email, code: codeStr });
      toast.success(res.message || t('verify.success'));
      setTimeout(() => router.push('/login'), 1500);
    } catch (err: any) {
      toast.error(err.response?.data?.message || t('verify.error'));
    } finally { setLoading(false); }
  };

  const handleResend = async () => {
    if (!email) { toast.error(t('verify.noEmail')); return; }
    setResending(true);
    try {
      await authApi.resendVerificationCode({ email });
      toast.success(t('verify.codeSent'));
      setCode(['', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } catch (err: any) {
      toast.error(err.response?.data?.message || t('verify.resendError'));
    } finally { setResending(false); }
  };

  return (
    <div className="min-h-screen flex relative">
    <div className="absolute top-4 right-4 z-10"><LanguageSwitcher /></div>

    {/* LEFT PANEL */}
      <div className="hidden lg:flex lg:w-5/12 bg-linear-to-br from-[#1E4D8C] via-[#2563a8] to-[#1a3d6f] p-10 flex-col justify-between text-white">
      <div>
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-1">Evuze</h1>
          <p className="text-blue-200 text-sm">{t('auth.healthcarePlatform')}</p>
        </div>
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-3">{t('verify.title')}</h2>
          <p className="text-blue-100 text-sm leading-relaxed">
            Almost there! Verify your email to activate your account and start using Evuze.
            </p>
        </div>
        <div className="space-y-4">
          {[
              { icon: MapPinIcon, title: 'Find Nearby Pharmacies', desc: 'Locate pharmacies with real-time availability.' },
              { icon: ClockIcon, title: 'Save Time', desc: 'Check availability before visiting.' },
              { icon: UserGroupIcon, title: 'Connect with Healthcare', desc: 'Bridge patients and pharmacies.' },
              { icon: ShieldCheckIcon, title: 'Secure & Private', desc: 'Enterprise-grade security.' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-start gap-3">
              <Icon className="w-5 h-5 shrink-0 mt-0.5 text-teal-300" />
              <div>
                <h3 className="font-semibold text-sm mb-0.5">{title}</h3>
                <p className="text-blue-200 text-xs">{desc}</p>
              </div>
            </div>
          ))}
          </div>
      </div>
      <p className="text-blue-300 text-xs">© 2026 Evuze Healthcare Platform. All rights reserved.</p>
    </div>

    {/* RIGHT PANEL */}
      <div className="w-full lg:w-7/12 flex items-center justify-center bg-gray-50 p-8">
      <div className="w-full max-w-md">
        {/* Icon */}
          <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center mb-6">
          <EnvelopeIcon className="w-7 h-7 text-blue-600" />
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-1">{t('verify.title')}</h2>
        <p className="text-gray-500 text-sm mb-1">{t('verify.subtitle')}</p>
        {email && <p className="text-xs text-teal-600 font-medium mb-6">Sent to: {email}</p>}

          <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-3">{t('verify.enterCode')}</label>
            <div className="flex gap-2.5 justify-start">
              {code.map((digit, idx) => (
                  <input key={idx}
                    ref={el => { inputRefs.current[idx] = el; }}
                    type="text" inputMode="numeric" maxLength={1} value={digit}
                    onChange={e => handleChange(idx, e.target.value)}
                    onKeyDown={e => handleKeyDown(idx, e)} onPaste={handlePaste}
                    className="w-13 h-13 text-center text-xl font-bold border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all"
                    disabled={loading} />
              ))}
              </div>
          </div>

          <button type="submit" disabled={loading || code.join('').length !== 5}
              className="w-full bg-teal-500 hover:bg-teal-600 text-white py-3 rounded-lg font-semibold text-sm transition-all shadow-md disabled:opacity-50 flex items-center justify-center gap-2">
            {loading
                ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Verifying...</>
              : t('verify.verifyButton')}
            </button>
        </form>

        <div className="mt-6 text-center space-y-3">
          <p className="text-sm text-gray-500">{t('verify.didntReceive')}</p>
          <button onClick={handleResend} disabled={resending}
              className="text-teal-600 font-semibold text-sm hover:underline disabled:opacity-50">
            {resending ? t('verify.resending') : t('verify.resendCode')}
            </button>
        </div>

        <div className="mt-6 text-center">
          <Link href="/login" className="text-sm text-gray-400 hover:text-gray-600">
            ← Back to Login
            </Link>
        </div>
      </div>
    </div>
  </div>
);
}

export default function VerifyEmailPage() {
  const { t } = useTranslation();

  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="text-gray-500 text-sm">{t('common.loading')}</div></div>}>
    <VerifyEmailForm />
  </Suspense>
);
}