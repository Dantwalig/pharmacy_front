'use client';
// src/app/(pharmacy)/PharmacyTopbar.tsx
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Bell, ChevronDown, User } from 'lucide-react';
import { SUPPORTED_LANGUAGES } from '@/lib/i18n';

interface PharmacyTopbarProps {
  pharmacyName?: string;
  subtitle?: string;
}

export default function PharmacyTopbar({
  pharmacyName = 'E-Vuze Pharmacy',
  subtitle,
}: PharmacyTopbarProps) {
  const { t, i18n } = useTranslation();
  const [roleOpen, setRoleOpen] = useState(false);
  const currentRole = t('pharmacyOwner.role');

  const changeLanguage = (code: string) => {
    i18n.changeLanguage(code);
    localStorage.setItem('i18nextLng', code);
  };

  return (
    <header className="fixed top-0 left-72 right-0 z-30 h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      {/* Left: pharmacy name */}
      <div>
        <p className="text-base font-semibold" style={{ color: '#2D9B8A' }}>
          {pharmacyName}
        </p>
        <p className="text-xs text-gray-500">
          {subtitle ?? t('pharmacyOwner.managePharmacy')}
        </p>
      </div>

      {/* Right: role + lang + bell + user */}
      <div className="flex items-center gap-4">
        {/* Role selector */}
        <div className="relative">
          <button
            onClick={() => setRoleOpen(!roleOpen)}
            className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
          >
            {currentRole}
            <ChevronDown size={14} />
          </button>
          {roleOpen && (
            <div className="absolute right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg py-1 min-w-40 z-50">
              <div className="px-4 py-2 text-sm font-medium text-gray-900 bg-gray-50 rounded-t-xl">
                {currentRole}
              </div>
            </div>
          )}
        </div>

        {/* Current role badge */}
        <span
          className="px-3 py-1.5 rounded-lg text-sm font-medium text-white"
          style={{ backgroundColor: '#2D9B8A' }}
        >
          {currentRole}
        </span>

        {/* Language switcher */}
        <div className="flex items-center gap-1">
          {SUPPORTED_LANGUAGES.map((lang, i) => (
            <span key={lang.code} className="flex items-center">
              <button
                onClick={() => changeLanguage(lang.code)}
                className={`text-sm font-medium transition-colors px-0.5 ${
                  i18n.language === lang.code
                    ? 'text-gray-900 font-semibold'
                    : 'text-gray-400 hover:text-gray-700'
                }`}
              >
                {lang.label}
              </button>
              {i < SUPPORTED_LANGUAGES.length - 1 && (
                <span className="text-gray-300 mx-1 select-none">|</span>
              )}
            </span>
          ))}
        </div>

        {/* Notifications */}
        <button className="relative p-2 rounded-full hover:bg-gray-100">
          <Bell size={18} className="text-gray-600" />
          <span
            className="absolute top-1 right-1 w-2 h-2 rounded-full"
            style={{ backgroundColor: '#EF4444' }}
          />
        </button>

        {/* User avatar */}
        <div className="flex items-center gap-2">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-semibold"
            style={{ backgroundColor: '#1E4D8C' }}
          >
            <User size={16} />
          </div>
          <div className="hidden md:block">
            <p className="text-sm font-semibold text-gray-800">Pharmacy</p>
            <p className="text-xs text-gray-500">{currentRole}</p>
          </div>
        </div>
      </div>
    </header>
  );
}