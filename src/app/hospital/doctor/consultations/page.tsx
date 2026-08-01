'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { api, unwrapData } from '@/lib/api';
import type { ConsultationStatus, Consultation } from '@/types/hospital';

const STATUS_BADGE: Record<ConsultationStatus, string> = {
  ACTIVE: 'bg-blue-50  border border-blue-400  text-blue-600',
  COMPLETED: 'bg-green-50 border border-green-400 text-green-600',
  PENDING: 'bg-amber-50 border border-amber-400 text-amber-600',
};

const STATUS_KEY: Record<ConsultationStatus, string> = {
  ACTIVE: 'hospital.active',
  COMPLETED: 'hospital.completed',
  PENDING: 'hospital.pending',
};

// Raw shape returned by GET /appointments (confirmed in DOCTOR_REMAINING_PAGES_API_GAPS.md).
// `scheduledAt` is the date field — the API does NOT return a field named `date`.
// `diagnosisSummary` is only confirmed for GET /appointments/:id (single record), not the list.
interface AppointmentRaw {
  id: string;
  scheduledAt?: string;
  status: string;
  type?: string;
  reason?: string;
  diagnosisSummary?: string;
  patient: { firstName: string; lastName: string };
}

// TODO: verify field mapping against Swagger — see DOCTOR_PORTAL_BACKEND_CONTRACT.md
function mapToConsultation(a: AppointmentRaw): Consultation {
  return {
    id: a.id,
    patientName:
      `${a.patient?.firstName ?? ''} ${a.patient?.lastName ?? ''}`.trim() || '—',
    // scheduledAt is the confirmed date field from GET /appointments.
    date: a.scheduledAt
      ? new Date(a.scheduledAt).toLocaleDateString([], {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        })
      : '—',
    type: a.type ?? '—',
    // diagnosisSummary confirmed only for GET /appointments/:id — may be absent in the list.
    diagnosis: a.diagnosisSummary ?? '—',
    // TODO: duration not provided by GET /appointments — show '—' until endpoint confirmed
    duration: '—',
    // gender, age, bp are not included in the appointments response.
    // TODO: populate once GET /consultations?doctorId=:id is confirmed available in Swagger
    //       and its response shape is verified — see DOCTOR_PORTAL_BACKEND_CONTRACT.md
    status:
      a.status === 'COMPLETED'
        ? 'COMPLETED'
        : a.status === 'PENDING' || a.status === 'CONFIRMED'
        ? 'PENDING'
        : 'ACTIVE',
  };
}

export default function HospitalDoctorConsultationsPage() {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [selectedId, setSelected] = useState<string | null>(null);

  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadConsultations() {
      try {
        setLoading(true);
        // GET /appointments is auto-scoped to the authenticated doctor via JWT.
        // We adapt the response to the Consultation shape; gender/age/bp are
        // not included in the appointments include — see DOCTOR_REMAINING_PAGES_API_GAPS.md.
        const res = await api.get('/appointments');
        const raw = unwrapData<{
          id: string; date: string; scheduledAt?: string; status: string; type?: string;
          reason?: string; diagnosisSummary?: string;
          patient: { firstName: string; lastName: string };
        }>(res.data);

        const mapped: Consultation[] = raw.map(a => {
          const dateStr = a.scheduledAt || a.date;
          const parsedDate = dateStr ? new Date(dateStr) : null;
          const formattedDate = parsedDate && !isNaN(parsedDate.getTime())
            ? parsedDate.toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' })
            : '—';

          return {
            id:        a.id,
            patientName: `${a.patient?.firstName ?? ''} ${a.patient?.lastName ?? ''}`.trim() || '—',
            date:      formattedDate,
            type:      a.type ?? 'CONSULTATION',
            diagnosis: a.diagnosisSummary,
            status:    a.status === 'COMPLETED' ? 'COMPLETED' : a.status === 'PENDING' || a.status === 'CONFIRMED' ? 'PENDING' : 'ACTIVE',
          };
        });

        setConsultations(mapped);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch consultations:', err);
        setError(t('hospital.failedLoadConsultations'));
      } finally {
        setLoading(false);
      }
    }
    loadConsultations();
  }, []);

  const filtered = consultations.filter(c =>
    c.patientName.toLowerCase().includes(search.toLowerCase())
  );

  const selected = consultations.find(c => c.id === selectedId) ?? null;

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="rounded-2xl p-8" style={{ background: '#EBF5FF' }}>
        <h1 className="text-3xl font-bold" style={{ color: '#1E3A5F' }}>
          {t('hospital.patientConsultations')}
        </h1>
        <p className="mt-1 text-sm" style={{ color: '#0284C7' }}>
          {t('hospital.consultationsSubtitle')}
        </p>
      </div>

      {/* Error banner */}
      {error && !loading && (
        <div className="flex items-center justify-between bg-red-50 border border-red-200 rounded-2xl px-5 py-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Split panel */}
      <div className="flex gap-4">
        {/* Left — queue (fixed height, scrollable list) */}
        <div
          className="w-72 shrink-0 bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col overflow-hidden"
          style={{ height: 520 }}
        >
          {/* Title row */}
          <div className="px-5 py-4 border-b border-gray-200 shrink-0">
            <h2 className="text-base font-bold text-gray-900">{t('hospital.queueForToday')}</h2>
          </div>

          {/* Search row */}
          <div className="px-4 py-3 border-b border-gray-200 shrink-0">
            <input
              type="text"
              placeholder={t('hospital.searchPatientQueue')}
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full px-4 py-2.5 text-sm bg-gray-100 rounded-full placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          {/* Scrollable patient rows */}
          <div className="flex-1 overflow-y-auto divide-y divide-gray-200">
            {loading ? (
              <div className="p-4 space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="animate-pulse bg-gray-100 rounded-xl h-16 w-full" />
                ))}
              </div>
            ) : error ? (
              <p className="text-sm text-red-500 text-center py-8">{error}</p>
            ) : filtered.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-8">
                {search ? t('hospital.noPatientsFound') : t('hospital.noConsultations')}
              </p>
            ) : (
              filtered.map(c => {
                const subtitle = [
                  c.gender,
                  c.age ? `${c.age} yrs` : null,
                  c.bp ? `BP ${c.bp}` : null,
                  c.date !== '—' ? c.date : null,
                ].filter(Boolean).join(' · ') || c.date;

                return (
                  <button
                    key={c.id}
                    onClick={() => setSelected(c.id)}
                    className={`w-full text-left px-5 py-4 transition-colors ${selectedId === c.id ? 'bg-blue-50' : 'hover:bg-gray-50'
                      }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-gray-900 truncate">{c.patientName}</p>
                        <p className="text-xs text-gray-500 mt-1 truncate">
                          {subtitle}
                        </p>
                      </div>
                      <span className={`shrink-0 text-[10px] font-semibold px-2.5 py-1 rounded-full ${STATUS_BADGE[c.status]}`}>
                        {t(STATUS_KEY[c.status] ?? c.status)}
                      </span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right — consultation detail / placeholder */}
        <div
          className="flex-1 bg-white rounded-2xl border border-gray-100 shadow-sm flex items-center justify-center"
          style={{ height: 520 }}
        >
          {selected ? (
            <div className="w-full h-full p-8 overflow-y-auto">
              <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900">{selected.patientName}</h2>
                {/* gender/age/bp not provided by GET /appointments */}
                {/* TODO: populate once GET /consultations?doctorId=:id is confirmed */}
                <p className="text-sm text-gray-500 mt-1">
                  {[
                    selected.gender,
                    selected.age ? `${selected.age} years` : null,
                    selected.bp ? `BP ${selected.bp}` : null,
                    selected.date !== '—' ? selected.date : null,
                  ].filter(Boolean).join(' · ') || selected.date}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <InfoCard label={t('hospital.consultationType')} value={selected.type} />
                <InfoCard label={t('hospital.date')} value={selected.date} />
                <InfoCard label={t('hospital.diagnosis')} value={selected.diagnosis ?? '—'} />
                <InfoCard label={t('hospital.duration')} value={selected.duration ?? '—'} />
                <InfoCard
                  label={t('hospital.status')}
                  value={
                    <span
                      className={`inline-flex px-2.5 py-1 text-xs font-semibold rounded-full bg-white ${STATUS_BADGE[selected.status]}`}
                    >
                      {t(STATUS_KEY[selected.status] ?? selected.status)}
                    </span>
                  }
                />
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center text-center px-8">
              <div
                className="w-24 h-24 rounded-full flex items-center justify-center mb-5"
                style={{ background: '#EBF5FF' }}
              >
                <svg
                  width="40"
                  height="40"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#00A2E8"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900">{t('hospital.beginConsultation')}</h3>
              <p className="text-sm text-gray-500 mt-2 max-w-xs leading-relaxed">
                {t('hospital.beginConsultationHint')}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function InfoCard({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="bg-gray-50 rounded-xl p-4">
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">{label}</p>
      <div className="text-sm font-medium text-gray-900">{value}</div>
    </div>
  );
}
