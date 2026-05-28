'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '@/lib/api';
import { useFetch } from '@/hooks/useFetch';
import toast from 'react-hot-toast';
import { getErrorMessage } from '@/lib/errorHandler';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { LockClosedIcon, PlusIcon, ArrowsRightLeftIcon } from '@heroicons/react/24/outline';

const NAVY = '#1E4D8C';
const TEAL = '#2D9B8A';

const STATUS_STYLES: Record<string, string> = {
  PENDING:   'bg-yellow-100 text-yellow-800',
  APPROVED:  'bg-blue-100 text-blue-800',
  REJECTED:  'bg-red-100 text-red-800',
  SHIPPED:   'bg-orange-100 text-orange-800',
  COMPLETED: 'bg-green-100 text-green-800',
};

type Tab = 'outgoing' | 'incoming';

export default function BranchTransfersPage() {
  const { t } = useTranslation();
  const [tab, setTab] = useState<Tab>('outgoing');
  const [backendReady, setBackendReady] = useState(true);
  const [branches, setBranches] = useState<any[]>([]);
  const [medications, setMedications] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [myBranchId, setMyBranchId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    api.get('/branches/my-branch-details')
      .then(res => setMyBranchId(res.data?.id || null))
      .catch(() => {});
  }, []);

  const handleUpdateStatus = async (transferId: string, status: string) => {
    setUpdatingId(transferId);
    try {
      await api.patch(`/stock-transfers/${transferId}/status`, { status });
      toast.success(`Transfer status updated to ${status}`);
      refetch();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setUpdatingId(null);
    }
  };

  const [form, setForm] = useState({
    toBranchId: '',
    notes: '',
    items: [{ medicationId: '', quantity: '' }],
  });

  const { data, loading, refetch } = useFetch<any[]>(
    async (signal) => {
      try {
        const res = await api.get('/stock-transfers/branch', { signal });
        setBackendReady(true);
        return Array.isArray(res.data) ? res.data : res.data?.data ?? [];
      } catch (error: unknown) {
        if ((error as any)?.response?.status === 403 || (error as any)?.response?.status === 404) {
          setBackendReady(false);
        } else {
          toast.error(t('errors.failedToLoadTransfers'));
        }
        return [];
      }
    },
    []
  );

  const transfers = data ?? [];

  const fetchFormData = async () => {
    try {
      const [medsRes, branchesRes] = await Promise.all([
        api.get('/medications/pharmacy/my-medications').catch(() => ({ data: [] })),
        api.get('/branches/pharmacy-branches').catch(() => ({ data: [] })),
      ]);
      setMedications(Array.isArray(medsRes.data) ? medsRes.data : []);
      setBranches(Array.isArray(branchesRes.data) ? branchesRes.data : []);
    } catch {
      // General catch-all
    }
  };

  const handleOpenForm = () => {
    setShowForm(true);
    fetchFormData();
  };

  const addItem = () => setForm(f => ({ ...f, items: [...f.items, { medicationId: '', quantity: '' }] }));
  const removeItem = (i: number) => setForm(f => ({ ...f, items: f.items.filter((_, idx) => idx !== i) }));
  const updateItem = (i: number, field: string, value: string) => {
    setForm(f => ({ ...f, items: f.items.map((item, idx) => idx === i ? { ...item, [field]: value } : item) }));
  };

  const handleSubmitTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.toBranchId) { toast.error(t('form.selectDestinationBranch')); return; }
    if (form.items.some(item => !item.medicationId || !item.quantity)) {
      toast.error(t('form.enterMedicationItems')); return;
    }
    setSubmitting(true);
    try {
      // BACKEND PENDING: POST /stock-transfers
      // This endpoint does not exist yet. See comment in fetchTransfers above.
      await api.post('/stock-transfers', {
        toBranchId: form.toBranchId,
        notes: form.notes || undefined,
        items: form.items.map(item => ({
          medicationId: item.medicationId,
          quantity: parseInt(item.quantity),
        })),
      });
      toast.success(t('success.transferSubmitted'));
      setShowForm(false);
      setForm({ toBranchId: '', notes: '', items: [{ medicationId: '', quantity: '' }] });
      refetch();
    } catch (error: unknown) {
      if ((error as any)?.response?.status === 403 || (error as any)?.response?.status === 404) {
        setBackendReady(false);
        toast.error(t('errors.backendNotEnabledTransfers'));
      } else {
        toast.error(getErrorMessage(error));
      }
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });

  const outgoing = transfers.filter((t: any) => t.fromBranchId === myBranchId);
  const incoming = transfers.filter((t: any) => t.toBranchId === myBranchId);
  const displayed = tab === 'outgoing' ? outgoing : incoming;

  return (
    <div className="space-y-6">

      {/* Hero */}
      <div className="rounded-2xl p-6 lg:p-8 text-white" style={{ backgroundColor: NAVY }}>
        <h1 className="text-2xl lg:text-3xl font-bold">{t('transfers.stockTransfers')}</h1>
        <p className="mt-1 text-white/70">{t('transfers.requestManage')}</p>
      </div>

      {/* Backend pending banner */}
      {!backendReady && (
        <div className="flex items-start gap-3 px-4 py-4 rounded-xl border border-yellow-200 bg-yellow-50">
          <LockClosedIcon className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-yellow-800">{t('branch.backendPending')}</p>
            <p className="text-xs text-yellow-700 mt-1 space-y-1">
              <span className="block">
                The stock transfer feature is fully built on the frontend. The backend team needs to create
                the following endpoints using the existing
                <span className="font-mono font-bold mx-1">StockTransfer</span>
                model in the Prisma schema:
              </span>
              <span className="block">
                1. <span className="font-mono font-bold">GET /stock-transfers/branch</span> — Role.BRANCH_MANAGER — returns all transfers for the manager's branch
              </span>
              <span className="block">
                2. <span className="font-mono font-bold">POST /stock-transfers</span> — Role.BRANCH_MANAGER — creates a new transfer request
              </span>
              <span className="block">
                3. <span className="font-mono font-bold">PATCH /stock-transfers/:id/status</span> — Role.BRANCH_MANAGER — approve, reject, ship, or complete a transfer
              </span>
              <span className="block">{t('transfers.noFrontendChanges')}</span>
            </p>
          </div>
        </div>
      )}

      {/* Summary cards */}
      {backendReady && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: t('transfers.totalTransfers'), value: transfers.length,                                           dark: false },
            { label: t('transfers.pending'),         value: transfers.filter((t: any) => t.status === 'PENDING').length,       dark: false },
            { label: t('transfers.inTransit'),       value: transfers.filter((t: any) => t.status === 'SHIPPED').length,       dark: false },
            { label: t('transfers.completed'),       value: transfers.filter((t: any) => t.status === 'COMPLETED').length,     dark: true  },
          ].map(s => (
            <div
              key={s.label}
              className="rounded-2xl p-5 flex items-center justify-between"
              style={{ backgroundColor: s.dark ? NAVY : TEAL }}
            >
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
      )}

      {/* Actions row */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex bg-gray-100 rounded-xl p-1 w-fit">
          {([
            { key: 'outgoing', label: `Outgoing (${outgoing.length})` },
            { key: 'incoming', label: `Incoming (${incoming.length})` },
          ] as { key: Tab; label: string }[]).map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${tab === t.key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <button
          onClick={handleOpenForm}
          className="flex items-center gap-2 px-4 py-2.5 text-white rounded-xl text-sm font-medium"
          style={{ backgroundColor: TEAL }}
        >
          <PlusIcon className="w-4 h-4" /> Request Transfer
        </button>
      </div>

      {/* Transfer request form */}
      {showForm && (
        <form onSubmit={handleSubmitTransfer} className="bg-white rounded-2xl p-6 border border-gray-100 space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-800">{t('transfers.newTransferRequest')}</h3>
            <button type="button" onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600 text-sm">{t('common.cancel')}</button>
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
              <div className="px-3 py-2.5 border border-gray-200 rounded-lg bg-gray-50">
                <p className="text-xs text-gray-500">
                  Branch list requires a backend endpoint. The backend team needs to add
                  <span className="font-mono font-bold mx-1">GET /branches/pharmacy-branches</span>
                  accessible to Role.BRANCH_MANAGER. For now, enter the branch ID manually:
                </p>
                <input type="text" required value={form.toBranchId}
                  onChange={e => setForm(f => ({ ...f, toBranchId: e.target.value }))}
                  placeholder={t('transfers.branchIdPlaceholder')}
                  className="w-full mt-2 px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-teal-400" />
              </div>
            )}
          </div>

          {/* Medication items */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-semibold text-gray-700">
                Medications <span className="text-red-500">*</span>
              </label>
              <button type="button" onClick={addItem}
                className="text-xs font-medium hover:underline"
                style={{ color: TEAL }}>
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
                      className="px-2 py-2 text-red-400 hover:text-red-600 text-sm">
                      x
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">{t('transfers.notes')}</label>
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

      {/* Transfers list */}
      {loading ? (
        <div className="flex justify-center py-16"><LoadingSpinner /></div>
      ) : !backendReady ? (
        <div className="bg-white rounded-2xl p-16 text-center border border-gray-100">
          <LockClosedIcon className="w-12 h-12 text-gray-200 mx-auto mb-4" />
          <p className="text-gray-500 font-medium">{t('transfers.transferAccessPending')}</p>
          <p className="text-gray-400 text-sm mt-1">{t('transfers.seeAboveForBackend')}</p>
        </div>
      ) : displayed.length === 0 ? (
        <div className="bg-white rounded-2xl p-16 text-center border border-gray-100">
          <ArrowsRightLeftIcon className="w-12 h-12 text-gray-200 mx-auto mb-4" />
          <p className="text-gray-500 font-medium">
            No {tab} transfers yet
          </p>
          <p className="text-gray-400 text-sm mt-1">
            {tab === 'outgoing' ? t('transfers.startNewRequest') : t('transfers.incomingWillAppear')}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {displayed.map((t: any) => (
            <div key={t.id} className="bg-white rounded-2xl border border-gray-100 p-5">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-3 flex-wrap">
                    <p className="font-semibold text-gray-900 text-sm">
                      {tab === 'outgoing'
                        ? `To: ${t.toBranch?.name ?? t.toBranchId}`
                        : `From: ${t.fromBranch?.name ?? t.fromBranchId}`}
                    </p>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${STATUS_STYLES[t.status] ?? 'bg-gray-100 text-gray-600'}`}>
                      {t.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">Requested: {formatDate(t.createdAt)}</p>
                  {t.notes && <p className="text-xs text-gray-500 italic">{t.notes}</p>}
                  {t.items && t.items.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {t.items.map((item: any, i: number) => (
                        <span key={i} className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded-full">
                          {item.medication?.name ?? item.medicationId} x{item.quantity}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Actions */}
                {backendReady && (
                  <div className="flex flex-col sm:flex-row gap-2 shrink-0 self-center">
                    {/* If current branch is B (toBranchId, receiver of the request, sender of the stock) */}
                    {t.toBranchId === myBranchId && t.status === 'PENDING' && (
                      <>
                        <button
                          type="button"
                          onClick={() => handleUpdateStatus(t.id, 'APPROVED')}
                          disabled={updatingId === t.id}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg disabled:opacity-50 transition"
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          onClick={() => handleUpdateStatus(t.id, 'REJECTED')}
                          disabled={updatingId === t.id}
                          className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-lg disabled:opacity-50 transition"
                        >
                          Reject
                        </button>
                      </>
                    )}

                    {/* If current branch is B (toBranchId, sender of the stock) and status is APPROVED */}
                    {t.toBranchId === myBranchId && t.status === 'APPROVED' && (
                      <button
                        type="button"
                        onClick={() => handleUpdateStatus(t.id, 'SHIPPED')}
                        disabled={updatingId === t.id}
                        className="px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold rounded-lg disabled:opacity-50 transition"
                      >
                        Ship Transfer
                      </button>
                    )}

                    {/* If current branch is A (fromBranchId, initiator, receiver of the stock) and status is SHIPPED */}
                    {t.fromBranchId === myBranchId && t.status === 'SHIPPED' && (
                      <button
                        type="button"
                        onClick={() => handleUpdateStatus(t.id, 'COMPLETED')}
                        disabled={updatingId === t.id}
                        className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold rounded-lg disabled:opacity-50 transition"
                      >
                        Complete / Receive
                      </button>
                    )}

                    {/* If current branch is A (fromBranchId, initiator) and status is PENDING */}
                    {t.fromBranchId === myBranchId && t.status === 'PENDING' && (
                      <button
                        type="button"
                        onClick={() => handleUpdateStatus(t.id, 'REJECTED')}
                        disabled={updatingId === t.id}
                        className="px-3 py-1.5 border border-red-200 text-red-600 hover:bg-red-50 text-xs font-semibold rounded-lg disabled:opacity-50 transition"
                      >
                        Cancel Request
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
