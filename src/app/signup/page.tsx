// frontend/src/app/signup/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import LanguageSwitcher from '@/components/shared/LanguageSwitcher';
import {
  EnvelopeIcon, LockClosedIcon, UserIcon, PhoneIcon,
  BuildingStorefrontIcon, EyeIcon, EyeSlashIcon,
  MapPinIcon, ClockIcon, UserGroupIcon, ShieldCheckIcon,
} from '@heroicons/react/24/outline';

type Role = 'PATIENT' | 'PHARMACY';

export default function SignupPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const [role, setRole] = useState<Role>('PATIENT');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [patientForm, setPatientForm] = useState({
    firstName: '', lastName: '', email: '', phone: '',
    password: '', confirmPassword: '', address: '',
    dateOfBirth: '', gender: 'MALE',
  });

  const [pharmacyForm, setPharmacyForm] = useState({
    email: '', password: '', confirmPassword: '',
    pharmacyName: '', representativeName: '', phone: '',
    address: '', dateOfIncorporation: '',
    rdbCertificate: '',
    pharmacyLicense: '',
    businessRegistration: '',
  });

  const handlePatientSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (patientForm.password !== patientForm.confirmPassword) {
      toast.error('Passwords do not match'); return;
    }
    if (patientForm.password.length < 8) {
      toast.error('Password must be at least 8 characters'); return;
    }
    setLoading(true);
    try {
      const { confirmPassword, ...data } = patientForm;
      const res = await api.post('/auth/register/patient', data);
      toast.success(res.data.message || 'Account created! Please verify your email.');
      router.push(`/verify-email?email=${encodeURIComponent(patientForm.email)}`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  const handlePharmacySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pharmacyForm.password !== pharmacyForm.confirmPassword) {
      toast.error('Passwords do not match'); return;
    }
    if (!pharmacyForm.rdbCertificate || !pharmacyForm.pharmacyLicense || !pharmacyForm.businessRegistration) {
      toast.error('Please fill in all required document numbers'); return;
    }
    setLoading(true);
    try {
      const res = await api.post('/auth/register/pharmacy', pharmacyForm);
      toast.success(res.data.message || 'Application submitted! Please verify your email.');
      router.push(`/verify-email?email=${encodeURIComponent(pharmacyForm.email)}`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  const inputCls = "w-full pl-11 pr-4 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all text-gray-900 text-sm";
  const labelCls = "block text-xs font-semibold text-gray-700 mb-1";

  return (
    <div className="min-h-screen flex relative">
      {/* Language Switcher */}
      <div className="absolute top-4 right-4 z-10"><LanguageSwitcher /></div>

      {/* LEFT PANEL */}
      <div className="hidden lg:flex lg:w-5/12 bg-linear-to-br from-[#1E4D8C] via-[#2563a8] to-[#1a3d6f] p-10 flex-col justify-between text-white">
        <div>
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-1">Evuze</h1>
            <p className="text-blue-200 text-sm">Healthcare Platform</p>
          </div>
          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-3">Join Evuze Today</h2>
            <p className="text-blue-100 text-sm leading-relaxed">
              Create your account and start managing your healthcare journey with Rwanda's leading pharmacy platform.
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

      {/* RIGHT PANEL — only form area scrolls */}
      <div className="w-full lg:w-7/12 flex flex-col bg-gray-50 h-screen overflow-hidden">
        {/* Fixed header */}
        <div className="px-8 pt-6 pb-3 bg-gray-50 shrink-0">
          <h2 className="text-2xl font-bold text-gray-900">Create Account</h2>
          <p className="text-gray-500 text-sm mt-1">Sign up to get started</p>

          {/* Role Switcher */}
          <div className="flex mt-4 bg-gray-200 rounded-lg p-1 w-fit">
            <button
              onClick={() => setRole('PATIENT')}
              className={`flex items-center gap-2 px-5 py-2 rounded-md text-sm font-semibold transition-all ${role === 'PATIENT' ? 'bg-white text-gray-900 shadow' : 'text-gray-600 hover:text-gray-900'}`}
            >
              <UserIcon className="w-4 h-4" /> Patient
            </button>
            <button
              onClick={() => setRole('PHARMACY')}
              className={`flex items-center gap-2 px-5 py-2 rounded-md text-sm font-semibold transition-all ${role === 'PHARMACY' ? 'bg-white text-gray-900 shadow' : 'text-gray-600 hover:text-gray-900'}`}
            >
              <BuildingStorefrontIcon className="w-4 h-4" /> Pharmacy Owner
            </button>
          </div>
        </div>

        {/* Scrollable form */}
        <div className="flex-1 overflow-y-auto px-8 pb-8">
          {role === 'PATIENT' ? (
            <form onSubmit={handlePatientSubmit} className="space-y-4 max-w-lg">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>First Name</label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input type="text" required value={patientForm.firstName}
                      onChange={e => setPatientForm({...patientForm, firstName: e.target.value})}
                      className={inputCls} placeholder="John" />
                  </div>
                </div>
                <div>
                  <label className={labelCls}>Last Name</label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input type="text" required value={patientForm.lastName}
                      onChange={e => setPatientForm({...patientForm, lastName: e.target.value})}
                      className={inputCls} placeholder="Doe" />
                  </div>
                </div>
              </div>
              <div>
                <label className={labelCls}>Email</label>
                <div className="relative">
                  <EnvelopeIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="email" required value={patientForm.email}
                    onChange={e => setPatientForm({...patientForm, email: e.target.value})}
                    className={inputCls} placeholder="you@example.com" />
                </div>
              </div>
              <div>
                <label className={labelCls}>Phone Number</label>
                <div className="relative">
                  <PhoneIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="tel" required value={patientForm.phone}
                    onChange={e => setPatientForm({...patientForm, phone: e.target.value})}
                    className={inputCls} placeholder="+250 7XX XXX XXX" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Date of Birth</label>
                  <input type="date" required value={patientForm.dateOfBirth}
                    onChange={e => setPatientForm({...patientForm, dateOfBirth: e.target.value})}
                    className={inputCls.replace('pl-11','pl-3')} />
                </div>
                <div>
                  <label className={labelCls}>Gender</label>
                  <select value={patientForm.gender}
                    onChange={e => setPatientForm({...patientForm, gender: e.target.value})}
                    className={inputCls.replace('pl-11','pl-3')}>
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
              </div>
              <div>
                <label className={labelCls}>Address</label>
                <div className="relative">
                  <MapPinIcon className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <textarea value={patientForm.address}
                    onChange={e => setPatientForm({...patientForm, address: e.target.value})}
                    className={`${inputCls} resize-none`} rows={2} placeholder="Your address" />
                </div>
              </div>
              <div>
                <label className={labelCls}>Password</label>
                <div className="relative">
                  <LockClosedIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type={showPassword ? 'text' : 'password'} required minLength={8}
                    value={patientForm.password}
                    onChange={e => setPatientForm({...patientForm, password: e.target.value})}
                    className={`${inputCls} pr-10`} placeholder="Min 8 characters" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    {showPassword ? <EyeSlashIcon className="w-4 h-4"/> : <EyeIcon className="w-4 h-4"/>}
                  </button>
                </div>
              </div>
              <div>
                <label className={labelCls}>Confirm Password</label>
                <div className="relative">
                  <LockClosedIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type={showConfirm ? 'text' : 'password'} required
                    value={patientForm.confirmPassword}
                    onChange={e => setPatientForm({...patientForm, confirmPassword: e.target.value})}
                    className={`${inputCls} pr-10`} placeholder="Repeat password" />
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    {showConfirm ? <EyeSlashIcon className="w-4 h-4"/> : <EyeIcon className="w-4 h-4"/>}
                  </button>
                </div>
              </div>
              <button type="submit" disabled={loading}
                className="w-full bg-teal-500 hover:bg-teal-600 text-white py-3 rounded-lg font-semibold text-sm transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed">
                {loading ? <span className="flex items-center justify-center gap-2"><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/> Creating account...</span> : 'Create Account'}
              </button>
              <p className="text-center text-sm text-gray-600">
                Already have an account?{' '}
                <Link href="/login" className="text-teal-600 font-semibold hover:underline">Sign in</Link>
              </p>
            </form>
          ) : (
            <form onSubmit={handlePharmacySubmit} className="space-y-4 max-w-lg">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-700">
                ℹ️ Your application will be reviewed by our team within 24–48 hours.
              </div>
              <div>
                <label className={labelCls}>Pharmacy Name</label>
                <div className="relative">
                  <BuildingStorefrontIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="text" required value={pharmacyForm.pharmacyName}
                    onChange={e => setPharmacyForm({...pharmacyForm, pharmacyName: e.target.value})}
                    className={inputCls} placeholder="e.g. HealthCare Pharmacy" />
                </div>
              </div>
              <div>
                <label className={labelCls}>Representative Name</label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="text" required value={pharmacyForm.representativeName}
                    onChange={e => setPharmacyForm({...pharmacyForm, representativeName: e.target.value})}
                    className={inputCls} placeholder="Full name" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Email</label>
                  <div className="relative">
                    <EnvelopeIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input type="email" required value={pharmacyForm.email}
                      onChange={e => setPharmacyForm({...pharmacyForm, email: e.target.value})}
                      className={inputCls} placeholder="pharmacy@email.com" />
                  </div>
                </div>
                <div>
                  <label className={labelCls}>Phone</label>
                  <div className="relative">
                    <PhoneIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input type="tel" required value={pharmacyForm.phone}
                      onChange={e => setPharmacyForm({...pharmacyForm, phone: e.target.value})}
                      className={inputCls} placeholder="+250 7XX XXX XXX" />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Date of Incorporation</label>
                  <input type="date" required value={pharmacyForm.dateOfIncorporation}
                    onChange={e => setPharmacyForm({...pharmacyForm, dateOfIncorporation: e.target.value})}
                    className={inputCls.replace('pl-11','pl-3')} />
                </div>
                <div>
                  <label className={labelCls}>Address</label>
                  <div className="relative">
                    <MapPinIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input type="text" required value={pharmacyForm.address}
                      onChange={e => setPharmacyForm({...pharmacyForm, address: e.target.value})}
                      className={inputCls} placeholder="Pharmacy address" />
                  </div>
                </div>
              </div>
              {/* Documents */}
              <div className="space-y-3">
               <div className="space-y-4">
                 <div>
                  <label className={labelCls}>
                    RDB Certificate Number <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <ShieldCheckIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input type="text" required value={pharmacyForm.rdbCertificate}
                      onChange={e => setPharmacyForm({...pharmacyForm, rdbCertificate: e.target.value})}
                      className={inputCls} placeholder="RDB Certificate Number" />
                  </div>
                </div>
                <div>
                  <label className={labelCls}>
                    Pharmacy License Number <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <ShieldCheckIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input type="text" required value={pharmacyForm.pharmacyLicense}
                      onChange={e => setPharmacyForm({...pharmacyForm, pharmacyLicense: e.target.value})}
                      className={inputCls} placeholder="License Number" />
                  </div>
                </div>
                <div>
                  <label className={labelCls}>
                    Business Registration Number <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <BuildingStorefrontIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input type="text" required value={pharmacyForm.businessRegistration}
                      onChange={e => setPharmacyForm({...pharmacyForm, businessRegistration: e.target.value})}
                      className={inputCls} placeholder="Business Registration Number" />
                  </div>
                </div>
              </div>
              </div>
              <div>
                <label className={labelCls}>Password</label>
                <div className="relative">
                  <LockClosedIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type={showPassword ? 'text' : 'password'} required minLength={8}
                    value={pharmacyForm.password}
                    onChange={e => setPharmacyForm({...pharmacyForm, password: e.target.value})}
                    className={`${inputCls} pr-10`} placeholder="Min 8 characters" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    {showPassword ? <EyeSlashIcon className="w-4 h-4"/> : <EyeIcon className="w-4 h-4"/>}
                  </button>
                </div>
              </div>
              <div>
                <label className={labelCls}>Confirm Password</label>
                <div className="relative">
                  <LockClosedIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type={showConfirm ? 'text' : 'password'} required
                    value={pharmacyForm.confirmPassword}
                    onChange={e => setPharmacyForm({...pharmacyForm, confirmPassword: e.target.value})}
                    className={`${inputCls} pr-10`} placeholder="Repeat password" />
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    {showConfirm ? <EyeSlashIcon className="w-4 h-4"/> : <EyeIcon className="w-4 h-4"/>}
                  </button>
                </div>
              </div>
              <button type="submit" disabled={loading}
                className="w-full bg-teal-500 hover:bg-teal-600 text-white py-3 rounded-lg font-semibold text-sm transition-all shadow-md disabled:opacity-50">
                {loading ? <span className="flex items-center justify-center gap-2"><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/> Submitting...</span> : 'Submit Application'}
              </button>
              <p className="text-center text-sm text-gray-600">
                Already registered?{' '}
                <Link href="/login" className="text-teal-600 font-semibold hover:underline">Sign in</Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}