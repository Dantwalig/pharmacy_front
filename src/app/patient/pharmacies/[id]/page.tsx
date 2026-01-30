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
import { ArrowLeftIcon, PhoneIcon, MapPinIcon } from '@heroicons/react/24/outline';

export default function PharmacyOrderDetailsPage() {
  const { t } = useTranslation();
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchOrderDetails();
  }, [params.id]);

  const fetchOrderDetails = async () => {
    try {
      const res = await api.get(`/orders/${params.id}`);
      setOrder(res.data);
    } catch (error) {
      console.error('Failed to fetch order:', error);
      toast.error('Failed to load order');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (newStatus: string) => {
    if (!confirm(`Are you sure you want to update status to ${newStatus}?`)) return;

    setUpdating(true);
    try {
      await api.patch(`/orders/${params.id}/status`, {
        status: newStatus,
      });
      toast.success('Order status updated successfully');
      fetchOrderDetails();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  const getNextStatus = (currentStatus: string) => {
    const statusFlow: Record<string, string | null> = {
      PENDING: 'ACCEPTED',
      ACCEPTED: 'PREPARING',
      PREPARING: order?.type === 'DELIVERY' ? 'OUT_FOR_DELIVERY' : 'READY_FOR_PICKUP',
      OUT_FOR_DELIVERY: 'DELIVERED',
      READY_FOR_PICKUP: 'COMPLETED',
      DELIVERED: 'COMPLETED',
    };
    return statusFlow[currentStatus];
  };

  const canReject = order && order.status === 'PENDING';

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">{t('orders.notFound')}</p>
      </div>
    );
  }

  const nextStatus = getNextStatus(order.status);

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
          <div className="max-w-5xl mx-auto space-y-6">
            {/* Back Button */}
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
            >
              <ArrowLeftIcon className="w-5 h-5" />
              {t('common.back')}
            </button>

            {/* Order Header */}
            <div className="bg-linear-to-r from-purple-600 to-indigo-600 rounded-2xl shadow-xl p-8 text-white">
              <div className="flex justify-between items-start flex-wrap gap-4">
                <div>
                  <h1 className="text-3xl font-bold mb-2">
                    Order #{order.orderNumber || order.id.slice(0, 8)}
                  </h1>
                  <p className="text-purple-100">
                    {new Date(order.createdAt).toLocaleString()}
                  </p>
                </div>

                <span
                  className={`inline-block px-6 py-3 rounded-xl text-sm font-bold shadow-lg ${
                    order.status === 'DELIVERED' || order.status === 'COMPLETED'
                      ? 'bg-green-500 text-white'
                      : order.status === 'CANCELLED'
                      ? 'bg-red-500 text-white'
                      : 'bg-yellow-500 text-white'
                  }`}
                >
                  {order.status}
                </span>
              </div>

              {/* Cancellation Reason */}
              {order.status === 'CANCELLED' && order.cancellationReason && (
                <div className="mt-6 bg-red-500/20 backdrop-blur-sm rounded-xl p-4 border border-red-300/30">
                  <p className="text-sm font-semibold mb-1">Cancellation Reason:</p>
                  <p className="text-sm text-white/90">{order.cancellationReason}</p>
                </div>
              )}
            </div>

            {/* Patient Info */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
              <h2 className="font-bold text-xl mb-4 text-gray-800 dark:text-gray-100">
                👤 Patient Information
              </h2>
              <div className="space-y-3">
                <p className="text-gray-700 dark:text-gray-300">
                  <strong>Name:</strong> {order.patient.firstName} {order.patient.lastName}
                </p>
                <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                  <PhoneIcon className="w-5 h-5" />
                  <span>{order.patient.phone}</span>
                </div>
              </div>
            </div>

            {/* Delivery Info */}
            {order.type === 'DELIVERY' && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
                <h2 className="font-bold text-xl mb-4 text-gray-800 dark:text-gray-100">
                  🚚 Delivery Information
                </h2>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 text-gray-700 dark:text-gray-300">
                    <MapPinIcon className="w-5 h-5 mt-0.5 shrink-0" />
                    <span>{order.deliveryAddress}</span>
                  </div>
                  {order.deliveryZone && (
                    <p className="text-gray-700 dark:text-gray-300">
                      <strong>Zone:</strong> {order.deliveryZone}
                    </p>
                  )}
                  <p className="text-gray-700 dark:text-gray-300">
                    <strong>Delivery Fee:</strong> {order.deliveryFee?.toLocaleString() || 0} RWF
                  </p>
                </div>
              </div>
            )}

            {/* Medications */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
              <h2 className="font-bold text-xl mb-4 text-gray-800 dark:text-gray-100">
                💊 Medications
              </h2>
              <div className="space-y-4">
                {order.orderItems?.map((item: any) => (
                  <div
                    key={item.id}
                    className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-4 last:border-0"
                  >
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800 dark:text-gray-100">
                        {item.medication.name}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Quantity: {item.quantity} × {item.price.toLocaleString()} RWF
                      </p>
                    </div>
                    <p className="font-bold text-lg bg-linear-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                      {(item.price * item.quantity).toLocaleString()} RWF
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Prescription */}
            {order.prescription && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
                <h2 className="font-bold text-xl mb-4 text-gray-800 dark:text-gray-100">
                  📋 Prescription
                </h2>
                <div className="space-y-3">
                  <p className="text-gray-700 dark:text-gray-300">
                    <strong>Status:</strong>{' '}
                    <span
                      className={`font-semibold ${
                        order.prescription.status === 'APPROVED'
                          ? 'text-green-600'
                          : 'text-yellow-600'
                      }`}
                    >
                      {order.prescription.status}
                    </span>
                  </p>
                  {order.prescription.fileUrl && (
                    <a
                      href={order.prescription.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block text-blue-600 hover:text-blue-700 underline"
                    >
                      View Prescription Document
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Payment Summary */}
            <div className="bg-linear-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-2xl shadow-lg p-6">
              <h2 className="font-bold text-xl mb-4 text-gray-800 dark:text-gray-100">
                💰 Payment Summary
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between text-gray-700 dark:text-gray-300">
                  <span>Subtotal</span>
                  <span>{order.subtotal.toLocaleString()} RWF</span>
                </div>
                {order.deliveryFee > 0 && (
                  <div className="flex justify-between text-gray-700 dark:text-gray-300">
                    <span>Delivery Fee</span>
                    <span>{order.deliveryFee.toLocaleString()} RWF</span>
                  </div>
                )}
                {order.insuranceCoverage > 0 && (
                  <div className="flex justify-between text-green-600 dark:text-green-400">
                    <span>Insurance Coverage</span>
                    <span>-{order.insuranceCoverage.toLocaleString()} RWF</span>
                  </div>
                )}
                <div className="border-t-2 border-gray-300 dark:border-gray-600 pt-3 flex justify-between font-bold text-xl">
                  <span className="text-gray-800 dark:text-gray-100">Total</span>
                  <span className="bg-linear-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                    {order.total.toLocaleString()} RWF
                  </span>
                </div>
                <div className="pt-2 space-y-1 text-sm">
                  <p className="text-gray-600 dark:text-gray-400">
                    Payment Method: <span className="font-semibold">{order.paymentMethod}</span>
                  </p>
                  <p className="text-gray-600 dark:text-gray-400">
                    Payment Status:{' '}
                    <span
                      className={`font-semibold ${
                        order.paymentStatus === 'PAID' ? 'text-green-600' : 'text-yellow-600'
                      }`}
                    >
                      {order.paymentStatus}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            {order.status !== 'CANCELLED' && order.status !== 'COMPLETED' && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 space-y-4">
                <h3 className="font-bold text-lg text-gray-800 dark:text-gray-100">
                  Update Order Status
                </h3>
                <div className="flex flex-wrap gap-4">
                  {nextStatus && (
                    <button
                      onClick={() => handleUpdateStatus(nextStatus)}
                      disabled={updating}
                      className="flex-1 bg-linear-to-r from-purple-600 to-indigo-600 text-white py-4 rounded-xl font-bold hover:from-purple-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {updating ? 'Updating...' : `Mark as ${nextStatus}`}
                    </button>
                  )}
                  {canReject && (
                    <button
                      onClick={() => handleUpdateStatus('CANCELLED')}
                      disabled={updating}
                      className="flex-1 bg-red-500 hover:bg-red-600 text-white py-4 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {updating ? 'Rejecting...' : 'Reject Order'}
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}