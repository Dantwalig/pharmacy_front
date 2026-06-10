'use client';

import { useState, useRef, useEffect } from 'react';
import {
  Search, Plus, Minus, Pill,
  User, Phone, Mail, MapPin, Heart, AlertTriangle, ShieldCheck, UserCircle2,
  ChevronDown,
} from 'lucide-react';
import { MOCK_PATIENTS, MOCK_PATIENT_RX, MOCK_PATIENT_DETAILS } from '@/mock/hospital/consultations';
import { MOCK_DRUG_STOCK } from '@/mock/hospital/inventory';
import type { PatientDetail, PrescriptionTab } from '@/types/hospital';

const NAVY = '#1E3A5F';
const TEAL = '#2D9B8A';

// ── Info field row ────────────────────────────────────────────────────────────
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

// ── Patient Info tab ──────────────────────────────────────────────────────────
function PatientInfoTab({ patient, detail }: {
  patient: (typeof MOCK_PATIENTS)[number];
  detail: PatientDetail | undefined;
}) {
  const STATUS_COLOR: Record<string, string> = {
    ACTIVE: '#15803D', CRITICAL: '#DC2626', INACTIVE: '#6B7280',
  };
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <h4 className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-1">Personal Information</h4>
        <div className="divide-y divide-gray-50">
          <InfoRow icon={User}    label="Full Name"     value={patient.name}                                       color="#2563EB" />
          <InfoRow icon={User}    label="Age"           value={`${patient.age} years old`}                         color="#2563EB" />
          <InfoRow icon={User}    label="Gender"        value={patient.gender}                                     color="#2563EB" />
          {detail && <InfoRow icon={User}  label="Date of Birth" value={detail.dob}         color="#2563EB" />}
          {detail && <InfoRow icon={Heart} label="Blood Type"    value={detail.bloodType}   color="#DC2626" />}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <h4 className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-1">Contact Information</h4>
        <div className="divide-y divide-gray-50">
          {detail ? (
            <>
              <InfoRow icon={Phone}  label="Phone"   value={detail.phone}   color={TEAL} />
              <InfoRow icon={Mail}   label="Email"   value={detail.email}   color={TEAL} />
              <InfoRow icon={MapPin} label="Address" value={detail.address} color={TEAL} />
            </>
          ) : <p className="text-xs text-gray-400 py-3">No contact data.</p>}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <h4 className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-1">Medical Summary</h4>
        <div className="divide-y divide-gray-50">
          <InfoRow icon={Heart}        label="Current Condition" value={patient.condition}                                                     color="#BE185D" />
          <InfoRow icon={User}         label="Last Visit"        value={patient.lastVisit}                                                     color="#BE185D" />
          <InfoRow icon={UserCircle2}  label="Status"            value={patient.status.charAt(0) + patient.status.slice(1).toLowerCase()}     color={STATUS_COLOR[patient.status]} />
          {detail && (
            <InfoRow icon={AlertTriangle} label="Allergies" value={detail.allergies.length > 0 ? detail.allergies.join(', ') : 'None reported'} color="#EA580C" />
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <h4 className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-1">Insurance & Emergency</h4>
        <div className="divide-y divide-gray-50">
          {detail ? (
            <>
              <InfoRow icon={ShieldCheck} label="Insurance Provider" value={detail.insurance}                                                           color="#7C3AED" />
              <InfoRow icon={ShieldCheck} label="Insurance ID"       value={detail.insuranceId}                                                         color="#7C3AED" />
              <InfoRow icon={Phone}       label="Emergency Contact"  value={`${detail.emergencyContact.name} (${detail.emergencyContact.relation})`}    color="#DC2626" />
              <InfoRow icon={Phone}       label="Emergency Phone"    value={detail.emergencyContact.phone}                                              color="#DC2626" />
            </>
          ) : <p className="text-xs text-gray-400 py-3">No insurance data.</p>}
        </div>
      </div>
    </div>
  );
}

// ── Toggle pill helper ────────────────────────────────────────────────────────
function TogglePill({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="px-4 py-1.5 rounded-full text-xs font-semibold transition-all border"
      style={
        active
          ? { background: '#3B82F6', color: '#fff', borderColor: '#3B82F6' }
          : { background: '#fff', color: '#6B7280', borderColor: '#E5E7EB' }
      }
    >
      {label}
    </button>
  );
}

// ── Stepper ───────────────────────────────────────────────────────────────────
function Stepper({ value, unit, onDecrement, onIncrement }: {
  value: number; unit: string; onDecrement: () => void; onIncrement: () => void;
}) {
  return (
    <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2">
      <button onClick={onDecrement} className="w-6 h-6 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-200 transition-colors">
        <Minus size={12} />
      </button>
      <span className="text-sm font-semibold text-gray-700 min-w-[60px] text-center">{value} {unit}</span>
      <button onClick={onIncrement} className="w-6 h-6 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-200 transition-colors">
        <Plus size={12} />
      </button>
    </div>
  );
}

// ── Drug search input with dropdown ──────────────────────────────────────────
function DrugSearchInput({ value, onChange }: { value: string; onChange: (name: string) => void }) {
  const [query, setQuery]       = useState(value);
  const [open, setOpen]         = useState(false);
  const containerRef            = useRef<HTMLDivElement>(null);

  const results = query.trim().length > 0
    ? MOCK_DRUG_STOCK.filter(d =>
        d.drug.brandName.toLowerCase().includes(query.toLowerCase()) ||
        d.drug.genericName.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 8)
    : [];

  function select(drug: (typeof MOCK_DRUG_STOCK)[number]) {
    const label = `${drug.drug.brandName} ${drug.drug.dosageStrength}`;
    setQuery(label);
    onChange(label);
    setOpen(false);
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
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
          placeholder="Search medicine name…"
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
            const badge = STOCK_COLOR[stockStatus];
            return (
              <li key={d.drugId}>
                <button
                  onMouseDown={() => select(d)}
                  className="w-full text-left px-3 py-2.5 hover:bg-gray-50 transition-colors flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">{d.drug.brandName} {d.drug.dosageStrength}</p>
                    <p className="text-xs text-gray-400 truncate">{d.drug.genericName} · {d.drug.dosageForm}</p>
                  </div>
                  <span
                    className="shrink-0 px-2 py-0.5 rounded-full text-xs font-semibold"
                    style={{ background: badge.bg, color: badge.color }}
                  >
                    {stockStatus === 'OUT' ? 'Out of stock' : stockStatus === 'LOW_STOCK' ? 'Low stock' : `Qty: ${d.quantity}`}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {open && query.trim().length > 0 && results.length === 0 && (
        <div className="absolute z-20 left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg px-4 py-3 text-xs text-gray-400">
          No medicines found for &ldquo;{query}&rdquo;
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
export default function HospitalDoctorPrescriptionPage() {
  const [search, setSearch]       = useState('');
  const [selectedId, setSelected] = useState(MOCK_PATIENTS[0].id);
  const [activeTab, setTab]       = useState<PrescriptionTab>('prescriptions');

  // Form state
  const [medName, setMedName]   = useState('');
  const [doseQty, setDoseQty]   = useState(1);
  const [doseUnit, setDoseUnit] = useState('Tablet');
  const [durQty, setDurQty]     = useState(1);
  const [durUnit, setDurUnit]   = useState('Week');
  const [repeat, setRepeat]     = useState<'everyday' | 'alternative' | 'specific'>('everyday');
  const [altDays, setAltDays]   = useState<Set<string>>(new Set());
  const [times, setTimes]       = useState<Set<string>>(new Set(['Morning', 'Lunch']));
  const [foodTiming, setFood]   = useState<'after' | 'before'>('after');

  const patient  = MOCK_PATIENTS.find(p => p.id === selectedId)!;
  const rxList   = MOCK_PATIENT_RX[selectedId] ?? [];
  const initials = patient.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  const filtered = MOCK_PATIENTS.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  function toggleTime(t: string) {
    setTimes(prev => {
      const next = new Set(prev);
      next.has(t) ? next.delete(t) : next.add(t);
      return next;
    });
  }

  const TABS: { id: PrescriptionTab; label: string }[] = [
    { id: 'info',          label: 'Patient Info'  },
    { id: 'visits',        label: 'Visits'        },
    { id: 'labs',          label: 'Labs'          },
    { id: 'prescriptions', label: 'Prescriptions' },
  ];

  return (
    <div className="flex gap-4 h-[calc(100vh-88px)] min-h-0">

      {/* ── Patient list ── */}
      <div className="w-52 shrink-0 bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col overflow-hidden">
        <div className="px-4 pt-4 pb-2">
          <h2 className="text-sm font-bold mb-3" style={{ color: NAVY }}>Patients</h2>
          <div className="relative">
            <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-7 pr-3 py-1.5 text-xs border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-1"
              style={{ '--tw-ring-color': TEAL } as React.CSSProperties}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-2 pb-2 space-y-1">
          {filtered.map(p => {
            const isActive = p.id === selectedId;
            return (
              <button
                key={p.id}
                onClick={() => { setSelected(p.id); setTab('prescriptions'); }}
                className="w-full text-left px-3 py-2.5 rounded-xl transition-all"
                style={isActive ? { background: '#3B82F6', color: '#fff' } : { color: NAVY }}
              >
                <p className="text-xs font-semibold leading-tight">{p.name}</p>
                <p
                  className="text-xs mt-0.5 leading-tight truncate"
                  style={{ color: isActive ? 'rgba(255,255,255,0.75)' : '#9CA3AF' }}
                >
                  {p.condition.charAt(0) + p.condition.slice(1).toLowerCase()}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Patient detail ── */}
      <div className="flex-1 min-w-0 bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col overflow-hidden">

        {/* Patient header */}
        <div className="flex items-center gap-4 px-6 py-4 border-b border-gray-100">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold text-white shrink-0"
            style={{ background: '#CBD5E1' }}
          >
            {initials}
          </div>
          <div>
            <h2 className="text-lg font-bold" style={{ color: NAVY }}>{patient.name}</h2>
            <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
              <span className="font-semibold" style={{ color: '#3B82F6' }}>
                {patient.condition.charAt(0) + patient.condition.slice(1).toLowerCase()}
              </span>
              <span className="text-gray-300">←</span>
              <span>Latest Diagnosis</span>
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100 px-6">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setTab(tab.id)}
              className="relative px-4 py-3 text-xs font-semibold transition-colors"
              style={{ color: activeTab === tab.id ? '#1D4ED8' : '#9CA3AF' }}
            >
              {tab.label}
              {activeTab === tab.id && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full" style={{ background: '#1D4ED8' }} />
              )}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'info' ? (
            <PatientInfoTab patient={patient} detail={MOCK_PATIENT_DETAILS[patient.id]} />
          ) : activeTab !== 'prescriptions' ? (
            <div className="flex items-center justify-center h-32 text-sm text-gray-400">
              No data available for this tab yet.
            </div>
          ) : (
            <div className="flex gap-5 h-full">

              {/* ── Prescription form ── */}
              <div className="flex-1 min-w-0 bg-gray-50 rounded-2xl border border-gray-100 p-5 flex flex-col gap-4">
                <h3 className="text-sm font-bold" style={{ color: NAVY }}>
                  Prescription for{' '}
                  <span style={{ color: '#3B82F6' }}>{medName || '…'}</span>
                </h3>

                {/* Medicine search */}
                <div>
                  <label className="text-xs font-semibold text-gray-500 mb-1 block">Medicine</label>
                  <DrugSearchInput value={medName} onChange={setMedName} />
                </div>

                {/* Dosage */}
                <div>
                  <label className="text-xs font-semibold text-gray-500 mb-2 block">Dosage</label>
                  <div className="flex items-center gap-3 flex-wrap">
                    <Stepper value={doseQty} unit={doseUnit} onDecrement={() => setDoseQty(q => Math.max(1, q - 1))} onIncrement={() => setDoseQty(q => q + 1)} />
                    <select value={doseUnit} onChange={e => setDoseUnit(e.target.value)} className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white text-gray-600 focus:outline-none">
                      {['Tablet', 'Capsule', 'Teaspoon', 'ml'].map(u => <option key={u}>{u}</option>)}
                    </select>
                    <Stepper value={durQty} unit={durUnit} onDecrement={() => setDurQty(q => Math.max(1, q - 1))} onIncrement={() => setDurQty(q => q + 1)} />
                    <select value={durUnit} onChange={e => setDurUnit(e.target.value)} className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white text-gray-600 focus:outline-none">
                      {['Day', 'Week', 'Month'].map(u => <option key={u}>{u}</option>)}
                    </select>
                  </div>
                </div>

                {/* Repeat */}
                <div>
                  <label className="text-xs font-semibold text-gray-500 mb-2 block">Repeat</label>
                  <div className="flex gap-2 flex-wrap">
                    <TogglePill label="Everyday"         active={repeat === 'everyday'}    onClick={() => setRepeat('everyday')}    />
                    <TogglePill label="Alternative days" active={repeat === 'alternative'} onClick={() => setRepeat('alternative')} />
                    <TogglePill label="Specific days"    active={repeat === 'specific'}    onClick={() => setRepeat('specific')}    />
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
                            style={
                              active
                                ? { background: '#3B82F6', color: '#fff', borderColor: '#3B82F6' }
                                : { background: '#fff', color: '#6B7280', borderColor: '#E5E7EB' }
                            }
                          >
                            {day}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Time of day */}
                <div>
                  <label className="text-xs font-semibold text-gray-500 mb-2 block">Time of the day</label>
                  <div className="flex gap-2">
                    {['Morning', 'Lunch', 'Night'].map(t => (
                      <TogglePill key={t} label={t} active={times.has(t)} onClick={() => toggleTime(t)} />
                    ))}
                  </div>
                </div>

                {/* To be taken */}
                <div>
                  <label className="text-xs font-semibold text-gray-500 mb-2 block">To be taken</label>
                  <div className="flex gap-2">
                    <TogglePill label="After food"  active={foodTiming === 'after'}  onClick={() => setFood('after')}  />
                    <TogglePill label="Before food" active={foodTiming === 'before'} onClick={() => setFood('before')} />
                  </div>
                </div>

                <button
                  className="mt-auto w-full py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90"
                  style={{ background: '#3B82F6' }}
                >
                  Add Medicine
                </button>
              </div>

              {/* ── Current prescriptions ── */}
              <div className="w-64 shrink-0 flex flex-col gap-3 overflow-y-auto">
                {rxList.length === 0 ? (
                  <div className="flex items-center justify-center h-24 text-xs text-gray-400 bg-gray-50 rounded-2xl border border-gray-100">
                    No prescriptions yet.
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
                    <button
                      className="w-full py-1.5 rounded-lg border text-xs font-semibold transition-colors hover:bg-blue-50"
                      style={{ borderColor: '#BFDBFE', color: '#1D4ED8' }}
                    >
                      Change Prescription
                    </button>
                  </div>
                ))}
              </div>

            </div>
          )}
        </div>
      </div>

    </div>
  );
}
