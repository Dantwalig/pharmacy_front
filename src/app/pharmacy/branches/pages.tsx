'use client';
// src/app/(pharmacy)/branches/page.tsx
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/navigation';
import { Search, Plus, X } from 'lucide-react';
import { api } from '@/lib/api';

const NAVY = '#1E4D8C';
const TEAL = '#2D9B8A';

export default function BranchManagementPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const [branches, setBranches] = useState<any[]>([]);
  const [search, setSearch]     = useState('');
  const [loading, setLoading]   = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm]          = useState({ name: '', address: '', managerEmail: '' });
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    try {
      const res = await api.get('/branches');
      setBranches(res.data?.data ?? res.data ?? []);
    } catch { }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filtered = branches.filter(b =>
    !search ||
    b.name?.toLowerCase().includes(search.toLowerCase()) ||
    b.address?.toLowerCase().includes(search.toLowerCase())
  );

  const handleAdd = async () => {
    setSubmitting(true);
    try {
      await api.post('/branches', form);
      setShowModal(false);
      setForm({ name: '', address: '', managerEmail: '' });
      load();
    } catch { }
    setSubmitting(false);
  };

  const statusStyle = (s: string) =>
    s === 'APPROVED' || s === 'ACTIVE'
      ? { bg: '#D1FAE5', text: '#065F46', label: 'Active' }
      : { bg: '#FEE2E2', text: '#991B1B', label: 'Inactive' };

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="rounded-2xl p-8 text-white" style={{ backgroundColor: NAVY }}>
        <h1 className="text-3xl font-bold">{t('pharmacyOwner.branchManagementTitle')}</h1>
        <p className="mt-1 text-white/70">{t('pharmacyOwner.branchManagementSubtitle')}</p>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search size={16} className="absolute left-3 top-3 text-gray-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={t('pharmacyOwner.searchBranches')}
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
          />
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-medium"
          style={{ backgroundColor: TEAL }}
        >
          <Plus size={16} />
          {t('pharmacyOwner.addBranch')}
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              {[
                t('pharmacyOwner.branchName'),
                t('pharmacyOwner.location'),
                t('pharmacyOwner.manager'),
                t('pharmacyOwner.monthlyRevenuCol'),
                t('common.status'),
                t('common.actions'),
              ].map(h => (
                <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="py-12 text-center text-gray-400">{t('common.loading')}</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={6} className="py-12 text-center text-gray-400">{t('common.noData')}</td></tr>
            ) : (
              filtered.map((b: any) => {
                const st = statusStyle(b.status);
                return (
                  <tr key={b.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                    <td className="px-5 py-4 text-sm font-semibold text-gray-800">{b.name}</td>
                    <td className="px-5 py-4 text-sm text-gray-500">{b.address}</td>
                    <td className="px-5 py-4 text-sm">
                      {b.managerName
                        ? <span className="font-medium" style={{ color: TEAL }}>{b.managerName}</span>
                        : <span className="text-amber-500 font-medium">{t('common.unassigned')}</span>
                      }
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-700">
                      RWF {b.monthlyRevenue?.toLocaleString() ?? '0'}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className="px-2.5 py-1 rounded-full text-xs font-semibold"
                        style={{ backgroundColor: st.bg, color: st.text }}
                      >
                        {st.label}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <button
                        onClick={() => router.push(`/pharmacy/branches/${b.id}`)}
                        className="text-sm font-medium hover:underline"
                        style={{ color: NAVY }}
                      >
                        {t('common.viewDetails')}
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Add Branch Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-gray-900">{t('pharmacyOwner.addBranch')}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('pharmacyOwner.branchName')} *
                </label>
                <input
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('pharmacyOwner.location')} *
                </label>
                <input
                  value={form.address}
                  onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Manager Email
                </label>
                <input
                  value={form.managerEmail}
                  onChange={e => setForm(f => ({ ...f, managerEmail: e.target.value }))}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={handleAdd}
                disabled={submitting || !form.name || !form.address}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium text-white disabled:opacity-60"
                style={{ backgroundColor: TEAL }}
              >
                {submitting ? t('common.saving') : t('common.add')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}