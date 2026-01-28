// frontend/src/app/pharmacy/inventory/page.tsx

'use client';

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import PharmacyTopbar from '@/components/pharmacy/PharmacyTopbar';
import PharmacySidebar from '@/components/pharmacy/PharmacySidebar';
import { PlusIcon, PencilIcon, TrashIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

export default function PharmacyInventoryPage() {
  const { t } = useTranslation();
  const [medications, setMedications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingMed, setEditingMed] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    category: '',
    price: '',
    quantity: '',
    requiresPrescription: false,
    lowStockThreshold: '10',
  });

  useEffect(() => {
    fetchMedications();
  }, []);

  const fetchMedications = async () => {
    try {
      const res = await api.get('/medications');
      setMedications(res.data);
    } catch (error) {
      console.error('Failed to fetch medications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      // Convert string values to numbers for the API
      const payload = {
        ...formData,
        price: parseFloat(formData.price) || 0,
        quantity: parseInt(formData.quantity) || 0,
        lowStockThreshold: parseInt(formData.lowStockThreshold) || 10,
      };

      if (editingMed) {
        await api.patch(`/medications/${editingMed.id}`, payload);
        toast.success(t('pharmacy.medicationUpdated'));
      } else {
        await api.post('/medications', payload);
        toast.success(t('pharmacy.medicationAdded'));
      }

      setShowModal(false);
      resetForm();
      fetchMedications();
    } catch (error: any) {
      toast.error(error.response?.data?.message || t('pharmacy.operationFailed'));
    }
  };

  const handleEdit = (med: any) => {
    setEditingMed(med);
    setFormData({
      name: med.name,
      category: med.category,
      price: med.price.toString(),
      quantity: med.quantity.toString(),
      requiresPrescription: med.requiresPrescription,
      lowStockThreshold: med.lowStockThreshold?.toString() || '10',
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t('pharmacy.confirmDelete'))) return;

    try {
      await api.delete(`/medications/${id}`);
      toast.success(t('pharmacy.medicationDeleted'));
      fetchMedications();
    } catch (error) {
      toast.error(t('pharmacy.deleteFailed'));
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      category: '',
      price: '',
      quantity: '',
      requiresPrescription: false,
      lowStockThreshold: '10',
    });
    setEditingMed(null);
  };

  const filteredMeds = medications.filter((med: any) =>
    med.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <PharmacySidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Topbar */}
        <PharmacyTopbar />

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-auto">
          <div className="space-y-6">
            {/* Header */}
            <div className="bg-linear-to-r from-green-600 to-emerald-600 rounded-2xl shadow-xl p-8 text-white">
              <div className="flex justify-between items-center flex-wrap gap-4">
                <div>
                  <h1 className="text-3xl sm:text-4xl font-bold mb-2">
                    {t('pharmacy.inventoryManagement')} 💊
                  </h1>
                  <p className="text-green-100 text-lg">{t('pharmacy.manageStock')}</p>
                </div>
                <button
                  onClick={() => {
                    resetForm();
                    setShowModal(true);
                  }}
                  className="bg-white text-green-600 px-6 py-3 rounded-xl font-bold hover:bg-green-50 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-2"
                >
                  <PlusIcon className="w-5 h-5" />
                  {t('pharmacy.addMedication')}
                </button>
              </div>
            </div>

            {/* Search */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-4">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-400" />
                <input
                  type="text"
                  placeholder={t('medications.searchPlaceholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                />
              </div>
            </div>

            {/* Medications Grid */}
            {filteredMeds.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-12 text-center">
                <p className="text-6xl mb-4">💊</p>
                <p className="text-gray-500 dark:text-gray-400 text-lg">{t('medications.noMedications')}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredMeds.map((med: any) => (
                  <div key={med.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all transform hover:scale-105">
                    {/* Card Header */}
                    <div className="bg-linear-to-r from-green-500 to-emerald-500 p-6 text-white">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <h3 className="font-bold text-xl mb-1">{med.name}</h3>
                          <p className="text-sm opacity-90">{med.category}</p>
                        </div>
                        {med.requiresPrescription && (
                          <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-semibold">
                            Rx
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="p-6 space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600 dark:text-gray-400">{t('pharmacy.price')}</span>
                          <span className="font-bold text-lg text-gray-800 dark:text-gray-100">
                            {med.price.toLocaleString()} RWF
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600 dark:text-gray-400">{t('medications.stock')}</span>
                          <span
                            className={`font-bold text-lg ${
                              med.quantity === 0
                                ? 'text-red-600 dark:text-red-400'
                                : med.quantity < med.lowStockThreshold
                                ? 'text-yellow-600 dark:text-yellow-400'
                                : 'text-green-600 dark:text-green-400'
                            }`}
                          >
                            {med.quantity} {t('pharmacy.units')}
                          </span>
                        </div>
                      </div>

                      <div className="flex gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <button
                          onClick={() => handleEdit(med)}
                          className="flex-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 py-2 rounded-xl font-semibold hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-all flex items-center justify-center gap-1"
                        >
                          <PencilIcon className="w-4 h-4" />
                          {t('common.edit')}
                        </button>
                        <button
                          onClick={() => handleDelete(med.id)}
                          className="flex-1 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 py-2 rounded-xl font-semibold hover:bg-red-100 dark:hover:bg-red-900/30 transition-all flex items-center justify-center gap-1"
                        >
                          <TrashIcon className="w-4 h-4" />
                          {t('common.delete')}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Add/Edit Modal */}
            {showModal && (
              <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
                  <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-100">
                    {editingMed ? t('pharmacy.editMedication') : t('pharmacy.addNewMedication')}
                  </h2>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                        {t('pharmacy.name')}
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                        {t('pharmacy.category')}
                      </label>
                      <input
                        type="text"
                        value={formData.category}
                        onChange={(e) =>
                          setFormData({ ...formData, category: e.target.value })
                        }
                        className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                          {t('pharmacy.price')} (RWF)
                        </label>
                        <input
                          type="number"
                          value={formData.price}
                          onChange={(e) =>
                            setFormData({ ...formData, price: e.target.value })
                          }
                          className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                          {t('pharmacy.quantity')}
                        </label>
                        <input
                          type="number"
                          value={formData.quantity}
                          onChange={(e) =>
                            setFormData({ ...formData, quantity: e.target.value })
                          }
                          className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                        {t('pharmacy.lowStockThreshold')}
                      </label>
                      <input
                        type="number"
                        value={formData.lowStockThreshold}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            lowStockThreshold: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                      />
                    </div>

                    <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                      <input
                        type="checkbox"
                        id="requiresPrescription"
                        checked={formData.requiresPrescription}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            requiresPrescription: e.target.checked,
                          })
                        }
                        className="w-5 h-5 text-green-600"
                      />
                      <label htmlFor="requiresPrescription" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {t('medications.prescriptionRequired')}
                      </label>
                    </div>
                  </div>

                  <div className="flex gap-3 mt-6">
                    <button
                      onClick={() => {
                        setShowModal(false);
                        resetForm();
                      }}
                      className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 py-3 rounded-xl font-bold hover:bg-gray-300 dark:hover:bg-gray-600 transition-all"
                    >
                      {t('common.cancel')}
                    </button>
                    <button
                      onClick={handleSubmit}
                      className="flex-1 bg-linear-to-r from-green-600 to-emerald-600 text-white py-3 rounded-xl font-bold hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg"
                    >
                      {editingMed ? t('common.update') : t('common.add')}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}