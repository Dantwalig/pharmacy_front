// frontend/src/components/shared/LeaveRequestForm.tsx
//
// Submits a new leave request. Shared by the staff portal (pharmacist,
// cashier, nurse) and the branch manager portal — the backend figures out
// who reviews the request (branch manager or pharmacy owner).

'use client';

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { getErrorMessage } from '@/lib/errorHandler';
import { CalendarDaysIcon, PaperAirplaneIcon } from '@heroicons/react/24/outline';
import { LeaveTypeInfo, LeaveType } from '@/types/leave';

interface LeaveRequestFormProps {
  onSubmitted?: () => void;
}

export default function LeaveRequestForm({ onSubmitted }: LeaveRequestFormProps) {
  const { t } = useTranslation();
  const [types, setTypes] = useState<LeaveTypeInfo[]>([]);
  const [loadingTypes, setLoadingTypes] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [leaveType, setLeaveType] = useState<LeaveType>('ANNUAL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [attachmentUrl, setAttachmentUrl] = useState('');

  useEffect(() => {
    let cancelled = false;
    api
      .get('/leave/types')
      .then((res) => {
        if (!cancelled) setTypes(res.data ?? []);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoadingTypes(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const selected = types.find((ty) => ty.type === leaveType);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate || !endDate) {
      toast.error(t('leave.selectDates'));
      return;
    }
    if (!reason.trim()) {
      toast.error(t('leave.provideReason'));
      return;
    }
    setSubmitting(true);
    try {
      await api.post('/leave/request', {
        leaveType,
        startDate,
        endDate,
        reason: reason.trim(),
        attachmentUrl: attachmentUrl.trim() || undefined,
      });
      toast.success(t('leave.requestSubmitted'));
      setStartDate('');
      setEndDate('');
      setReason('');
      setAttachmentUrl('');
      onSubmitted?.();
    } catch (error: unknown) {
      toast.error(getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
      <div className="flex items-center gap-2">
        <CalendarDaysIcon className="w-5 h-5 text-brand-teal" />
        <h2 className="font-bold text-gray-900">{t('leave.newRequest')}</h2>
      </div>

      {/* Leave type */}
      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1.5">{t('leave.leaveType')}</label>
        <select
          value={leaveType}
          onChange={(e) => setLeaveType(e.target.value as LeaveType)}
          disabled={loadingTypes}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
        >
          {types.map((ty) => (
            <option key={ty.type} value={ty.type}>
              {ty.label} ({ty.defaultDays > 0 ? `${ty.defaultDays} ${t('leave.daysPerYear')}` : t('leave.unpaid')})
            </option>
          ))}
        </select>
        {selected && (
          <p className="text-xs text-gray-500 mt-1.5">
            {selected.description}{' '}
            <span className="text-gray-400">— {selected.legalReference}</span>
          </p>
        )}
      </div>

      {/* Dates */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5">{t('leave.startDate')}</label>
          <input
            type="date"
            required
            value={startDate}
            min={new Date().toISOString().split('T')[0]}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5">{t('leave.endDate')}</label>
          <input
            type="date"
            required
            value={endDate}
            min={startDate || new Date().toISOString().split('T')[0]}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
          />
        </div>
      </div>

      {/* Reason */}
      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1.5">{t('leave.reason')}</label>
        <textarea
          required
          rows={3}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder={t('leave.reasonPlaceholder')}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none resize-none"
        />
      </div>

      {/* Attachment (optional, e.g. medical certificate) */}
      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1.5">
          {t('leave.attachmentUrl')} <span className="text-gray-400 font-normal">({t('form.optional')})</span>
        </label>
        <input
          type="text"
          value={attachmentUrl}
          onChange={(e) => setAttachmentUrl(e.target.value)}
          placeholder={t('leave.attachmentPlaceholder')}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
        />
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-white text-sm font-semibold bg-brand-teal hover:opacity-90 transition-opacity disabled:opacity-50"
      >
        <PaperAirplaneIcon className="w-4 h-4" />
        {submitting ? t('leave.submitting') : t('leave.submitRequest')}
      </button>
    </form>
  );
}
