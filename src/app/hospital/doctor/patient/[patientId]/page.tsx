'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api, unwrapData } from '@/lib/api';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import {
  MOCK_PATIENT_VITALS,
  MOCK_PATIENT_APPOINTMENTS,
  MOCK_LAB_RESULTS,
  MOCK_PATIENT_NOTES,
  MOCK_PATIENT_DEMOGRAPHICS,
  type MockLabResult,
  type MockPatientNote,
} from '@/mock/hospital/patient-detail';

const NAVY = '#1E3A5F';
const TEAL = '#2D9B8A';

// ─── Types ──────────────────────────────────────────────────────────────────

interface PatientAppointment {
  id: string;
  date: string;
  status: string;
  reason?: string;
  diagnosisSummary?: string;
  doctorRecommendations?: string;
  patientId: string;
  hospitalId: string;
  patient: { firstName: string; lastName: string; phone?: string };
  hospital: { id: string; name: string };
}

interface VitalReading {
  name: string;
  value: string;
  unit?: string;
}

interface VitalRecord {
  id: string;
  recordedAt?: string;
  nurseNotes?: string;
  readings?: VitalReading[];
  nurse?: { firstName?: string; lastName?: string };
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function parseReadings(readings: VitalReading[] = []) {
  const v: Record<string, string> = {};
  for (const r of readings) {
    const n = (r.name ?? '').toLowerCase();
    if (n.includes('blood') || n.includes('pressure') || n.includes('bp'))
      v.bp = r.value;
    else if (n.includes('heart') || n.includes('pulse')) v.hr = r.value;
    else if (n.includes('temp')) v.temp = r.value;
    else if (n.includes('oxygen') || n.includes('spo') || n.includes('o2'))
      v.o2 = r.value;
    else if (n.includes('resp')) v.resp = r.value;
    else if (n.includes('weight')) v.weight = r.value;
  }
  return v;
}

function toChartPoints(records: VitalRecord[]) {
  return records.map((r, i) => {
    const v = parseReadings(r.readings);
    const label = r.recordedAt
      ? new Date(r.recordedAt).toLocaleDateString([], {
          month: 'short',
          day: 'numeric',
        })
      : `#${i + 1}`;
    const bpParts = v.bp?.split('/') ?? [];
    return {
      label,
      bpSys: bpParts[0] ? Number(bpParts[0]) : null,
      hr: v.hr ? Number(v.hr) : null,
      temp: v.temp ? Number(v.temp) : null,
      o2: v.o2 ? Number(v.o2) : null,
    };
  });
}

function vitalStatus(key: string, val: number | null) {
  if (val === null) return { label: '—', color: '#9CA3AF', bg: '#F3F4F6' };
  let ok = true;
  if (key === 'bpSys') ok = val >= 90 && val <= 140;
  else if (key === 'hr') ok = val >= 60 && val <= 100;
  else if (key === 'temp') ok = val >= 36.0 && val <= 37.5;
  else if (key === 'o2') ok = val >= 95;
  return ok
    ? { label: 'Normal', color: '#16A34A', bg: '#DCFCE7' }
    : { label: 'High', color: '#DC2626', bg: '#FEE2E2' };
}

// ─── Tabs ─────────────────────────────────────────────────────────────────────

const TABS = [
  'Overview',
  'Vitals & Health Trends',
  'Lab Results',
  'Consultations',
  'Patient Notes',
] as const;
type Tab = (typeof TABS)[number];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PatientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const patientId = params.patientId as string;

  const [activeTab, setActiveTab] = useState<Tab>('Vitals & Health Trends');
  const [appts, setAppts] = useState<PatientAppointment[]>([]);
  const [vitals, setVitals] = useState<VitalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [noAdmission, setNoAdmission] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      setNoAdmission(false);
      try {
        // 1. Appointments (doctor-scoped) → derive patient info
        const apptRes = await api.get('/appointments');
        const all = unwrapData<PatientAppointment>(apptRes.data);
        const mine = all
          .filter((a) => a.patientId === patientId)
          .sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
          );

        if (!cancelled) {
          if (mine.length === 0) {
            if (process.env.NODE_ENV !== 'production') {
              // Dev fallback: show mock patient when no real appointments exist
              setAppts(MOCK_PATIENT_APPOINTMENTS as unknown as PatientAppointment[]);
              setVitals(MOCK_PATIENT_VITALS as unknown as VitalRecord[]);
            } else {
              setError('This patient has no appointments with you.');
            }
            return;
          }
          setAppts(mine);
        }

        // 2. Admissions for their hospital → find this patient's admission
        const hospitalId = mine[0].hospitalId;
        const admRes = await api.get(
          `/inpatient/admissions?hospitalId=${hospitalId}`,
        );
        const admList: any[] = Array.isArray(admRes.data)
          ? admRes.data
          : Array.isArray(admRes.data?.data)
            ? admRes.data.data
            : [];

        const admission = admList.find(
          (a: any) =>
            a.patient?.id === patientId || a.patientId === patientId,
        );

        if (!admission) {
          if (!cancelled) {
            if (process.env.NODE_ENV !== 'production') {
              // Dev fallback: show mock vitals when patient is not admitted
              setVitals(MOCK_PATIENT_VITALS as unknown as VitalRecord[]);
            } else {
              setNoAdmission(true);
            }
          }
          return;
        }

        // 3. Vitals for that admission (oldest → newest)
        const vitRes = await api.get(
          `/inpatient/admissions/${admission.id}/vitals`,
        );
        const vitList: VitalRecord[] = Array.isArray(vitRes.data)
          ? vitRes.data
          : Array.isArray(vitRes.data?.data)
            ? vitRes.data.data
            : [];

        if (!cancelled) setVitals([...vitList].reverse());
      } catch (err: any) {
        if (!cancelled)
          setError(
            err?.response?.data?.message ?? 'Failed to load patient details.',
          );
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [patientId]);

  const patient = appts[0]?.patient;
  const hospital = appts[0]?.hospital;
  const initials = patient
    ? `${patient.firstName[0] ?? ''}${patient.lastName[0] ?? ''}`.toUpperCase()
    : '??';
  const fullName = patient
    ? `${patient.firstName} ${patient.lastName}`
    : '—';
  const shortId = patientId.slice(-8).toUpperCase();

  const chartData = toChartPoints(vitals);
  const latest = chartData[chartData.length - 1] ?? {};
  const latestVitals = parseReadings(
    vitals[vitals.length - 1]?.readings,
  );

  return (
    <div className="space-y-5">
      {/* ── Breadcrumb ── */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => router.push('/hospital/doctor/patient')}
          className="flex items-center gap-1.5 text-sm font-medium hover:opacity-70 transition-opacity"
          style={{ color: NAVY }}
        >
          <ArrowLeftIcon className="w-4 h-4" />
          Patient Directory
        </button>
        <span className="text-gray-300">/</span>
        <span className="text-sm font-semibold" style={{ color: TEAL }}>
          {fullName}
        </span>
      </div>

      {/* ── Loading skeleton ── */}
      {loading && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 animate-pulse space-y-4">
          <div className="flex gap-5">
            <div className="w-16 h-16 rounded-full bg-gray-200 shrink-0" />
            <div className="flex-1 space-y-3 pt-1">
              <div className="h-5 w-48 bg-gray-200 rounded" />
              <div className="h-3 w-32 bg-gray-100 rounded" />
              <div className="h-3 w-64 bg-gray-100 rounded" />
            </div>
          </div>
          <div className="h-10 bg-gray-100 rounded-xl" />
          <div className="grid grid-cols-4 gap-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-100 rounded-xl" />
            ))}
          </div>
        </div>
      )}

      {/* ── Error ── */}
      {!loading && error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-10 text-center">
          <p className="text-red-600 font-semibold">{error}</p>
          <button
            onClick={() => router.push('/hospital/doctor/patient')}
            className="mt-4 text-sm text-blue-600 hover:underline"
          >
            ← Back to Patient Directory
          </button>
        </div>
      )}

      {/* ── Main content ── */}
      {!loading && !error && (
        <>
          {/* Patient header card */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-6 py-5">
            <div className="flex items-start gap-5">
              {/* Square avatar */}
              <div
                className="w-16 h-16 rounded-2xl shrink-0 flex items-center justify-center text-2xl font-bold text-white select-none"
                style={{ background: TEAL }}
              >
                {initials}
              </div>

              {/* Right content */}
              <div className="flex-1 min-w-0">
                {/* Name + status badges */}
                <div className="flex flex-wrap items-center gap-2.5">
                  <h1 className="text-xl font-bold leading-tight" style={{ color: NAVY }}>
                    {fullName}
                  </h1>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-green-50 text-green-700 border border-green-100 whitespace-nowrap">
                    • {MOCK_PATIENT_DEMOGRAPHICS.status} • {MOCK_PATIENT_DEMOGRAPHICS.condition}
                  </span>
                </div>

                {/* MRN / gender / age / DOB */}
                <p className="text-xs text-gray-500 mt-1.5">
                  MRN: #{MOCK_PATIENT_DEMOGRAPHICS.mrn}
                  {' • '}
                  {MOCK_PATIENT_DEMOGRAPHICS.gender}
                  {' • '}
                  {new Date().getFullYear() - new Date(MOCK_PATIENT_DEMOGRAPHICS.dateOfBirth).getFullYear()} Years Old
                  {' • '}
                  DOB:{' '}
                  {new Date(MOCK_PATIENT_DEMOGRAPHICS.dateOfBirth).toLocaleDateString([], {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </p>

                {/* Demographics grid */}
                <div className="border-t border-gray-100 mt-4 pt-4 flex flex-wrap gap-x-8 gap-y-3">
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">
                      Blood Type
                    </p>
                    <p className="text-sm font-semibold text-gray-700">
                      {MOCK_PATIENT_DEMOGRAPHICS.bloodType}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">
                      Height
                    </p>
                    <p className="text-sm font-semibold text-gray-700">
                      {MOCK_PATIENT_DEMOGRAPHICS.height} cm
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">
                      Weight
                    </p>
                    <p className="text-sm font-semibold text-gray-700">
                      {MOCK_PATIENT_DEMOGRAPHICS.weight} kg
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">
                      Allergies
                    </p>
                    <p className="text-sm font-semibold text-red-600">
                      {MOCK_PATIENT_DEMOGRAPHICS.allergies.join(', ')}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">
                      Primary Physician
                    </p>
                    <p className="text-sm font-semibold text-gray-700">
                      {MOCK_PATIENT_DEMOGRAPHICS.primaryPhysician}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs + content */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {/* Tab bar */}
            <div className="flex border-b border-gray-100 overflow-x-auto">
              {TABS.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className="px-5 py-3.5 text-sm font-medium whitespace-nowrap transition-all border-b-2"
                  style={
                    activeTab === tab
                      ? {
                          color: TEAL,
                          borderColor: TEAL,
                          background: '#F0FAFA',
                        }
                      : { color: '#6B7280', borderColor: 'transparent' }
                  }
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div className="p-6">
              {activeTab === 'Vitals & Health Trends' && (
                <VitalsTab
                  vitals={vitals}
                  chartData={chartData}
                  latestVitals={latestVitals}
                  latest={latest}
                  noAdmission={noAdmission}
                />
              )}
              {activeTab === 'Overview' && (
                <OverviewTab appts={appts} />
              )}
              {activeTab === 'Consultations' && (
                <ConsultationsTab appts={appts} />
              )}
              {activeTab === 'Lab Results' && <LabResultsTab />}
              {activeTab === 'Patient Notes' && <PatientNotesTab />}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ─── Vitals tab ───────────────────────────────────────────────────────────────

function VitalsTab({
  vitals,
  chartData,
  latestVitals,
  latest,
  noAdmission,
}: {
  vitals: VitalRecord[];
  chartData: ReturnType<typeof toChartPoints>;
  latestVitals: Record<string, string>;
  latest: Partial<ReturnType<typeof toChartPoints>[0]>;
  noAdmission: boolean;
}) {
  if (noAdmission) {
    return (
      <div className="text-center py-16">
        <p className="font-medium text-gray-500">
          No inpatient admission found for this patient
        </p>
        <p className="text-sm text-gray-400 mt-1">
          Vitals are only recorded for currently admitted patients.
        </p>
      </div>
    );
  }

  if (vitals.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="font-medium text-gray-500">No vitals recorded yet</p>
        <p className="text-sm text-gray-400 mt-1">
          Vitals will appear here once a nurse records an assessment.
        </p>
      </div>
    );
  }

  const overviewRows = [
    {
      label: 'Blood Pressure',
      value: latestVitals.bp ?? '—',
      unit: 'mmHg',
      sKey: 'bpSys',
      sVal: latest.bpSys ?? null,
      dot: '#F97316',
    },
    {
      label: 'Heart Rate',
      value: latestVitals.hr ?? '—',
      unit: 'bpm',
      sKey: 'hr',
      sVal: latest.hr ?? null,
      dot: '#EF4444',
    },
    {
      label: 'Temperature',
      value: latestVitals.temp ?? '—',
      unit: '°C',
      sKey: 'temp',
      sVal: latest.temp ?? null,
      dot: '#F59E0B',
    },
    {
      label: 'O₂ Saturation',
      value: latestVitals.o2 ?? '—',
      unit: '%',
      sKey: 'o2',
      sVal: latest.o2 ?? null,
      dot: '#10B981',
    },
    {
      label: 'Weight',
      value: latestVitals.weight ?? '—',
      unit: 'kg',
      sKey: 'weight',
      sVal: null,
      dot: '#6366F1',
    },
  ];

  return (
    <div className="flex gap-6">
      {/* Left: vitals cards + charts + history */}
      <div className="flex-1 min-w-0 space-y-5">
        {/* Current vitals cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <VitalCard
            label="Blood Pressure"
            value={latestVitals.bp ?? '—'}
            unit="mmHg"
            color="#F97316"
            sKey="bpSys"
            sVal={latest.bpSys ?? null}
          />
          <VitalCard
            label="Heart Rate"
            value={latestVitals.hr ?? '—'}
            unit="bpm"
            color="#EF4444"
            sKey="hr"
            sVal={latest.hr ?? null}
          />
          <VitalCard
            label="Temperature"
            value={latestVitals.temp ?? '—'}
            unit="°C"
            color="#F59E0B"
            sKey="temp"
            sVal={latest.temp ?? null}
          />
          <VitalCard
            label="Oxygen Saturation"
            value={latestVitals.o2 ?? '—'}
            unit="%"
            color="#10B981"
            sKey="o2"
            sVal={latest.o2 ?? null}
          />
        </div>

        {/* Charts — only shown when there are enough data points */}
        {chartData.length > 1 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <MiniChart
              title="Blood Pressure (mmHg)"
              data={chartData}
              dataKey="bpSys"
              color="#F97316"
            />
            <MiniChart
              title="Heart Rate (bpm)"
              data={chartData}
              dataKey="hr"
              color="#EF4444"
            />
            <MiniChart
              title="Temperature (°C)"
              data={chartData}
              dataKey="temp"
              color="#F59E0B"
            />
            <MiniChart
              title="Oxygen Saturation (SpO2)"
              data={chartData}
              dataKey="o2"
              color="#10B981"
            />
          </div>
        )}

        {/* Measurement history table */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold" style={{ color: NAVY }}>
              Measurement History
            </h3>
            <span className="text-xs text-gray-400">
              {vitals.length} record{vitals.length !== 1 ? 's' : ''}
            </span>
          </div>
          <div className="overflow-x-auto rounded-xl border border-gray-100">
            <table className="w-full text-xs">
              <thead style={{ background: '#F8FAFC' }}>
                <tr>
                  {[
                    'Date / Time',
                    'Blood Pressure',
                    'Heart Rate',
                    'Temp (°C)',
                    'Resp Rate',
                    'O₂ Sat',
                    'Recorded By',
                    'Status',
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 bg-white">
                {[...vitals].reverse().map((rec) => {
                  const v = parseReadings(rec.readings);
                  const nurse =
                    [rec.nurse?.firstName, rec.nurse?.lastName]
                      .filter(Boolean)
                      .join(' ') || '—';
                  const dt = rec.recordedAt
                    ? new Date(rec.recordedAt)
                    : null;
                  const dateStr = dt
                    ? dt.toLocaleDateString([], {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })
                    : '—';
                  const timeStr = dt
                    ? dt.toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : '';
                  const bpSys = v.bp
                    ? parseInt(v.bp.split('/')[0])
                    : null;
                  const st = vitalStatus('bpSys', bpSys);

                  return (
                    <tr
                      key={rec.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="font-medium text-gray-700">
                          {dateStr}
                        </span>
                        {timeStr && (
                          <span className="block text-gray-400">
                            {timeStr}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {v.bp ?? '—'}
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {v.hr ?? '—'}
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {v.temp ?? '—'}
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {v.resp ?? '—'}
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {v.o2 ?? '—'}
                      </td>
                      <td className="px-4 py-3 text-gray-700 whitespace-nowrap">
                        {nurse}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className="px-2 py-0.5 rounded-full text-xs font-semibold"
                          style={{ color: st.color, background: st.bg }}
                        >
                          {bpSys !== null ? st.label : '—'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Right: Latest Overview panel */}
      <div className="w-52 shrink-0">
        <div
          className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 sticky top-6"
        >
          <h3
            className="text-sm font-bold mb-4"
            style={{ color: NAVY }}
          >
            Latest Overview
          </h3>
          <div className="space-y-3.5">
            {overviewRows.map((row) => {
              const st = vitalStatus(row.sKey, row.sVal);
              return (
                <div
                  key={row.label}
                  className="flex items-center justify-between gap-2"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ background: row.dot }}
                      />
                      <p className="text-xs text-gray-500 truncate">
                        {row.label}
                      </p>
                    </div>
                    <p
                      className="text-base font-bold leading-tight"
                      style={{ color: NAVY }}
                    >
                      {row.value}
                    </p>
                  </div>
                  <span
                    className="text-xs font-semibold px-2 py-0.5 rounded-full shrink-0"
                    style={{ color: st.color, background: st.bg }}
                  >
                    {row.sVal !== null ? st.label : '—'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Overview tab ─────────────────────────────────────────────────────────────

function OverviewTab({ appts }: { appts: PatientAppointment[] }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold" style={{ color: NAVY }}>
          Appointment History
        </h3>
        <span className="text-xs text-gray-400">
          {appts.length} record{appts.length !== 1 ? 's' : ''}
        </span>
      </div>
      <div className="space-y-2">
        {appts.slice(0, 8).map((a) => (
          <div
            key={a.id}
            className="flex items-start gap-3 rounded-xl px-4 py-3 border border-gray-100 hover:bg-gray-50 transition-colors"
          >
            <div
              className="mt-1 w-2 h-2 rounded-full shrink-0"
              style={{ background: TEAL }}
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className="text-xs font-semibold text-gray-700">
                  {new Date(a.date).toLocaleDateString([], {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-medium shrink-0">
                  {a.status}
                </span>
              </div>
              {a.reason && (
                <p className="text-xs text-gray-500 mt-0.5">{a.reason}</p>
              )}
              {a.diagnosisSummary && (
                <p className="text-xs text-gray-700 font-medium mt-1">
                  {a.diagnosisSummary}
                </p>
              )}
              {a.doctorRecommendations && (
                <p className="text-xs text-gray-400 mt-0.5 italic">
                  {a.doctorRecommendations}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Consultations tab ────────────────────────────────────────────────────────

function ConsultationsTab({ appts }: { appts: PatientAppointment[] }) {
  if (appts.length === 0) {
    return (
      <EmptyState
        message="No consultations on record"
        sub="Consultations will appear here once appointments are completed."
      />
    );
  }
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-bold" style={{ color: NAVY }}>
        Consultation History
      </h3>
      <div className="overflow-x-auto rounded-xl border border-gray-100">
        <table className="w-full text-xs">
          <thead style={{ background: '#F8FAFC' }}>
            <tr>
              {[
                'Date',
                'Reason',
                'Diagnosis',
                'Recommendations',
                'Status',
              ].map((h) => (
                <th
                  key={h}
                  className="px-4 py-3 text-left font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 bg-white">
            {appts.map((a) => (
              <tr key={a.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 whitespace-nowrap font-medium text-gray-700">
                  {new Date(a.date).toLocaleDateString([], {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </td>
                <td className="px-4 py-3 text-gray-600 max-w-[140px]">
                  {a.reason ?? '—'}
                </td>
                <td className="px-4 py-3 text-gray-600 max-w-[160px]">
                  {a.diagnosisSummary ?? '—'}
                </td>
                <td className="px-4 py-3 text-gray-600 max-w-[160px]">
                  {a.doctorRecommendations ?? '—'}
                </td>
                <td className="px-4 py-3">
                  <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700">
                    {a.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Shared sub-components ────────────────────────────────────────────────────

function VitalCard({
  label,
  value,
  unit,
  color,
  sKey,
  sVal,
}: {
  label: string;
  value: string;
  unit: string;
  color: string;
  sKey: string;
  sVal: number | null;
}) {
  const st = vitalStatus(sKey, sVal);
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
      <div className="flex items-start justify-between mb-3">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ background: color + '18' }}
        >
          <div
            className="w-3 h-3 rounded-full"
            style={{ background: color }}
          />
        </div>
        <span
          className="text-xs font-semibold px-2 py-0.5 rounded-full"
          style={{ color: st.color, background: st.bg }}
        >
          {sVal !== null ? st.label : '—'}
        </span>
      </div>
      <p className="text-2xl font-bold leading-tight" style={{ color: NAVY }}>
        {value}
      </p>
      <p className="text-xs text-gray-500 mt-1">{label}</p>
      <p className="text-xs text-gray-300">{unit}</p>
    </div>
  );
}

function MiniChart({
  title,
  data,
  dataKey,
  color,
}: {
  title: string;
  data: any[];
  dataKey: string;
  color: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
      <h4 className="text-xs font-semibold text-gray-500 mb-3">{title}</h4>
      <ResponsiveContainer width="100%" height={110}>
        <LineChart data={data} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 9, fill: '#9CA3AF' }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              fontSize: 11,
              borderRadius: 8,
              border: '1px solid #E5E7EB',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            }}
            labelStyle={{ color: '#374151', fontWeight: 600 }}
          />
          <Line
            type="monotone"
            dataKey={dataKey}
            stroke={color}
            strokeWidth={2}
            dot={{ r: 3, fill: color, strokeWidth: 0 }}
            activeDot={{ r: 5, fill: color }}
            connectNulls
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

// ─── Lab Results tab ──────────────────────────────────────────────────────────

const STATUS_STYLES: Record<string, { color: string; bg: string }> = {
  Normal:   { color: '#16A34A', bg: '#DCFCE7' },
  High:     { color: '#DC2626', bg: '#FEE2E2' },
  Low:      { color: '#D97706', bg: '#FEF3C7' },
  Critical: { color: '#7C3AED', bg: '#EDE9FE' },
};

function LabResultsTab() {
  const results: MockLabResult[] = MOCK_LAB_RESULTS;
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold" style={{ color: NAVY }}>
          Lab Results
        </h3>
        <span className="text-xs text-gray-400">{results.length} test{results.length !== 1 ? 's' : ''}</span>
      </div>
      <div className="overflow-x-auto rounded-xl border border-gray-100">
        <table className="w-full text-xs">
          <thead style={{ background: '#F8FAFC' }}>
            <tr>
              {['Test', 'Category', 'Result', 'Reference Range', 'Status', 'Ordered By', 'Date'].map((h) => (
                <th
                  key={h}
                  className="px-4 py-3 text-left font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 bg-white">
            {results.map((r) => {
              const st = STATUS_STYLES[r.status] ?? STATUS_STYLES.Normal;
              return (
                <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-700 whitespace-nowrap">
                    {r.testName}
                    {r.notes && (
                      <p className="text-gray-400 font-normal mt-0.5 max-w-[200px] leading-tight">
                        {r.notes}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{r.category}</td>
                  <td className="px-4 py-3 font-semibold whitespace-nowrap" style={{ color: NAVY }}>
                    {r.result}
                    {r.unit !== '—' && (
                      <span className="text-gray-400 font-normal ml-1">{r.unit}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{r.referenceRange}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span
                      className="px-2 py-0.5 rounded-full text-xs font-semibold"
                      style={{ color: st.color, background: st.bg }}
                    >
                      {r.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{r.orderedBy}</td>
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                    {new Date(r.resultAt).toLocaleDateString([], {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Patient Notes tab ────────────────────────────────────────────────────────

const ROLE_STYLES: Record<string, { color: string; bg: string }> = {
  Doctor: { color: NAVY,   bg: '#E0F2FE' },
  Nurse:  { color: '#047857', bg: '#ECFDF5' },
};

function PatientNotesTab() {
  const notes: MockPatientNote[] = MOCK_PATIENT_NOTES;
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold" style={{ color: NAVY }}>
          Patient Notes
        </h3>
        <span className="text-xs text-gray-400">{notes.length} note{notes.length !== 1 ? 's' : ''}</span>
      </div>
      <div className="space-y-3">
        {notes.map((note) => {
          const rs = ROLE_STYLES[note.role] ?? ROLE_STYLES.Doctor;
          return (
            <div
              key={note.id}
              className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                    style={{ background: rs.color }}
                  >
                    {note.author.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-700">{note.author}</p>
                    <span
                      className="text-xs font-medium px-2 py-0.5 rounded-full"
                      style={{ color: rs.color, background: rs.bg }}
                    >
                      {note.role}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-gray-400 whitespace-nowrap shrink-0">
                  {new Date(note.createdAt).toLocaleDateString([], {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}{' '}
                  {new Date(note.createdAt).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed">{note.content}</p>
              {note.tags && note.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {note.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function EmptyState({ message, sub }: { message: string; sub: string }) {
  return (
    <div className="text-center py-16">
      <p className="font-medium text-gray-500">{message}</p>
      <p className="text-sm text-gray-400 mt-1">{sub}</p>
    </div>
  );
}
