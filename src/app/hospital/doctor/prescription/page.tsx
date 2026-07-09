'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Search, Plus, Minus, Pill,
  User, Phone, Mail, MapPin, Heart, AlertTriangle, ShieldCheck, UserCircle2,
  ChevronDown,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { api, unwrapData } from '@/lib/api';
import toast from 'react-hot-toast';
import { InformationCircleIcon } from '@heroicons/react/24/outline';
import type { PatientDetail, PrescriptionTab, Patient, DrugStock, PatientRx } from '@/types/hospital';

const NAVY = '#1E3A5F';
const TEAL = '#2D9B8A';

// Shape of the appointments response used to derive the patient list.
// GET /hospitals/:id/patients?doctorId= does not exist on the backend (no GET patients route,
// only POST :id/patients/search and POST :id/patients/register). We derive unique patients
// from GET /appointments instead, which is doctor-scoped via JWT.
interface BackendAppointment {
  id: string;
  date: string;
  status: string;
  reason?: string;
  patientId: string;
  hospitalId: string;
  patient: { firstName: string; lastName: string; phone?: string };
}

function uniquePatients(appointments: BackendAppointment[]): Patient[] {
  const seen = new Set<string>();
  const out: Patient[] = [];
  for (const a of appointments) {
    if (!seen.has(a.patientId)) {
      seen.add(a.patientId);
      out.push({
        id: a.patientId,
        patientId: a.patientId,
        name: `${a.patient?.firstName ?? ''} ${a.patient?.lastName ?? ''}`.trim() || '—',
        age: 0,          // not returned by /appointments
        gender: 'Male',  // not returned by /appointments
        lastVisit: new Date(a.date).toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' }),
        condition: a.reason ?? '—',
        status: 'ACTIVE',
      });
    }
  }
  return out;
}

function InfoRow({ icon: Icon, label, value, color = '#6B7280' }: {
  icon: React.ElementType; label: string; value: string; color?: string;
}) {
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-gray-50 last:border-0">
      <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5" style={{ background: `${color}15` }}>
        <Icon size={13} style={{ color }} />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-gray-400 font-medium">{label}</p>
        <p className="text-sm font-semibold text-gray-700 mt-0.5 leading-tight">{value}</p>
      </div>
    </div>
  );
}

function PatientInfoTab({ patient, detail }: {
  patient: Patient;
  detail: PatientDetail | undefined;
}) {
  const { t } = useTranslation();
  const STATUS_COLOR: Record<string, string> = {
    ACTIVE: '#15803D', CRITICAL: '#DC2626', INACTIVE: '#6B7280',
  };
  return (
    <div className="space-y-4">
      {/* Gap notice: age/gender/DOB/contact are not in the appointments response */}
      <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
        <InformationCircleIcon className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
        <p className="text-xs text-amber-800">
          <span className="font-semibold">{t('hospital.extendedPatientInfoUnavailable', 'Extended patient info unavailable:')}</span>{' '}
          {t('hospital.extendedPatientInfoHint', 'Age, gender, contact, and insurance details require a dedicated patient-detail endpoint not yet available.')}
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h4 className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-1">{t('hospital.personalInformation')}</h4>
          <div className="divide-y divide-gray-50">
            <InfoRow icon={User}  label={t('hospital.fullName')} value={patient.name}                                        color="#2563EB" />
            {patient.age > 0 && <InfoRow icon={User} label={t('hospital.age')}    value={`${patient.age} ${t('hospital.yearsOld')}`} color="#2563EB" />}
            {patient.gender && <InfoRow icon={User} label={t('hospital.gender')} value={patient.gender}                             color="#2563EB" />}
            {detail && <InfoRow icon={User}  label={t('hospital.dateOfBirth')} value={detail.dob}       color="#2563EB" />}
            {detail && <InfoRow icon={Heart} label={t('hospital.bloodType')}   value={detail.bloodType} color="#DC2626" />}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h4 className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-1">{t('hospital.contactInformation')}</h4>
          <div className="divide-y divide-gray-50">
            {detail ? (
              <>
                <InfoRow icon={Phone}  label={t('common.phone')}   value={detail.phone}   color={TEAL} />
                <InfoRow icon={Mail}   label={t('common.email')}   value={detail.email}   color={TEAL} />
                <InfoRow icon={MapPin} label={t('common.address')} value={detail.address} color={TEAL} />
              </>
            ) : <p className="text-xs text-gray-400 py-3">{t('hospital.noContactData')}</p>}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h4 className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-1">{t('hospital.medicalSummary')}</h4>
          <div className="divide-y divide-gray-50">
            <InfoRow icon={Heart}       label={t('hospital.currentCondition')} value={patient.condition || '—'}                                                      color="#BE185D" />
            <InfoRow icon={User}        label={t('hospital.lastVisit')}        value={patient.lastVisit || '—'}                                                      color="#BE185D" />
            <InfoRow icon={UserCircle2} label={t('hospital.status')}
              value={patient.status ? patient.status.charAt(0) + patient.status.slice(1).toLowerCase() : '—'}
              color={STATUS_COLOR[patient.status] || '#6B7280'} />
            {detail && (
              <InfoRow icon={AlertTriangle} label={t('hospital.allergies')}
                value={detail.allergies.length > 0 ? detail.allergies.join(', ') : t('hospital.noneReported')}
                color="#EA580C" />
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h4 className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-1">{t('hospital.insuranceEmergency')}</h4>
          <div className="divide-y divide-gray-50">
            {detail ? (
              <>
                <InfoRow icon={ShieldCheck} label={t('hospital.insuranceProvider')} value={detail.insurance}                                                            color="#7C3AED" />
                <InfoRow icon={ShieldCheck} label={t('hospital.insuranceId')}       value={detail.insuranceId}                                                          color="#7C3AED" />
                <InfoRow icon={Phone}       label={t('hospital.emergencyContact')}  value={`${detail.emergencyContact.name} (${detail.emergencyContact.relation})`}     color="#DC2626" />
                <InfoRow icon={Phone}       label={t('hospital.emergencyPhone')}    value={detail.emergencyContact.phone}                                               color="#DC2626" />
              </>
            ) : <p className="text-xs text-gray-400 py-3">{t('hospital.noInsuranceData')}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

function TogglePill({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="px-4 py-1.5 rounded-full text-xs font-semibold transition-all border"
      style={
        active
          ? { background: '#DBEAFE', color: '#2563EB', borderColor: '#DBEAFE' }
          : { background: '#F3F4F6', color: '#6B7280', borderColor: '#F3F4F6' }
      }
    >
      {label}
    </button>
  );
}

function Stepper({ value, unit, onDecrement, onIncrement }: {
  value: number; unit: string; onDecrement: () => void; onIncrement: () => void;
}) {
  return (
    <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2">
      <button onClick={onDecrement} type="button" className="w-6 h-6 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-200 transition-colors">
        <Minus size={12} />
      </button>
      <span className="text-sm font-semibold text-gray-700 min-w-[60px] text-center">{value} {unit}</span>
      <button onClick={onIncrement} type="button" className="w-6 h-6 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-200 transition-colors">
        <Plus size={12} />
      </button>
    </div>
  );
}

// ── Drug search input with real-time stock dropdown ───────────────────────────
function DrugSearchInput({ value, onChange, drugStock }: { value: string; onChange: (name: string) => void; drugStock: DrugStock[] }) {
  const { t } = useTranslation();
  const [query, setQuery]   = useState(value);
  const [open, setOpen]     = useState(false);
  const containerRef        = useRef<HTMLDivElement>(null);

  const results = query.trim().length > 0
    ? drugStock.filter(d =>
        d.drug.brandName.toLowerCase().includes(query.toLowerCase()) ||
        d.drug.genericName.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 8)
    : [];

  function select(drug: DrugStock) {
    const label = `${drug.drug.brandName} ${drug.drug.dosageStrength}`;
    setQuery(label);
    onChange(label);
    setOpen(false);
  }

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const STOCK_COLOR: Record<string, { bg: string; color: string }> = {
    IN_STOCK:  { bg: '#F0FDF4', color: '#15803D' },
    LOW_STOCK: { bg: '#FFF7ED', color: '#C2410C' },
    OUT:       { bg: '#FEF2F2', color: '#DC2626' },
  };

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        <input
          type="text"
          placeholder={t('hospital.searchMedicineName')}
          value={query}
          onChange={e => { setQuery(e.target.value); onChange(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          className="w-full pl-8 pr-8 py-2 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2"
          style={{ '--tw-ring-color': '#3B82F6' } as React.CSSProperties}
        />
        <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
      </div>

      {open && results.length > 0 && (
        <ul className="absolute z-20 left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden max-h-52 overflow-y-auto">
          {results.map(d => {
            const stockStatus = d.quantity === 0 ? 'OUT' : d.lowStockAlert ? 'LOW_STOCK' : 'IN_STOCK';
            const badge = STOCK_COLOR[stockStatus] || STOCK_COLOR.OUT;
            return (
              <li key={d.drugId}>
                <button
                  type="button"
                  onMouseDown={() => select(d)}
                  className="w-full text-left px-3 py-2.5 hover:bg-gray-50 transition-colors flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">{d.drug.brandName} {d.drug.dosageStrength}</p>
                    <p className="text-xs text-gray-400 truncate">{d.drug.genericName} · {d.drug.dosageForm}</p>
                  </div>
                  <span className="shrink-0 px-2 py-0.5 rounded-full text-xs font-semibold" style={{ background: badge.bg, color: badge.color }}>
                    {stockStatus === 'OUT' ? t('hospital.outOfStock') : stockStatus === 'LOW_STOCK' ? t('hospital.lowStock') : t('hospital.qtyLabel', { count: d.quantity })}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {open && query.trim().length > 0 && results.length === 0 && (
        <div className="absolute z-20 left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg px-4 py-3 text-xs text-gray-400">
          {t('hospital.noMedicinesFound', { query })}
        </div>
      )}
    </div>
  );
}

export default function HospitalDoctorPrescriptionPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const hospitalId = (user as any)?.hospitalId;

  const [patients,   setPatients]  = useState<Patient[]>([]);
  const [loadingPts, setLoadingPts] = useState(true);
  const [selectedId, setSelected]  = useState<string>('');

  const [rxList,     setRxList]    = useState<PatientRx[]>([]);
  const [loadingRx,  setLoadingRx] = useState(false);
  const [rxError,    setRxError]   = useState(false);
  const [drugStock,  setDrugStock] = useState<DrugStock[]>([]);

  const [search,     setSearch]    = useState('');
  const [activeTab,  setTab]       = useState<PrescriptionTab>('prescriptions');

  const [medName,    setMedName]   = useState('');
  const [doseQty,    setDoseQty]   = useState(1);
  const [doseUnit,   setDoseUnit]  = useState('Tablet');
  const [durQty,     setDurQty]    = useState(1);
  const [durUnit,    setDurUnit]   = useState('Week');
  const [repeat,     setRepeat]    = useState<'everyday' | 'alternative' | 'specific'>('everyday');
  const [altDays,    setAltDays]   = useState<Set<string>>(new Set());
  const [times,      setTimes]     = useState<Set<string>>(new Set(['Morning', 'Lunch']));
  const [foodTiming, setFood]      = useState<'after' | 'before'>('after');

  const unitLabel = (u: string) => t(`hospital.unit${u === 'ml' ? 'Ml' : u}`);
  const dayLabel  = (d: string) => t(`hospital.day${d}`);
  const timeLabel = (id: string) => t(`hospital.time${id}`);

  // Derive unique patients from GET /appointments (doctor-scoped via JWT).
  // GET /hospitals/:id/patients?doctorId= doesn't exist — backend only has POST :id/patients/search.
  const fetchPatients = useCallback(async () => {
    setLoadingPts(true);
    try {
      const res = await api.get('/appointments');
      const raw = unwrapData<BackendAppointment>(res.data);
      const derived = uniquePatients(raw);
      setPatients(derived);
      if (derived.length > 0 && !selectedId) setSelected(derived[0].id);
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? t('hospital.failedLoadPatients', 'Failed to load patients.'));
    } finally {
      setLoadingPts(false);
    }
  }, []);

  useEffect(() => { fetchPatients(); }, [fetchPatients]);

  // RX history — backend route is GET /prescriptions/patient/:mrn (requires MRN),
  // but we only have patient UUID from appointments. Will fail with NotFoundException
  // until backend adds a UUID-based route. Degrades gracefully with rxError notice.
  useEffect(() => {
    if (!hospitalId || !selectedId) return;
    setLoadingRx(true);
    setRxError(false);
    api.get(`/prescriptions/patient/${selectedId}?hospitalId=${hospitalId}`)
      .then(res => { setRxList(unwrapData<PatientRx>(res.data)); setRxError(false); })
      .catch(() => { setRxList([]); setRxError(true); })
      .finally(() => setLoadingRx(false));
  }, [hospitalId, selectedId]);

  useEffect(() => {
    if (!hospitalId) return;
    api.get(`/hospitals/${hospitalId}/drug-stock`)
      .then(res => setDrugStock(unwrapData<DrugStock>(res.data)))
      .catch(() => {/* degrades to free-text search */});
  }, [hospitalId]);

  const TABS: { id: PrescriptionTab; label: string }[] = [
    { id: 'info',          label: t('hospital.patientInfo')   },
    { id: 'visits',        label: t('hospital.visits')        },
    { id: 'labs',          label: t('hospital.labs')          },
    { id: 'prescriptions', label: t('hospital.prescriptions') },
  ];

  const filtered = patients.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
  const patient  = patients.find(p => p.id === selectedId);
  const initials = patient?.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '?';

  function toggleTime(id: string) {
    setTimes(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  const handleIssuePrescription = async () => {
    if (!medName) { toast.error(t('hospital.selectMedicationError', 'Please select a medication')); return; }
    if (!selectedId || !hospitalId) return;
    try {
      await api.post('/prescriptions/hospital-issue', {
        patientId:      selectedId,
        hospitalId,
        medicationName: medName,
        dosage:         `${doseQty} ${doseUnit}`,
        duration:       `${durQty} ${durUnit}`,
        repeatType:     repeat,
        repeatDays:     Array.from(altDays),
        timesOfDay:     Array.from(times),
        foodTiming,
      });
      toast.success(t('hospital.prescriptionIssued', 'Prescription issued successfully'));
      setMedName('');
      // reload rx list — will surface rxError if UUID/MRN gap persists on backend
      api.get(`/prescriptions/patient/${selectedId}?hospitalId=${hospitalId}`)
        .then(res => { setRxList(unwrapData<PatientRx>(res.data)); setRxError(false); })
        .catch(() => setRxError(true));
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? t('hospital.prescriptionFailed', 'Failed to issue prescription'));
    }
  };

  return (
    <div className="flex gap-4 h-[calc(100vh-88px)] min-h-0">
      {/* Patient list */}
      <div className="w-52 shrink-0 bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col overflow-hidden">
        <div className="px-4 pt-4 pb-2">
          <h2 className="text-sm font-bold mb-3" style={{ color: NAVY }}>{t('hospital.patientsTitle')}</h2>
          <div className="relative">
            <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder={t('common.search')}
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-7 pr-3 py-1.5 text-xs border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-1"
              style={{ '--tw-ring-color': TEAL } as React.CSSProperties}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-2 pb-2 space-y-1">
          {loadingPts ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="animate-pulse px-3 py-2.5 rounded-xl">
                <div className="h-3 w-28 bg-gray-200 rounded mb-1" />
                <div className="h-2.5 w-20 bg-gray-200 rounded" />
              </div>
            ))
          ) : filtered.length === 0 ? (
            <div className="p-4 text-xs text-center text-gray-500">
              {t('hospital.noPatientsFound', 'No patients found.')}
            </div>
          ) : filtered.map(p => {
            const isActive = p.id === selectedId;
            return (
              <button
                key={p.id}
                onClick={() => { setSelected(p.id); setTab('prescriptions'); }}
                className="w-full text-left px-3 py-2.5 rounded-xl transition-all flex items-center gap-2.5"
                style={isActive ? { background: '#3B82F6', color: '#fff' } : { color: NAVY }}
              >
                <span
                  className="w-7 h-7 rounded-full shrink-0 flex items-center justify-center text-[10px] font-bold"
                  style={{ background: isActive ? 'rgba(255,255,255,0.4)' : '#E5E7EB', color: isActive ? '#fff' : NAVY }}
                >
                  {p.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-semibold leading-tight truncate">{p.name}</p>
                  <p className="text-xs mt-0.5 leading-tight truncate" style={{ color: isActive ? 'rgba(255,255,255,0.75)' : '#9CA3AF' }}>
                    {p.condition !== '—' ? p.condition : t('hospital.general', 'General')}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 min-w-0 bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col overflow-hidden">
        {!patient ? (
          <div className="flex-1 flex items-center justify-center text-sm text-gray-400">
            {loadingPts
              ? t('hospital.loadingPatients', 'Loading patients…')
              : t('hospital.selectPatient', 'Select a patient to write a prescription.')}
          </div>
        ) : (
          <>
            {/* Patient header */}
            <div className="flex items-center gap-4 px-6 py-4 border-b border-gray-100">
              <div className="w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold text-white shrink-0" style={{ background: '#CBD5E1' }}>
                {initials}
              </div>
              <div>
                <h2 className="text-lg font-bold" style={{ color: NAVY }}>{patient.name}</h2>
                <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                  {patient.condition !== '—' && (
                    <>
                      <span className="font-semibold" style={{ color: '#3B82F6' }}>
                        {patient.condition.charAt(0) + patient.condition.slice(1).toLowerCase()}
                      </span>
                      <span className="text-gray-300">←</span>
                    </>
                  )}
                  <span>{t('hospital.latestDiagnosis')}</span>
                </p>
              </div>
            </div>

            {/* Tabs */}
            <div className="px-6 py-3 border-b border-gray-100">
              <div className="flex items-center bg-gray-100 rounded-xl p-1">
                {TABS.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setTab(tab.id)}
                    className={`flex-1 px-4 py-2 text-xs font-semibold rounded-lg transition-all ${activeTab === tab.id ? 'bg-white shadow-sm' : ''}`}
                    style={{ color: activeTab === tab.id ? '#1D4ED8' : '#6B7280' }}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab content */}
            <div className="flex-1 overflow-y-auto p-6">
              {activeTab === 'info' ? (
                <PatientInfoTab patient={patient} detail={undefined} />
              ) : activeTab !== 'prescriptions' ? (
                <div className="flex items-center justify-center h-32 text-sm text-gray-400">
                  {t('hospital.noTabData')}
                </div>
              ) : (
                <div className="flex gap-5 items-start">

                  {/* ── Prescription form ── */}
                  <div className="flex-1 min-w-0 bg-gray-50 rounded-2xl border border-gray-100 p-5 flex flex-col gap-4">
                    <h3 className="text-sm font-bold" style={{ color: NAVY }}>
                      {t('hospital.prescriptionFor')}{' '}
                      <span style={{ color: '#3B82F6' }}>{medName || '…'}</span>
                    </h3>

                    <div>
                      <label className="text-xs font-semibold text-gray-500 mb-1 block">{t('hospital.medicine')}</label>
                      <DrugSearchInput value={medName} onChange={setMedName} drugStock={drugStock} />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-gray-500 mb-2 block">{t('hospital.dosage')}</label>
                      <div className="flex items-center gap-3 flex-wrap">
                        <Stepper value={doseQty} unit={unitLabel(doseUnit)} onDecrement={() => setDoseQty(q => Math.max(1, q - 1))} onIncrement={() => setDoseQty(q => q + 1)} />
                        <select value={doseUnit} onChange={e => setDoseUnit(e.target.value)} className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white text-gray-600 focus:outline-none">
                          {['Tablet', 'Capsule', 'Teaspoon', 'ml'].map(u => <option key={u} value={u}>{unitLabel(u)}</option>)}
                        </select>
                        <Stepper value={durQty} unit={unitLabel(durUnit)} onDecrement={() => setDurQty(q => Math.max(1, q - 1))} onIncrement={() => setDurQty(q => q + 1)} />
                        <select value={durUnit} onChange={e => setDurUnit(e.target.value)} className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white text-gray-600 focus:outline-none">
                          {['Day', 'Week', 'Month'].map(u => <option key={u} value={u}>{unitLabel(u)}</option>)}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-gray-500 mb-2 block">{t('hospital.repeat')}</label>
                      <div className="flex gap-2 flex-wrap">
                        <TogglePill label={t('hospital.everyday')}         active={repeat === 'everyday'}    onClick={() => setRepeat('everyday')}    />
                        <TogglePill label={t('hospital.alternativeDays')} active={repeat === 'alternative'} onClick={() => setRepeat('alternative')} />
                        <TogglePill label={t('hospital.specificDays')}    active={repeat === 'specific'}    onClick={() => setRepeat('specific')}    />
                      </div>
                      {repeat === 'alternative' && (
                        <div className="flex gap-1.5 mt-3 flex-wrap">
                          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => {
                            const active = altDays.has(day);
                            return (
                              <button
                                key={day}
                                onClick={() => setAltDays(prev => {
                                  const next = new Set(prev);
                                  next.has(day) ? next.delete(day) : next.add(day);
                                  return next;
                                })}
                                className="w-9 h-9 rounded-lg text-xs font-semibold transition-all border"
                                style={active ? { background: '#DBEAFE', color: '#2563EB', borderColor: '#DBEAFE' } : { background: '#F3F4F6', color: '#6B7280', borderColor: '#F3F4F6' }}
                              >
                                {dayLabel(day)}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-gray-500 mb-2 block">{t('hospital.timeOfDay')}</label>
                      <div className="flex gap-2">
                        {['Morning', 'Lunch', 'Night'].map(id => (
                          <TogglePill key={id} label={timeLabel(id)} active={times.has(id)} onClick={() => toggleTime(id)} />
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-gray-500 mb-2 block">{t('hospital.toBeTaken')}</label>
                      <div className="flex gap-2">
                        <TogglePill label={t('hospital.afterFood')}  active={foodTiming === 'after'}  onClick={() => setFood('after')}  />
                        <TogglePill label={t('hospital.beforeFood')} active={foodTiming === 'before'} onClick={() => setFood('before')} />
                      </div>
                    </div>

                    <button
                      onClick={handleIssuePrescription}
                      className="mt-auto w-full py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90"
                      style={{ background: 'linear-gradient(to right, #0284C7, #38BDF8)' }}
                    >
                      {t('hospital.addMedicine')}
                    </button>
                  </div>

                  {/* ── Current prescriptions ── */}
                  <div className="w-64 shrink-0 flex flex-col gap-3">
                    {rxError && (
                      <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2.5">
                        <InformationCircleIcon className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                        <p className="text-xs text-amber-800">
                          {t('hospital.rxHistoryGap', 'Rx history unavailable — backend route requires MRN; only patient UUID is available from appointments.')}
                        </p>
                      </div>
                    )}
                    {loadingRx ? (
                      <div className="animate-pulse bg-gray-100 rounded-2xl h-24" />
                    ) : rxList.length === 0 && !rxError ? (
                      <div className="flex items-center justify-center h-24 text-xs text-gray-400 bg-gray-50 rounded-2xl border border-gray-100">
                        {t('hospital.noPrescriptions')}
                      </div>
                    ) : rxList.map(rx => (
                      <div key={rx.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col gap-3">
                        <div className="flex items-start gap-3">
                          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${TEAL}15` }}>
                            <Pill size={16} style={{ color: TEAL }} />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-bold leading-tight" style={{ color: NAVY }}>{rx.name}</p>
                            <p className="text-xs text-gray-500 mt-1 leading-relaxed">{rx.description}</p>
                          </div>
                        </div>
                        {/* Disabled until a change-prescription flow is implemented */}
                        <button
                          disabled
                          className="w-full py-1.5 rounded-lg border text-xs font-semibold opacity-50 cursor-not-allowed"
                          style={{ borderColor: '#BFDBFE', color: '#1D4ED8' }}
                        >
                          {t('hospital.changePrescription')}
                        </button>
                      </div>
                    ))}
                  </div>

                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
