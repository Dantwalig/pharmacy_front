'use client';

import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { CreditCard, Package, CheckCircle2, ListOrdered, User, ShoppingCart } from 'lucide-react';
import CashierPOSModal from './CashierPOSModal';
import { useAuth } from '@/context/AuthContext';
import { Order } from '@/types';

const NAVY = '#1E4D8C';
const TEAL = '#2D9B8A';

type CashierTab = 'pending_payment' | 'ready_pickup' | 'completed' | 'all';

const STATUS_PENDING_PAYMENT = ['READY_FOR_PICKUP'];
const STATUS_READY_PICKUP = ['ACCEPTED', 'PREPARING', 'OUT_FOR_DELIVERY'];
const STATUS_COMPLETED = ['COMPLETED', 'DELIVERED'];

interface CashierOrdersViewProps {
  orders: Order[];
  loading: boolean;
}

export default function CashierOrdersView({ orders, loading }: CashierOrdersViewProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [tab, setTab] = useState<CashierTab>('pending_payment');
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [advancedIds, setAdvancedIds] = useState<Set<string>>(new Set());

  const tabs: { key: CashierTab; label: string; icon: React.ElementType }[] = [
    { key: 'pending_payment', label: t('cashier.tabPendingPayment'), icon: CreditCard },
    { key: 'ready_pickup',    label: t('cashier.tabReadyPickup'),    icon: Package },
    { key: 'completed',       label: t('cashier.tabCompleted'),      icon: CheckCircle2 },
    { key: 'all',             label: t('cashier.tabAll'),            icon: ListOrdered },
  ];

  const filtered = useMemo(() => {
    return orders.filter((o) => {
      if (advancedIds.has(o.id)) {
        return tab === 'completed' || tab === 'all';
      }
      switch (tab) {
        case 'pending_payment': return STATUS_PENDING_PAYMENT.includes(o.status);
        case 'ready_pickup':    return STATUS_READY_PICKUP.includes(o.status);
        case 'completed':       return STATUS_COMPLETED.includes(o.status);
        case 'all':             return true;
        default:                return true;
      }
    });
  }, [tab, orders, advancedIds]);

  const cashierName = user
    ? `${user.profile?.firstName ?? ''} ${user.profile?.lastName ?? ''}`.trim() || user.email || 'Cashier'
    : 'Cashier';

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: TEAL }} />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Hero Banner */}
      <div className="rounded-2xl p-6 lg:p-8 border border-blue-100 bg-linear-to-r from-[#E5F1FF] to-[#F3F8FF] shadow-xs">
        <h1 className="text-2xl lg:text-3xl font-black text-[#1E4D8C]">{t('cashier.ordersTitle') || 'Cashier Portal'}</h1>
        <p className="mt-1.5 text-blue-700/80 font-semibold text-sm">{t('cashier.ordersSubtitle') || 'Manage client checkouts, payments, and prescription status verification.'}</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: t('cashier.tabAll'),             value: orders.length,                                                          icon: ListOrdered, color: '#1E4D8C', bg: 'bg-blue-50' },
          { label: t('cashier.tabPendingPayment'),  value: orders.filter((o) => STATUS_PENDING_PAYMENT.includes(o.status)).length, icon: CreditCard,  color: '#2D9B8A', bg: 'bg-teal-50' },
          { label: t('cashier.tabReadyPickup'),     value: orders.filter((o) => STATUS_READY_PICKUP.includes(o.status)).length,    icon: Package,     color: '#EAB308', bg: 'bg-amber-50' },
          { label: t('cashier.tabCompleted'),       value: orders.filter((o) => STATUS_COMPLETED.includes(o.status)).length + advancedIds.size, icon: CheckCircle2, color: '#22C55E', bg: 'bg-emerald-50' },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <div
              key={s.label}
              className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700/50 shadow-xs flex items-center justify-between hover:shadow-md transition-all duration-300"
            >
              <div>
                <p className="text-gray-400 dark:text-gray-400 text-xs font-bold uppercase tracking-wider">{s.label}</p>
                <p className="text-gray-900 dark:text-white text-2xl font-black mt-1">{s.value}</p>
              </div>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${s.bg}`}>
                <Icon size={22} style={{ color: s.color }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Segmented Control Switcher */}
      <div className="flex bg-[#F0F4FA] dark:bg-gray-800/50 p-1.5 rounded-2xl max-w-2xl border border-gray-200/50 dark:border-gray-700/50">
        {tabs.map(({ key, label, icon: Icon }) => {
          const active = tab === key;
          return (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-black transition-all duration-200 ${
                active
                  ? 'bg-white dark:bg-gray-700 text-[#1E4D8C] shadow-sm font-black'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
              }`}
            >
              <Icon size={14} className={active ? 'text-[#1E4D8C]' : 'text-gray-400'} />
              {label}
            </button>
          );
        })}
      </div>

      {/* Orders List */}
      {filtered.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-12 text-center border border-gray-100 dark:border-gray-700 shadow-xs">
          <ShoppingCart size={48} className="text-gray-200 dark:text-gray-600 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400 font-bold text-sm">{t('cashier.noOrders')}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((o) => {
            const itemCount = o.orderItems.reduce((s, it) => s + it.quantity, 0);
            const isPaid = advancedIds.has(o.id);
            const isPaymentTab = tab === 'pending_payment';
            const initials = [o.patient?.firstName?.[0], o.patient?.lastName?.[0]].filter(Boolean).join('').toUpperCase() || 'P';
            const formattedTotal = Number(o.total ?? 0).toLocaleString();

            return (
              <div
                key={o.id}
                className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden shadow-xs hover:shadow-md transition-all duration-300 relative group"
              >
                {/* Left visual accent indicator */}
                <div 
                  className={`absolute left-0 top-0 bottom-0 w-1.5 transition-colors ${
                    isPaid ? 'bg-emerald-500' : 'bg-[#1E4D8C]'
                  }`} 
                />

                <div className="pl-6 pr-6 py-5 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                  {/* Left: Patient Initials Avatar & Name */}
                  <div className="flex items-start sm:items-center gap-4 flex-1 min-w-0">
                    <div 
                      className="w-12 h-12 rounded-2xl flex items-center justify-center text-white text-sm font-black shrink-0 shadow-xs"
                      style={{ background: `linear-gradient(135deg, ${NAVY} 0%, #2563a8 100%)` }}
                    >
                      {initials}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-extrabold text-gray-900 dark:text-white text-base truncate">
                          {o.patient.firstName} {o.patient.lastName}
                        </h3>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200/50">
                          {o.type || 'PICKUP'}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-400 dark:text-gray-500 mt-1 flex-wrap">
                        <span className="font-mono bg-gray-50 dark:bg-gray-700/50 px-2 py-0.5 rounded-md border border-gray-100 dark:border-gray-700">
                          #{o.id.slice(0, 8).toUpperCase()}
                        </span>
                        <span>·</span>
                        <span>{new Date(o.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                  </div>

                  {/* Middle: Items summary & Price */}
                  <div className="flex flex-wrap items-center gap-6 sm:gap-10 shrink-0">
                    <div className="space-y-0.5">
                      <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">{t('cashier.items') || 'Items Count'}</p>
                      <p className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                        <Package size={14} className="text-gray-400" />
                        {itemCount} {itemCount === 1 ? t('cashier.item') : t('cashier.items')}
                      </p>
                    </div>

                    <div className="space-y-0.5">
                      <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Total Amount</p>
                      <p className="text-base font-black text-[#1E4D8C] dark:text-[#3baaef] font-mono">
                        RWF {formattedTotal}
                      </p>
                    </div>

                    <div className="space-y-0.5">
                      <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Status</p>
                      <div className="flex items-center gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border ${
                          isPaid 
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border-emerald-200/50'
                            : 'bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400 border-amber-200/50'
                        }`}>
                          {isPaid ? t('cashier.paid') : o.status.replace(/_/g, ' ')}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Payment button */}
                  {isPaymentTab && !isPaid && (
                    <button
                      onClick={() => setActiveOrder(o)}
                      className="w-full md:w-auto flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-white text-sm font-bold shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] shrink-0"
                      style={{ background: `linear-gradient(135deg, ${TEAL} 0%, #207a6c 100%)` }}
                    >
                      <CreditCard size={15} />
                      {t('cashier.processPayment')}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <CashierPOSModal
        open={!!activeOrder}
        onClose={() => setActiveOrder(null)}
        order={activeOrder}
        cashierName={cashierName}
        onAdvance={(id) => {
          setAdvancedIds((prev) => new Set(prev).add(id));
          setActiveOrder(null);
        }}
      />
    </div>
  );
}
