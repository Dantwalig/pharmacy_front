'use client';

import { useEffect, useState } from 'react';
import { Hexagon, AlertTriangle, ClipboardList, Search } from 'lucide-react';
import { useHospitalId } from '@/lib/hospital';
import api from '@/lib/api';
import toast from 'react-hot-toast';

type Category = 'Drug' | 'Supply' | 'Equipment';
type Stock = 'IN_STOCK' | 'LOW_STOCK';
type Alert = 'SAFE' | 'EXPIRING' | 'EXPIRED' | null;

interface InventoryItem {
  id: string;
  drugId?: string;
  name: string;
  category: Category;
  quantity: number;
  reorder: number;
  expiry: string | null;
  stock: Stock;
  alert: Alert;
  alertLabel?: string;
}

function computeAlert(expiryDate: string | null): { alert: Alert; alertLabel?: string } {
  if (!expiryDate) return { alert: null };
  const now = Date.now();
  const exp = new Date(expiryDate).getTime();
  if (exp < now) return { alert: 'EXPIRED' };
  const daysLeft = Math.ceil((exp - now) / 86_400_000);
  if (daysLeft <= 60) return { alert: 'EXPIRING', alertLabel: `Expiring (${daysLeft}d)` };
  return { alert: 'SAFE' };
}


const MODE_CARDS = [
  { id: 'stock',       title: 'Hospital Stock',  desc: 'Track current drug supplies, equipment, and medical inventory levels.', icon: Hexagon,       color: '#2563EB' },
  { id: 'alerts',      title: 'Alerts Queue',    desc: 'Instantly find expired, expiring, or critical low-stock items.',         icon: AlertTriangle, color: '#DC2626' },
  { id: 'procurement', title: 'Procurement Log', desc: 'Submit and review procurement requests, tracking approval & delivery stages.', icon: ClipboardList, color: '#059669' },
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

export default function HospitalAdminInventoryPage() {
  const hospitalId = useHospitalId();
  const [activeMode, setActiveMode] = useState('stock');
  const [tab, setTab]               = useState('ALL');
  const [search, setSearch]         = useState('');
  const [items, setItems]           = useState<InventoryItem[]>([]);
  const [loadingItems, setLoadingItems] = useState(true);
  const [editingId, setEditingId]   = useState<string | null>(null);
  const [editQty, setEditQty]       = useState<number>(0);
  const [saving, setSaving]         = useState(false);

  useEffect(() => {
    if (!hospitalId) { setLoadingItems(false); return; }
    api.get(`/hospitals/${hospitalId}/drug-stock`)
      .then(res => {
        const raw: any[] = Array.isArray(res.data) ? res.data : [];
        const mapped: InventoryItem[] = raw.map(item => {
          const { alert, alertLabel } = computeAlert(item.expiryDate);
          return {
            id:       item.id,
            drugId:   item.drugId,
            name:     item.drug?.brandName ?? 'Unknown',
            category: 'Drug' as Category,
            quantity: item.quantity,
            reorder:  item.reorderLevel,
            expiry:   item.expiryDate ? item.expiryDate.substring(0, 10) : null,
            stock:    item.lowStockAlert ? 'LOW_STOCK' : 'IN_STOCK',
            alert,
            alertLabel,
          };
        });
        setItems(mapped);
      })
      .catch(() => {})
      .finally(() => setLoadingItems(false));
  }, [hospitalId]);

  const handleSaveQty = async (item: InventoryItem) => {
    if (!hospitalId || !item.drugId) return;
    setSaving(true);
    try {
      await api.patch(`/hospitals/${hospitalId}/drug-stock/${item.drugId}`, { qtyOnHand: editQty });
      setItems(prev => prev.map(i =>
        i.drugId === item.drugId
          ? { ...i, quantity: editQty, stock: editQty <= i.reorder ? 'LOW_STOCK' : 'IN_STOCK' }
          : i
      ));
      setEditingId(null);
    } catch {
      toast.error('Failed to update stock — please try again.');
    }
    setSaving(false);
  };

  const modeFiltered = activeMode === 'alerts'
    ? items.filter(i => i.alert !== null)
    : items;

  const filtered = modeFiltered.filter(i => {
    if (tab !== 'ALL' && i.category !== tab) return false;
    if (search.trim() && !i.name.toLowerCase().includes(search.trim().toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="rounded-2xl p-8" style={{ background: '#EBF5FF' }}>
        <h1 className="text-3xl font-bold" style={{ color: '#1E3A5F' }}>Inventory Control &amp; Supply Chain</h1>
        <p className="mt-1 text-sm font-medium" style={{ color: '#0284C7' }}>Track and manage hospital stock levels, alerts, and procurement requests</p>
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

      {activeMode === 'procurement' && (
        <div className="flex items-center justify-center py-16 text-sm text-gray-400 bg-white rounded-2xl border border-gray-100 shadow-sm">
          Procurement log is not yet available — no backend endpoint exists for this feature.
        </div>
      )}

      {/* Tabs + search */}
      {activeMode !== 'procurement' && (
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
            placeholder="Search stock inventory..."
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
      )}

      {/* Table */}
      {activeMode !== 'procurement' && <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[880px]">
            <thead>
              <tr className="border-b border-gray-100 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                <th className="px-6 py-4">Item Name</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Available Quantity</th>
                <th className="px-6 py-4">Min. Reorder Limit</th>
                <th className="px-6 py-4">Expiry Date</th>
                <th className="px-6 py-4">Status / Alerts</th>
                <th className="px-6 py-4 text-right">Quick Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-sm">
              {loadingItems ? (
                <tr><td colSpan={7} className="px-6 py-12 text-center text-gray-400 font-medium">Loading inventory…</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={7} className="px-6 py-12 text-center text-gray-400 font-medium">No items found.</td></tr>
              ) : filtered.map(item => {
                const stock = STOCK_STYLE[item.stock];
                const alert = item.alert ? ALERT_STYLE[item.alert] : null;
                return (
                  <tr key={item.drugId} className="hover:bg-gray-50/70 transition-colors">
                    <td className="px-6 py-4 font-bold text-gray-900">{item.name}</td>
                    <td className="px-6 py-4 text-gray-500">{item.category}</td>
                    <td className="px-6 py-4 font-semibold text-gray-800">{item.quantity} units</td>
                    <td className="px-6 py-4 text-gray-500">{item.reorder} units</td>
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
                      {editingId === item.drugId ? (
                        <div className="flex items-center gap-1.5 justify-end">
                          <input
                            type="number"
                            min={0}
                            value={editQty}
                            onChange={e => setEditQty(Number(e.target.value))}
                            className="w-20 px-2 py-1 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                          />
                          <button
                            onClick={() => handleSaveQty(item)}
                            disabled={saving}
                            className="px-2 py-1 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                          >
                            {saving ? '…' : 'Save'}
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="px-2 py-1 text-xs font-semibold text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50"
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => { setEditingId(item.drugId ?? null); setEditQty(item.quantity); }}
                          className="px-3 py-2 text-xs font-semibold text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors whitespace-nowrap"
                        >
                          Request Stock
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>}
    </div>
  );
}
