// frontend/src/app/patient/orders/page.tsx

'use client';

import { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import api from '@/lib/api';
import Link from 'next/link';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import {
  ClipboardDocumentListIcon,
  XMarkIcon,
  MapPinIcon,
  PhoneIcon,
  CheckCircleIcon,
  ChevronDownIcon,
  MagnifyingGlassIcon,
  CubeIcon,
  BanknotesIcon,
  TruckIcon,
  BuildingStorefrontIcon,
  FunnelIcon,
} from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleSolid } from '@heroicons/react/24/solid';

type OrderStatus =
  | 'PENDING'
  | 'ACCEPTED'
  | 'PREPARING'
  | 'OUT_FOR_DELIVERY'
  | 'READY_FOR_PICKUP'
  | 'DELIVERED'
  | 'CANCELLED';

type FilterType = 'all' | 'pending' | 'completed';

const COMPLETED_STATUSES: OrderStatus[] = ['DELIVERED', 'CANCELLED'];
const PENDING_STATUSES: OrderStatus[] = [
  'PENDING',
  'ACCEPTED',
  'PREPARING',
  'OUT_FOR_DELIVERY',
  'READY_FOR_PICKUP',
];

function getStatusMeta(status: OrderStatus, t: (key: string) => string) {
  switch (status) {
    case 'PENDING':
      return { label: t('orders2.statusPending'), color: '#F59E0B', bg: '#FEF3C7', textColor: '#92400E', dot: '#F59E0B' };
    case 'ACCEPTED':
      return { label: t('orders2.statusAccepted'), color: '#3B82F6', bg: '#DBEAFE', textColor: '#1E40AF', dot: '#3B82F6' };
    case 'PREPARING':
      return { label: t('orders2.statusPreparing'), color: '#8B5CF6', bg: '#EDE9FE', textColor: '#5B21B6', dot: '#8B5CF6' };
    case 'OUT_FOR_DELIVERY':
      return { label: t('orders2.statusOutForDelivery'), color: '#06B6D4', bg: '#CFFAFE', textColor: '#155E75', dot: '#06B6D4' };
    case 'READY_FOR_PICKUP':
      return { label: t('orders2.statusReadyForPickup'), color: '#10B981', bg: '#D1FAE5', textColor: '#065F46', dot: '#10B981' };
    case 'DELIVERED':
      return { label: t('orders2.statusDelivered'), color: '#10B981', bg: '#D1FAE5', textColor: '#065F46', dot: '#10B981' };
    case 'CANCELLED':
      return { label: t('orders2.statusCancelled'), color: '#EF4444', bg: '#FEE2E2', textColor: '#991B1B', dot: '#EF4444' };
    default:
      return { label: status, color: '#6B7280', bg: '#F3F4F6', textColor: '#374151', dot: '#6B7280' };
  }
}

/* ─── Order Detail Dialog ─── */
function OrderDetailDialog({ order, onClose }: { order: any; onClose: () => void }) {
  const { t } = useTranslation();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  const statusMeta = getStatusMeta(order.status as OrderStatus, t);
  const orderDate = new Date(order.createdAt);

  const statusSteps: OrderStatus[] =
    order.type === 'DELIVERY'
      ? ['PENDING', 'ACCEPTED', 'PREPARING', 'OUT_FOR_DELIVERY', 'DELIVERED']
      : ['PENDING', 'ACCEPTED', 'PREPARING', 'READY_FOR_PICKUP', 'DELIVERED'];

  const currentStepIndex = statusSteps.indexOf(order.status as OrderStatus);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      aria-modal="true"
      role="dialog"
    >
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative bg-white dark:bg-gray-900 w-full sm:max-w-2xl sm:rounded-3xl rounded-t-3xl shadow-2xl flex flex-col max-h-[92vh] sm:max-h-[88vh] overflow-hidden">

        {/* Header */}
        <div className="relative bg-linear-to-r from-[#1E4D8C] to-[#2D9B8A] p-6 text-white shrink-0">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
            aria-label="Close dialog"
          >
            <XMarkIcon className="w-5 h-5 text-white" />
          </button>

          <div className="pr-10">
            <p className="text-xs font-semibold text-blue-200 uppercase tracking-widest mb-1">{t('orders.orderDetails')}</p>
            <h2 className="text-2xl font-bold mb-1">
              #{order.orderNumber || order.id?.slice(0, 8)}
            </h2>
            <p className="text-sm text-blue-100">
              {orderDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>

          <div className="mt-4 flex items-center gap-3">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold bg-white/20 text-white">
              <span className="w-2 h-2 rounded-full bg-white inline-block" />
              {statusMeta.label}
            </span>
            {order.type && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-white/20 text-white">
                {order.type === 'DELIVERY' ? <TruckIcon className="w-3.5 h-3.5" /> : <BuildingStorefrontIcon className="w-3.5 h-3.5" />}
                {order.type === 'DELIVERY' ? t('orders2.typeDelivery') : t('orders2.typePickup')}
              </span>
            )}
          </div>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1 divide-y divide-gray-100 dark:divide-gray-800">

          {/* Progress tracker */}
          {order.status !== 'CANCELLED' && (
            <div className="px-6 py-5">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">{t('orders.orderProgress')}</h3>
              <div className="relative">
                <div className="absolute top-4 left-4 right-4 h-0.5 bg-gray-200 dark:bg-gray-700" />
                <div
                  className="absolute top-4 left-4 h-0.5 bg-linear-to-r from-[#1E4D8C] to-[#2D9B8A] transition-all duration-700"
                  style={{ width: currentStepIndex >= 0 ? `${(currentStepIndex / (statusSteps.length - 1)) * (100 - 8)}%` : '0%' }}
                />
                <div className="relative flex justify-between">
                  {statusSteps.map((step, i) => {
                    const meta = getStatusMeta(step, t);
                    const done = i <= currentStepIndex;
                    const current = i === currentStepIndex;
                    return (
                      <div key={step} className="flex flex-col items-center flex-1">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${
                            done
                              ? 'bg-linear-to-br from-[#1E4D8C] to-[#2D9B8A] border-transparent'
                              : 'bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600'
                          } ${current ? 'ring-4 ring-[#2D9B8A]/30 scale-110' : ''}`}
                        >
                          {done ? (
                            <CheckCircleSolid className="w-4 h-4 text-white" />
                          ) : (
                            <span className="text-xs text-gray-400 font-bold">{i + 1}</span>
                          )}
                        </div>
                        <p
                          className={`text-center mt-2 leading-tight ${done ? 'text-[#1E4D8C] dark:text-blue-400 font-semibold' : 'text-gray-400'}`}
                          style={{ fontSize: '9px', maxWidth: '56px' }}
                        >
                          {meta.label}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {order.status === 'CANCELLED' && order.cancellationReason && (
            <div className="px-6 py-4">
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-4">
                <p className="text-xs font-bold text-red-600 dark:text-red-400 uppercase tracking-wide mb-1">{t('orders.cancellationReason')}</p>
                <p className="text-sm text-red-700 dark:text-red-300">{order.cancellationReason}</p>
              </div>
            </div>
          )}

          {/* Pharmacy */}
          <div className="px-6 py-5">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">{t('form.pharmacy')}</h3>
            <div className="flex items-start gap-4">
              <div className="w-11 h-11 bg-linear-to-br from-[#1E4D8C] to-[#2D9B8A] rounded-2xl flex items-center justify-center shrink-0">
                <BuildingStorefrontIcon className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-gray-900 dark:text-white text-base">{order.pharmacy?.name}</p>
                {order.pharmacy?.address && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 flex items-start gap-1.5 mt-1">
                    <MapPinIcon className="w-4 h-4 shrink-0 mt-0.5 text-[#2D9B8A]" />
                    {order.pharmacy.address}
                  </p>
                )}
                {order.pharmacy?.phone && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1.5 mt-1">
                    <PhoneIcon className="w-4 h-4 text-[#2D9B8A]" />
                    {order.pharmacy.phone}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Medications */}
          <div className="px-6 py-5">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
              {t('orders.medications')} ({order.orderItems?.length || 0} {t('orders2.items').toLowerCase()})
            </h3>
            <div className="space-y-3">
              {order.orderItems?.map((item: any) => (
                <div key={item.id} className="flex items-center gap-3 bg-gray-50 dark:bg-gray-800 rounded-2xl p-3.5">
                  <div className="w-10 h-10 bg-linear-to-br from-blue-100 to-teal-100 dark:from-blue-900/40 dark:to-teal-900/40 rounded-xl flex items-center justify-center shrink-0">
                    <CubeIcon className="w-5 h-5 text-[#1E4D8C] dark:text-blue-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 dark:text-white text-sm">{item.medication?.name}</p>
                    {item.medication?.dosage && (
                      <p className="text-xs text-gray-500 dark:text-gray-400">{item.medication.dosage}</p>
                    )}
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      {t('orders.qty')}: {item.quantity} × {item.price?.toLocaleString()} RWF
                    </p>
                  </div>
                  <p className="font-bold text-[#1E4D8C] dark:text-blue-400 text-sm shrink-0">
                    {(item.price * item.quantity)?.toLocaleString()} RWF
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Delivery Info */}
          {order.type === 'DELIVERY' && (order.deliveryAddress || order.deliveryZone) && (
            <div className="px-6 py-5">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">{t('orders.deliveryDetails')}</h3>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-4 space-y-2">
                {order.deliveryAddress && (
                  <div className="flex items-start gap-2">
                    <MapPinIcon className="w-4 h-4 text-[#2D9B8A] shrink-0 mt-0.5" />
                    <p className="text-sm text-gray-700 dark:text-gray-300">{order.deliveryAddress}</p>
                  </div>
                )}
                {order.deliveryZone && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 pl-6">{t('orders.zone')}: {order.deliveryZone}</p>
                )}
                <p className="text-sm text-gray-600 dark:text-gray-400 pl-6">
                  {t('orders.deliveryFee')}: <span className="font-semibold">{order.deliveryFee?.toLocaleString() || 0} RWF</span>
                </p>
              </div>
            </div>
          )}

          {/* Payment Summary */}
          <div className="px-6 py-5">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">{t('orders.paymentSummary')}</h3>
            <div className="bg-linear-to-br from-blue-50 to-teal-50 dark:from-blue-900/20 dark:to-teal-900/20 rounded-2xl p-4 space-y-2.5">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600 dark:text-gray-400">{t('orders.subtotal')}</span>
                <span className="font-medium text-gray-900 dark:text-white">{order.subtotal?.toLocaleString()} RWF</span>
              </div>
              {(order.deliveryFee ?? 0) > 0 && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600 dark:text-gray-400">{t('orders.deliveryFee')}</span>
                  <span className="font-medium text-gray-900 dark:text-white">{order.deliveryFee?.toLocaleString()} RWF</span>
                </div>
              )}
              {(order.insuranceCoverage ?? 0) > 0 && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-green-600 dark:text-green-400">{t('orders.insuranceCoverage')}</span>
                  <span className="font-medium text-green-600 dark:text-green-400">-{order.insuranceCoverage?.toLocaleString()} RWF</span>
                </div>
              )}
              <div className="border-t border-blue-200/60 dark:border-blue-800/50 pt-2.5 flex justify-between items-center">
                <span className="font-bold text-gray-900 dark:text-white">{t('common.total')}</span>
                <span className="text-xl font-extrabold bg-linear-to-r from-[#1E4D8C] to-[#2D9B8A] bg-clip-text text-transparent">
                  {order.total?.toLocaleString()} RWF
                </span>
              </div>
              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-2">
                  <BanknotesIcon className="w-4 h-4 text-gray-400" />
                  <span className="text-xs text-gray-500 dark:text-gray-400">{order.paymentMethod}</span>
                </div>
                <span
                  className="text-xs font-bold px-2.5 py-1 rounded-full"
                  style={
                    order.paymentStatus === 'COMPLETED' || order.paymentStatus === 'PAID'
                      ? { backgroundColor: '#D1FAE5', color: '#065F46' }
                      : { backgroundColor: '#FEF3C7', color: '#92400E' }
                  }
                >
                  {order.paymentStatus}
                </span>
              </div>
            </div>
          </div>

          {/* Prescription */}
          {order.prescription && (
            <div className="px-6 py-5">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">{t('prescriptions.prescriptionsTitle')}</h3>
              <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 rounded-2xl p-4">
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {t('common.status')}:{' '}
                  <span
                    className="font-semibold"
                    style={{ color: order.prescription.status === 'APPROVED' ? '#10B981' : '#F59E0B' }}
                  >
                    {order.prescription.status}
                  </span>
                </span>
                {order.prescription.fileUrl && (
                  <a
                    href={order.prescription.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-semibold text-[#1E4D8C] dark:text-blue-400 hover:underline"
                  >
                    {t('common.view')} →
                  </a>
                )}
              </div>
            </div>
          )}

          <div className="h-4" />
        </div>

        {/* Footer */}
        <div className="shrink-0 p-4 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3.5 rounded-2xl font-bold text-sm text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            {t('common.close')}
          </button>
          <Link
            href={`/patient/orders/${order.id}`}
            className="flex-1 py-3.5 rounded-2xl font-bold text-sm text-white bg-linear-to-r from-[#1E4D8C] to-[#2D9B8A] hover:opacity-90 transition-opacity text-center flex items-center justify-center"
          >
            {t('orders2.manageOrder', 'Manage Order')}
          </Link>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Page ─── */
export default function OrdersPage() {
  const { t } = useTranslation();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>('all');
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilter, setShowFilter] = useState(false);

  const fetchOrders = useCallback(async () => {
    try {
      const res = await api.get('/orders/my-orders');
      setOrders(res.data ?? []);
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const allCount = orders.length;
  const pendingCount = orders.filter((o) => PENDING_STATUSES.includes(o.status)).length;
  const completedCount = orders.filter((o) => COMPLETED_STATUSES.includes(o.status)).length;

  const filteredOrders = orders.filter((order) => {
    const matchesFilter =
      filter === 'pending' ? PENDING_STATUSES.includes(order.status) :
      filter === 'completed' ? COMPLETED_STATUSES.includes(order.status) :
      true;
    const matchesSearch = !searchQuery.trim() ||
      order.orderItems?.some((item: any) =>
        item.medication?.name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    return matchesFilter && matchesSearch;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <>
      <div className="space-y-5 pb-8">

        {/* Page Header */}
        <div className="bg-[#EBF5FF] rounded-2xl p-8">
          <h1 className="text-2xl font-bold text-[#1E3A5F] mb-1">{t('orders2.myOrders')}</h1>
          <p className="text-sm" style={{ color: '#3B82F6' }}>{t('orders2.trackManage')}</p>
        </div>

        {/* Filter + Search bar */}
        <div className="flex items-center gap-3">
          {/* Filter dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowFilter(!showFilter)}
              className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 shadow-sm transition-colors"
            >
              <FunnelIcon className="w-4 h-4 text-gray-500" />
              {t('orders2.filterBy')}
              <ChevronDownIcon className="w-4 h-4 text-gray-400" />
            </button>
            {showFilter && (
              <div className="absolute top-full left-0 mt-1 w-44 bg-white rounded-xl shadow-lg border border-gray-100 z-20">
                {(['all', 'pending', 'completed'] as FilterType[]).map((f) => (
                  <button
                    key={f}
                    onClick={() => { setFilter(f); setShowFilter(false); }}
                    className={`w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 first:rounded-t-xl last:rounded-b-xl transition-colors ${filter === f ? 'text-[#1E4D8C] font-semibold bg-blue-50' : 'text-gray-700'}`}
                  >
                    {f === 'all' ? `${t('orders2.orderAll')} (${allCount})` : f === 'pending' ? `${t('orders2.orderActive')} (${pendingCount})` : `${t('orders2.orderCompleted')} (${completedCount})`}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Search */}
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder={t('orders2.searchByMedication')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#2D9B8A] bg-white shadow-sm transition-colors"
            />
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left px-5 py-3.5 text-sm font-medium text-gray-600">{t('orders2.orderId')}</th>
                  <th className="text-left px-5 py-3.5 text-sm font-medium text-gray-600">{t('common.date')}</th>
                  <th className="text-left px-5 py-3.5 text-sm font-medium text-gray-600">{t('orders2.time')}</th>
                  <th className="text-left px-5 py-3.5 text-sm font-medium text-gray-600">{t('orders.medications')}</th>
                  <th className="text-left px-5 py-3.5 text-sm font-medium text-gray-600">{t('orders2.quantity')}</th>
                  <th className="text-left px-5 py-3.5 text-sm font-medium text-gray-600">{t('orders2.amountRwf')}</th>
                  <th className="text-left px-5 py-3.5 text-sm font-medium text-gray-600">{t('common.status')}</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order: any, idx: number) => {
                  const meta = getStatusMeta(order.status as OrderStatus, t);
                  const date = new Date(order.createdAt);
                  const firstItem = order.orderItems?.[0];
                  const totalQty = order.orderItems?.reduce((s: number, i: any) => s + (i.quantity || 0), 0);
                  return (
                    <tr
                      key={order.id}
                      onClick={() => setSelectedOrder(order)}
                      className="border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <td className="px-5 py-4 text-sm font-medium text-gray-900">
                        #{order.orderNumber || idx + 1}
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-600">
                        {date.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })}
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-600">
                        {date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                      </td>
                      <td className="px-5 py-4">
                        <p className="text-sm font-medium text-gray-900">{firstItem?.medication?.name || order.pharmacy?.name || '—'}</p>
                        {firstItem?.medication?.dosage && (
                          <p className="text-xs text-gray-400">{firstItem.medication.dosage}</p>
                        )}
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-600">{totalQty ?? '—'}</td>
                      <td className="px-5 py-4 text-sm font-medium text-gray-900">{order.total?.toLocaleString()}</td>
                      <td className="px-5 py-4">
                        <span
                          className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full"
                          style={{ backgroundColor: meta.bg, color: meta.textColor }}
                        >
                          <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: meta.dot }} />
                          {meta.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredOrders.length === 0 && (
            <div className="text-center py-16">
              <div className="flex flex-col items-center gap-2">
                <svg className="w-12 h-12 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M4 6h16M4 10h16M4 14h10M4 18h6M15 15l2 2 4-4" />
                </svg>
                <p className="text-gray-400 text-sm font-medium">{t('orders2.searchForMedication')}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {selectedOrder && (
        <OrderDetailDialog order={selectedOrder} onClose={() => setSelectedOrder(null)} />
      )}
    </>
  );
}
