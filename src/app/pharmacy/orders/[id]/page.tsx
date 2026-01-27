// frontend/src/app/pharmacy/orders/[id]/page.tsx

'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import api from '@/lib/api';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import PharmacyTopbar from '@/components/pharmacy/PharmacyTopbar';
import PharmacySidebar from '@/components/pharmacy/PharmacySidebar';
import toast from 'react-hot-toast';
import { ArrowLeftIcon, UserCircleIcon, MapPinIcon, PhoneIcon } from '@heroicons/react/24/outline';

export default function PharmacyOrderDetailPage() {
  const { t } = useTranslation();
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [prescriptionRejectionReason, setPrescriptionRejectionReason] = useState('');
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);

  useEffect(() => {
    fetchOrder();
  }, [params.id]);

  const fetchOrder = async () => {
    try {
      const res = await api.get(`/orders/${params.id}`);
      setOrder(res.data);
    } catch (error) {
      console.error('Failed to fetch order:', error);
      toast.error(t('pharmacy.orderLoadFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptOrder = async () => {
    setUpdating(true);
    try {
      await api.patch(`/orders/${params.id}/status`, { status: 'ACCEPTED' });
      toast.success(t('pharmacy.orderAccepted'));
      fetchOrder();
    } catch (error: any) {
      toast.error(error.response?.data?.message || t('pharmacy.operationFailed'));
    } finally {
      setUpdating(false);
    }
  };

  const handleRejectPrescription = async () => {
    if (!prescriptionRejectionReason.trim()) {
      toast.error(t('pharmacy.provideReason'));
      return;
    }

    setUpdating(true);
    try {
      await api.patch(`/orders/${params.id}/reject-prescription`, {
        reason: prescriptionRejectionReason,
      });
      toast.success(t('pharmacy.prescriptionRejected'));
      setShowPrescriptionModal(false);
      fetchOrder();
    } catch (error: any) {
      toast.error(error.response?.data?.message || t('pharmacy.operationFailed'));
    } finally {
      setUpdating(false);
    }
  };

  const handleUpdateStatus = async (newStatus: string) => {
    setUpdating(true);
    try {
      await api.patch(`/orders/${params.id}/status`, { status: newStatus });
      toast.success(t('pharmacy.statusUpdated'));
      fetchOrder();
    } catch (error: any) {
      toast.error(error.response?.data?.message || t('pharmacy.operationFailed'));
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
        <PharmacySidebar />
        <div className="flex-1 flex flex-col">
          <PharmacyTopbar />
          <main className="flex-1 p-6 flex items-center justify-center">
            <div className="text-center">
              <p className="text-gray-500 dark:text-gray-400">{t('orders.notFound')}</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  const getStatusColor = () => {
    switch (order.status) {
      case 'PENDING':
        return 'from-yellow-500 to-orange-500';
      case 'ACCEPTED':
      case 'PREPARING':
        return 'from-blue-500 to-cyan-500';
      case 'DELIVERED':
        return 'from-green-500 to-emerald-500';
      case 'CANCELLED':
        return 'from-red-500 to-pink-500';
      default:
        return 'from-purple-500 to-indigo-500';
    }
  };

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
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Back Button */}
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
            >
              <ArrowLeftIcon className="w-5 h-5" />
              {t('common.back')}
            </button>

            {/* Order Header */}
            <div className={`bg-linear-to-r ${getStatusColor()} rounded-2xl shadow-xl p-8 text-white`}>
              <div className="flex justify-between items-start flex-wrap gap-4">
                <div>
                  <h1 className="text-3xl font-bold mb-2">
                    {t('pharmacy.orderNumber')}: #{order.id.slice(0, 8)}
                  </h1>
                  <p className="opacity-90">
                    {new Date(order.createdAt).toLocaleString()}
                  </p>
                </div>

                <span className="bg-white/20 backdrop-blur-sm px-6 py-3 rounded-xl text-sm font-bold">
                  {order.status}
                </span>
              </div>
            </div>

            {/* Patient Info */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
              <h2 className="font-bold text-xl mb-4 text-gray-800 dark:text-gray-100 flex items-center gap-2">
                <UserCircleIcon className="w-6 h-6" />
                {t('pharmacy.patientInfo')}
              </h2>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                    <UserCircleIcon className="w-7 h-7 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-800 dark:text-gray-100">
                      {order.patient.firstName} {order.patient.lastName}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{order.patient.user.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                  <PhoneIcon className="w-5 h-5" />
                  <span>{order.patient.phone}</span>
                </div>
              </div>
            </div>

            {/* Medications */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
              <h2 className="font-bold text-xl mb-4 text-gray-800 dark:text-gray-100">
                {t('orders.medications')} 💊
              </h2>
              <div className="space-y-4">
                {order.medications.map((med: any) => (
                  <div
                    key={med.id}
                    className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-4 last:border-0"
                  >
                    <div className="flex-1">
                      <p className="font-bold text-gray-800 dark:text-gray-100">{med.medication.name}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {t('orders.quantity')}: {med.quantity}
                      </p>
                      {med.medication.requiresPrescription && (
                        <span className="inline-block mt-2 text-xs bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 px-3 py-1 rounded-full font-medium">
                          📋 {t('medications.prescriptionRequired')}
                        </span>
                      )}
                    </div>
                    <p className="font-bold text-xl bg-linear-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                      {(med.price * med.quantity).toLocaleString()} RWF
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Prescription Section */}
            {order.prescriptionUrl && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
                <h2 className="font-bold text-xl mb-4 text-gray-800 dark:text-gray-100">
                  {t('pharmacy.prescription')} 📋
                </h2>
                <div className="space-y-4">
                  <div className="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-700 rounded-xl p-4">
                    <p className="text-sm text-blue-700 dark:text-blue-400 mb-3">
                      {t('pharmacy.prescriptionUploaded')}
                    </p>
                    <a
                      href={order.prescriptionUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-purple-600 dark:text-purple-400 hover:underline font-medium"
                    >
                      {t('pharmacy.viewPrescription')} →
                    </a>
                  </div>

                  {order.status === 'PENDING' && (
                    <div className="flex gap-3">
                      <button
                        onClick={handleAcceptOrder}
                        disabled={updating}
                        className="flex-1 bg-linear-to-r from-green-600 to-emerald-600 text-white py-3 rounded-xl font-bold hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg disabled:opacity-50"
                      >
                        {updating ? t('pharmacy.approving') : t('pharmacy.approvePrescription')}
                      </button>
                      <button
                        onClick={() => setShowPrescriptionModal(true)}
                        disabled={updating}
                        className="flex-1 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 py-3 rounded-xl font-bold hover:bg-red-100 dark:hover:bg-red-900/30 transition-all"
                      >
                        {t('pharmacy.rejectPrescription')}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Delivery Info */}
            {order.deliveryMethod === 'DELIVERY' && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
                <h2 className="font-bold text-xl mb-4 text-gray-800 dark:text-gray-100 flex items-center gap-2">
                  <MapPinIcon className="w-6 h-6" />
                  {t('orders.deliveryInfo')} 🚚
                </h2>
                <div className="space-y-2 text-gray-700 dark:text-gray-300">
                  <p><strong>{t('orders.address')}:</strong> {order.deliveryAddress}</p>
                  <p><strong>{t('orders.zone')}:</strong> {order.deliveryZone}</p>
                  <p><strong>{t('orders.fee')}:</strong> {order.deliveryFee.toLocaleString()} RWF</p>
                </div>
              </div>
            )}

            {/* Payment Summary */}
            <div className="bg-linear-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-2xl shadow-lg p-6">
              <h2 className="font-bold text-xl mb-4 text-gray-800 dark:text-gray-100">
                {t('orders.paymentSummary')}
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between text-gray-700 dark:text-gray-300">
                  <span>{t('orders.subtotal')}</span>
                  <span className="font-semibold">{order.subtotal.toLocaleString()} RWF</span>
                </div>
                {order.deliveryFee > 0 && (
                  <div className="flex justify-between text-gray-700 dark:text-gray-300">
                    <span>{t('orders.deliveryFee')}</span>
                    <span className="font-semibold">{order.deliveryFee.toLocaleString()} RWF</span>
                  </div>
                )}
                <div className="border-t-2 border-gray-300 dark:border-gray-600 pt-3 flex justify-between font-bold text-2xl">
                  <span className="text-gray-800 dark:text-gray-100">{t('orders.total')}</span>
                  <span className="bg-linear-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                    {order.total.toLocaleString()} RWF
                  </span>
                </div>
              </div>
            </div>

            {/* Status Update Actions */}
            {order.status === 'PENDING' && !order.prescriptionUrl && (
              <button
                onClick={handleAcceptOrder}
                disabled={updating}
                className="w-full bg-linear-to-r from-green-600 to-emerald-600 text-white py-4 rounded-xl font-bold text-lg hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50"
              >
                {updating ? t('pharmacy.accepting') : t('pharmacy.acceptOrder')}
              </button>
            )}

            {order.status === 'ACCEPTED' && (
              <button
                onClick={() => handleUpdateStatus('PREPARING')}
                disabled={updating}
                className="w-full bg-linear-to-r from-blue-600 to-cyan-600 text-white py-4 rounded-xl font-bold text-lg hover:from-blue-700 hover:to-cyan-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50"
              >
                {updating ? t('pharmacy.updating') : t('pharmacy.markPreparing')}
              </button>
            )}

            {order.status === 'PREPARING' && (
              <div className="flex gap-3">
                {order.deliveryMethod === 'DELIVERY' ? (
                  <button
                    onClick={() => handleUpdateStatus('OUT_FOR_DELIVERY')}
                    disabled={updating}
                    className="flex-1 bg-linear-to-r from-purple-600 to-indigo-600 text-white py-4 rounded-xl font-bold text-lg hover:from-purple-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50"
                  >
                    {updating ? t('pharmacy.updating') : t('pharmacy.markOutForDelivery')}
                  </button>
                ) : (
                  <button
                    onClick={() => handleUpdateStatus('READY_FOR_PICKUP')}
                    disabled={updating}
                    className="flex-1 bg-linear-to-r from-purple-600 to-indigo-600 text-white py-4 rounded-xl font-bold text-lg hover:from-purple-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50"
                  >
                    {updating ? t('pharmacy.updating') : t('pharmacy.markReadyForPickup')}
                  </button>
                )}
              </div>
            )}

            {(order.status === 'OUT_FOR_DELIVERY' || order.status === 'READY_FOR_PICKUP') && (
              <button
                onClick={() => handleUpdateStatus('DELIVERED')}
                disabled={updating}
                className="w-full bg-linear-to-r from-green-600 to-emerald-600 text-white py-4 rounded-xl font-bold text-lg hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50"
              >
                {updating ? t('pharmacy.updating') : t('pharmacy.markDelivered')}
              </button>
            )}

            {/* Prescription Rejection Modal */}
            {showPrescriptionModal && (
              <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 max-w-md w-full">
                  <h2 className="text-2xl font-bold mb-4 text-red-600 dark:text-red-400">
                    {t('pharmacy.rejectPrescription')}
                  </h2>

                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    {t('pharmacy.rejectReason')}
                  </p>

                  <textarea
                    value={prescriptionRejectionReason}
                    onChange={(e) => setPrescriptionRejectionReason(e.target.value)}
                    placeholder={t('pharmacy.rejectPlaceholder')}
                    className="w-full border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-xl p-3 min-h-[120px] focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
                  />

                  <div className="flex gap-3 mt-6">
                    <button
                      onClick={() => {
                        setShowPrescriptionModal(false);
                        setPrescriptionRejectionReason('');
                      }}
                      className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 py-3 rounded-xl font-bold hover:bg-gray-300 dark:hover:bg-gray-600 transition-all"
                    >
                      {t('common.cancel')}
                    </button>
                    <button
                      onClick={handleRejectPrescription}
                      disabled={updating}
                      className="flex-1 bg-red-600 text-white py-3 rounded-xl font-bold hover:bg-red-700 transition-all shadow-lg disabled:opacity-50"
                    >
                      {updating ? t('pharmacy.rejecting') : t('superAdmin.reject')}
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