// frontend/src/app/super-admin/pharmacies/page.tsx
// FIXED VERSION - Corrected API methods and CSS classes

'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import SuperAdminTopbar from '@/components/super-admin/SuperAdminTopbar';
import SuperAdminSidebar from '@/components/super-admin/SuperAdminSidebar';
import {
  BuildingStorefrontIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';

// Separate component that uses useSearchParams
function PharmaciesContent() {
  const { t } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [pharmacies, setPharmacies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'PENDING' | 'APPROVED' | 'REJECTED' | 'ALL'>(
    (searchParams?.get('filter')?.toUpperCase() as any) || 'PENDING'
  );
  const [rejectionModal, setRejectionModal] = useState<{ show: boolean; pharmacyId: string | null }>({
    show: false,
    pharmacyId: null,
  });
  const [rejectionReason, setRejectionReason] = useState('');
  const [approving, setApproving] = useState<string | null>(null);
  const [rejecting, setRejecting] = useState(false);

  useEffect(() => {
    fetchPharmacies();
  }, [filter]);

  const fetchPharmacies = async () => {
    setLoading(true);
    try {
      const url =
        filter === 'ALL'
          ? '/super-admin/pharmacies'
          : `/super-admin/pharmacies?status=${filter}`;
      const res = await api.get(url);
      setPharmacies(res.data);
    } catch (error: any) {
      console.error('Failed to fetch pharmacies:', error);
      toast.error(error.response?.data?.message || 'Failed to load pharmacies');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string, pharmacyName: string) => {
    if (!confirm(`${t('superAdmin.approve')} ${pharmacyName}?`)) return;

    setApproving(id);
    try {
      // Changed from .patch to .put to match backend
      await api.put(`/super-admin/pharmacies/${id}/approve`, {});
      toast.success(`${pharmacyName} approved successfully!`);
      fetchPharmacies();
    } catch (error: any) {
      console.error('Approval error:', error);
      toast.error(error.response?.data?.message || 'Failed to approve pharmacy');
    } finally {
      setApproving(null);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }

    setRejecting(true);
    try {
      // Changed from .patch to .put to match backend
      await api.put(`/super-admin/pharmacies/${rejectionModal.pharmacyId}/reject`, {
        reason: rejectionReason,
      });
      toast.success('Pharmacy rejected');
      setRejectionModal({ show: false, pharmacyId: null });
      setRejectionReason('');
      fetchPharmacies();
    } catch (error: any) {
      console.error('Rejection error:', error);
      toast.error(error.response?.data?.message || 'Failed to reject pharmacy');
    } finally {
      setRejecting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <SuperAdminSidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Topbar */}
        <SuperAdminTopbar />

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-auto">
          <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">
                  {t('superAdmin.pharmacyManagement')} 🏥
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  {pharmacies.length} {pharmacies.length === 1 ? t('pharmacies.pharmacy') : t('pharmacies.pharmacies')}
                </p>
              </div>

              {/* Filter Buttons */}
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setFilter('PENDING')}
                  className={`px-4 py-2 rounded-lg font-medium transition-all transform hover:scale-105 ${
                    filter === 'PENDING'
                      ? 'bg-yellow-600 text-white shadow-lg'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  {t('superAdmin.pending')}
                </button>
                <button
                  onClick={() => setFilter('APPROVED')}
                  className={`px-4 py-2 rounded-lg font-medium transition-all transform hover:scale-105 ${
                    filter === 'APPROVED'
                      ? 'bg-green-600 text-white shadow-lg'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  {t('superAdmin.approved')}
                </button>
                <button
                  onClick={() => setFilter('REJECTED')}
                  className={`px-4 py-2 rounded-lg font-medium transition-all transform hover:scale-105 ${
                    filter === 'REJECTED'
                      ? 'bg-red-600 text-white shadow-lg'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  {t('superAdmin.rejected')}
                </button>
                <button
                  onClick={() => setFilter('ALL')}
                  className={`px-4 py-2 rounded-lg font-medium transition-all transform hover:scale-105 ${
                    filter === 'ALL'
                      ? 'bg-purple-600 text-white shadow-lg'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  {t('superAdmin.all')}
                </button>
              </div>
            </div>

            {/* Pharmacy Cards */}
            {pharmacies.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-12 text-center">
                <p className="text-6xl mb-4">🏥</p>
                <p className="text-gray-500 dark:text-gray-400 text-lg">{t('superAdmin.noPharmacies')}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pharmacies.map((pharmacy: any) => (
                  <div
                    key={pharmacy.id}
                    className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all transform hover:scale-105 overflow-hidden"
                  >
                    {/* Card Header - FIXED: bg-gradient-to-r instead of bg-linear-to-r */}
                    <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-6 text-white">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <BuildingStorefrontIcon className="w-8 h-8" />
                          <div>
                            <h3 className="font-bold text-xl">{pharmacy.name}</h3>
                            <p className="text-sm opacity-90">{pharmacy.address}</p>
                          </div>
                        </div>
                      </div>
                      <span
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${
                          pharmacy.status === 'PENDING'
                            ? 'bg-yellow-400 text-yellow-900'
                            : pharmacy.status === 'APPROVED'
                            ? 'bg-green-400 text-green-900'
                            : 'bg-red-400 text-red-900'
                        }`}
                      >
                        {pharmacy.status === 'PENDING' && '⏳'}
                        {pharmacy.status === 'APPROVED' && <CheckCircleIcon className="w-4 h-4" />}
                        {pharmacy.status === 'REJECTED' && <XCircleIcon className="w-4 h-4" />}
                        {pharmacy.status}
                      </span>
                    </div>

                    {/* Card Body */}
                    <div className="p-6 space-y-4">
                      <div className="space-y-3 text-sm">
                        <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                          <PhoneIcon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                          <span>{pharmacy.phone}</span>
                        </div>
                        <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                          <EnvelopeIcon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                          <span className="truncate">{pharmacy.user.email}</span>
                        </div>
                        <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                          <MapPinIcon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                          <span>{pharmacy.address}</span>
                        </div>
                        {pharmacy.tinNumber && (
                          <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                            <DocumentTextIcon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                            <span>TIN: {pharmacy.tinNumber}</span>
                          </div>
                        )}
                      </div>

                      {pharmacy.pharmacyLicense && (
                        <a
                          href={pharmacy.pharmacyLicense}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block w-full text-center py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors font-medium text-sm"
                        >
                          📄 View License
                        </a>
                      )}

                      {/* Action Buttons */}
                      {pharmacy.status === 'PENDING' && (
                        <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                          <button
                            onClick={() => handleApprove(pharmacy.id, pharmacy.name)}
                            disabled={approving === pharmacy.id}
                            className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {approving === pharmacy.id ? (
                              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                              <>
                                <CheckCircleIcon className="w-5 h-5" />
                                {t('superAdmin.approve')}
                              </>
                            )}
                          </button>
                          <button
                            onClick={() => setRejectionModal({ show: true, pharmacyId: pharmacy.id })}
                            disabled={approving === pharmacy.id}
                            className="flex-1 bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 transition-colors font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <XCircleIcon className="w-5 h-5" />
                            {t('superAdmin.reject')}
                          </button>
                        </div>
                      )}

                      {pharmacy.status === 'REJECTED' && pharmacy.rejectionReason && (
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 mt-4">
                          <p className="text-xs font-semibold text-red-700 dark:text-red-400 mb-1">
                            Rejection Reason:
                          </p>
                          <p className="text-sm text-red-600 dark:text-red-300">{pharmacy.rejectionReason}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Rejection Modal */}
            {rejectionModal.show && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md p-6 shadow-2xl">
                  <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">
                    {t('superAdmin.reject')} Pharmacy
                  </h3>

                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Please provide a reason for rejecting this pharmacy application.
                  </p>

                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Enter rejection reason..."
                    className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg p-4 min-h-[120px] focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                  />

                  <div className="flex gap-3 mt-6">
                    <button
                      onClick={() => {
                        setRejectionModal({ show: false, pharmacyId: null });
                        setRejectionReason('');
                      }}
                      disabled={rejecting}
                      className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 py-3 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 font-semibold transition-colors disabled:opacity-50"
                    >
                      {t('common.cancel')}
                    </button>
                    <button
                      onClick={handleReject}
                      disabled={rejecting}
                      className="flex-1 bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {rejecting ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        t('superAdmin.reject')
                      )}
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

// Main component with Suspense boundary
export default function SuperAdminPharmaciesPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <LoadingSpinner />
      </div>
    }>
      <PharmaciesContent />
    </Suspense>
  );
}