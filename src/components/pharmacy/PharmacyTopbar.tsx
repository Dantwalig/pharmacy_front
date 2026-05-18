'use client';
import { useTranslation } from 'react-i18next';
import { Bell, Menu, Sun, ChevronDown } from 'lucide-react';
import { SUPPORTED_LANGUAGES } from '@/lib/i18n';
import { useAuth } from '@/context/AuthContext';

interface PharmacyTopbarProps {
  pharmacyName?: string;
  subtitle?: string;
  onMenuClick?: () => void;
}

export default function PharmacyTopbar({ onMenuClick }: PharmacyTopbarProps) {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();

  const firstName = user?.profile?.firstName ?? '';
  const lastName  = user?.profile?.lastName  ?? '';
  const fullName  = [firstName, lastName].filter(Boolean).join(' ');
  const initials  = [firstName[0], lastName[0]].filter(Boolean).join('').toUpperCase();

  const changeLanguage = (code: string) => {
    i18n.changeLanguage(code);
    localStorage.setItem('i18nextLng', code);
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-6">
      {/* Left: hamburger + title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          aria-label="Open sidebar"
        >
          <Menu size={18} className="text-gray-600" />
        </button>
        <p className="text-base font-semibold text-gray-900">
          E-Vuze Healthcare Platform
        </p>
      </div>

      {/* Right: language · sun · bell · user */}
      <div className="flex items-center gap-2 lg:gap-3">

        {/* Language switcher */}
        <div className="hidden md:flex items-center gap-1">
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

        {/* Sun icon */}
        <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
          <Sun size={17} className="text-gray-500" />
        </button>

        {/* Bell */}
        <button className="relative p-2 rounded-full hover:bg-gray-100 transition-colors" aria-label="Notifications">
          <Bell size={18} className="text-gray-600" />
          <span
            className="absolute top-1 right-1 w-2 h-2 rounded-full"
            style={{ backgroundColor: '#EF4444' }}
          />
        </button>

        {/* User avatar + name */}
        <div className="flex items-center gap-2 cursor-pointer group">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-semibold select-none shrink-0"
            style={{ backgroundColor: '#2D9B8A' }}
          >
            {initials || t('topbar.pharmacy')[0]}
          </div>
          {fullName && (
            <div className="hidden md:flex items-center gap-1">
              <p className="text-sm font-semibold text-gray-800 whitespace-nowrap">{fullName}</p>
              <ChevronDown size={14} className="text-gray-400" />
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
