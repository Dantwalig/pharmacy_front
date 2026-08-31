// frontend/src/components/shared/LeaveReviewList.tsx
//
// Used by both the branch manager portal (reviewing their own branch's
// staff) and the pharmacy owner portal (reviewing anyone, including branch
// managers). Authorization is enforced server-side; this component just
// renders whatever the backend returns for the caller.

'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { getErrorMessage } from '@/lib/errorHandler';
import { CheckIcon, XMarkIcon, UserCircleIcon, ClockIcon } from '@heroicons/react/24/outline';
import { LeaveRequest, requesterDisplayName } from '@/types/leave';

const STATUS_STYLES: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  APPROVED: 'bg-emerald-100 text-emerald-700',
  REJECTED: 'bg-red-100 text-red-700',
  CANCELLED: 'bg-gray-100 text-gray-500',
};

interface LeaveReviewListProps {
  requests: LeaveRequest[];
  onChanged?: () => void;
  showBranch?: boolean;
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function LeaveReviewList({ requests, onChanged, showBranch }: LeaveReviewListProps) {
  const { t } = useTranslation();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const handleApprove = async (id: string) => {
    setBusyId(id);
    try {
      await api.put(`/leave/${id}/approve`, {});
      toast.success(t('leave.approved'));
      onChanged?.();
    } catch (error: unknown) {
      toast.error(getErrorMessage(error));
    } finally {
      setBusyId(null);
    }
  };

  const submitReject = async () => {
    if (!rejectingId) return;
    if (!rejectReason.trim()) {
      toast.error(t('form.provideReason'));
      return;
    }
    setBusyId(rejectingId);
    try {
      await api.put(`/leave/${rejectingId}/reject`, { rejectionReason: rejectReason.trim() });
      toast.success(t('leave.rejected'));
      setRejectingId(null);
      setRejectReason('');
      onChanged?.();
    } catch (error: unknown) {
      toast.error(getErrorMessage(error));
    } finally {
      setBusyId(null);
    }
  };

  if (requests.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-10 text-center border border-gray-100">
        <ClockIcon className="w-10 h-10 text-gray-200 mx-auto mb-2" />
        <p className="text-gray-500 text-sm">{t('leave.noRequests')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {requests.map((req) => (
        <div key={req.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 lg:p-5">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <UserCircleIcon className="w-4 h-4 text-gray-400 shrink-0" />
                <span className="font-semibold text-gray-900 text-sm">{requesterDisplayName(req)}</span>
                <span className="text-xs text-gray-400">({req.requesterRole.replace(/_/g, ' ')})</span>
                {showBranch && req.branch && (
                  <span className="px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-500">{req.branch.name}</span>
                )}
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[req.status]}`}>
                  {req.status}
                </span>
              </div>
              <p className="text-xs text-gray-500">
                {req.leaveType.replace(/_/g, ' ')} · {formatDate(req.startDate)} → {formatDate(req.endDate)} ·{' '}
                {req.totalDays} {t('leave.days')}
              </p>
              <p className="text-sm text-gray-600 mt-1">{req.reason}</p>
              {req.status === 'REJECTED' && req.rejectionReason && (
                <p className="text-xs text-red-600 mt-1">{t('leave.rejectionReason')}: {req.rejectionReason}</p>
              )}
            </div>

            {req.status === 'PENDING' && (
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => handleApprove(req.id)}
                  disabled={busyId === req.id}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50"
                >
                  <CheckIcon className="w-3.5 h-3.5" />
                  {t('leave.approve')}
                </button>
                <button
                  onClick={() => { setRejectingId(req.id); setRejectReason(''); }}
                  disabled={busyId === req.id}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-red-500 hover:bg-red-600 disabled:opacity-50"
                >
                  <XMarkIcon className="w-3.5 h-3.5" />
                  {t('leave.reject')}
                </button>
              </div>
            )}
          </div>

          {rejectingId === req.id && (
            <div className="mt-3 pt-3 border-t border-gray-100 space-y-2">
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={2}
                placeholder={t('checkout2.rejectReasonPlaceholder')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 outline-none resize-none"
              />
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => { setRejectingId(null); setRejectReason(''); }}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium border border-gray-200 text-gray-600 hover:bg-gray-50"
                >
                  {t('common.cancel')}
                </button>
                <button
                  onClick={submitReject}
                  disabled={busyId === req.id}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-red-600 hover:bg-red-700 disabled:opacity-50"
                >
                  {t('staffPages.confirmRejection')}
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
