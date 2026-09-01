'use client';

import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import api from '@/lib/api';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import StatusBadge from '@/components/shared/StatusBadge';
import toast from 'react-hot-toast';
import { CalendarDaysIcon } from '@heroicons/react/24/outline';

interface LeaveRequest {
  id: string;
  type: 'ANNUAL' | 'SICK' | 'UNPAID';
  startDate: string;
  endDate: string;
  reason?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  reviewNote?: string;
  staff?: { firstName: string; lastName: string };
}

export default function BranchStaffLeavePage() {
  const { t } = useTranslation();
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});

  const load = useCallback(async () => {
    try {
      const res = await api.get('/staff-leave/branch');
      setRequests(res.data?.data ?? res.data ?? []);
    } catch {
      // non-fatal
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const review = async (id: string, status: 'APPROVED' | 'REJECTED') => {
    setBusyId(id);
    try {
      await api.patch(`/staff-leave/${id}/status`, {
        status,
        reviewNote: notes[id]?.trim() || undefined,
      });
      toast.success(
        status === 'APPROVED' ? t('staffLeave.approved') : t('staffLeave.rejected'),
      );
      load();
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? t('staffLeave.reviewError'));
    } finally {
      setBusyId(null);
    }
  };

  const fmtDate = (iso: string) => new Date(iso).toLocaleDateString();
  const pending = requests.filter((r) => r.status === 'PENDING');
  const done = requests.filter((r) => r.status !== 'PENDING');

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <CalendarDaysIcon className="w-6 h-6 text-brand-teal" />
          {t('staffLeave.branchTitle')}
        </h1>
        <p className="text-sm text-gray-500 mt-1">{t('staffLeave.branchSubtitle')}</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner />
        </div>
      ) : (
        <>
          {/* Pending queue */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {t('staffLeave.pendingQueue')}
            </h2>
            {pending.length === 0 ? (
              <p className="text-sm text-gray-500 py-6 text-center">{t('staffLeave.noPending')}</p>
            ) : (
              <ul className="divide-y divide-gray-100">
                {pending.map((r) => (
                  <li key={r.id} className="py-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-gray-800">
                          {r.staff?.firstName} {r.staff?.lastName}
                        </p>
                        <p className="text-sm text-gray-600 mt-0.5">
                          {t(`staffLeave.${r.type.toLowerCase()}`)} · {fmtDate(r.startDate)} → {fmtDate(r.endDate)}
                        </p>
                        {r.reason && <p className="text-xs text-gray-500 mt-0.5">{r.reason}</p>}
                      </div>
                      <StatusBadge status={r.status} />
                    </div>
                    <div className="mt-3 flex flex-col sm:flex-row gap-2">
                      <input
                        value={notes[r.id] ?? ''}
                        onChange={(e) => setNotes({ ...notes, [r.id]: e.target.value })}
                        placeholder={t('staffLeave.reviewNotePlaceholder')}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-teal"
                      />
                      <button
                        onClick={() => review(r.id, 'APPROVED')}
                        disabled={busyId === r.id}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold rounded-lg disabled:opacity-50 transition"
                      >
                        {t('staffLeave.approve')}
                      </button>
                      <button
                        onClick={() => review(r.id, 'REJECTED')}
                        disabled={busyId === r.id}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-lg disabled:opacity-50 transition"
                      >
                        {t('staffLeave.reject')}
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* History */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('staffLeave.history')}</h2>
            {done.length === 0 ? (
              <p className="text-sm text-gray-500 py-4 text-center">{t('staffLeave.noHistory')}</p>
            ) : (
              <ul className="divide-y divide-gray-100">
                {done.map((r) => (
                  <li key={r.id} className="py-3 flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-800">
                        {r.staff?.firstName} {r.staff?.lastName} ·{' '}
                        {t(`staffLeave.${r.type.toLowerCase()}`)} · {fmtDate(r.startDate)} → {fmtDate(r.endDate)}
                      </p>
                      {r.reviewNote && (
                        <p className="text-xs text-gray-400 mt-0.5">{r.reviewNote}</p>
                      )}
                    </div>
                    <StatusBadge status={r.status} />
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  );
}
