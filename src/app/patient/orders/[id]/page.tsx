// frontend/src/app/patient/orders/[id]/page.tsx

'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import api from '@/lib/api';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import toast from 'react-hot-toast';
import { ArrowLeftIcon, MapPinIcon, PhoneIcon } from '@heroicons/react/24/outline';

export default function OrderDetailsPage() {
  const { t } = useTranslation();
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

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

  const handleCancelOrder = async () => {
    if (!confirm(t('orders.confirmCancel'))) return;

    setCancelling(true);
    try {
      await api.patch(`/orders/${params.id}/cancel`);
      toast.success('Order cancelled successfully');
      fetchOrderDetails();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to cancel order');
    } finally {
      setCancelling(false);
    }
  };

  const canCancel = order && !['OUT_FOR_DELIVERY', 'READY_FOR_PICKUP', 'DELIVERED', 'CANCELLED'].includes(order.status);

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

  const statusSteps = ['PENDING', 'ACCEPTED', 'PREPARING', order.deliveryMethod === 'DELIVERY' ? 'OUT_FOR_DELIVERY' : 'READY_FOR_PICKUP', 'DELIVERED'];

  return (
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
      <div className="bg-linear-to-r from-blue-600 to-cyan-600 rounded-2xl shadow-xl p-8 text-white">
        <div className="flex justify-between items-start flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              {t('orders.orderNumber')}: #{order.id.slice(0, 8)}
            </h1>
            <p className="text-blue-100">
              {new Date(order.createdAt).toLocaleString()}
            </p>
          </div>

          <span
            className={`inline-block px-6 py-3 rounded-xl text-sm font-bold shadow-lg ${
              order.status === 'DELIVERED'
                ? 'bg-green-500 text-white'
                : order.status === 'CANCELLED'
                ? 'bg-red-500 text-white'
                : 'bg-yellow-500 text-white'
            }`}
          >
            {order.status}
          </span>
        </div>

        {/* Status Timeline */}
        <div className="mt-8">
          <div className="flex justify-between items-center">
            {statusSteps.map((status, index) => {
              const isComplete = statusSteps.indexOf(order.status) >= index;
              const isCurrent = order.status === status;

              return (
                <div key={status} className="flex flex-col items-center flex-1">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center font-bold transition-all ${
                      isComplete
                        ? 'bg-white text-blue-600 shadow-lg'
                        : 'bg-white/30 text-white/70'
                    } ${isCurrent ? 'ring-4 ring-white/50 scale-110' : ''}`}
                  >
                    {isComplete ? '✓' : index + 1}
                  </div>
                  <p className="text-xs mt-2 text-center text-white/90 font-medium">{status}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Pharmacy Info */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
        <h2 className="font-bold text-xl mb-4 text-gray-800 dark:text-gray-100">
          {t('orders.pharmacyInfo')}
        </h2>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
              🏥
            </div>
            <p className="font-semibold text-gray-800 dark:text-gray-100">{order.pharmacy.name}</p>
          </div>
          <div className="flex items-start gap-3 text-gray-600 dark:text-gray-400">
            <MapPinIcon className="w-5 h-5 mt-0.5 shrink-0" />
            <span>{order.pharmacy.address}</span>
          </div>
          <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
            <PhoneIcon className="w-5 h-5 shrink-0" />
            <span>{order.pharmacy.phone}</span>
          </div>
        </div>
      </div>

      {/* Medications */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
        <h2 className="font-bold text-xl mb-4 text-gray-800 dark:text-gray-100">
          {t('orders.medications')}
        </h2>
        <div className="space-y-4">
          {order.medications.map((med: any) => (
            <div key={med.id} className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-4 last:border-0">
              <div className="flex-1">
                <p className="font-semibold text-gray-800 dark:text-gray-100">{med.medication.name}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t('orders.quantity')}: {med.quantity}
                </p>
              </div>
              <p className="font-bold text-lg bg-linear-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                {(med.price * med.quantity).toLocaleString()} RWF
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Delivery Info */}
      {order.deliveryMethod === 'DELIVERY' && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
          <h2 className="font-bold text-xl mb-4 text-gray-800 dark:text-gray-100">
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
      <div className="bg-linear-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-2xl shadow-lg p-6">
        <h2 className="font-bold text-xl mb-4 text-gray-800 dark:text-gray-100">
          {t('orders.paymentSummary')}
        </h2>
        <div className="space-y-3">
          <div className="flex justify-between text-gray-700 dark:text-gray-300">
            <span>{t('orders.subtotal')}</span>
            <span>{order.subtotal.toLocaleString()} RWF</span>
          </div>
          {order.deliveryFee > 0 && (
            <div className="flex justify-between text-gray-700 dark:text-gray-300">
              <span>{t('orders.deliveryFee')}</span>
              <span>{order.deliveryFee.toLocaleString()} RWF</span>
            </div>
          )}
          {order.insuranceCoverage && (
            <div className="flex justify-between text-green-600 dark:text-green-400">
              <span>{t('orders.insuranceCoverage')}</span>
              <span>-{order.insuranceCoverage.toLocaleString()} RWF</span>
            </div>
          )}
          <div className="border-t-2 border-gray-300 dark:border-gray-600 pt-3 flex justify-between font-bold text-xl">
            <span className="text-gray-800 dark:text-gray-100">{t('orders.total')}</span>
            <span className="bg-linear-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              {order.total.toLocaleString()} RWF
            </span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 pt-2">
            {t('orders.paymentMethod')}: {order.paymentMethod}
          </p>
        </div>
      </div>

      {/* Actions */}
      {canCancel && (
        <button
          onClick={handleCancelOrder}
          disabled={cancelling}
          className="w-full bg-red-500 hover:bg-red-600 text-white py-4 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {cancelling ? t('orders.cancelling') : t('orders.cancelOrder')}
        </button>
      )}
    </div>
  );
}