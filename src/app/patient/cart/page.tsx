// frontend/src/app/patient/cart/page.tsx

'use client';

import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { useCart } from '@/context/CartContext';
import { TrashIcon, PlusIcon, MinusIcon, ShoppingBagIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

export default function CartPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const { items, removeFromCart, updateQuantity, getTotal, clearCart } = useCart();

  if (items.length === 0) {
    return (
      <div className="space-y-6">
      <div className="bg-[#EBF5FF] rounded-2xl p-8 flex items-start justify-between">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-2 text-[#1E3A5F]">{t('cart.title')}</h1>
          <p className="text-gray-500">{t('cart.reviewItems')}</p>
        </div>
        <Link href="/patient/search">
          <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm">
            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            {t('common.search')}
          </button>
        </Link>
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
        <ShoppingBagIcon className="w-16 h-16 mx-auto text-gray-300 mb-4" />
        <p className="text-gray-800 text-lg mb-2 font-bold">{t('cart.empty')}</p>
        <p className="text-gray-500 mb-6 text-sm">
          {t('cart.suggestedMeds')}<br />
          <span className="text-gray-400">[Paracetamol 500mg, Ibuprofen 200mg, Vitamin C]</span>
        </p>
        <Link href="/patient/search">
          <button className="text-white px-8 py-3 rounded-xl font-semibold hover:opacity-90 transition-opacity" style={{ background: 'linear-gradient(to right, #0688CA, #32B6F2)' }}>
            {t('checkout2.browseMedications')}
          </button>
        </Link>
      </div>
    </div>
  );
  }

  const pharmacyName = items[0]?.pharmacyName;
  const subtotal = getTotal();
  const deliveryFee = 1000;
  const total = subtotal + deliveryFee;

  return (
    <div className="space-y-6">
    <div className="bg-[#EBF5FF] rounded-2xl p-8 flex items-start justify-between">
      <div>
        <h1 className="text-3xl sm:text-4xl font-bold mb-2 text-[#1E3A5F]">{t('cart.title')}</h1>
        <p className="text-gray-500">{pharmacyName || t('cart.reviewItems')}</p>
      </div>
      <Link href="/patient/search">
        <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm">
          <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          {t('common.search')}
        </button>
      </Link>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">{t('cart.title')} ({items.length})</h2>
            <button onClick={clearCart} className="text-red-600 hover:text-red-700 text-sm font-medium flex items-center gap-2">
              <TrashIcon className="w-4 h-4" /> {t('cart.clearCart')}
              </button>
          </div>
          <div className="space-y-4">
            {items.map((item) => (
                <div key={item.medicationId} className="border border-gray-200 dark:border-gray-700 rounded-xl p-5 hover:shadow-md transition-all">
                <div className="flex gap-4">
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-800 dark:text-gray-100 mb-1">{item.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{item.price.toLocaleString()} RWF</p>
                    {item.requiresPrescription && (
                        <span className="inline-block px-3 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 text-xs rounded-full font-medium">
                         {t('medications.prescriptionRequired')}
                        </span>
                    )}
                    </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 border-2 border-gray-300 dark:border-gray-600 rounded-xl overflow-hidden">
                      <button onClick={() => updateQuantity(item.medicationId, item.quantity - 1)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" aria-label={`Decrease quantity of ${item.name}`}>
                        <MinusIcon className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                      </button>
                      <span className="px-4 font-bold text-gray-800 dark:text-gray-100">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.medicationId, item.quantity + 1)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" aria-label={`Increase quantity of ${item.name}`}>
                        <PlusIcon className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                      </button>
                    </div>
                    <button onClick={() => removeFromCart(item.medicationId)} className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors" aria-label={`Remove ${item.name} from cart`}>
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">{t('cart.subtotal')}</span>
                  <span className="font-bold text-lg text-[#2563EB]">{(item.price * item.quantity).toLocaleString()} RWF</span>
                </div>
              </div>
            ))}
            </div>
        </div>
      </div>

      {/* Order Summary */}
        <div className="lg:col-span-1">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 sticky top-6">
          <h2 className="font-bold text-xl text-gray-800 dark:text-gray-100 mb-6">{t('orders.paymentSummary')}</h2>
          <div className="space-y-4 mb-6">
            <div className="flex justify-between text-gray-700 dark:text-gray-300">
              <span>{t('cart.subtotal')}</span><span className="font-semibold">{subtotal.toLocaleString()} RWF</span>
            </div>
            <div className="flex justify-between text-gray-700 dark:text-gray-300">
              <span>{t('cart.deliveryFee')}</span><span className="font-semibold">{deliveryFee.toLocaleString()} RWF</span>
            </div>
            <div className="border-t-2 border-gray-300 dark:border-gray-600 pt-4 flex justify-between">
              <span className="font-bold text-lg text-gray-800 dark:text-gray-100">{t('cart.total')}</span>
              <span className="font-bold text-2xl text-[#2563EB]">{total.toLocaleString()} RWF</span>
            </div>
          </div>
          <div className="space-y-3">
            <button onClick={() => router.push('/patient/checkout')}
                className="w-full text-white py-4 rounded-xl font-bold hover:opacity-90 transition-opacity shadow-sm" style={{ background: 'linear-gradient(to right, #0688CA, #32B6F2)' }}>
              {t('cart.proceedToCheckout')}
              </button>
            <Link href="/patient/search">
              <button className="w-full bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 py-3 rounded-xl font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition-all flex items-center justify-center gap-2">
                <ShoppingBagIcon className="w-5 h-5" /> {t('cart.continueShopping')}
                </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  </div>
);
}