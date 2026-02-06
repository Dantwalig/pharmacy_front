// frontend/src/app/pharmacy/inventory/page.tsx

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import api from '@/lib/api';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import PharmacyTopbar from '@/components/pharmacy/PharmacyTopbar';
import PharmacySidebar from '@/components/pharmacy/PharmacySidebar';
import SupportBot from '@/components/pharmacy/SupportBot';
import toast from 'react-hot-toast';
import { MagnifyingGlassIcon, PlusIcon, CubeIcon } from '@heroicons/react/24/outline';

export default function PharmacyInventoryPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const [medications, setMedications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'LOW_STOCK' | 'OUT_OF_STOCK'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchMedications();
  }, [filter]);

  const fetchMedications = async () => {
    try {
      setLoading(true);
      let url = '/medications/pharmacy/my-medications';
      
      if (filter === 'LOW_STOCK') {
        url = '/medications/pharmacy/low-stock';
      } else if (filter === 'OUT_OF_STOCK') {
        url = '/medications/pharmacy/out-of-stock';
      }
      
      const res = await api.get(url);
      setMedications(res.data);
    } catch (error) {
      console.error('Failed to fetch medications:', error);
      toast.error('Failed to load medications');
    } finally {
      setLoading(false);
    }
  };

  const filteredMedications = medications.filter((med: any) =>
    med.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    med.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <PharmacySidebar />
      <SupportBot />

      <div className="flex-1 flex flex-col lg:ml-72">
        <PharmacyTopbar />

        <main className="flex-1 p-4 lg:p-8 overflow-auto">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="bg-linear-to-r from-[#1E4D8C] via-[#2563a8] to-[#1a3d6f] rounded-2xl shadow-lg p-6 lg:p-8 text-white">
              <h1 className="text-2xl lg:text-3xl font-bold mb-2">
                Inventory Management
              </h1>
              <p className="text-blue-100 text-sm lg:text-base">
                Manage your pharmacy's medication inventory
              </p>
            </div>

            {/* Search and Add */}
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="relative w-full sm:w-96">
                <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search medications..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                />
              </div>
              <button
                onClick={() => router.push('/pharmacy/inventory/add')}
                className="w-full sm:w-auto bg-teal-500 hover:bg-teal-600 text-white px-6 py-3 rounded-lg font-medium transition-all shadow-md flex items-center justify-center gap-2"
              >
                <PlusIcon className="w-5 h-5" />
                Add Medication
              </button>
            </div>

            {/* Filter Tabs */}
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setFilter('ALL')}
                className={`px-6 py-3 rounded-lg font-medium transition-all ${
                  filter === 'ALL'
                    ? 'bg-teal-500 text-white shadow-md'
                    : 'bg-white text-gray-700 hover:shadow-md'
                }`}
              >
                All Items
              </button>
              <button
                onClick={() => setFilter('LOW_STOCK')}
                className={`px-6 py-3 rounded-lg font-medium transition-all ${
                  filter === 'LOW_STOCK'
                    ? 'bg-teal-500 text-white shadow-md'
                    : 'bg-white text-gray-700 hover:shadow-md'
                }`}
              >
                Low Stock
              </button>
              <button
                onClick={() => setFilter('OUT_OF_STOCK')}
                className={`px-6 py-3 rounded-lg font-medium transition-all ${
                  filter === 'OUT_OF_STOCK'
                    ? 'bg-teal-500 text-white shadow-md'
                    : 'bg-white text-gray-700 hover:shadow-md'
                }`}
              >
                Out of Stock
              </button>
            </div>

            {filteredMedications.length === 0 ? (
              <div className="bg-white rounded-xl shadow-md p-16 text-center">
                <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                  <CubeIcon className="w-12 h-12 text-gray-400" />
                </div>
                <p className="text-gray-500 text-lg mb-2">No medications found</p>
                <p className="text-gray-400 text-sm">
                  {searchTerm ? 'Try a different search term' : 'Add medications to your inventory'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredMedications.map((med: any) => (
                  <div
                    key={med.id}
                    onClick={() => router.push(`/pharmacy/inventory/${med.id}`)}
                    className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all p-6 cursor-pointer"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="font-bold text-lg text-gray-900">{med.name}</h3>
                      {med.quantity === 0 ? (
                        <span className="bg-red-100 text-red-600 text-xs px-2 py-1 rounded-full font-bold">
                          OUT
                        </span>
                      ) : med.quantity <= (med.lowStockThreshold || 10) ? (
                        <span className="bg-yellow-100 text-yellow-600 text-xs px-2 py-1 rounded-full font-bold">
                          LOW
                        </span>
                      ) : null}
                    </div>

                    <p className="text-sm text-gray-600 mb-4">{med.category}</p>

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Stock:</span>
                        <span className={`font-semibold ${
                          med.quantity === 0 ? 'text-red-600' :
                          med.quantity <= (med.lowStockThreshold || 10) ? 'text-yellow-600' :
                          'text-gray-900'
                        }`}>
                          {med.quantity} units
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Price:</span>
                        <span className="font-semibold text-teal-600">{med.price} RWF</span>
                      </div>
                      {med.requiresPrescription && (
                        <div className="pt-2 border-t border-gray-200">
                          <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                            Requires Prescription
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}