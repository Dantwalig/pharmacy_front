'use client';

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import api, { unwrapData } from '@/lib/api';// This is a placeholder import. The backend team needs to create the necessary endpoints for stock transfers as described in the comments below.
import toast from 'react-hot-toast';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import {
  ArrowsRightLeftIcon,
  PlusIcon,
  ClockIcon,
  WrenchScrewdriverIcon,
} from '@heroicons/react/24/outline';

const NAVY = '#1E4D8C';
const TEAL = '#2D9B8A';

const STATUS_STYLES: Record<string, string> = {
  PENDING:   'bg-yellow-100 text-yellow-800',
  APPROVED:  'bg-blue-100   text-blue-800',
  REJECTED:  'bg-red-100    text-red-800',
  SHIPPED:   'bg-orange-100 text-orange-800',
  COMPLETED: 'bg-green-100  text-green-800',
};

type Tab              = 'outgoing' | 'incoming';
type BackendState     = 'loading' | 'unavailable' | 'ready';

// ── Feature-unavailable empty state ───────────────────────────────────────

function FeatureUnavailable() {
  return (
    <div className="flex flex-col items-center justify-center py-24 px-6 text-center bg-white rounded-2xl border border-gray-100">
      {/* Icon cluster */}
      <div className="relative mb-6">
        <div className="w-20 h-20 rounded-full flex items-center justify-center"
          style={{ backgroundColor: '#F0FAFA' }}>
          <ArrowsRightLeftIcon className="w-9 h-9" style={{ color: TEAL }} />
        </div>
        {/* Badge */}
        <span className="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-amber-100 border-2 border-white flex items-center justify-center">
          <ClockIcon className="w-3.5 h-3.5 text-amber-600" />
        </span>
      </div>

      <h2 className="text-xl font-bold text-gray-800 mb-2">
        Stock Transfers Coming Soon
      </h2>
      <p className="text-gray-500 text-sm max-w-sm leading-relaxed mb-6">
        This feature is not yet available. The backend team is currently building
        the transfer endpoints — once deployed, everything will work automatically
        with no changes needed here.
      </p>

      {/* Status pill */}
      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-amber-200 bg-amber-50">
        <WrenchScrewdriverIcon className="w-4 h-4 text-amber-600 shrink-0" />
        <span className="text-xs font-semibold text-amber-700">Backend implementation in progress</span>
      </div>
    </div>
  );
}

// ── Per-tab empty state (backend ready, just no data yet) ─────────────────

function NoTransfers({ tab, onRequest }: { tab: Tab; onRequest: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center bg-white rounded-2xl border border-gray-100">
      <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
        style={{ backgroundColor: '#F0FAFA' }}>
        <ArrowsRightLeftIcon className="w-7 h-7" style={{ color: TEAL }} />
      </div>
      <h3 className="text-lg font-semibold text-gray-700 mb-1">
        No {tab === 'outgoing' ? 'outgoing' : 'incoming'} transfers yet
      </h3>
      <p className="text-gray-400 text-sm mb-5">
        {tab === 'outgoing'
          ? 'Start a new request to send stock to another branch.'
          : 'Incoming transfer requests from other branches will appear here.'}
      </p>
      {tab === 'outgoing' && (
        <button
          onClick={onRequest}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90"
          style={{ backgroundColor: TEAL }}
        >
          <PlusIcon className="w-4 h-4" />
          Request Transfer
        </button>
      )}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────

export default function BranchTransfersPage() {
  const { t } = useTranslation();

  const [backendState, setBackendState] = useState<BackendState>('loading');
  const [tab, setTab]                   = useState<Tab>('outgoing');
  const [transfers, setTransfers]       = useState<any[]>([]);
  const [showForm, setShowForm]         = useState(false);
  const [branches, setBranches]         = useState<any[]>([]);
  const [medications, setMedications]   = useState<any[]>([]);
  const [submitting, setSubmitting]     = useState(false);
  const [form, setForm] = useState({
    toBranchId: '',
    notes: '',
    items: [{ medicationId: '', quantity: '' }],
  });

  // ── Fetch ────────────────────────────────────────────────────────────────
  useEffect(() => { fetchTransfers(); }, []);

  const fetchTransfers = async () => {
    setBackendState('loading');
    try {
      const res = await api.get('/stock-transfers/branch');
      setTransfers(Array.isArray(res.data) ? res.data : res.data?.data ?? []);
      setBackendState('ready');
    } catch (err: any) {
      const status = err?.response?.status;
      // 404 → endpoint doesn't exist yet; 403 → role not wired yet
      // Both mean the backend feature isn't deployed — show the unavailable state
      if (status === 404 || status === 403) {
        setBackendState('unavailable');
      } else {
        // Unexpected error (500, network) — show unavailable rather than a crash
        setBackendState('unavailable');
        console.error('Transfers fetch error:', err);
      }
    }
  };

  const fetchFormData = async () => {
    try {
      const [medsRes, branchRes] = await Promise.allSettled([
        api.get('/medications/pharmacy/my-medications'),
        api.get('/branches/pharmacy-branches'),
      ]);
      if (medsRes.status === 'fulfilled')
        setMedications(Array.isArray(medsRes.value.data) ? medsRes.value.data : []);
      if (branchRes.status === 'fulfilled')
        setBranches(Array.isArray(branchRes.value.data?.data ?? branchRes.value.data)
          ? (branchRes.value.data?.data ?? branchRes.value.data) : []);
    } catch { /* dropdowns degrade gracefully to text inputs */ }
  };

  // ── Form helpers ─────────────────────────────────────────────────────────
  const handleOpenForm = () => { setShowForm(true); fetchFormData(); };
  const addItem        = () => setForm(f => ({ ...f, items: [...f.items, { medicationId: '', quantity: '' }] }));
  const removeItem     = (i: number) => setForm(f => ({ ...f, items: f.items.filter((_, idx) => idx !== i) }));
  const updateItem     = (i: number, field: string, value: string) =>
    setForm(f => ({ ...f, items: f.items.map((item, idx) => idx === i ? { ...item, [field]: value } : item) }));

  const handleSubmitTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.toBranchId)                                          { toast.error(t('form.selectDestinationBranch')); return; }
    if (form.items.some(i => !i.medicationId || !i.quantity))     { toast.error(t('form.enterMedicationItems'));    return; }
    setSubmitting(true);
    try {
      await api.post('/stock-transfers', {
        toBranchId: form.toBranchId,
        notes:      form.notes || undefined,
        items:      form.items.map(i => ({ medicationId: i.medicationId, quantity: parseInt(i.quantity) })),
      });
      toast.success(t('success.transferSubmitted'));
      setShowForm(false);
      setForm({ toBranchId: '', notes: '', items: [{ medicationId: '', quantity: '' }] });
      fetchTransfers();
    } catch (err: any) {
      const status = err?.response?.status;
      if (status === 404 || status === 403) {
        setBackendState('unavailable');
      } else {
        toast.error(err.response?.data?.message || t('transfers.failedToSubmit'));
      }
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });

  const outgoing  = transfers.filter(t => t.direction === 'outgoing' || t.isOutgoing);
  const incoming  = transfers.filter(t => t.direction === 'incoming' || t.isIncoming);
  const displayed = tab === 'outgoing' ? outgoing : incoming;

  return (
    <div className="space-y-6">

      {/* Hero */}
      <div className="rounded-2xl p-6 lg:p-8 text-white" style={{ backgroundColor: NAVY }}>
        <div className="flex items-center gap-3 mb-1">
          <ArrowsRightLeftIcon className="w-6 h-6 text-white/70" />
          <h1 className="text-2xl lg:text-3xl font-bold">{t('transfers.stockTransfers')}</h1>
        </div>
        <p className="text-white/60 text-sm">{t('transfers.requestManage')}</p>
      </div>

      {/* ── Loading ─────────────────────────────────────────────────────── */}
      {backendState === 'loading' && (
        <div className="flex justify-center py-24">
          <LoadingSpinner />
        </div>
      )}

      {/* ── Feature unavailable ─────────────────────────────────────────── */}
      {backendState === 'unavailable' && <FeatureUnavailable />}

      {/* ── Ready ───────────────────────────────────────────────────────── */}
      {backendState === 'ready' && (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: t('transfers.totalTransfers'), value: transfers.length,                                        dark: false },
              { label: t('transfers.pending'),         value: transfers.filter(t => t.status === 'PENDING').length,   dark: false },
              { label: t('transfers.inTransit'),       value: transfers.filter(t => t.status === 'SHIPPED').length,   dark: false },
              { label: t('transfers.completed'),       value: transfers.filter(t => t.status === 'COMPLETED').length, dark: true  },
            ].map(s => (
              <div key={s.label} className="rounded-2xl p-5 flex items-center justify-between"
                style={{ backgroundColor: s.dark ? NAVY : TEAL }}>
                <div>
                  <p className="text-white/80 text-sm">{s.label}</p>
                  <p className="text-white text-2xl font-bold mt-1">{s.value}</p>
                </div>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-white/15">
                  <ArrowsRightLeftIcon className="w-5 h-5 text-white" />
                </div>
              </div>
            ))}
          </div>

          {/* Actions row */}
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex bg-gray-100 rounded-xl p-1 w-fit">
              {([
                { key: 'outgoing', label: `Outgoing (${outgoing.length})` },
                { key: 'incoming', label: `Incoming (${incoming.length})` },
              ] as { key: Tab; label: string }[]).map(item => (
                <button key={item.key} onClick={() => setTab(item.key)}
                  className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
                    tab === item.key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                  }`}>
                  {item.label}
                </button>
              ))}
            </div>

            <button onClick={handleOpenForm}
              className="flex items-center gap-2 px-4 py-2.5 text-white rounded-xl text-sm font-medium hover:opacity-90 transition-opacity"
              style={{ backgroundColor: TEAL }}>
              <PlusIcon className="w-4 h-4" /> Request Transfer
            </button>
          </div>

          {/* Transfer request form */}
          {showForm && (
            <form onSubmit={handleSubmitTransfer}
              className="bg-white rounded-2xl p-6 border border-gray-100 space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-800">{t('transfers.newTransferRequest')}</h3>
                <button type="button" onClick={() => setShowForm(false)}
                  className="text-gray-400 hover:text-gray-600 text-sm">
                  {t('common.cancel')}
                </button>
              </div>

              {/* Destination branch */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Destination Branch <span className="text-red-500">*</span>
                </label>
                {branches.length > 0 ? (
                  <select required value={form.toBranchId}
                    onChange={e => setForm(f => ({ ...f, toBranchId: e.target.value }))}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-teal-400">
                    <option value="">{t('transfers.selectBranch')}</option>
                    {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                ) : (
                  <input type="text" required value={form.toBranchId}
                    onChange={e => setForm(f => ({ ...f, toBranchId: e.target.value }))}
                    placeholder={t('transfers.branchIdPlaceholder')}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-teal-400" />
                )}
              </div>

              {/* Medication items */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Medications <span className="text-red-500">*</span>
                  </label>
                  <button type="button" onClick={addItem}
                    className="text-xs font-medium hover:underline" style={{ color: TEAL }}>
                    + Add Item
                  </button>
                </div>
                <div className="space-y-2">
                  {form.items.map((item, i) => (
                    <div key={i} className="flex gap-2 items-start">
                      {medications.length > 0 ? (
                        <select required value={item.medicationId}
                          onChange={e => updateItem(i, 'medicationId', e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-teal-400">
                          <option value="">{t('transfers.selectMedication')}</option>
                          {medications.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                        </select>
                      ) : (
                        <input type="text" required value={item.medicationId}
                          onChange={e => updateItem(i, 'medicationId', e.target.value)}
                          placeholder={t('transfers.medicationIdPlaceholder')}
                          className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-teal-400" />
                      )}
                      <input type="number" required min="1" value={item.quantity}
                        onChange={e => updateItem(i, 'quantity', e.target.value)}
                        placeholder="Qty"
                        className="w-20 px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-teal-400" />
                      {form.items.length > 1 && (
                        <button type="button" onClick={() => removeItem(i)}
                          className="px-2 py-2 text-red-400 hover:text-red-600 text-sm">✕</button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  {t('transfers.notes')}
                </label>
                <textarea rows={2} value={form.notes}
                  onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                  placeholder={t('transfers.notesPlaceholder')}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-teal-400 resize-none" />
              </div>

              <div className="flex gap-3">
                <button type="button" onClick={() => setShowForm(false)}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold border border-gray-200 text-gray-600 hover:bg-gray-50">
                  Cancel
                </button>
                <button type="submit" disabled={submitting}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-50"
                  style={{ backgroundColor: TEAL }}>
                  {submitting ? t('transfers.submitting') : t('transfers.submitRequest')}
                </button>
              </div>
            </form>
          )}

          {/* Transfers list / per-tab empty state */}
          {displayed.length === 0 ? (
            <NoTransfers tab={tab} onRequest={handleOpenForm} />
          ) : (
            <div className="space-y-3">
              {displayed.map(item => (
                <div key={item.id} className="bg-white rounded-2xl border border-gray-100 p-5">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-3 flex-wrap">
                        <p className="font-semibold text-gray-900 text-sm">
                          {tab === 'outgoing'
                            ? `To: ${item.toBranch?.name ?? item.toBranchId}`
                            : `From: ${item.fromBranch?.name ?? item.fromBranchId}`}
                        </p>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${STATUS_STYLES[item.status] ?? 'bg-gray-100 text-gray-600'}`}>
                          {item.status}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">Requested: {formatDate(item.createdAt)}</p>
                      {item.notes && <p className="text-xs text-gray-500 italic">{item.notes}</p>}
                      {item.items?.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-1">
                          {item.items.map((med: any, i: number) => (
                            <span key={i} className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded-full">
                              {med.medication?.name ?? med.medicationId} x{med.quantity}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
