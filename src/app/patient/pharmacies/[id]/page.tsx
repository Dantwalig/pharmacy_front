// frontend/src/app/patient/pharmacies/[id]/page.tsx

'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import api from '@/lib/api';
import { useCart } from '@/context/CartContext';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import toast from 'react-hot-toast';
import { ArrowLeftIcon, MapPinIcon, PhoneIcon, ClockIcon, CheckBadgeIcon } from '@heroicons/react/24/outline';

export default function PharmacyDetails() {
  const { t } = useTranslation();
  const params = useParams();
  const router = useRouter();
  const { addToCart } = useCart();
  const [pharmacy, setPharmacy] = useState<any>(null);
  const [medications, setMedications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchPharmacyDetails();
  }, [params.id]);

  const fetchPharmacyDetails = async () => {
    try {
      const [pharmacyRes, medsRes] = await Promise.all([
        api.get(`/pharmacies/${params.id}`),
        api.get(`/medications/search?pharmacyId=${params.id}`),
      ]);
      
      setPharmacy(pharmacyRes.data);
      setMedications(medsRes.data);
    } catch (error) {
      console.error('Failed to fetch pharmacy:', error);
      toast.error(t('pharmacies.loadFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (medication: any) => {
    addToCart({
      medicationId: medication.id,
      name: medication.name,
      price: medication.price,
      quantity: 1,
      pharmacyId: pharmacy.id,
      pharmacyName: pharmacy.name,
      requiresPrescription: medication.requiresPrescription,
      imageUrl: medication.imageUrl,
    });
    toast.success(t('cart.itemAdded'));
  };

  const filteredMedications = medications.filter((med: any) =>
    med.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    med.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!pharmacy) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">{t('pharmacies.notFound')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
      >
        <ArrowLeftIcon className="w-5 h-5" />
        {t('common.back')}
      </button>

      {/* Pharmacy Info Header */}
      <div className="bg-linear-to-r from-blue-600 to-cyan-600 rounded-2xl shadow-xl p-8 text-white">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm text-3xl">
                🏥
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold mb-1">{pharmacy.name}</h1>
                <div className="flex items-center gap-2">
                  <CheckBadgeIcon className="w-5 h-5" />
                  <span className="text-sm font-medium">{t('pharmacies.verified')}</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-2 mt-4">
              <div className="flex items-center gap-3 text-blue-100">
                <MapPinIcon className="w-5 h-5 shrink-0" />
                <span>{pharmacy.address}</span>
              </div>
              <div className="flex items-center gap-3 text-blue-100">
                <PhoneIcon className="w-5 h-5 shrink-0" />
                <span>{pharmacy.phone}</span>
              </div>
              <div className="flex items-center gap-3 text-blue-100">
                <ClockIcon className="w-5 h-5 shrink-0" />
                <span>{t('pharmacies.openNow')}</span>
              </div>
            </div>
          </div>

          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 border border-white/30">
            <p className="text-sm opacity-90 mb-1">{t('pharmacies.availableMedications')}</p>
            <p className="text-3xl font-bold">💊 {medications.length}</p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-4">
        <div className="relative">
          <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl">
            🔍
          </span>
          <input
            type="text"
            placeholder={t('medications.searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
          />
        </div>
      </div>

      {/* Results Count */}
      <div className="text-gray-600 dark:text-gray-400">
        {t('medications.found')} {filteredMedications.length} {filteredMedications.length === 1 ? t('medications.medication') : t('medications.medications')}
      </div>

      {/* Medications Grid */}
      {filteredMedications.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMedications.map((med: any) => (
            <div key={med.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all transform hover:scale-105 overflow-hidden">
              {/* Card Header */}
              <div className="bg-linear-to-r from-blue-500 to-cyan-500 p-6 text-white">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-bold text-xl mb-1">{med.name}</h3>
                    <p className="text-sm opacity-90">{med.category}</p>
                  </div>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-6 space-y-4">
                {med.requiresPrescription && (
                  <div className="flex items-center gap-2 text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 px-3 py-2 rounded-lg">
                    <span>📋</span>
                    <span className="text-sm font-medium">{t('medications.prescriptionRequired')}</span>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{t('pharmacy.price')}</p>
                    <p className="text-2xl font-bold bg-linear-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                      {med.price.toLocaleString()} RWF
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600 dark:text-gray-400">{t('medications.stock')}</p>
                    <p className={`text-lg font-bold ${
                      med.quantity > 10 
                        ? 'text-green-600 dark:text-green-400' 
                        : med.quantity > 0 
                        ? 'text-yellow-600 dark:text-yellow-400' 
                        : 'text-red-600 dark:text-red-400'
                    }`}>
                      {med.quantity} {t('pharmacy.units')}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => handleAddToCart(med)}
                  disabled={med.quantity === 0}
                  className="w-full bg-linear-to-r from-blue-600 to-cyan-600 text-white py-3 rounded-xl font-bold hover:from-blue-700 hover:to-cyan-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
                >
                  {med.quantity > 0 ? t('medications.addToCart') : t('medications.outOfStock')}
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-12 text-center">
          <p className="text-6xl mb-4">💊</p>
          <p className="text-gray-500 dark:text-gray-400 text-lg">{t('medications.noMedications')}</p>
        </div>
      )}
    </div>
  );
}