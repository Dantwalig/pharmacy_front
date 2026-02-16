// frontend/src/components/LanguageSwitcher.tsx

'use client';

import { useTranslation } from 'react-i18next';
import { useEffect } from 'react';

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const languages = [
    { code: 'en', name: 'EN' },
    { code: 'fr', name: 'FR' },
    { code: 'rw', name: 'RW' }
  ];

  const changeLanguage = (langCode: string) => {
    i18n.changeLanguage(langCode);
    localStorage.setItem('language', langCode);
  };

  // Load saved language on mount
  useEffect(() => {
    const savedLang = localStorage.getItem('language');
    if (savedLang && ['en', 'fr', 'rw'].includes(savedLang)) {
      i18n.changeLanguage(savedLang);
    }
  }, [i18n]);

  return (
    <div className="flex items-center gap-1">
      {languages.map((lang, index) => (
        <div key={lang.code} className="flex items-center">
          <button
            onClick={() => changeLanguage(lang.code)}
            className={`px-2 py-1 text-sm font-medium transition-colors ${
              i18n.language === lang.code
                ? 'text-gray-900'
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            {lang.name}
          </button>
          {index < languages.length - 1 && (
            <span className="text-gray-300">|</span>
          )}
        </div>
      ))}
    </div>
  );
}