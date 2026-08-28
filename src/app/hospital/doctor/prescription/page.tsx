'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Pill, Phone, Plus, Minus, Trash2 } from 'lucide-react';
import { api, unwrapData } from '@/lib/api';
import { ArrowPathIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const NAVY = '#1E3A5F';
const TEAL = '#2D9B8A';

interface PatientSummary {
  patientId: string;
  hospitalId: string;
  firstName: string;
  lastName: string;
  phone?: string;
  lastReason?: string;
}

interface BackendAppointment {
  id: string;
  date: string;
  status: string;
  reason?: string;
  patientId: string;
  hospitalId: string;
  patient: { firstName: string; lastName: string; phone?: string };
  hospital: { id: string; name: string };
}

interface DrugStockItem {
  id: string;
  quantity: number;
  drug: {
    brandName: string;
    genericName: string;
    dosageStrength: string;
    dosageForm: string;
  };
}

interface MedicationItem {
  key:       number;
  name:      string;
  dosage:    string;
  frequency: string;
  duration:  string;
  quantity:  number;
}

function uniquePatients(appointments: BackendAppointment[]): PatientSummary[] {
  const map = new Map<string, PatientSummary>();
  for (const a of appointments) {
    if (!map.has(a.patientId)) {
      map.set(a.patientId, {
        patientId:  a.patientId,
        hospitalId: a.hospitalId,
        firstName:  a.patient?.firstName ?? '',
        lastName:   a.patient?.lastName  ?? '',
        phone:      a.patient?.phone,
        lastReason: a.reason,
      });
    }
  }
  return Array.from(map.values());
}

let _key = 0;
function newMed(): MedicationItem {
  return { key: ++_key, name: '', dosage: '', frequency: '', duration: '', quantity: 1 };
}

export default function HospitalDoctorPrescriptionPage() {
  const { t } = useTranslation();

  const [patients,    setPatients]    = useState<PatientSummary[]>([]);
  const [loadingPts,  setLoadingPts]  = useState(true);
  const [errorPts,    setErrorPts]    = useState<string | null>(null);
  const [search,      setSearch]      = useState('');
  const [selectedId,  setSelectedId]  = useState<string | null>(null);

  const [diagnosis,   setDiagnosis]   = useState('');
  const [medications, setMedications] = useState<MedicationItem[]>([newMed()]);
  const [submitting,  setSubmitting]  = useState(false);

  const [drugStock,   setDrugStock]   = useState<DrugStockItem[]>([]);
  const [hospitalIdForDrugs, setHospitalIdForDrugs] = useState<string | null>(null);

  const fetchPatients = useCallback(async () => {
    setLoadingPts(true);
    setErrorPts(null);
    try {
      const res = await api.get('/appointments');
      const raw = unwrapData<BackendAppointment>(res.data);
      setPatients(uniquePatients(raw));
      const firstHospitalId = raw[0]?.hospitalId;
      if (firstHospitalId) setHospitalIdForDrugs(firstHospitalId);
    } catch (err: any) {
      setErrorPts(err?.response?.data?.message ?? err?.message ?? 'Failed to load patients.');
    } finally {
      setLoadingPts(false);
    }
  }, []);

  useEffect(() => { fetchPatients(); }, [fetchPatients]);

  useEffect(() => {
    if (!hospitalIdForDrugs) return;
    api.get(`/hospitals/${hospitalIdForDrugs}/drug-stock`)
      .then(res => {
        const items = Array.isArray(res.data) ? res.data : (Array.isArray(res.data?.data) ? res.data.data : []);
        setDrugStock(items);
      })
      .catch(() => {});
  }, [hospitalIdForDrugs]);
  useEffect(() => {
    if (patients.length > 0 && !selectedId) setSelectedId(patients[0].patientId);
  }, [patients, selectedId]);

  const filtered = patients.filter(p =>
    `${p.firstName} ${p.lastName}`.toLowerCase().includes(search.toLowerCase())
  );

  const selected = patients.find(p => p.patientId === selectedId) ?? null;

  function addMed() { setMedications(prev => [...prev, newMed()]); }
  function removeMed(key: number) { setMedications(prev => prev.filter(m => m.key !== key)); }
  function updateMed(key: number, field: keyof MedicationItem, value: string | number) {
    setMedications(prev => prev.map(m => m.key === key ? { ...m, [field]: value } : m));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selected) return;
    if (!diagnosis.trim()) { toast.error('Please enter a diagnosis.'); return; }
    if (medications.some(m => !m.name.trim() || !m.dosage.trim() || !m.frequency.trim() || !m.duration.trim())) {
      toast.error('Please fill in all medication fields.'); return;
    }
    setSubmitting(true);
    try {
      await api.post('/prescriptions/hospital-issue', {
        patientId:  selected.patientId,
        hospitalId: selected.hospitalId,
        diagnosis:  diagnosis.trim(),
        medications: medications.map(m => ({
          name:      m.name,
          dosage:    m.dosage,
          frequency: m.frequency,
          duration:  m.duration,
          ...(m.quantity > 0 ? { quantity: m.quantity } : {}),
        })),
      });
      toast.success('Prescription issued successfully.');
      setDiagnosis('');
      setMedications([newMed()]);
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Failed to issue prescription.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex gap-4 h-[calc(100vh-88px)] min-h-0">

      {/* Patient list */}
      <div className="w-52 shrink-0 bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col overflow-hidden">
        <div className="px-4 pt-4 pb-2">
          <h2 className="text-sm font-bold mb-3" style={{ color: NAVY }}>{t('hospital.patientsTitle', 'Patients')}</h2>
          <input
            type="text"
            placeholder={t('common.search', 'Search')}
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full px-3 py-1.5 text-xs border border-gray-200 rounded-lg bg-gray-50 focus:outline-none"
          />
        </div>

        <div className="flex-1 overflow-y-auto px-2 pb-2 space-y-1">
          {loadingPts ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="animate-pulse px-3 py-2.5 rounded-xl">
                <div className="h-3 w-28 bg-gray-200 rounded mb-1" />
                <div className="h-2.5 w-20 bg-gray-200 rounded" />
              </div>
            ))
          ) : errorPts ? (
            <div className="px-3 py-4 text-center space-y-2">
              <p className="text-xs text-gray-400">{errorPts}</p>
              <button onClick={fetchPatients} className="text-xs text-blue-600 flex items-center gap-1 mx-auto">
                <ArrowPathIcon className="w-3 h-3" /> Retry
              </button>
            </div>
          ) : filtered.length === 0 ? (
            <p className="text-xs text-gray-400 text-center py-4">{t('hospital.noPatientsFound', 'No patients found.')}</p>
          ) : (
            filtered.map(p => {
              const isActive = p.patientId === selectedId;
              return (
                <button
                  key={p.patientId}
                  onClick={() => { setSelectedId(p.patientId); setDiagnosis(''); setMedications([newMed()]); }}
                  className="w-full text-left px-3 py-2.5 rounded-xl transition-all flex items-center gap-2.5"
                  style={isActive ? { background: '#3B82F6', color: '#fff' } : { color: NAVY }}
                >
                  <span className="w-7 h-7 rounded-full shrink-0 flex items-center justify-center text-[10px] font-bold"
                    style={{ background: isActive ? 'rgba(255,255,255,0.3)' : '#E5E7EB', color: isActive ? '#fff' : NAVY }}>
                    {p.firstName[0]}{p.lastName[0]}
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold leading-tight truncate">{p.firstName} {p.lastName}</p>
                    {p.lastReason && (
                      <p className="text-xs mt-0.5 leading-tight truncate" style={{ color: isActive ? 'rgba(255,255,255,0.75)' : '#9CA3AF' }}>
                        {p.lastReason}
                      </p>
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 min-w-0 bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col overflow-hidden">
        {!selected ? (
          <div className="flex-1 flex items-center justify-center text-sm text-gray-400">
            {loadingPts ? 'Loading patients…' : 'Select a patient to write a prescription.'}
          </div>
        ) : (
          <>
            {/* Patient header */}
            <div className="flex items-center gap-4 px-6 py-4 border-b border-gray-100">
              <div className="w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold text-white shrink-0" style={{ background: '#CBD5E1' }}>
                {selected.firstName[0]}{selected.lastName[0]}
              </div>
              <div>
                <h2 className="text-lg font-bold" style={{ color: NAVY }}>{selected.firstName} {selected.lastName}</h2>
                {selected.phone && (
                  <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                    <Phone size={11} /> {selected.phone}
                  </p>
                )}
              </div>
            </div>

            {/* Gap notice — prescription history requires MRN not in appointments response */}
            <div className="mx-6 mt-4 flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
              <InformationCircleIcon className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-800">
                <span className="font-semibold">Prescription history unavailable:</span>{' '}
                Loading a patient&apos;s past prescriptions requires their MRN, which is not included in the appointments response.
                See <code className="bg-amber-100 px-1 rounded">DOCTOR_REMAINING_PAGES_API_GAPS.md</code>.
              </p>
            </div>

            {/* Prescription form */}
            <div className="flex-1 overflow-y-auto p-6">
              <form onSubmit={handleSubmit} className="space-y-5">
                <h3 className="text-sm font-bold" style={{ color: NAVY }}>
                  {t('hospital.prescriptionFor', 'Issue prescription for')}{' '}
                  <span style={{ color: '#3B82F6' }}>{selected.firstName} {selected.lastName}</span>
                </h3>

                <div>
                  <label className="text-xs font-semibold text-gray-500 mb-1 block">{t('hospital.diagnosis', 'Diagnosis')} *</label>
                  <input
                    type="text"
                    value={diagnosis}
                    onChange={e => setDiagnosis(e.target.value)}
                    placeholder="e.g. Upper respiratory tract infection"
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                    required
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-semibold text-gray-500">{t('hospital.medications', 'Medications')} *</label>
                    <button type="button" onClick={addMed} className="flex items-center gap-1 text-xs text-blue-600 font-semibold hover:text-blue-800">
                      <Plus size={12} /> Add
                    </button>
                  </div>
                  {drugStock.length > 0 && (
                  <datalist id="drug-names">
                    {drugStock.map(d => (
                      <option
                        key={d.id}
                        value={`${d.drug.brandName} ${d.drug.dosageStrength}`.trim()}
                      />
                    ))}
                  </datalist>
                )}
                <div className="space-y-3">
                    {medications.map(med => (
                      <div key={med.key} className="bg-gray-50 rounded-xl border border-gray-100 p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Pill size={14} style={{ color: TEAL }} />
                            <span className="text-xs font-semibold text-gray-600">Medication</span>
                          </div>
                          {medications.length > 1 && (
                            <button type="button" onClick={() => removeMed(med.key)} className="text-red-400 hover:text-red-600">
                              <Trash2 size={13} />
                            </button>
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="col-span-2">
                            <label className="text-xs text-gray-400 mb-0.5 block">Name *</label>
                            <input
                              type="text"
                              list={drugStock.length > 0 ? 'drug-names' : undefined}
                              value={med.name}
                              onChange={e => updateMed(med.key, 'name', e.target.value)}
                              placeholder="e.g. Amoxicillin 500mg"
                              className="w-full px-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-400"
                              required
                            />
                          </div>
                          <div>
                            <label className="text-xs text-gray-400 mb-0.5 block">Dosage *</label>
                            <input
                              type="text"
                              value={med.dosage}
                              onChange={e => updateMed(med.key, 'dosage', e.target.value)}
                              placeholder="1 capsule"
                              className="w-full px-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-400"
                              required
                            />
                          </div>
                          <div>
                            <label className="text-xs text-gray-400 mb-0.5 block">Frequency *</label>
                            <input
                              type="text"
                              value={med.frequency}
                              onChange={e => updateMed(med.key, 'frequency', e.target.value)}
                              placeholder="3× daily"
                              className="w-full px-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-400"
                              required
                            />
                          </div>
                          <div>
                            <label className="text-xs text-gray-400 mb-0.5 block">Duration *</label>
                            <input
                              type="text"
                              value={med.duration}
                              onChange={e => updateMed(med.key, 'duration', e.target.value)}
                              placeholder="7 days"
                              className="w-full px-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-400"
                              required
                            />
                          </div>
                          <div>
                            <label className="text-xs text-gray-400 mb-0.5 block">Qty</label>
                            <div className="flex items-center gap-1.5 bg-white rounded-lg border border-gray-200 px-2 py-1">
                              <button type="button" onClick={() => updateMed(med.key, 'quantity', Math.max(1, Number(med.quantity) - 1))}
                                className="w-5 h-5 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100">
                                <Minus size={10} />
                              </button>
                              <span className="text-xs font-semibold text-gray-700 w-6 text-center">{med.quantity}</span>
                              <button type="button" onClick={() => updateMed(med.key, 'quantity', Number(med.quantity) + 1)}
                                className="w-5 h-5 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100">
                                <Plus size={10} />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
                  style={{ background: 'linear-gradient(to right, #0284C7, #38BDF8)' }}
                >
                  {submitting ? t('common.saving', 'Issuing…') : t('hospital.issuePrescription', 'Issue Prescription')}
                </button>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
