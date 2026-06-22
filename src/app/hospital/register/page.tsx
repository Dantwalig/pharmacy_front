'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { getErrorMessage } from '@/lib/errorHandler';
import LocationPicker from '@/components/shared/LocationPicker';
import {
  EnvelopeIcon, LockClosedIcon, UserIcon, PhoneIcon,
  BuildingOffice2Icon, EyeIcon, EyeSlashIcon, MapPinIcon,
  ClockIcon, UserGroupIcon, ShieldCheckIcon,
} from '@heroicons/react/24/outline';

export default function HospitalRegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [form, setForm] = useState({
    email: '', password: '', confirmPassword: '',
    hospitalName: '', representativeName: '', phone: '',
    address: '', dateOfIncorporation: '',
    rdbCertificate: '', hospitalLicense: '', businessRegistration: '',
    latitude: undefined as number | undefined,
    longitude: undefined as number | undefined,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      toast.error('Passwords do not match'); return;
    }
    if (form.password.length < 8) {
      toast.error('Password must be at least 8 characters'); return;
    }
    if (form.latitude === undefined || form.longitude === undefined) {
      toast.error('Please pin your hospital location on the map before submitting.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/auth/register/hospital', form);
      toast.success(res.data.message || 'Hospital application submitted for review.');
      router.push(`/verify-email?email=${encodeURIComponent(form.email)}`);
    } catch (error: unknown) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const inputCls = 'w-full pl-11 pr-4 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all text-gray-900 text-sm';
  const labelCls = 'block text-xs font-semibold text-gray-700 mb-1';

  const sidebarFeatures = [
    { icon: MapPinIcon, title: 'Reach more patients', desc: 'Get listed across the E-Vuze healthcare network.' },
    { icon: ClockIcon, title: 'Save administrative time', desc: 'Manage staff, appointments, and inventory in one place.' },
    { icon: UserGroupIcon, title: 'Connect care teams', desc: 'Doctors, nurses, and admins working from one portal.' },
    { icon: ShieldCheckIcon, title: 'Secure & compliant', desc: 'Patient data handled with the same standards as our pharmacy network.' },
  ];

  return (
    <div className="min-h-screen flex relative">
      {/* LEFT PANEL */}
      <div className="hidden lg:flex lg:w-5/12 bg-linear-to-br from-brand-navy via-[#2563a8] to-brand-navy-dark p-10 flex-col justify-between text-white">
        <div>
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-1">Evuze</h1>
            <p className="text-blue-200 text-sm">Healthcare Platform</p>
          </div>
          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-3">Register your hospital</h2>
            <p className="text-blue-100 text-sm leading-relaxed">
              Join the E-Vuze network and give your doctors, nurses, and admin staff a single platform to manage care.
            </p>
          </div>
          <div className="space-y-4">
            {sidebarFeatures.map(({ icon: Icon, title, desc }) => (
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
        <p className="text-blue-300 text-xs">© {new Date().getFullYear()} E-Vuze</p>
      </div>

      {/* RIGHT PANEL */}
      <div className="w-full lg:w-7/12 flex flex-col bg-gray-50 h-screen overflow-hidden">
        <div className="px-8 pt-6 pb-3 bg-gray-50 shrink-0">
          <h2 className="text-2xl font-bold text-gray-900">Hospital Registration</h2>
          <p className="text-gray-500 text-sm mt-1">Submit your hospital&apos;s details for review and onboarding.</p>
        </div>

        <div className="flex-1 overflow-y-auto px-8 pb-8">
          <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-700">
              ℹ Your application will be reviewed by our team before your hospital admin account is activated.
            </div>

            <div>
              <label className={labelCls}>Hospital Name</label>
              <div className="relative">
                <BuildingOffice2Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="text" required value={form.hospitalName}
                  onChange={e => setForm({ ...form, hospitalName: e.target.value })}
                  className={inputCls} placeholder="e.g. King Faisal Hospital" />
              </div>
            </div>

            <div>
              <label className={labelCls}>Representative Name</label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="text" required value={form.representativeName}
                  onChange={e => setForm({ ...form, representativeName: e.target.value })}
                  className={inputCls} placeholder="Full name of the hospital admin" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Email</label>
                <div className="relative">
                  <EnvelopeIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="email" required value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    className={inputCls} placeholder="admin@hospital.com" />
                </div>
              </div>
              <div>
                <label className={labelCls}>Phone</label>
                <div className="relative">
                  <PhoneIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="tel" required value={form.phone}
                    onChange={e => setForm({ ...form, phone: e.target.value })}
                    className={inputCls} placeholder="+250 7XX XXX XXX" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Date of Incorporation</label>
                <input type="date" value={form.dateOfIncorporation}
                  max={new Date().toISOString().split('T')[0]}
                  onChange={e => setForm({ ...form, dateOfIncorporation: e.target.value })}
                  className={inputCls.replace('pl-11', 'pl-3')} />
              </div>
              <div>
                <label className={labelCls}>Address</label>
                <div className="relative">
                  <MapPinIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="text" required value={form.address}
                    onChange={e => setForm({ ...form, address: e.target.value })}
                    className={inputCls} placeholder="Hospital street address" />
                </div>
              </div>
            </div>

            {/* Map picker — required */}
            <LocationPicker
              latitude={form.latitude}
              longitude={form.longitude}
              onChange={(lat, lng) => setForm(f => ({ ...f, latitude: lat, longitude: lng }))}
              required={true}
              label="Pin Hospital Location on Map"
              height="280px"
            />

            {/* Optional documents */}
            <div className="space-y-4">
              <div>
                <label className={labelCls}>RDB Certificate Number <span className="text-gray-400">(optional)</span></label>
                <div className="relative">
                  <ShieldCheckIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="text" value={form.rdbCertificate}
                    onChange={e => setForm({ ...form, rdbCertificate: e.target.value })}
                    className={inputCls} placeholder="RDB-XXXXXXXX" />
                </div>
              </div>
              <div>
                <label className={labelCls}>Hospital License Number <span className="text-gray-400">(optional)</span></label>
                <div className="relative">
                  <ShieldCheckIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="text" value={form.hospitalLicense}
                    onChange={e => setForm({ ...form, hospitalLicense: e.target.value })}
                    className={inputCls} placeholder="License number" />
                </div>
              </div>
              <div>
                <label className={labelCls}>Business Registration Number <span className="text-gray-400">(optional)</span></label>
                <div className="relative">
                  <BuildingOffice2Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="text" value={form.businessRegistration}
                    onChange={e => setForm({ ...form, businessRegistration: e.target.value })}
                    className={inputCls} placeholder="Business registration number" />
                </div>
              </div>
            </div>

            <div>
              <label className={labelCls}>Password</label>
              <div className="relative">
                <LockClosedIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type={showPassword ? 'text' : 'password'} required minLength={8}
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  className={`${inputCls} pr-10`} placeholder="Minimum 8 characters" />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  {showPassword ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className={labelCls}>Confirm Password</label>
              <div className="relative">
                <LockClosedIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type={showConfirm ? 'text' : 'password'} required
                  value={form.confirmPassword}
                  onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
                  className={`${inputCls} pr-10`} placeholder="Repeat password" />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  {showConfirm ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full bg-teal-500 hover:bg-teal-600 text-white py-3 rounded-lg font-semibold text-sm transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed">
              {loading
                ? <span className="flex items-center justify-center gap-2"><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Submitting…</span>
                : 'Submit Application'}
            </button>

            <p className="text-center text-sm text-gray-600">
              Already registered?{' '}
              <Link href="/login" className="text-teal-600 font-semibold hover:underline">Sign in</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
