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
  reviewedAt?: string;
}

export default function StaffLeavePage() {
  const { t } = useTranslation();
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    type: 'ANNUAL',
    startDate: '',
    endDate: '',
    reason: '',
  });

  const load = useCallback(async () => {
    try {
      const res = await api.get('/staff-leave/my');
      setRequests(res.data?.data ?? res.data ?? []);
    } catch {
      // list failure is non-fatal
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.startDate || !form.endDate) {
      toast.error(t('staffLeave.fillDates'));
      return;
    }
    setSubmitting(true);
    try {
      await api.post('/staff-leave', form);
      toast.success(t('staffLeave.submitSuccess'));
      setForm({ type: 'ANNUAL', startDate: '', endDate: '', reason: '' });
      load();
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? t('staffLeave.submitError'));
    } finally {
      setSubmitting(false);
    }
  };

  const fmtDate = (iso: string) => new Date(iso).toLocaleDateString();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <CalendarDaysIcon className="w-6 h-6 text-brand-teal" />
          {t('staffLeave.title')}
        </h1>
        <p className="text-sm text-gray-500 mt-1">{t('staffLeave.subtitle')}</p>
      </div>

      {/* Request form */}
      <form
        onSubmit={submit}
        className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4 shadow-sm"
      >
        <div className="grid sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('staffLeave.type')}
            </label>
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-teal"
            >
              <option value="ANNUAL">{t('staffLeave.annual')}</option>
              <option value="SICK">{t('staffLeave.sick')}</option>
              <option value="UNPAID">{t('staffLeave.unpaid')}</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('staffLeave.startDate')}
            </label>
            <input
              type="date"
              value={form.startDate}
              onChange={(e) => setForm({ ...form, startDate: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-teal"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('staffLeave.endDate')}
            </label>
            <input
              type="date"
              value={form.endDate}
              onChange={(e) => setForm({ ...form, endDate: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-teal"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('staffLeave.reason')}
          </label>
          <textarea
            value={form.reason}
            onChange={(e) => setForm({ ...form, reason: e.target.value })}
            rows={2}
            placeholder={t('staffLeave.reasonPlaceholder')}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-teal"
          />
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="px-5 py-2.5 bg-brand-teal hover:bg-brand-navy text-white text-sm font-semibold rounded-lg disabled:opacity-50 transition"
        >
          {submitting ? t('staffLeave.submitting') : t('staffLeave.submit')}
        </button>
      </form>

      {/* My requests */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          {t('staffLeave.myRequests')}
        </h2>
        {loading ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner />
          </div>
        ) : requests.length === 0 ? (
          <p className="text-sm text-gray-500 py-6 text-center">
            {t('staffLeave.noRequests')}
          </p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {requests.map((r) => (
              <li key={r.id} className="py-3 flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-800">
                    {t(`staffLeave.${r.type.toLowerCase()}`)} · {fmtDate(r.startDate)} → {fmtDate(r.endDate)}
                  </p>
                  {r.reason && <p className="text-xs text-gray-500 mt-0.5">{r.reason}</p>}
                  {r.reviewNote && (
                    <p className="text-xs text-gray-400 mt-0.5">{t('staffLeave.managerNote')}: {r.reviewNote}</p>
                  )}
                </div>
                <StatusBadge status={r.status} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
