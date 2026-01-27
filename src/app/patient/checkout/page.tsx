// frontend/src/app/patient/checkout/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { useCart } from '@/context/CartContext';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import LoadingSpinner from '@/components/shared/LoadingSpinner';

declare global {
  interface Window {
    FlutterwaveCheckout: any;
  }
}

export default function CheckoutPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const { items, getTotal, clearCart, pharmacyId } = useCart();
  
  const [loading, setLoading] = useState(false);
  const [orderType, setOrderType] = useState<'DELIVERY' | 'PICKUP'>('DELIVERY');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'MTN_MOMO' | 'AIRTEL_MONEY' | 'CARD' | 'INSURANCE'>('MTN_MOMO');
  const [phoneNumber, setPhoneNumber] = useState('');
  
  const [insuranceProvider, setInsuranceProvider] = useState('');
  const [insurancePolicyNumber, setInsurancePolicyNumber] = useState('');
  const [insuranceMemberId, setInsuranceMemberId] = useState('');
  const [insuranceMemberName, setInsuranceMemberName] = useState('');
  const [insuranceVerified, setInsuranceVerified] = useState(false);
  const [insuranceCoverage, setInsuranceCoverage] = useState(0);
  
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    if (items.length === 0) {
      router.push('/patient/cart');
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.flutterwave.com/v3.js';
    script.async = true;
    document.body.appendChild(script);

    fetchUserProfile();

    return () => {
      document.body.removeChild(script);
    };
  }, [items, router]);

  const fetchUserProfile = async () => {
    try {
      const res = await api.get('/patients/profile');
      setUser(res.data);
      setDeliveryAddress(res.data.address || '');
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    }
  };

  const verifyInsurance = async () => {
    if (!insuranceProvider || !insurancePolicyNumber || !insuranceMemberId || !insuranceMemberName) {
      toast.error('Please fill in all insurance fields');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/insurance/verify', {
        provider: insuranceProvider,
        policyNumber: insurancePolicyNumber,
        memberId: insuranceMemberId,
        memberName: insuranceMemberName,
      });

      setInsuranceVerified(true);
      setInsuranceCoverage(res.data.coveragePercentage);
      toast.success(`Insurance verified! ${res.data.coveragePercentage}% coverage`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Insurance verification failed');
    } finally {
      setLoading(false);
    }
  };

  const calculateTotals = () => {
    const subtotal = getTotal();
    const deliveryFee = orderType === 'DELIVERY' ? 1000 : 0;
    
    let insuranceCoverageAmount = 0;
    let patientPayment = subtotal + deliveryFee;

    if (paymentMethod === 'INSURANCE' && insuranceVerified) {
      insuranceCoverageAmount = (subtotal * insuranceCoverage) / 100;
      patientPayment = subtotal - insuranceCoverageAmount + deliveryFee;
    }

    return { subtotal, deliveryFee, insuranceCoverageAmount, patientPayment };
  };

  const handlePlaceOrder = async () => {
    if (orderType === 'DELIVERY' && !deliveryAddress) {
      toast.error('Please enter delivery address');
      return;
    }

    if (paymentMethod === 'INSURANCE' && !insuranceVerified) {
      toast.error('Please verify your insurance first');
      return;
    }

    if (['MTN_MOMO', 'AIRTEL_MONEY'].includes(paymentMethod) && !phoneNumber) {
      toast.error('Please enter phone number');
      return;
    }

    setLoading(true);

    try {
      const orderData = {
        pharmacyId,
        type: orderType,
        items: items.map(item => ({
          medicationId: item.medicationId,
          quantity: item.quantity,
        })),
        deliveryAddress: orderType === 'DELIVERY' ? deliveryAddress : undefined,
        paymentMethod,
        insuranceProvider: paymentMethod === 'INSURANCE' ? insuranceProvider : undefined,
        insurancePolicyNumber: paymentMethod === 'INSURANCE' ? insurancePolicyNumber : undefined,
      };

      const orderRes = await api.post('/orders', orderData);
      const order = orderRes.data;

      const paymentData = {
        orderId: order.id,
        phoneNumber: paymentMethod !== 'CARD' ? phoneNumber : undefined,
        insuranceProvider: paymentMethod === 'INSURANCE' ? insuranceProvider : undefined,
        insurancePolicyNumber: paymentMethod === 'INSURANCE' ? insurancePolicyNumber : undefined,
        insuranceVerified: paymentMethod === 'INSURANCE' ? insuranceVerified : undefined,
      };

      const paymentRes = await api.post('/payments/initiate', paymentData);

      if (paymentMethod === 'CARD') {
        window.FlutterwaveCheckout({
          public_key: process.env.NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY,
          tx_ref: paymentRes.data.data?.tx_ref,
          amount: calculateTotals().patientPayment,
          currency: 'RWF',
          customer: {
            email: user?.email || 'patient@example.com',
            name: `${user?.firstName} ${user?.lastName}`,
          },
          callback: async (response: any) => {
            if (response.status === 'successful') {
              await api.post('/payments/verify', {
                paymentId: paymentRes.data.paymentId,
                transactionId: response.transaction_id,
              });

              toast.success('Payment successful!');
              clearCart();
              router.push(`/patient/orders/${order.id}`);
            }
          },
          onclose: () => {
            toast.error('Payment cancelled');
          },
        });
      } else {
        toast.success('Order placed! Check your phone for payment prompt.');
        clearCart();
        router.push(`/patient/orders/${order.id}`);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Order failed');
    } finally {
      setLoading(false);
    }
  };

  const totals = calculateTotals();

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-linear-to-r from-green-600 to-emerald-600 rounded-2xl shadow-xl p-8 text-white">
        <h1 className="text-3xl sm:text-4xl font-bold mb-2">{t('checkout.title')} 💳</h1>
        <p className="text-green-100 text-lg">{t('checkout.subtitle')}</p>
      </div>

      {/* Order Type */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
        <h2 className="font-bold text-xl mb-4 text-gray-800 dark:text-gray-100">{t('checkout.orderType')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => setOrderType('DELIVERY')}
            className={`p-6 border-2 rounded-xl transition-all transform hover:scale-105 ${
              orderType === 'DELIVERY'
                ? 'border-green-600 bg-green-50 dark:bg-green-900/20 shadow-lg'
                : 'border-gray-200 dark:border-gray-700 hover:border-green-300'
            }`}
          >
            <p className="text-3xl mb-2">🚚</p>
            <p className="font-bold text-lg text-gray-800 dark:text-gray-100">{t('checkout.delivery')}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">{t('checkout.deliveryDesc')}</p>
          </button>
          <button
            onClick={() => setOrderType('PICKUP')}
            className={`p-6 border-2 rounded-xl transition-all transform hover:scale-105 ${
              orderType === 'PICKUP'
                ? 'border-green-600 bg-green-50 dark:bg-green-900/20 shadow-lg'
                : 'border-gray-200 dark:border-gray-700 hover:border-green-300'
            }`}
          >
            <p className="text-3xl mb-2">🏪</p>
            <p className="font-bold text-lg text-gray-800 dark:text-gray-100">{t('checkout.pickup')}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">{t('checkout.pickupDesc')}</p>
          </button>
        </div>

        {orderType === 'DELIVERY' && (
          <div className="mt-6">
            <label className="block text-sm font-semibold mb-2 text-gray-800 dark:text-gray-100">
              {t('checkout.deliveryAddress')}
            </label>
            <input
              type="text"
              value={deliveryAddress}
              onChange={(e) => setDeliveryAddress(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
              placeholder={t('checkout.addressPlaceholder')}
            />
          </div>
        )}
      </div>

      {/* Payment Method */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
        <h2 className="font-bold text-xl mb-4 text-gray-800 dark:text-gray-100">{t('checkout.paymentMethod')}</h2>
        <div className="space-y-3">
          {['MTN_MOMO', 'AIRTEL_MONEY', 'CARD', 'INSURANCE'].map((method) => (
            <label key={method} className="flex items-center gap-3 p-4 border-2 border-gray-200 dark:border-gray-700 rounded-xl cursor-pointer hover:border-green-500 transition-all">
              <input
                type="radio"
                name="payment"
                checked={paymentMethod === method}
                onChange={() => setPaymentMethod(method as any)}
                className="w-5 h-5 text-green-600"
              />
              <span className="text-gray-800 dark:text-gray-100 font-medium">
                {method === 'MTN_MOMO' && '📱 MTN Mobile Money'}
                {method === 'AIRTEL_MONEY' && '📱 Airtel Money'}
                {method === 'CARD' && '💳 Credit/Debit Card'}
                {method === 'INSURANCE' && '🏥 Health Insurance'}
              </span>
            </label>
          ))}
        </div>

        {['MTN_MOMO', 'AIRTEL_MONEY'].includes(paymentMethod) && (
          <div className="mt-4">
            <label className="block text-sm font-semibold mb-2 text-gray-800 dark:text-gray-100">
              {t('checkout.phoneNumber')}
            </label>
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
              placeholder="+250788123456"
            />
          </div>
        )}

        {paymentMethod === 'INSURANCE' && (
          <div className="mt-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-800 dark:text-gray-100">
                  {t('checkout.insuranceProvider')}
                </label>
                <select
                  value={insuranceProvider}
                  onChange={(e) => setInsuranceProvider(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                >
                  <option value="">{t('checkout.selectProvider')}</option>
                  <option value="MMI">MMI</option>
                  <option value="RSSB">RSSB</option>
                  <option value="Sanlam">Sanlam</option>
                  <option value="RAMA">RAMA</option>
                  <option value="Britam">Britam</option>
                  <option value="Radiant">Radiant</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-800 dark:text-gray-100">
                  {t('checkout.policyNumber')}
                </label>
                <input
                  type="text"
                  value={insurancePolicyNumber}
                  onChange={(e) => setInsurancePolicyNumber(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-800 dark:text-gray-100">
                  {t('checkout.memberId')}
                </label>
                <input
                  type="text"
                  value={insuranceMemberId}
                  onChange={(e) => setInsuranceMemberId(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-800 dark:text-gray-100">
                  {t('checkout.memberName')}
                </label>
                <input
                  type="text"
                  value={insuranceMemberName}
                  onChange={(e) => setInsuranceMemberName(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                />
              </div>
            </div>
            
            <button
              onClick={verifyInsurance}
              disabled={loading || insuranceVerified}
              className="w-full bg-linear-to-r from-green-600 to-emerald-600 text-white py-3 rounded-xl font-bold hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg disabled:opacity-50"
            >
              {insuranceVerified ? '✓ Verified' : t('checkout.verifyInsurance')}
            </button>

            {insuranceVerified && (
              <div className="bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-700 rounded-xl p-4">
                <p className="text-green-700 dark:text-green-400 font-bold">
                  ✓ {t('checkout.insuranceVerified')} - {insuranceCoverage}% {t('checkout.coverage')}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Order Summary */}
      <div className="bg-linear-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl shadow-lg p-6">
        <h2 className="font-bold text-xl mb-4 text-gray-800 dark:text-gray-100">{t('checkout.orderSummary')}</h2>
        <div className="space-y-3">
          <div className="flex justify-between text-gray-700 dark:text-gray-300">
            <span>{t('orders.subtotal')}</span>
            <span className="font-semibold">{totals.subtotal.toLocaleString()} RWF</span>
          </div>
          <div className="flex justify-between text-gray-700 dark:text-gray-300">
            <span>{t('orders.deliveryFee')}</span>
            <span className="font-semibold">{totals.deliveryFee.toLocaleString()} RWF</span>
          </div>
          {insuranceVerified && (
            <div className="flex justify-between text-green-600 dark:text-green-400">
              <span>{t('orders.insuranceCoverage')} ({insuranceCoverage}%)</span>
              <span className="font-semibold">-{totals.insuranceCoverageAmount.toLocaleString()} RWF</span>
            </div>
          )}
          <div className="border-t-2 border-gray-300 dark:border-gray-600 pt-3 flex justify-between font-bold text-2xl">
            <span className="text-gray-800 dark:text-gray-100">{t('orders.total')}</span>
            <span className="bg-linear-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              {totals.patientPayment.toLocaleString()} RWF
            </span>
          </div>
        </div>

        <button
          onClick={handlePlaceOrder}
          disabled={loading}
          className="w-full bg-linear-to-r from-green-600 to-emerald-600 text-white py-4 rounded-xl font-bold text-lg hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl mt-6 disabled:opacity-50"
        >
          {loading ? <LoadingSpinner size="sm" /> : t('checkout.placeOrder')}
        </button>
      </div>
    </div>
  );
}