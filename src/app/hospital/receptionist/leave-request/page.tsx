//src/app/hospital/recertionist/leave-request/page.tsx

'use client';

import { useTranslation } from 'react-i18next';
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { api, unwrapData } from '@/lib/api';
import toast from 'react-hot-toast';

const BLUE = '#1E3A8A';
const lightBlue = '#1E40AF';

type LeaveRequest = {
  id: string;
  requestDate: string; // ISO date
  leaveType: string;
  startDate: string; // ISO date
  endDate: string; // ISO date
  durationDays: number;
  status: 'APPROVED' | 'PENDING' | 'REJECTED';
  fileName?: string | null;
};

export default function HospitalReceptionistLeaveRequestPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const hospitalId = (user as any)?.hospitalId || '';

  const [loading, setLoading] = useState(true);
  const [errorProp, setErrorProp] = useState('');

  // Mock balances
  const [annualBalance, setAnnualBalance] = useState(14);
  const [sickBalance, setSickBalance] = useState(8);

  // Mock request history
  const [history, setHistory] = useState<LeaveRequest[]>([]);

  useEffect(() => {
    if (!hospitalId) {
      setLoading(false);
      setErrorProp('No hospital session found. Please log in.');
      return;
    }
    api.get(`/hospitals/${hospitalId}/receptionist/leaves`)
      .then(res => {
        const data = unwrapData(res.data) || [];
        setHistory(data as any);
        // Also possibly set balances if returned
        if (res.data?.annualBalance) setAnnualBalance(res.data.annualBalance);
        if (res.data?.sickBalance) setSickBalance(res.data.sickBalance);
      })
      .catch(() => setErrorProp('Failed to load leave requests.'))
      .finally(() => setLoading(false));
  }, [hospitalId]);

  // Form state
  const [leaveType, setLeaveType] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const statusLabel = (s: LeaveRequest['status']) => t(`hospital.${s.toLowerCase()}`);

  // Simple helpers
  const statusBadge = (status: LeaveRequest['status']) => {
    switch (status) {
      case 'APPROVED':
        return 'inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full bg-emerald-50 text-emerald-600';
      case 'PENDING':
        return 'inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full bg-amber-50 text-amber-600';
      case 'REJECTED':
        return 'inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full bg-red-50 text-red-600';
      default:
        return 'inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-600';
    }
  };

  const formatDate = (iso: string) => {
    try {
      const d = new Date(iso);
      return d.toLocaleDateString(undefined, { year: 'numeric', month: '2-digit', day: '2-digit' });
    } catch {
      return iso;
    }
  };

  const calcDurationDays = (s: string, e: string) => {
    if (!s || !e) return 0;
    const sd = new Date(s);
    const ed = new Date(e);
    const diff = Math.round((ed.getTime() - sd.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    return diff > 0 ? diff : 0;
  };

  const submitLeaveRequest = () => {

    if (!leaveType) {
      toast.error(t('hospital.alertSelectLeaveType'));
      return;
    }
    if (!startDate || !endDate) {
      toast.error(t('hospital.alertSelectDates'));
      return;
    }
    const duration = calcDurationDays(startDate, endDate);
    if (duration <= 0) {
      toast.error(t('hospital.alertEndDate'));
      return;
    }

    const newReq: LeaveRequest = {
      id: `LR-${(history.length + 1).toString().padStart(3, '0')}`,
      requestDate: new Date().toISOString().split('T')[0],
      leaveType,
      startDate,
      endDate,
      durationDays: duration,
      status: 'PENDING',
      fileName,
    };

    setHistory((prev) => [newReq, ...prev]);
    // reset form
    setLeaveType('');
    setStartDate('');
    setEndDate('');
    setReason('');
    setFileName(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files && e.target.files[0];
    if (f) {
      setFileName(f.name);
    } else {
      setFileName(null);
    }
  };

  const viewRequest = (req: LeaveRequest) => {
    toast(`${req.id} · ${req.leaveType} · ${formatDate(req.startDate)}–${formatDate(req.endDate)} · ${statusLabel(req.status)}`, { duration: 5000 });
  };

  const cancelRequest = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm(t('hospital.confirmCancelRequest'))) return;
    setHistory((prev) => prev.map((h) => (h.id === id ? { ...h, status: 'REJECTED' } : h)));
  };

  return (
    <div className="space-y-6">
      {/* Hero Header */}
      <div className="rounded-2xl p-8" style={{ background: '#EBF5FF' }}>
        <h1 className="text-3xl font-extrabold" style={{ color: BLUE }}>
          {t('hospital.leaveRequestTitle', 'Staff Leave Request Panel')}
        </h1>
        <p className="mt-1 text-sm" style={{ color: lightBlue }}>
          {t('hospital.leaveRequestSubtitle', 'Submit leaves, upload supporting documentation, and track authorization histories.')}
        </p>
      </div>

      {errorProp && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm border border-red-100">
          {errorProp}
        </div>
      )}
      {loading && (
        <div className="p-8 text-center text-gray-500 animate-pulse">Loading leave requests...</div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        <div className="lg:col-span-4 space-y-6">

          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-xl bg-white p-4 shadow-sm border border-gray-100">
              <p className="text-xs uppercase text-gray-400">{t('hospital.annualLeave')}</p>
              <div className="mt-3">
                <div className="text-2xl font-extrabold text-sky-600">{annualBalance} {t('hospital.daysWord')}</div>
                <p className="text-xs text-gray-400 mt-1">{t('hospital.remainingBalance')}</p>
              </div>
            </div>
            <div className="rounded-xl bg-white p-4 shadow-sm border border-gray-100">
              <p className="text-xs uppercase text-gray-400">{t('hospital.sickLeave')}</p>
              <div className="mt-3">
                <div className="text-2xl font-extrabold text-amber-600">{sickBalance} {t('hospital.daysWord')}</div>
                <p className="text-xs text-gray-400 mt-1">{t('hospital.remainingBalance')}</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold mb-3">{t('hospital.submitLeaveRequest')}</h3>

            <label className="block text-xs font-medium text-gray-600">{t('hospital.leaveTypeRequired')}</label>
            <select
              value={leaveType}
              onChange={(e) => setLeaveType(e.target.value)}
              className="mt-2 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm bg-white"
              aria-label={t('hospital.thLeaveType')} >
              <option value="">{t('hospital.selectLeaveType')}</option>
              <option value="Annual Leave">{t('hospital.annualLeave')}</option>
              <option value="Sick Leave">{t('hospital.sickLeave')}</option>
              <option value="Unpaid Leave">{t('hospital.unpaidLeave')}</option>
            </select>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600">{t('hospital.startDateRequired')}</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="mt-2 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600">{t('hospital.endDateRequired')}</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="mt-2 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm bg-white"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-xs font-medium text-gray-600">{t('hospital.reasonRequired')}</label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder={t('hospital.reasonPlaceholder')}
                rows={4}
                className="mt-2 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm bg-white resize-none"
              />
            </div>

            <div className="mt-4">
              <label className="block text-xs font-medium text-gray-600">{t('hospital.supportingDocuments')}</label>
              <div className="mt-2">
                <label className="flex items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-200 px-4 py-3 text-sm text-gray-500 cursor-pointer hover:bg-gray-50">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                  <span>{t('hospital.uploadFileHint')}</span>
                  <input ref={fileInputRef} onChange={onFileChange} type="file" className="hidden" />
                </label>
                <p className="mt-2 text-xs text-gray-400">{fileName ?? t('hospital.noFileSelected')}</p>
              </div>
            </div>

            <div className="mt-6">
              <button
                onClick={submitLeaveRequest}
                className="w-full rounded-lg bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 text-sm font-semibold"
              >
                {t('hospital.submitLeaveRequest')}
              </button>
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="lg:col-span-8">
          <div className="rounded-xl bg-white p-4 shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold mb-4">{t('hospital.requestHistory')}</h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-xs uppercase text-gray-400 font-semibold tracking-wide">
                    <th className="py-3 px-4">{t('hospital.thRequestDate')}</th>
                    <th className="py-3 px-4">{t('hospital.thLeaveType')}</th>
                    <th className="py-3 px-4">{t('hospital.thDuration')}</th>
                    <th className="py-3 px-4">{t('hospital.status')}</th>
                    <th className="py-3 px-4 text-right">{t('hospital.actions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
                  {history.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4 font-medium">{formatDate(r.requestDate)}</td>
                      <td className="py-3 px-4">{r.leaveType}</td>
                      <td className="py-3 px-4">
                        <div className="font-semibold">{r.durationDays} {t('hospital.daysWord')}</div>
                        <div className="text-xs text-gray-400">{formatDate(r.startDate)} to {formatDate(r.endDate)}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={statusBadge(r.status)}>{statusLabel(r.status)}</span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center gap-2 justify-end">
                          <button
                            onClick={() => viewRequest(r)}
                            className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                          >
                            {t('common.view')}
                          </button>

                          {r.status === 'PENDING' && (
                            <button
                              onClick={(e) => cancelRequest(e, r.id)}
                              className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium bg-red-500 text-white hover:bg-red-600"
                            >
                              {t('common.cancel')}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {history.length === 0 && (
                <div className="p-6 text-center text-sm text-gray-400">{t('hospital.noRequests')}</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}