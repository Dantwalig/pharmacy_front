'use client';

import { useState } from 'react';
import { Hexagon, AlertTriangle, ClipboardList, Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';

type Category = 'Drug' | 'Supply' | 'Equipment';
type Stock = 'IN_STOCK' | 'LOW_STOCK';
type Alert = 'SAFE' | 'EXPIRING' | 'EXPIRED' | null;

interface InventoryItem {
  name: string;
  category: Category;
  quantity: number;
  reorder: number;
  expiry: string | null;
  stock: Stock;
  alert: Alert;
  alertLabel?: string;
}

const ITEMS: InventoryItem[] = [
  { name: 'Amoxicillin 500mg',      category: 'Drug',      quantity: 45,  reorder: 100, expiry: '2026-09-12', stock: 'LOW_STOCK', alert: 'SAFE' },
  { name: 'Ibuprofen 400mg',        category: 'Drug',      quantity: 210, reorder: 50,  expiry: '2027-02-15', stock: 'IN_STOCK',  alert: 'SAFE' },
  { name: 'Lisinopril 10mg',        category: 'Drug',      quantity: 12,  reorder: 20,  expiry: '2026-06-25', stock: 'LOW_STOCK', alert: 'EXPIRING', alertLabel: 'Expiring (35d)' },
  { name: 'Surgical Sterile Gloves',category: 'Supply',    quantity: 850, reorder: 200, expiry: '2029-10-30', stock: 'IN_STOCK',  alert: 'SAFE' },
  { name: 'N95 Respirator Masks',   category: 'Supply',    quantity: 80,  reorder: 150, expiry: '2026-04-10', stock: 'LOW_STOCK', alert: 'EXPIRED' },
  { name: 'ECG Patient Monitor',    category: 'Equipment', quantity: 6,   reorder: 2,   expiry: null,         stock: 'IN_STOCK',  alert: null },
  { name: 'Automated Defibrillator',category: 'Equipment', quantity: 1,   reorder: 2,   expiry: null,         stock: 'LOW_STOCK', alert: null },
];



export default function HospitalAdminInventoryPage() {

  const { t } = useTranslation();

  const MODE_CARDS = [
  { id: 'stock',       title: t('hospital.hospitalStock'),  desc: t('hospital.hospitalStockDesc'), icon: Hexagon,       color: '#2563EB' },
  { id: 'alerts',      title: t('hospital.alertsQueue'),    desc: t('hospital.alertsQueueDesc'),         icon: AlertTriangle, color: '#DC2626' },
  { id: 'procurement', title: t('hospital.procurementLog'), desc: t('hospital.procurementLogDesc'), icon: ClipboardList, color: '#059669' },
 ];

const TABS: { key: string; label: string }[] = [
  { key: 'ALL',       label: 'All Items' },
  { key: 'Drug',      label: 'Drugs / Meds' },
  { key: 'Supply',    label: 'Supplies' },
  { key: 'Equipment', label: 'Equipment' },
];

const STOCK_STYLE: Record<Stock, { bg: string; color: string; dot: string; label: string }> = {
  IN_STOCK:  { bg: '#ECFDF5', color: '#059669', dot: '#10B981', label: 'In Stock' },
  LOW_STOCK: { bg: '#FEF2F2', color: '#DC2626', dot: '#EF4444', label: 'Low Stock' },
};

const ALERT_STYLE: Record<Exclude<Alert, null>, { bg: string; color: string; label: string }> = {
  SAFE:     { bg: '#ECFDF5', color: '#15803D', label: 'Safe' },
  EXPIRING: { bg: '#FFFBEB', color: '#C2410C', label: 'Expiring' },
  EXPIRED:  { bg: '#FEF2F2', color: '#DC2626', label: 'Expired' },
};

  const [activeMode, setActiveMode] = useState('stock');
  const [tab, setTab] = useState('ALL');
  const [search, setSearch] = useState('');

  const filtered = ITEMS.filter(i => {
    if (tab !== 'ALL' && i.category !== tab) return false;
    if (search.trim() && !i.name.toLowerCase().includes(search.trim().toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="rounded-2xl p-8" style={{ background: '#EBF5FF' }}>
        <h1 className="text-3xl font-bold" style={{ color: '#1E3A5F' }}>{t('hospital.inventoryControl')}</h1>
        <p className="mt-1 text-sm font-medium" style={{ color: '#0284C7' }}>{t('hospital.inventoryControlDesc')}</p>
        <h1 className="text-3xl font-bold" style={{ color: '#1E3A5F' }}>{t('hospital.inventoryControl')}</h1>
        <p className="mt-1 text-sm font-medium" style={{ color: '#0284C7' }}>{t('hospital.inventoryControlDesc')}</p>
      </div>

      {/* Mode cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {MODE_CARDS.map(card => {
          const Icon = card.icon;
          const active = activeMode === card.id;
          return (
            <button
              key={card.id}
              onClick={() => setActiveMode(card.id)}
              className="bg-white rounded-2xl border p-6 flex flex-col items-center text-center transition-all hover:shadow-md"
              style={{ borderColor: active ? card.color : '#F1F5F9', boxShadow: active ? `0 0 0 1px ${card.color}` : undefined }}
            >
              <Icon className="w-8 h-8 mb-3" style={{ color: card.color }} strokeWidth={1.6} />
              <h3 className="text-sm font-bold text-gray-900">{card.title}</h3>
              <p className="text-xs text-gray-400 mt-1 leading-relaxed max-w-[220px]">{card.desc}</p>
            </button>
          );
        })}
      </div>

      {/* Tabs + search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {TABS.map(tb => (
            <button
              key={tb.key}
              onClick={() => setTab(tb.key)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                tab === tb.key ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'
              }`}
            >
              {tb.label}
            </button>
          ))}
        </div>
        <div className="relative w-full sm:w-72">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={t('hospital.searchPlaceholder')}
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[880px]">
            <thead>
              <tr className="border-b border-gray-100 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                <th className="px-6 py-4">{t('hospital.itemName')}</th>
                <th className="px-6 py-4">{t('hospital.category')}</th>
                <th className="px-6 py-4">{t('hospital.availableQuantity')}</th>
                <th className="px-6 py-4">{t('hospital.minReorderLimit')}</th>
                <th className="px-6 py-4">{t('hospital.expiryDate')}</th>
                <th className="px-6 py-4">{t('hospital.statusAlerts')}</th>
                <th className="px-6 py-4 text-right">{t('hospital.quickActions')}</th>
                <th className="px-6 py-4">{t('hospital.itemName')}</th>
                <th className="px-6 py-4">{t('hospital.category')}</th>
                <th className="px-6 py-4">{t('hospital.availableQuantity')}</th>
                <th className="px-6 py-4">{t('hospital.minReorderLimit')}</th>
                <th className="px-6 py-4">{t('hospital.expiryDate')}</th>
                <th className="px-6 py-4">{t('hospital.statusAlerts')}</th>
                <th className="px-6 py-4 text-right">{t('hospital.quickActions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-sm">
              {filtered.length === 0 ? (
                <tr><td colSpan={7} className="px-6 py-12 text-center text-gray-400 font-medium">No items found.</td></tr>
              ) : filtered.map(item => {
                const stock = STOCK_STYLE[item.stock];
                const alert = item.alert ? ALERT_STYLE[item.alert] : null;
                return (
                  <tr key={item.name} className="hover:bg-gray-50/70 transition-colors">
                    <td className="px-6 py-4 font-bold text-gray-900">{item.name}</td>
                    <td className="px-6 py-4 text-gray-500">{item.category}</td>
                    <td className="px-6 py-4 font-semibold text-gray-800">{item.quantity} {t('hospital.units')}</td>
                    <td className="px-6 py-4 text-gray-500">{item.reorder} {t('hospital.units')}</td>
                    <td className="px-6 py-4 font-semibold text-gray-800">{item.quantity} {t('hospital.units')}</td>
                    <td className="px-6 py-4 text-gray-500">{item.reorder} {t('hospital.units')}</td>
                    <td className="px-6 py-4 text-gray-500">{item.expiry ?? '—'}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider" style={{ background: stock.bg, color: stock.color }}>
                          <span className="h-1.5 w-1.5 rounded-full" style={{ background: stock.dot }} />
                          {stock.label}
                        </span>
                        {alert && (
                          <span className="inline-block rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider" style={{ background: alert.bg, color: alert.color }}>
                            {item.alertLabel ?? alert.label}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="px-3 py-2 text-xs font-semibold text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors whitespace-nowrap">
                        Request Stock
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

