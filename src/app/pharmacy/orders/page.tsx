'use client';
import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, ChevronDown, ChevronLeft, ChevronRight, Calendar, Check } from 'lucide-react';
import { GitBranch } from 'lucide-react';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';

const BLUE = '#1B72C8';
const NAVY = '#1E4D8C';

type TabKey = 'ALL' | 'PENDING' | 'ACCEPTED' | 'READY_FOR_CHECKOUT' | 'COMPLETED' | 'REJECTED';

const STATUS_COLORS: Record<string, string> = {
  PENDING: '#F59E0B',
  ACCEPTED: '#3B82F6',
  READY_FOR_CHECKOUT: '#2D9B8A',
  COMPLETED: '#10B981',
  REJECTED: '#EF4444',
};

const PAGE_SIZE = 10;

export default function PharmacyOrdersPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [tab, setTab] = useState<TabKey>('ALL');
  const [search, setSearch] = useState('');
  const [branch, setBranch] = useState('');
  const [branches, setBranches] = useState<any[]>([]);
  const [branchOpen, setBranchOpen] = useState(false);
  const branchRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    async function load() {
      try {
        const [ordRes, brRes] = await Promise.all([
          api.get('/orders/pharmacy-orders'),
          api.get('/branches/my-branches'),
        ]);
        setOrders(ordRes.data?.data ?? ordRes.data ?? []);
        setBranches(brRes.data?.data ?? brRes.data ?? []);
      } catch { /* silently fail */ }
      finally { setLoading(false); }
    }
    load();
  }, []);

  const filtered = orders.filter(o => {
    if (tab !== 'ALL' && o.status !== tab) return false;
    if (branch && o.branchId !== branch) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        o.id?.toLowerCase().includes(q) ||
        o.patientName?.toLowerCase().includes(q) ||
        o.branchName?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  useEffect(() => { setPage(1); }, [tab, branch, search]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (branchRef.current && !branchRef.current.contains(e.target as Node)) {
        setBranchOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const countFor = (s: TabKey) =>
    s === 'ALL' ? 0 : orders.filter(o => o.status === s).length;

  const tabs: { key: TabKey; label: string }[] = [
    { key: 'ALL', label: t('pharmacyOwner.allOrders') },
    { key: 'PENDING', label: t('pharmacyOwner.pending') },
    { key: 'ACCEPTED', label: t('pharmacyOwner.accepted') },
    { key: 'READY_FOR_CHECKOUT', label: t('pharmacyOwner.readyForCheckout') },
    { key: 'COMPLETED', label: t('pharmacyOwner.completedTab') },
    { key: 'REJECTED', label: t('pharmacyOwner.rejected') },
  ];

  const headers = [
    t('pharmacyOwner.orderId'),
    t('pharmacyOwner.customer'),
    t('form.branch'),
    t('common.total'),
    t('common.status'),
    t('pharmacyOwner.staff'),
    t('common.date'),
    t('common.actions'),
  ];

  return (
    <div className="space-y-6">

      {/* Hero */}
      <div
        className="rounded-2xl p-6 lg:p-8"
        style={{ background: 'linear-gradient(135deg, #EBF5FF 0%, #DBEAFE 100%)' }}
      >
        <h1 className="text-3xl lg:text-4xl font-bold" style={{ color: NAVY }}>
          {t('pharmacyOwner.orderOverviewTitle')}
        </h1>
        <p className="mt-1 text-sm text-gray-500">{t('pharmacyOwner.orderOverviewSubtitle')}</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="flex-1 relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={t('pharmacyOwner.searchOrders')}
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2"
            style={{ '--tw-ring-color': BLUE } as React.CSSProperties}
          />
        </div>

        {/* Branch filter */}
        <div className="relative" ref={branchRef}>
          <button
            onClick={() => setBranchOpen(o => !o)}
            className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl bg-white text-sm text-gray-700 font-medium hover:bg-gray-50 transition-colors"
          >
            <GitBranch size={15} className="text-gray-500 shrink-0" />
            <span>{branch ? (branches.find((b: any) => b.id === branch)?.name ?? t('pharmacyOwner.allBranches')) : t('pharmacyOwner.allBranches')}</span>
            <ChevronDown size={14} className="text-gray-400 shrink-0" />
          </button>
          {branchOpen && (
            <div className="absolute left-0 top-full mt-1 z-20 min-w-[180px] bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
              {[{ id: '', name: t('pharmacyOwner.allBranches') }, ...branches].map((b: any) => (
                <button
                  key={b.id}
                  onClick={() => { setBranch(b.id); setBranchOpen(false); }}
                  className="w-full flex items-center justify-between px-4 py-2.5 text-sm text-left transition-colors"
                  style={branch === b.id ? { backgroundColor: BLUE, color: '#fff' } : {}}
                  onMouseEnter={e => { if (branch !== b.id) (e.currentTarget as HTMLElement).style.backgroundColor = '#F3F4F6'; }}
                  onMouseLeave={e => { if (branch !== b.id) (e.currentTarget as HTMLElement).style.backgroundColor = ''; }}
                >
                  {b.name}
                  {branch === b.id && <Check size={13} />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Date filter (UI-only for now) */}
        <div className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl bg-white text-sm text-gray-700 font-medium cursor-pointer hover:bg-gray-50 transition-colors">
          <Calendar size={15} className="text-gray-500" />
          <span>{t('pharmacyOwner.allDates')}</span>
          <ChevronDown size={14} className="text-gray-400" />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap">
        {tabs.map(({ key, label }) => {
          const c = countFor(key);
          const active = tab === key;
          return (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${active ? 'text-white' : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                }`}
              style={active ? { backgroundColor: BLUE } : {}}
            >
              {label}{c > 0 ? ` ${c}` : ''}
            </button>
          );
        })}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[750px]">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                {headers.map(h => (
                  <th
                    key={h}
                    className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-gray-400">
                    {t('common.loading')}
                  </td>
                </tr>
              ) : paged.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-gray-400">
                    {t('common.noData')}
                  </td>
                </tr>
              ) : (
                paged.map((order: any) => {
                  const dotColor = STATUS_COLORS[order.status] ?? '#9CA3AF';
                  return (
                    <tr
                      key={order.id}
                      className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                    >
                      <td className="px-5 py-4 text-sm font-medium text-gray-800">
                        #{order.id?.slice(0, 8)}
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-600">
                        {order.patientName ?? '—'}
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-600">
                        {order.branchName ?? '—'}
                      </td>
                      <td className="px-5 py-4 text-sm font-bold" style={{ color: BLUE }}>
                        {Number(order.total ?? 0).toLocaleString()} RWF
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className="inline-flex items-center gap-1.5 text-xs font-semibold"
                          style={{ color: dotColor }}
                        >
                          <span
                            className="w-2 h-2 rounded-full inline-block shrink-0"
                            style={{ backgroundColor: dotColor }}
                          />
                          {order.status?.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-500">
                        {order.staffName ?? '—'}
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-500">
                        {order.createdAt
                          ? new Date(order.createdAt).toLocaleString()
                          : '—'}
                      </td>
                      <td className="px-5 py-4">
                        <button
                          onClick={() => router.push(`/pharmacy/orders/${order.id}`)}
                          className="px-4 py-1.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          {t('common.view')}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination footer */}
        {!loading && filtered.length > 0 && (
          <div className="px-5 py-3.5 border-t border-gray-100 flex items-center justify-between">
            <p className="text-sm text-gray-500">
              {t('pharmacyOwner.showingOrders', {
                count: filtered.length,
                total: orders.length,
              })}
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={14} />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium transition-all ${page === p
                      ? 'text-white'
                      : 'text-gray-600 border border-gray-200 hover:bg-gray-50'
                    }`}
                  style={page === p ? { backgroundColor: BLUE } : {}}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
