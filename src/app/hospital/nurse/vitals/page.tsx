'use client';

import { useEffect, useMemo, useState } from 'react';
import { ClipboardCheck, BedDouble, AlertCircle, FilePlus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import api from '@/lib/api';
import { useHospitalId } from '@/lib/hospital';

const RECENT_RECORDS = [
  { date: '20/07/25', time: '14:00', summary: 'Temp- 38.0 C BP- 120/80 HR- 72', nurse: 'Ange' },
  { date: '19/07/25', time: '08:45', summary: 'Temp- 38.0 C BP- 120/80 HR- 72', nurse: 'Beni' },
  { date: '10/07/25', time: '12:30', summary: 'Temp- 38.0 C BP- 120/80 HR- 72', nurse: 'Clare' },
];

interface AdmissionSummary {
  id: string;
  status?: string;
  reason?: string;
  wardName?: string;
  bedNumber?: string;
  patient?: {
    id?: string;
    firstName?: string;
    lastName?: string;
  };
}

interface VitalRecord {
  id: string;
  admissionId?: string;
  recordedAt?: string;
  nurseNotes?: string;
  readings?: unknown;
  nurse?: {
    firstName?: string;
    lastName?: string;
  };
}

interface RecentRecordRow {
  date: string;
  time: string;
  summary: string;
  nurse: string;
}

const DEFAULT_VITALS = {
  temperature: '35',
  bloodPressure: '120/80',
  heartRate: '72',
  respiratoryRate: '16',
  oxygen: '98',
  weight: '60.0',
};

function toDisplayDate(value?: string) {
  if (!value) return '—';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return '—';
  return parsed.toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' });
}

function toDisplayTime(value?: string) {
  if (!value) return '—';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return '—';
  return parsed.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function mapVitalReadings(readings: unknown) {
  const values: Record<string, string> = {};
  const entries = Array.isArray(readings) ? readings : [];

  for (const entry of entries) {
    const item = entry as Record<string, unknown> | undefined;
    const name = String(item?.name ?? item?.key ?? '').toLowerCase();
    const value = item?.value ?? item?.reading ?? item?.measurement ?? item?.amount;

    if (typeof value === 'number' || typeof value === 'string') {
      const text = String(value);
      if (name.includes('temp')) values.temperature = text;
      else if (name.includes('blood') || name.includes('pressure') || name.includes('bp')) values.bloodPressure = text;
      else if (name.includes('heart') || name.includes('pulse')) values.heartRate = text;
      else if (name.includes('resp')) values.respiratoryRate = text;
      else if (name.includes('oxygen') || name.includes('spo2')) values.oxygen = text;
      else if (name.includes('weight')) values.weight = text;
    }
  }

  return values;
}

export default function NurseVitalsPage() {
  const { t } = useTranslation();
  const hospitalId = useHospitalId();
  const VITAL_FIELDS = useMemo(() => [
    { key: 'temperature', label: t('hospital.temperature') },
    { key: 'bloodPressure', label: t('hospital.bloodPressure') },
    { key: 'heartRate', label: t('hospital.heartRate') },
    { key: 'respiratoryRate', label: t('hospital.respiratoryRate') },
    { key: 'oxygen', label: t('hospital.oxygen') },
    { key: 'weight', label: t('hospital.weight') },
  ] as const, [t]);

  const [vitals, setVitals] = useState<Record<string, string>>(DEFAULT_VITALS);
  const [condition, setCondition] = useState('stable');
  const [painLevel, setPainLevel] = useState(4);
  const [mobility, setMobility] = useState('independent');
  const [observation, setObservation] = useState('Patient is alert and oriented');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [useMockFallback, setUseMockFallback] = useState(false);
  const [admissions, setAdmissions] = useState<AdmissionSummary[]>([]);
  const [recentRecords, setRecentRecords] = useState<RecentRecordRow[]>(RECENT_RECORDS);

  useEffect(() => {
    let cancelled = false;

    if (!hospitalId) {
      setUseMockFallback(true);
      setLoading(false);
      setError(null);
      setRecentRecords(RECENT_RECORDS);
      setVitals(DEFAULT_VITALS);
      return () => {
        cancelled = true;
      };
    }

    const loadVitals = async () => {
      setLoading(true);
      setError(null);
      setUseMockFallback(false);

      try {
        const admissionsResponse = await api.get(`/inpatient/admissions?hospitalId=${hospitalId}`);
        const admissionsPayload = admissionsResponse.data;
        const admissionList = Array.isArray(admissionsPayload)
          ? admissionsPayload
          : Array.isArray(admissionsPayload?.data)
            ? admissionsPayload.data
            : [];

        const normalizedAdmissions = admissionList.map((item: any) => ({
          id: item.id,
          status: item.status,
          reason: item.reason,
          wardName: item.wardName,
          bedNumber: item.bedNumber,
          patient: item.patient,
        })) as AdmissionSummary[];

        if (!cancelled) {
          setAdmissions(normalizedAdmissions);
        }

        const primaryAdmission = normalizedAdmissions.find((item) => item.status === 'ACTIVE') ?? normalizedAdmissions[0];

        if (!primaryAdmission) {
          if (!cancelled) {
            setRecentRecords([]);
            setError(null);
          }
          return;
        }

        const vitalsResponse = await api.get(`/inpatient/admissions/${primaryAdmission.id}/vitals`);
        const vitalsPayload = vitalsResponse.data;
        const vitalsList = Array.isArray(vitalsPayload)
          ? vitalsPayload
          : Array.isArray(vitalsPayload?.data)
            ? vitalsPayload.data
            : [];

        const mappedRecords = vitalsList
          .slice()
          .reverse()
          .map((item: any) => {
            const mappedValues = mapVitalReadings(item.readings);
            return {
              date: toDisplayDate(item.recordedAt),
              time: toDisplayTime(item.recordedAt),
              summary: [
                mappedValues.temperature ? `Temp ${mappedValues.temperature}` : null,
                mappedValues.bloodPressure ? `BP ${mappedValues.bloodPressure}` : null,
                mappedValues.heartRate ? `HR ${mappedValues.heartRate}` : null,
              ].filter(Boolean).join(' • '),
              nurse: `${item.nurse?.firstName ?? ''} ${item.nurse?.lastName ?? ''}`.trim() || 'Nurse',
            } as RecentRecordRow;
          });

        if (!cancelled) {
          setRecentRecords(mappedRecords.length > 0 ? mappedRecords : []);
          if (mappedValuesFromList(vitalsList)) {
            const latestValues = mapVitalReadings(vitalsList[vitalsList.length - 1]?.readings);
            setVitals((current) => ({ ...current, ...latestValues }));
          }
          if (vitalsList[0]?.nurseNotes) {
            setObservation(vitalsList[0].nurseNotes);
          }
        }
      } catch (err) {
        if (!cancelled) {
          if (process.env.NODE_ENV !== 'production') {
            setUseMockFallback(true);
            setRecentRecords(RECENT_RECORDS);
            setVitals(DEFAULT_VITALS);
            setObservation('Patient is alert and oriented');
          } else {
            setError('Unable to load vitals data right now.');
            setRecentRecords([]);
          }
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadVitals();

    return () => {
      cancelled = true;
    };
  }, [hospitalId]);

  const summaryLabel = useMemo(() => {
    if (loading) return t('hospital.loading');
    if (useMockFallback) return t('hospital.devFallback', 'Development fallback');
    if (error) return error;
    if (admissions.length === 0) return t('hospital.noAdmissionsFound', 'No inpatient admissions found for this hospital.');
    if (recentRecords.length === 0) return t('hospital.noVitalsRecords', 'No vitals records found for the latest admission.');
    return t('hospital.liveDataLoaded', 'Latest vitals loaded from the backend.');
  }, [admissions.length, error, loading, recentRecords.length, t, useMockFallback]);

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="rounded-2xl p-8" style={{ background: '#EBF5FF' }}>
        <h1 className="text-3xl font-bold" style={{ color: '#1E3A5F' }}>{t('hospital.vitalsTitle')}</h1>
        <p className="mt-1 text-sm font-medium" style={{ color: '#0284C7' }}>{t('hospital.vitalsSubtitle')}</p>
      </div>

      {useMockFallback && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          {t('hospital.devFallbackMessage', 'Showing mock vitals data because the backend is unavailable or no hospital context is available in development.')}
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label={t('hospital.completeAssessment')} value={loading ? 0 : recentRecords.length} icon={<ClipboardCheck className="w-6 h-6" />} color="red" sub={t('hospital.today')} />
        <StatCard label={t('hospital.admitPatients')} value={admissions.filter((item) => item.status === 'ACTIVE').length} icon={<BedDouble className="w-6 h-6" />} color="purple" sub={t('hospital.admitted')} />
        <StatCard label={t('hospital.criticalAlert')} value={0} icon={<AlertCircle className="w-6 h-6" />} color="blue" sub={t('hospital.today')} />
        <StatCard label={t('hospital.newAssessment')} value={recentRecords.length} icon={<FilePlus className="w-6 h-6" />} color="green" sub={t('hospital.today')} />
      </div>

      <div className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-600">
        {summaryLabel}
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Vitals Entry */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h3 className="text-base font-bold mb-4" style={{ color: '#1E3A5F' }}>{t('hospital.vitalsEntry')}</h3>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="h-9 animate-pulse rounded-lg bg-gray-100" />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {VITAL_FIELDS.map((f) => (
                <div key={f.key} className="flex items-center justify-between gap-3">
                  <label className="text-sm text-gray-600">{f.label}</label>
                  <input
                    type="text"
                    value={vitals[f.key]}
                    onChange={(e) => setVitals((current) => ({ ...current, [f.key]: e.target.value }))}
                    className="w-24 px-3 py-1.5 text-sm border border-gray-200 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Assessment */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h3 className="text-base font-bold mb-4" style={{ color: '#1E3A5F' }}>{t('hospital.assessment')}</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <label className="text-sm text-gray-600">{t('hospital.generalCondition')}</label>
              <select value={condition} onChange={e => setCondition(e.target.value)} className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400">
                <option value="stable">{t('hospital.stable')}</option>
                <option value="critical">{t('hospital.critical')}</option>
                <option value="improving">{t('hospital.improving')}</option>
              </select>
            </div>
            <div>
              <label className="text-sm text-gray-600 block mb-2">{t('hospital.painLevel')}</label>
              <input type="range" min={0} max={10} value={painLevel} onChange={(e) => setPainLevel(Number(e.target.value))} className="w-full accent-blue-500" />
            </div>
            <div className="flex items-center justify-between gap-3">
              <label className="text-sm text-gray-600">{t('hospital.mobilityStatus')}</label>
              <select value={mobility} onChange={e => setMobility(e.target.value)} className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400">
                <option value="independent">{t('hospital.independent')}</option>
                <option value="assisted">{t('hospital.assisted')}</option>
                <option value="bedridden">{t('hospital.bedridden')}</option>
              </select>
            </div>
            <div>
              <label className="text-sm text-gray-600 block mb-2">{t('hospital.additionalObservation')}</label>
              <textarea
                value={observation}
                onChange={(e) => setObservation(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
              />
            </div>
          </div>
        </div>

        {/* Recent Records */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h3 className="text-base font-bold mb-4" style={{ color: '#1E3A5F' }}>{t('hospital.recentRecords')}</h3>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="h-12 animate-pulse rounded-lg bg-gray-100" />
              ))}
            </div>
          ) : recentRecords.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-200 px-4 py-8 text-center text-sm text-gray-500">
              {t('hospital.noVitalsRecords', 'No vitals records are available yet for this hospital.')}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[11px] font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100">
                    <th className="pb-2 pr-2">{t('hospital.date')}</th>
                    <th className="pb-2 pr-2">{t('hospital.time')}</th>
                    <th className="pb-2 pr-2">{t('hospital.vitalsSummary')}</th>
                    <th className="pb-2">{t('hospital.nurse')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 text-xs">
                  {recentRecords.map((record, index) => (
                    <tr key={`${record.date}-${record.time}-${index}`}>
                      <td className="py-3 pr-2 text-gray-600 whitespace-nowrap">{record.date}</td>
                      <td className="py-3 pr-2 text-gray-600">{record.time}</td>
                      <td className="py-3 pr-2 text-gray-500">{record.summary}</td>
                      <td className="py-3 text-gray-600">{record.nurse}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex flex-wrap items-center justify-center gap-4">
        <button className="px-8 py-2.5 rounded-xl text-sm font-semibold text-white" style={{ background: '#1E3A5F' }}>
          {t('hospital.saveAssessment')}
        </button>
        <button className="px-8 py-2.5 rounded-xl text-sm font-semibold text-blue-600 border border-blue-200 hover:bg-blue-50 transition-colors">
          {t('hospital.updateAssessment')}
        </button>
        <button className="px-8 py-2.5 rounded-xl text-sm font-semibold text-gray-600 border border-gray-200 hover:bg-gray-50 transition-colors">
          {t('hospital.viewHistory')}
        </button>
      </div>
    </div>
  );
}

function mappedValuesFromList(vitalsList: any[]) {
  return vitalsList.length > 0;
}

function StatCard({ label, value, icon, color, sub }: {
  label: string; value: number; icon: React.ReactNode; color: 'red' | 'purple' | 'blue' | 'green'; sub: string;
}) {
  const palette = {
    red:    { bg: 'bg-red-50',    text: 'text-red-500',    border: 'border-red-100' },
    purple: { bg: 'bg-purple-50', text: 'text-purple-500', border: 'border-purple-100' },
    blue:   { bg: 'bg-blue-50',   text: 'text-blue-500',   border: 'border-blue-100' },
    green:  { bg: 'bg-green-50',  text: 'text-green-500',  border: 'border-green-100' },
  }[color];
  return (
    <div className={`bg-white rounded-xl p-5 border ${palette.border} shadow-sm`}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-sm text-gray-500">{label}</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
          <p className="text-xs text-gray-400 mt-1">{sub}</p>
        </div>
        <div className={`w-10 h-10 ${palette.bg} ${palette.text} rounded-lg flex items-center justify-center shrink-0`}>{icon}</div>
      </div>
    </div>
  );
}
