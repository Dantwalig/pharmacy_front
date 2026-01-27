// frontend/src/app/patient/pharmacies/page.tsx

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import api from '@/lib/api';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { MapPinIcon, PhoneIcon, ClockIcon, CheckBadgeIcon } from '@heroicons/react/24/outline';

export default function BrowsePharmacies() {
  const { t } = useTranslation();
  const [pharmacies, setPharmacies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchPharmacies();
  }, []);

  const fetchPharmacies = async () => {
    try {
      const res = await api.get('/pharmacies');
      setPharmacies(res.data);
    } catch (error) {
      console.error('Failed to fetch pharmacies:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPharmacies = pharmacies.filter((pharmacy: any) =>
    pharmacy.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    pharmacy.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-linear-to-r from-blue-600 to-cyan-600 rounded-2xl shadow-xl p-8 text-white">
        <h1 className="text-3xl sm:text-4xl font-bold mb-2">
          {t('pharmacies.title')} 🏥
        </h1>
        <p className="text-blue-100 text-lg">{t('pharmacies.subtitle')}</p>
      </div>

      {/* Search */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-4">
        <div className="relative">
          <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl">
            🔍
          </span>
          <input
            type="text"
            placeholder={t('pharmacies.searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
          />
        </div>
      </div>

      {/* Results Count */}
      <div className="text-gray-600 dark:text-gray-400">
        {t('pharmacies.found')} {filteredPharmacies.length} {filteredPharmacies.length === 1 ? t('pharmacies.pharmacy') : t('pharmacies.pharmacies')}
      </div>

      {/* Pharmacy Cards */}
      {filteredPharmacies.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-12 text-center">
          <p className="text-6xl mb-4">🏥</p>
          <p className="text-gray-500 dark:text-gray-400 text-lg">{t('pharmacies.noPharmacies')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPharmacies.map((pharmacy: any) => (
            <div
              key={pharmacy.id}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all transform hover:scale-105 overflow-hidden"
            >
              {/* Card Header */}
              <div className="bg-linear-to-r from-blue-500 to-cyan-500 p-6 text-white">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-xl mb-1">{pharmacy.name}</h3>
                    <div className="flex items-center gap-2">
                      <CheckBadgeIcon className="w-5 h-5" />
                      <span className="text-sm font-medium">{t('pharmacies.verified')}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-6 space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3 text-gray-700 dark:text-gray-300">
                    <MapPinIcon className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                    <span className="text-sm">{pharmacy.address}</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                    <PhoneIcon className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />
                    <span className="text-sm">{pharmacy.phone}</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                    <ClockIcon className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />
                    <span className="text-sm">{t('pharmacies.openNow')}</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-4">
                    <span>💊 {pharmacy._count?.medications || 0} {t('pharmacies.availableMedications')}</span>
                  </div>

                  <Link href={`/patient/pharmacies/${pharmacy.id}`}>
                    <button className="w-full bg-linear-to-r from-blue-600 to-cyan-600 text-white py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-cyan-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105">
                      {t('pharmacies.viewMedications')}
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}