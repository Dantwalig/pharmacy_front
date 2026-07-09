'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { api } from '@/lib/api';
import { ArrowLeftIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

interface BackendAppointment {
  id: string;
  date: string;
  status: string;
  type?: string;
  reason?: string;
  diagnosisSummary?: string;
  doctorRecommendations?: string;
  patientId: string;
  hospitalId: string;
  patient: { firstName: string; lastName: string; phone?: string };
  hospital: { id: string; name: string; address?: string };
}

const STATUS_COLOR: Record<string, { bg: string; color: string }> = {
  PENDING:          { bg: '#EBF5FF', color: '#2563EB' },
  CONFIRMED:        { bg: '#EBF5FF', color: '#2563EB' },
  READY_FOR_DOCTOR: { bg: '#FFF7ED', color: '#EA580C' },
  COMPLETED:        { bg: '#ECFDF5', color: '#059669' },
  CANCELLED:        { bg: '#FEF2F2', color: '#DC2626' },
  NO_SHOW:          { bg: '#F3F4F6', color: '#6B7280' },
};

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between py-3 border-b border-gray-50 last:border-0">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="text-sm font-semibold text-gray-900 text-right max-w-[60%]">{value}</span>
    </div>
  );
}

export default function AppointmentDetailPage() {
  const { t }  = useTranslation();
  const params = useParams<{ id: string }>();

  const [appointment, setAppointment] = useState<BackendAppointment | null>(null);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState<string | null>(null);

  const fetchAppointment = useCallback(async () => {
    if (!params.id) return;
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<BackendAppointment>(`/appointments/${params.id}`);
      setAppointment(res.data);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? err?.message ?? 'Appointment not found.');
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => { fetchAppointment(); }, [fetchAppointment]);

  const patientFullName = appointment
    ? `${appointment.patient?.firstName ?? ''} ${appointment.patient?.lastName ?? ''}`.trim()
    : '—';

  const formatted = appointment
    ? new Date(appointment.date).toLocaleString([], {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
        hour: '2-digit', minute: '2-digit',
      })
    : '';

  const statusStyle = appointment ? (STATUS_COLOR[appointment.status] ?? { bg: '#F3F4F6', color: '#6B7280' }) : null;

  return (
    <div className="max-w-xl mx-auto space-y-6 p-4 lg:p-6">
      <Link href="/hospital/doctor/appointments" className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors">
        <ArrowLeftIcon className="w-4 h-4" />
        {t('hospital.backToAppointments', 'Back to Appointments')}
      </Link>

      {/* Loading skeleton */}
      {loading && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-4 animate-pulse">
          <div className="h-4 w-48 bg-gray-200 rounded" />
          <div className="h-7 w-64 bg-gray-200 rounded" />
          <div className="h-3 w-32 bg-gray-200 rounded" />
          <div className="border-t border-gray-100 pt-4 space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex justify-between">
                <div className="h-3 w-24 bg-gray-200 rounded" />
                <div className="h-3 w-32 bg-gray-200 rounded" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Error state */}
      {error && !loading && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 flex flex-col items-center gap-3 text-center">
          <p className="text-sm text-red-700">{error}</p>
          <button onClick={fetchAppointment} className="flex items-center gap-1.5 text-xs font-semibold text-red-600 hover:text-red-800">
            <ArrowPathIcon className="w-4 h-4" /> {t('common.retry', 'Retry')}
          </button>
        </div>
      )}

      {/* Appointment detail */}
      {!loading && !error && appointment && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-4">
          <div>
            <span className="text-[10px] font-bold tracking-widest text-blue-600 uppercase bg-blue-50 px-2 py-1 rounded-md">
              {t('hospital.detailCardHeader', 'Appointment Profile')}
            </span>
            <h1 className="text-2xl font-extrabold text-gray-900 mt-2">{t('hospital.appointmentDetailsTitle', 'Appointment Details')}</h1>
            <p className="text-xs text-gray-400 mt-0.5">{t('hospital.idRef', 'ID')}: {params.id}</p>
          </div>

          <div className="border-t border-gray-100 pt-4">
            <DetailRow label={t('hospital.lblPatientName', 'Patient')} value={patientFullName} />
            <DetailRow label={t('hospital.thTime', 'Date & Time')} value={formatted} />
            <DetailRow label={t('hospital.thType', 'Type')} value={appointment.type ?? t('hospital.inPerson', 'In-Person')} />
            <DetailRow label={t('hospital.thNotes', 'Reason')} value={appointment.reason ?? '—'} />
            {appointment.diagnosisSummary && (
              <DetailRow label={t('hospital.diagnosisSummary', 'Diagnosis')} value={appointment.diagnosisSummary} />
            )}
            {appointment.doctorRecommendations && (
              <DetailRow label={t('hospital.doctorRecommendations', 'Recommendations')} value={appointment.doctorRecommendations} />
            )}
            {appointment.patient?.phone && (
              <DetailRow label={t('common.phone', 'Phone')} value={appointment.patient.phone} />
            )}
            <DetailRow label={t('hospital.hospitalLabel', 'Hospital')} value={appointment.hospital?.name ?? '—'} />
            <div className="flex justify-between pt-3">
              <span className="text-sm text-gray-500">{t('hospital.lblStatus', 'Status')}</span>
              {statusStyle && (
                <span className="px-3 py-1 rounded-full text-xs font-semibold" style={{ background: statusStyle.bg, color: statusStyle.color }}>
                  {appointment.status.replaceAll('_', ' ')}
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Not found */}
      {!loading && !error && !appointment && (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 shadow-sm text-center text-gray-400">
          {t('hospital.appointmentNotFound', 'Appointment not found.')}
        </div>
      )}
    </div>
  );
}
