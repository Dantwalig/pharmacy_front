// frontend/src/app/pharmacy/orders/page.tsx

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

export default function PharmacyOrdersPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'PENDING' | 'ACCEPTED' | 'ALL'>('PENDING');
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();
  }, [filter]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const url = filter === 'ALL' 
        ? '/orders/pharmacy-orders' 
        : `/orders/pharmacy-orders?status=${filter}`;
      const res = await api.get(url);
      setOrders(res.data);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickApprove = async (orderId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setUpdatingOrderId(orderId);
    
    try {
      await api.patch(`/orders/${orderId}/status`, { status: 'ACCEPTED' });
      toast.success('Order accepted successfully');
      fetchOrders();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to accept order');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const handleQuickReject = async (orderId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    const reason = prompt('Please enter rejection reason:');
    if (!reason) return;

    setUpdatingOrderId(orderId);
    
    try {
      await api.patch(`/orders/${orderId}/status`, { 
        status: 'CANCELLED',
        cancellationReason: reason 
      });
      toast.success('Order rejected');
      fetchOrders();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to reject order');
    } finally {
      setUpdatingOrderId(null);
    }
  };

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
                Orders Management
              </h1>
              <p className="text-blue-100 text-sm lg:text-base">
                Manage and process all orders
              </p>
            </div>

            {/* Filter Tabs */}
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setFilter('PENDING')}
                className={`px-6 py-3 rounded-lg font-medium transition-all ${
                  filter === 'PENDING'
                    ? 'bg-teal-500 text-white shadow-md'
                    : 'bg-white text-gray-700 hover:shadow-md'
                }`}
              >
                Pending
              </button>
              <button
                onClick={() => setFilter('ACCEPTED')}
                className={`px-6 py-3 rounded-lg font-medium transition-all ${
                  filter === 'ACCEPTED'
                    ? 'bg-teal-500 text-white shadow-md'
                    : 'bg-white text-gray-700 hover:shadow-md'
                }`}
              >
                Accepted
              </button>
              <button
                onClick={() => setFilter('ALL')}
                className={`px-6 py-3 rounded-lg font-medium transition-all ${
                  filter === 'ALL'
                    ? 'bg-teal-500 text-white shadow-md'
                    : 'bg-white text-gray-700 hover:shadow-md'
                }`}
              >
                All
              </button>
            </div>

            {orders.length === 0 ? (
              <div className="bg-white rounded-xl shadow-md p-12 text-center">
                <p className="text-gray-500 text-lg">No orders found</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {orders.map((order: any) => (
                  <div
                    key={order.id}
                    className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all overflow-hidden"
                  >
                    {/* Card Header */}
                    <div 
                      onClick={() => router.push(`/pharmacy/orders/${order.id}`)}
                      className="p-6 bg-[#2D5F8D] text-white cursor-pointer hover:opacity-90 transition-opacity"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="text-sm opacity-90 mb-1">Order</p>
                          <p className="text-xl font-bold">
                            #{order.id.slice(0, 8)}
                          </p>
                        </div>
                        <span className="bg-teal-500 px-3 py-1 rounded-full text-xs font-bold uppercase">
                          {order.status || 'PENDING'}
                        </span>
                      </div>
                      <p className="text-sm opacity-90">
                        {order.patient?.firstName || 'Unknown'} {order.patient?.lastName || 'Patient'}
                      </p>
                    </div>

                    {/* Card Body */}
                    <div className="p-6 space-y-4 bg-white">
                      <div className="space-y-2 text-sm text-gray-700">
                        <div className="flex items-center gap-2">
                          <span>📦</span>
                          <span>{order.orderItems?.length || 0} item(s)</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span>{order.type === 'DELIVERY' ? '🚚' : '🏪'}</span>
                          <span>{order.type === 'DELIVERY' ? 'Delivery' : 'Pickup'}</span>
                        </div>
                        <p className="text-xs text-gray-500 pt-2">
                          {new Date(order.createdAt).toLocaleString()}
                        </p>
                      </div>

                      <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                        <div>
                          <p className="text-sm text-gray-600">Total</p>
                          <p className="text-2xl font-bold text-teal-600">
                            {order.total?.toLocaleString() || 0} RWF
                          </p>
                        </div>

                        <button 
                          onClick={() => router.push(`/pharmacy/orders/${order.id}`)}
                          className="bg-white border-2 border-teal-600 text-teal-600 px-4 py-2 rounded-lg font-medium hover:bg-teal-50 transition-all text-sm"
                        >
                          View Details →
                        </button>
                      </div>

                      {/* Quick Action Buttons - Only show for PENDING orders */}
                      {order.status === 'PENDING' && (
                        <div className="flex gap-2 pt-2">
                          <button
                            onClick={(e) => handleQuickApprove(order.id, e)}
                            disabled={updatingOrderId === order.id}
                            className="flex-1 bg-teal-500 hover:bg-teal-600 text-white py-2.5 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                          >
                            {updatingOrderId === order.id ? (
                              <span className="flex items-center justify-center gap-2">
                                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                                </svg>
                              </span>
                            ) : (
                              '✓ Approve'
                            )}
                          </button>
                          <button
                            onClick={(e) => handleQuickReject(order.id, e)}
                            disabled={updatingOrderId === order.id}
                            className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2.5 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                          >
                            ✕ Reject
                          </button>
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