'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import {
  ClipboardDocumentListIcon,
  CheckCircleIcon,
  XCircleIcon,
  LockClosedIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';

const NAVY = '#1E4D8C';
const TEAL = '#2D9B8A';

const STATUS_STYLES: Record<string, string> = {
  PENDING:  'bg-yellow-100 text-yellow-800',
  APPROVED: 'bg-green-100 text-green-800',
  REJECTED: 'bg-red-100 text-red-800',
};

type Tab = 'queue' | 'history';

export default function StaffPrescriptionsPage() {
  const [tab, setTab] = useState<Tab>('queue');
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [backendReady, setBackendReady] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => { fetchPrescriptions(); }, []);

  const fetchPrescriptions = async () => {
    setLoading(true);
    try {
      // BACKEND PENDING: There is currently no endpoint that allows a PHARMACIST to list
      // branch prescriptions. The backend team needs to create one, e.g.:
      //   GET /prescriptions/branch  →  Role.PHARMACIST, Role.BRANCH_MANAGER
      // or extend the existing GET /prescriptions/my-prescriptions to support staff roles.
      //
      // When that endpoint is ready, replace the line below with the correct path.
      // Example: const res = await api.get('/prescriptions/branch');
      //
      // Additionally, PUT /prescriptions/:id/status currently restricts to Role.PHARMACY only.
      // The backend team needs to add Role.PHARMACIST to that endpoint as well.

      const res = await api.get('/prescriptions/branch'); // endpoint to be created by backend team
      setPrescriptions(Array.isArray(res.data) ? res.data : res.data?.data ?? []);
      setBackendReady(true);
    } catch (err: any) {
      if (err?.response?.status === 403 || err?.response?.status === 404) {
        setBackendReady(false);
      } else {
        toast.error('Failed to load prescriptions');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (id: string) => {
    setActionId(id);
    try {
      // BACKEND PENDING: PUT /prescriptions/:id/status
      // Currently restricts to Role.PHARMACY only.
      // Backend team needs to add Role.PHARMACIST to this endpoint's @Roles decorator.
      await api.put(`/prescriptions/${id}/status`, { status: 'APPROVED' });
      toast.success('Prescription verified');
      setPrescriptions(prev => prev.map(p => p.id === id ? { ...p, status: 'APPROVED' } : p));
    } catch (err: any) {
      if (err?.response?.status === 403) {
        setBackendReady(false);
        toast.error('Backend access not yet enabled. See banner above.');
      } else {
        toast.error(err.response?.data?.message || 'Failed to verify prescription');
      }
    } finally {
      setActionId(null);
    }
  };

  const handleReject = async (id: string) => {
    if (!rejectReason.trim()) { toast.error('Please provide a rejection reason'); return; }
    setActionId(id);
    try {
      // BACKEND PENDING: PUT /prescriptions/:id/status
      // Same endpoint, same pending backend role update.
      await api.put(`/prescriptions/${id}/status`, { status: 'REJECTED', rejectionReason: rejectReason });
      toast.success('Prescription rejected');
      setPrescriptions(prev => prev.map(p => p.id === id ? { ...p, status: 'REJECTED', rejectionReason: rejectReason } : p));
      setRejectingId(null);
      setRejectReason('');
    } catch (err: any) {
      if (err?.response?.status === 403) {
        setBackendReady(false);
        toast.error('Backend access not yet enabled. See banner above.');
      } else {
        toast.error(err.response?.data?.message || 'Failed to reject prescription');
      }
    } finally {
      setActionId(null);
    }
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });

  const queue   = prescriptions.filter(p => p.status === 'PENDING');
  const history = prescriptions.filter(p => p.status !== 'PENDING');

  const displayed = tab === 'queue' ? queue : history;

  return (
    <div className="space-y-6">

      {/* Hero */}
      <div className="rounded-2xl p-6 lg:p-8 text-white" style={{ backgroundColor: NAVY }}>
        <h1 className="text-2xl lg:text-3xl font-bold">Prescriptions</h1>
        <p className="mt-1 text-white/70">Review, verify, and reject patient prescriptions</p>
      </div>

      {/* Backend pending banner */}
      {!backendReady && (
        <div className="flex items-start gap-3 px-4 py-4 rounded-xl border border-yellow-200 bg-yellow-50">
          <LockClosedIcon className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-yellow-800">Backend access pending</p>
            <p className="text-xs text-yellow-700 mt-1 space-y-1">
              <span className="block">
                1. The backend team needs to create a new endpoint to list branch prescriptions for pharmacists,
                e.g. <span className="font-mono font-bold">GET /prescriptions/branch</span> with <span className="font-mono font-bold">Role.PHARMACIST</span>.
              </span>
              <span className="block">
                2. The backend team needs to add <span className="font-mono font-bold">Role.PHARMACIST</span> to
                <span className="font-mono font-bold mx-1">PUT /prescriptions/:id/status</span> so verify and reject actions work.
              </span>
              <span className="block">The UI below is fully built. No frontend changes will be needed once access is granted.</span>
            </p>
          </div>
        </div>
      )}

      {/* Summary cards */}
      {backendReady && (
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Pending Review', value: queue.length,                                        dark: false },
            { label: 'Verified',       value: prescriptions.filter(p => p.status === 'APPROVED').length, dark: false },
            { label: 'Rejected',       value: prescriptions.filter(p => p.status === 'REJECTED').length, dark: true },
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
                <ClipboardDocumentListIcon className="w-5 h-5 text-white" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab toggle */}
      <div className="flex bg-gray-100 rounded-xl p-1 w-fit">
        {([
          { key: 'queue',   label: `Pending Queue (${queue.length})` },
          { key: 'history', label: `History (${history.length})` },
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

      {/* Content */}
      {loading ? (
        <div className="flex justify-center py-16"><LoadingSpinner /></div>
      ) : !backendReady ? (
        <div className="bg-white rounded-2xl p-16 text-center border border-gray-100">
          <LockClosedIcon className="w-12 h-12 text-gray-200 mx-auto mb-4" />
          <p className="text-gray-500 font-medium">Prescription access is pending</p>
          <p className="text-gray-400 text-sm mt-1">See the banner above for what the backend team needs to do</p>
        </div>
      ) : displayed.length === 0 ? (
        <div className="bg-white rounded-2xl p-16 text-center border border-gray-100">
          <ClockIcon className="w-12 h-12 text-gray-200 mx-auto mb-4" />
          <p className="text-gray-500 font-medium">
            {tab === 'queue' ? 'No prescriptions pending review' : 'No prescription history yet'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {displayed.map(p => (
            <div key={p.id} className="bg-white rounded-2xl border border-gray-100 p-5">
              <div className="flex items-start justify-between gap-4 flex-wrap">

                {/* Left: patient info and prescription details */}
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-3 flex-wrap">
                    <p className="font-semibold text-gray-900 text-sm">
                      {p.patient
                        ? `${p.patient.firstName} ${p.patient.lastName}`
                        : `Prescription #${p.id.slice(0, 8)}`}
                    </p>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${STATUS_STYLES[p.status] ?? 'bg-gray-100 text-gray-600'}`}>
                      {p.status}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                    <span>Submitted: {formatDate(p.createdAt)}</span>
                    {p.reviewedAt && <span>Reviewed: {formatDate(p.reviewedAt)}</span>}
                    {p.fileName && <span>File: {p.fileName}</span>}
                  </div>

                  {/* Extracted medications from AI processing if available */}
                  {p.extractedMedications && Array.isArray(p.extractedMedications) && p.extractedMedications.length > 0 && (
                    <div className="mt-2">
                      <p className="text-xs font-semibold text-gray-500 mb-1">Extracted medications:</p>
                      <div className="flex flex-wrap gap-1.5">
                        {p.extractedMedications.map((m: any, i: number) => (
                          <span key={i} className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded-full">
                            {m.medicationName}{m.dosage ? ` — ${m.dosage}` : ''}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Rejection reason */}
                  {p.status === 'REJECTED' && p.rejectionReason && (
                    <p className="text-xs text-red-600 mt-1">Reason: {p.rejectionReason}</p>
                  )}

                  {/* Prescription file link */}
                  {p.fileUrl && (
                    <a
                      href={p.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex text-xs font-medium underline mt-1"
                      style={{ color: TEAL }}
                    >
                      View prescription file
                    </a>
                  )}
                </div>

                {/* Right: actions — only show for pending prescriptions in queue tab */}
                {tab === 'queue' && p.status === 'PENDING' && (
                  <div className="flex flex-col gap-2 shrink-0">
                    {rejectingId === p.id ? (
                      <div className="space-y-2 w-64">
                        <textarea
                          rows={2}
                          value={rejectReason}
                          onChange={e => setRejectReason(e.target.value)}
                          placeholder="Rejection reason (required)"
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs outline-none focus:border-red-400 resize-none"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => { setRejectingId(null); setRejectReason(''); }}
                            className="flex-1 py-1.5 text-xs font-medium border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleReject(p.id)}
                            disabled={!!actionId}
                            className="flex-1 py-1.5 text-xs font-medium text-white rounded-lg disabled:opacity-50 bg-red-600 hover:bg-red-700"
                          >
                            {actionId === p.id ? 'Rejecting...' : 'Confirm Reject'}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <button
                          onClick={() => handleVerify(p.id)}
                          disabled={!!actionId}
                          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white disabled:opacity-50 transition-all"
                          style={{ backgroundColor: TEAL }}
                        >
                          <CheckCircleIcon className="w-4 h-4" />
                          {actionId === p.id ? 'Verifying...' : 'Verify'}
                        </button>
                        <button
                          onClick={() => { setRejectingId(p.id); setRejectReason(''); }}
                          disabled={!!actionId}
                          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-red-600 border border-red-200 hover:bg-red-50 disabled:opacity-50 transition-all"
                        >
                          <XCircleIcon className="w-4 h-4" />
                          Reject
                        </button>
                      </>
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
