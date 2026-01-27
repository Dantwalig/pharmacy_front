// frontend/src/app/signup/page.tsx

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import api, { authApi } from '@/lib/api';
import toast from 'react-hot-toast';
import LanguageSwitcher from '@/components/shared/LanguageSwitcher';

type UserType = 'patient' | 'pharmacy';

export default function SignupPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const [userType, setUserType] = useState<UserType>('patient');
  const [loading, setLoading] = useState(false);

  // File uploads for pharmacy
  const [rdbCertificateFile, setRdbCertificateFile] = useState<File | null>(null);
  const [pharmacyLicenseFile, setPharmacyLicenseFile] = useState<File | null>(null);

  // Separate form data for patient and pharmacy
  const [patientData, setPatientData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    address: '',
    dateOfBirth: '',
    gender: '',
    insuranceProvider: '',
  });

  const [pharmacyData, setPharmacyData] = useState({
    pharmacyName: '',
    representativeName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    address: '',
    dateOfIncorporation: '',
    latitude: '',
    longitude: '',
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'rdb' | 'license') => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type (PDF only)
    if (file.type !== 'application/pdf') {
      toast.error('Please upload PDF files only');
      e.target.value = '';
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      e.target.value = '';
      return;
    }

    if (type === 'rdb') {
      setRdbCertificateFile(file);
    } else {
      setPharmacyLicenseFile(file);
    }
  };

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let formData;

      if (userType === 'patient') {
        formData = patientData;
      } else {
        // For pharmacy, we need to include base64 encoded documents
        if (!rdbCertificateFile || !pharmacyLicenseFile) {
          toast.error('Please upload both RDB Certificate and Pharmacy License');
          setLoading(false);
          return;
        }

        // Convert files to base64
        const rdbCertificateBase64 = await convertFileToBase64(rdbCertificateFile);
        const pharmacyLicenseBase64 = await convertFileToBase64(pharmacyLicenseFile);

        formData = {
          ...pharmacyData,
          rdbCertificate: rdbCertificateBase64,
          pharmacyLicense: pharmacyLicenseBase64,
        };
      }

      // Validate passwords match
      if (formData.password !== formData.confirmPassword) {
        toast.error('Passwords do not match!');
        setLoading(false);
        return;
      }

      // Validate password length
      if (formData.password.length < 8) {
        toast.error('Password must be at least 8 characters long!');
        setLoading(false);
        return;
      }

      // Clean up data - remove empty optional fields
      const cleanedData = Object.entries(formData).reduce((acc, [key, value]) => {
        if (value !== '') {
          acc[key] = value;
        }
        return acc;
      }, {} as any);

      // Call the appropriate auth API method
      const response = userType === 'patient' 
        ? await authApi.registerPatient(cleanedData)
        : await authApi.registerPharmacy(cleanedData);

      toast.success(
        response.message || 
        (userType === 'patient'
          ? 'Registration successful! Please check your email to verify your account.'
          : 'Registration successful! Please verify your email.')
      );

      // Redirect to email verification page with email parameter
      const email = userType === 'patient' ? patientData.email : pharmacyData.email;
      router.push(`/verify-email?email=${encodeURIComponent(email)}`);
    } catch (error: any) {
      console.error('Registration error:', error);
      const errorMessage = error.response?.data?.message || 'Registration failed. Please try again.';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all placeholder:text-gray-400 dark:placeholder:text-gray-500";

  return (
    <div className="min-h-screen bg-linear-to-br from-purple-600 via-indigo-600 to-blue-600 py-12 px-4 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
      </div>

      {/* Language Switcher */}
      <div className="absolute top-6 right-6 z-20">
        <LanguageSwitcher />
      </div>

      <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">🎉</div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            {t('auth.signup')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">Join E-Vuze Healthcare Platform</p>
        </div>

        {/* User Type Selector */}
        <div className="flex gap-4 mb-8">
          <button
            type="button"
            onClick={() => setUserType('patient')}
            className={`flex-1 py-4 rounded-xl font-bold transition-all transform ${
              userType === 'patient'
                ? 'bg-linear-to-r from-blue-600 to-cyan-600 text-white shadow-lg scale-105'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            <div className="flex flex-col items-center gap-2">
              <span className="text-3xl">🙋‍♂️</span>
              <span>{t('login.patient')}</span>
            </div>
          </button>
          <button
            type="button"
            onClick={() => setUserType('pharmacy')}
            className={`flex-1 py-4 rounded-xl font-bold transition-all transform ${
              userType === 'pharmacy'
                ? 'bg-linear-to-r from-green-600 to-emerald-600 text-white shadow-lg scale-105'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            <div className="flex flex-col items-center gap-2">
              <span className="text-3xl">🏥</span>
              <span>{t('login.pharmacy')}</span>
            </div>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {userType === 'patient' ? (
            <>
              {/* Patient Registration Form */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    {t('auth.firstName')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={patientData.firstName}
                    onChange={(e) =>
                      setPatientData({ ...patientData, firstName: e.target.value })
                    }
                    className={inputClass}
                    placeholder="John"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    {t('auth.lastName')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={patientData.lastName}
                    onChange={(e) =>
                      setPatientData({ ...patientData, lastName: e.target.value })
                    }
                    className={inputClass}
                    placeholder="Doe"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  {t('auth.email')} <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={patientData.email}
                  onChange={(e) =>
                    setPatientData({ ...patientData, email: e.target.value })
                  }
                  className={inputClass}
                  placeholder="you@example.com"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    {t('auth.password')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    required
                    value={patientData.password}
                    onChange={(e) =>
                      setPatientData({ ...patientData, password: e.target.value })
                    }
                    className={inputClass}
                    minLength={8}
                    placeholder="Min 8 characters"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Confirm Password <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    required
                    value={patientData.confirmPassword}
                    onChange={(e) =>
                      setPatientData({ ...patientData, confirmPassword: e.target.value })
                    }
                    className={inputClass}
                    minLength={8}
                    placeholder="Confirm password"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  {t('auth.phone')} <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  value={patientData.phone}
                  onChange={(e) =>
                    setPatientData({ ...patientData, phone: e.target.value })
                  }
                  className={inputClass}
                  placeholder="+250788123456"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  {t('auth.address')} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={patientData.address}
                  onChange={(e) =>
                    setPatientData({ ...patientData, address: e.target.value })
                  }
                  className={inputClass}
                  placeholder="Kigali, Rwanda"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    value={patientData.dateOfBirth}
                    onChange={(e) =>
                      setPatientData({ ...patientData, dateOfBirth: e.target.value })
                    }
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Gender
                  </label>
                  <select
                    value={patientData.gender}
                    onChange={(e) =>
                      setPatientData({ ...patientData, gender: e.target.value })
                    }
                    className={inputClass}
                  >
                    <option value="">Select</option>
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Insurance Provider (Optional)
                </label>
                <input
                  type="text"
                  value={patientData.insuranceProvider}
                  onChange={(e) =>
                    setPatientData({ ...patientData, insuranceProvider: e.target.value })
                  }
                  className={inputClass}
                  placeholder="e.g., RAMA, MMI"
                />
              </div>
            </>
          ) : (
            <>
              {/* Pharmacy Registration Form */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Pharmacy Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={pharmacyData.pharmacyName}
                  onChange={(e) =>
                    setPharmacyData({ ...pharmacyData, pharmacyName: e.target.value })
                  }
                  className={inputClass}
                  placeholder="ABC Pharmacy"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Representative Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={pharmacyData.representativeName}
                  onChange={(e) =>
                    setPharmacyData({ ...pharmacyData, representativeName: e.target.value })
                  }
                  className={inputClass}
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={pharmacyData.email}
                  onChange={(e) =>
                    setPharmacyData({ ...pharmacyData, email: e.target.value })
                  }
                  className={inputClass}
                  placeholder="pharmacy@example.com"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    required
                    value={pharmacyData.password}
                    onChange={(e) =>
                      setPharmacyData({ ...pharmacyData, password: e.target.value })
                    }
                    className={inputClass}
                    minLength={8}
                    placeholder="Min 8 characters"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Confirm Password <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    required
                    value={pharmacyData.confirmPassword}
                    onChange={(e) =>
                      setPharmacyData({ ...pharmacyData, confirmPassword: e.target.value })
                    }
                    className={inputClass}
                    minLength={8}
                    placeholder="Confirm password"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Phone <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  value={pharmacyData.phone}
                  onChange={(e) =>
                    setPharmacyData({ ...pharmacyData, phone: e.target.value })
                  }
                  className={inputClass}
                  placeholder="+250788123456"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={pharmacyData.address}
                  onChange={(e) =>
                    setPharmacyData({ ...pharmacyData, address: e.target.value })
                  }
                  className={inputClass}
                  placeholder="Kigali, Rwanda"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Date of Incorporation <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={pharmacyData.dateOfIncorporation}
                  onChange={(e) =>
                    setPharmacyData({ ...pharmacyData, dateOfIncorporation: e.target.value })
                  }
                  className={inputClass}
                />
              </div>

              {/* Document Upload Section */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-700 rounded-xl p-6 space-y-4">
                <div className="flex items-start gap-3 mb-4">
                  <div className="text-2xl">📄</div>
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-1">
                      Required Documents
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Please upload PDF copies of your pharmacy documents (max 5MB each)
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    RDB Certificate <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="file"
                      required
                      accept=".pdf"
                      onChange={(e) => handleFileChange(e, 'rdb')}
                      className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 dark:file:bg-purple-900 dark:file:text-purple-300"
                    />
                  </div>
                  {rdbCertificateFile && (
                    <div className="mt-2 flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                      <span>✓</span>
                      <span>{rdbCertificateFile.name}</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Pharmacy License <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="file"
                      required
                      accept=".pdf"
                      onChange={(e) => handleFileChange(e, 'license')}
                      className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 dark:file:bg-purple-900 dark:file:text-purple-300"
                    />
                  </div>
                  {pharmacyLicenseFile && (
                    <div className="mt-2 flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                      <span>✓</span>
                      <span>{pharmacyLicenseFile.name}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Optional Location Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Latitude (Optional)
                  </label>
                  <input
                    type="text"
                    value={pharmacyData.latitude}
                    onChange={(e) =>
                      setPharmacyData({ ...pharmacyData, latitude: e.target.value })
                    }
                    className={inputClass}
                    placeholder="-1.9441"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Longitude (Optional)
                  </label>
                  <input
                    type="text"
                    value={pharmacyData.longitude}
                    onChange={(e) =>
                      setPharmacyData({ ...pharmacyData, longitude: e.target.value })
                    }
                    className={inputClass}
                    placeholder="30.0619"
                  />
                </div>
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-linear-to-r from-purple-600 to-indigo-600 text-white py-4 rounded-xl font-bold hover:from-purple-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Creating account...</span>
              </div>
            ) : (
              t('auth.signup')
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Already have an account?{' '}
            <Link href="/login" className="text-purple-600 dark:text-purple-400 hover:underline font-bold">
              {t('auth.login')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}