// frontend/src/app/patient/search/page.tsx

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import api from '@/lib/api';
import { useCart } from '@/context/CartContext';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import toast from 'react-hot-toast';
import { MagnifyingGlassIcon, MapPinIcon, PhoneIcon, StarIcon, ClockIcon } from '@heroicons/react/24/outline';

export default function SearchPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const { addToCart } = useCart();
  const [activeTab, setActiveTab] = useState<'pharmacies' | 'medications'>('pharmacies');
  const [searchQuery, setSearchQuery] = useState('');
  const [pharmacies, setPharmacies] = useState([]);
  const [medications, setMedications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    if (activeTab === 'pharmacies') {
      fetchPharmacies();
    }
  }, [activeTab]);

  const fetchPharmacies = async () => {
    try {
      setLoading(true);
      const res = await api.get('/pharmacies');
      setPharmacies(res.data);
    } catch (error) {
      console.error('Failed to fetch pharmacies:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    if (activeTab === 'medications') {
      setLoading(true);
      setSearched(true);
      try {
        const res = await api.get(`/medications/search?query=${searchQuery}`);
        setMedications(res.data);
        if (res.data.length === 0) toast.error(t('errors.noMedicationsFound'));
      } catch (error) {
        console.error('Search failed:', error);
        toast.error(t('errors.searchFailed'));
      } finally {
        setLoading(false);
      }
    }
  };

  const handleAddToCart = (medication: any) => {
    addToCart({
      medicationId: medication.id,
      name: medication.name,
      price: medication.price,
      quantity: 1,
      pharmacyId: medication.pharmacy.id,
      pharmacyName: medication.pharmacy.name,
      branchId: medication.branchId || medication.pharmacy.branchId || '',
      requiresPrescription: medication.requiresPrescription,
      imageUrl: medication.imageUrl,
    });
    toast.success(`${medication.name} added to cart!`);
  };

  return (
    <div className="space-y-6">
    {/* Header */}
      <div className="bg-linear-to-r from-[#1E4D8C] to-[#1a3d6f] rounded-2xl shadow-xl p-8 text-white">
      <h1 className="text-3xl sm:text-4xl font-bold mb-2">
        Find Pharmacy & Medicine
        </h1>
      <p className="text-blue-100 text-lg">{t('search.searchNearby')}</p>
    </div>

    {/* Search Form */}
      <form onSubmit={handleSearch} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <MagnifyingGlassIcon className="w-5 h-5 absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
              type="text"
              placeholder={t('search.searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-xl focus:ring-2 focus:ring-[#2D9B8A] focus:border-transparent outline-none transition-all"
            />
        </div>
        <button type="submit" className="px-8 py-3 bg-[#2D9B8A] hover:bg-[#207a6c] text-white rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl whitespace-nowrap">
          Search
          </button>
      </div>
    </form>

    {/* Tabs */}
      <div className="flex gap-3">
      <button
          onClick={() => setActiveTab('pharmacies')}
          className={`px-6 py-3 rounded-xl font-semibold transition-all ${activeTab === 'pharmacies' ? 'bg-[#1E4D8C] text-white shadow-lg' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'}`}
        >
        Pharmacies
        </button>
      <button
          onClick={() => setActiveTab('medications')}
          className={`px-6 py-3 rounded-xl font-semibold transition-all ${activeTab === 'medications' ? 'bg-[#1E4D8C] text-white shadow-lg' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'}`}
        >
        Medications
        </button>
    </div>

    {loading && <div className="flex justify-center py-12"><LoadingSpinner /></div>}

      {/* Pharmacies Tab */}
      {!loading && activeTab === 'pharmacies' && (
        <div className="space-y-4">
        {pharmacies.map((pharmacy: any) => (
            <div key={pharmacy.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4 flex-1">
                <div className="w-16 h-16 bg-[#1E4D8C]/10 dark:bg-[#1E4D8C]/30 rounded-xl flex items-center justify-center shrink-0">
                  <span className="text-3xl font-bold text-[#1E4D8C]">🏨</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">{pharmacy.name}</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 text-sm">
                      <MapPinIcon className="w-4 h-4" />
                      <span>{pharmacy.address}</span>
                      {pharmacy.distance && <span className="text-blue-600 dark:text-blue-400 font-medium">• {pharmacy.distance} km</span>}
                      </div>
                    <div className="flex items-center gap-4 text-sm">
                      {pharmacy.rating && (
                          <div className="flex items-center gap-1 text-yellow-600">
                          <StarIcon className="w-4 h-4 fill-current" />
                          <span className="font-medium">{pharmacy.rating}</span>
                        </div>
                      )}
                        {pharmacy.hours && (
                          <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                          <ClockIcon className="w-4 h-4" />
                          <span>{pharmacy.hours}</span>
                        </div>
                      )}
                        <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                        <PhoneIcon className="w-4 h-4" />
                        <span>{pharmacy.phone}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-end gap-3">
                <span className={`px-4 py-2 rounded-full text-xs font-semibold ${pharmacy.status === 'Open' || !pharmacy.status ? 'bg-[#2D9B8A]/10 text-[#2D9B8A]' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'}`}>
                   {pharmacy.status || 'Open'}
                  </span>
                <button onClick={() => router.push(`/patient/pharmacies/${pharmacy.id}`)} className="bg-[#1E4D8C] hover:bg-[#1a3d6f] text-white px-6 py-2 rounded-xl font-semibold transition-all shadow-lg">
                  View Details
                  </button>
              </div>
            </div>
          </div>
        ))}
          {pharmacies.length === 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-12 text-center">
            <p className="text-6xl mb-4"></p>
            <p className="text-gray-500 dark:text-gray-400 text-lg">{t('search.noPharmaciesFound')}</p>
          </div>
        )}
        </div>
    )}

      {/* Medications Tab */}
      {!loading && activeTab === 'medications' && (
        <div className="space-y-6">
        {searched && medications.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {medications.map((med: any) => (
                <div key={med.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-all overflow-hidden">
                <div className="p-6 space-y-4">
                  <div>
                    <h3 className="font-bold text-xl text-gray-800 dark:text-gray-100 mb-2">{med.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Available at: {med.pharmacy.name}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-[#1E4D8C] dark:text-blue-400">RWF {med.price.toLocaleString()}</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${med.quantity > 0 ? 'bg-[#2D9B8A]/10 text-[#2D9B8A]' : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'}`}>
                      {med.quantity > 0 ? `In Stock (${med.quantity})` : 'Out of Stock'}
                      </span>
                  </div>
                  <button onClick={() => handleAddToCart(med)} disabled={med.quantity === 0}
                      className="w-full bg-[#2D9B8A] hover:bg-[#207a6c] disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-3 rounded-xl font-semibold transition-all shadow-lg">
                    Add to Cart
                    </button>
                </div>
              </div>
            ))}
            </div>
        )}
          {searched && medications.length === 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-12 text-center">
            <p className="text-6xl mb-4"></p>
            <p className="text-gray-500 dark:text-gray-400 text-lg">{t('search.noMedicationsFound')}</p>
          </div>
        )}
          {!searched && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-12 text-center">
            <p className="text-6xl mb-4"></p>
            <p className="text-gray-500 dark:text-gray-400 text-lg">{t('search.enterMedicationName')}</p>
          </div>
        )}
        </div>
    )}
    </div>
);
}