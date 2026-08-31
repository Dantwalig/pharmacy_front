// frontend/src/components/shared/LeaveHistoryList.tsx

'use client';

import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { getErrorMessage } from '@/lib/errorHandler';
import { ClockIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import { LeaveRequest } from '@/types/leave';
import { useState } from 'react';

const STATUS_STYLES: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  APPROVED: 'bg-emerald-100 text-emerald-700',
  REJECTED: 'bg-red-100 text-red-700',
  CANCELLED: 'bg-gray-100 text-gray-500',
};

interface LeaveHistoryListProps {
  requests: LeaveRequest[];
  onChanged?: () => void;
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function LeaveHistoryList({ requests, onChanged }: LeaveHistoryListProps) {
  const { t } = useTranslation();
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const handleCancel = async (id: string) => {
    setCancellingId(id);
    try {
      await api.put(`/leave/${id}/cancel`);
      toast.success(t('leave.cancelled'));
      onChanged?.();
    } catch (error: unknown) {
      toast.error(getErrorMessage(error));
    } finally {
      setCancellingId(null);
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
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-gray-900 text-sm">{req.leaveType.replace(/_/g, ' ')}</span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[req.status]}`}>
                  {req.status}
                </span>
              </div>
              <p className="text-xs text-gray-500">
                {formatDate(req.startDate)} → {formatDate(req.endDate)} · {req.totalDays} {t('leave.days')}
              </p>
              <p className="text-sm text-gray-600 mt-1">{req.reason}</p>
              {req.attachmentUrl && (
                <a
                  href={req.attachmentUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-brand-teal hover:underline"
                >
                  <DocumentTextIcon className="w-3.5 h-3.5" />
                  {t('leave.viewAttachment')}
                </a>
              )}
              {req.status === 'REJECTED' && req.rejectionReason && (
                <p className="text-xs text-red-600 mt-1">{t('leave.rejectionReason')}: {req.rejectionReason}</p>
              )}
            </div>
            {req.status === 'PENDING' && (
              <button
                onClick={() => handleCancel(req.id)}
                disabled={cancellingId === req.id}
                className="px-3 py-1.5 rounded-lg text-xs font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 shrink-0"
              >
                {cancellingId === req.id ? t('leave.cancelling') : t('leave.cancelRequest')}
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
