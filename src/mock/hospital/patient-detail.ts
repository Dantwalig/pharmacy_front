// Mock data for the doctor → patient detail page.
// Used as a dev fallback when the patient has no backend appointments
// and for the Lab Results and Patient Notes tabs (no backend endpoint yet).

// ─── Shared types ─────────────────────────────────────────────────────────────

export interface MockVitalReading {
  name: string;
  value: string;
  unit: string;
}

export interface MockVitalRecord {
  id: string;
  recordedAt: string;
  nurseNotes?: string;
  readings: MockVitalReading[];
  nurse: { firstName: string; lastName: string };
}

export interface MockAppointment {
  id: string;
  date: string;
  status: string;
  reason: string;
  diagnosisSummary: string;
  doctorRecommendations: string;
  patientId: string;
  hospitalId: string;
  patient: { firstName: string; lastName: string; phone: string };
  hospital: { id: string; name: string };
}

export interface MockLabResult {
  id: string;
  testName: string;
  category: string;
  result: string;
  unit: string;
  referenceRange: string;
  status: 'Normal' | 'High' | 'Low' | 'Critical';
  orderedAt: string;
  resultAt: string;
  orderedBy: string;
  notes?: string;
}

export interface MockPatientNote {
  id: string;
  author: string;
  role: 'Doctor' | 'Nurse';
  content: string;
  createdAt: string;
  tags?: string[];
}

// ─── Mock patient identity ────────────────────────────────────────────────────

export const MOCK_PATIENT_ID = 'mock-patient-alice-johnson';

export const MOCK_PATIENT_INFO = {
  id: MOCK_PATIENT_ID,
  firstName: 'Alice',
  lastName: 'Johnson',
  phone: '+250 788 123 456',
  hospitalId: 'mock-hospital-kfh',
  hospitalName: 'King Faisal Hospital',
};

export interface MockPatientDemographics {
  mrn: string;
  gender: string;
  dateOfBirth: string;   // ISO date string
  bloodType: string;
  height: number;        // cm
  weight: number;        // kg
  allergies: string[];
  primaryPhysician: string;
  status: string;
  condition: string;
}

export const MOCK_PATIENT_DEMOGRAPHICS: MockPatientDemographics = {
  mrn: 'EV-2026-8942',
  gender: 'Female',
  dateOfBirth: '1997-10-12',
  bloodType: 'O Positive (O+)',
  height: 168,
  weight: 68.0,
  allergies: ['Penicillin', 'Peanuts'],
  primaryPhysician: 'Dr. Samuel Nkurunziza',
  status: 'ACTIVE CARE',
  condition: 'STABLE',
};

// ─── Vitals & Health Trends ───────────────────────────────────────────────────

export const MOCK_PATIENT_VITALS: MockVitalRecord[] = [
  {
    id: 'vr-001',
    recordedAt: '2026-07-15T08:00:00Z',
    readings: [
      { name: 'Blood Pressure', value: '130/85', unit: 'mmHg' },
      { name: 'Heart Rate',     value: '88',     unit: 'bpm'  },
      { name: 'Temperature',   value: '37.2',   unit: '°C'   },
      { name: 'Oxygen Saturation', value: '96', unit: '%'    },
      { name: 'Respiratory Rate',  value: '18', unit: 'breaths/min' },
      { name: 'Weight',        value: '68.0',   unit: 'kg'   },
    ],
    nurseNotes: 'Patient mildly anxious on admission. BP slightly elevated.',
    nurse: { firstName: 'Ange', lastName: 'Uwimana' },
  },
  {
    id: 'vr-002',
    recordedAt: '2026-07-16T08:30:00Z',
    readings: [
      { name: 'Blood Pressure', value: '128/82', unit: 'mmHg' },
      { name: 'Heart Rate',     value: '84',     unit: 'bpm'  },
      { name: 'Temperature',   value: '37.0',   unit: '°C'   },
      { name: 'Oxygen Saturation', value: '97', unit: '%'    },
      { name: 'Respiratory Rate',  value: '17', unit: 'breaths/min' },
      { name: 'Weight',        value: '67.8',   unit: 'kg'   },
    ],
    nurse: { firstName: 'Beni', lastName: 'Nshimiyimana' },
  },
  {
    id: 'vr-003',
    recordedAt: '2026-07-17T07:45:00Z',
    readings: [
      { name: 'Blood Pressure', value: '135/88', unit: 'mmHg' },
      { name: 'Heart Rate',     value: '90',     unit: 'bpm'  },
      { name: 'Temperature',   value: '37.4',   unit: '°C'   },
      { name: 'Oxygen Saturation', value: '95', unit: '%'    },
      { name: 'Respiratory Rate',  value: '19', unit: 'breaths/min' },
      { name: 'Weight',        value: '67.9',   unit: 'kg'   },
    ],
    nurseNotes: 'Slight fever. Dr. notified. Increased fluid intake.',
    nurse: { firstName: 'Clare', lastName: 'Ingabire' },
  },
  {
    id: 'vr-004',
    recordedAt: '2026-07-18T09:00:00Z',
    readings: [
      { name: 'Blood Pressure', value: '124/80', unit: 'mmHg' },
      { name: 'Heart Rate',     value: '80',     unit: 'bpm'  },
      { name: 'Temperature',   value: '36.9',   unit: '°C'   },
      { name: 'Oxygen Saturation', value: '97', unit: '%'    },
      { name: 'Respiratory Rate',  value: '16', unit: 'breaths/min' },
      { name: 'Weight',        value: '67.5',   unit: 'kg'   },
    ],
    nurse: { firstName: 'Ange', lastName: 'Uwimana' },
  },
  {
    id: 'vr-005',
    recordedAt: '2026-07-19T08:15:00Z',
    readings: [
      { name: 'Blood Pressure', value: '122/79', unit: 'mmHg' },
      { name: 'Heart Rate',     value: '76',     unit: 'bpm'  },
      { name: 'Temperature',   value: '36.8',   unit: '°C'   },
      { name: 'Oxygen Saturation', value: '98', unit: '%'    },
      { name: 'Respiratory Rate',  value: '16', unit: 'breaths/min' },
      { name: 'Weight',        value: '67.3',   unit: 'kg'   },
    ],
    nurse: { firstName: 'Beni', lastName: 'Nshimiyimana' },
  },
  {
    id: 'vr-006',
    recordedAt: '2026-07-20T08:00:00Z',
    readings: [
      { name: 'Blood Pressure', value: '126/81', unit: 'mmHg' },
      { name: 'Heart Rate',     value: '78',     unit: 'bpm'  },
      { name: 'Temperature',   value: '37.0',   unit: '°C'   },
      { name: 'Oxygen Saturation', value: '98', unit: '%'    },
      { name: 'Respiratory Rate',  value: '15', unit: 'breaths/min' },
      { name: 'Weight',        value: '67.2',   unit: 'kg'   },
    ],
    nurse: { firstName: 'Clare', lastName: 'Ingabire' },
  },
  {
    id: 'vr-007',
    recordedAt: '2026-07-21T07:50:00Z',
    readings: [
      { name: 'Blood Pressure', value: '120/78', unit: 'mmHg' },
      { name: 'Heart Rate',     value: '74',     unit: 'bpm'  },
      { name: 'Temperature',   value: '36.7',   unit: '°C'   },
      { name: 'Oxygen Saturation', value: '99', unit: '%'    },
      { name: 'Respiratory Rate',  value: '15', unit: 'breaths/min' },
      { name: 'Weight',        value: '67.1',   unit: 'kg'   },
    ],
    nurseNotes: 'Patient improving well. Alert and oriented.',
    nurse: { firstName: 'Ange', lastName: 'Uwimana' },
  },
  {
    id: 'vr-008',
    recordedAt: '2026-07-22T08:10:00Z',
    readings: [
      { name: 'Blood Pressure', value: '122/80', unit: 'mmHg' },
      { name: 'Heart Rate',     value: '72',     unit: 'bpm'  },
      { name: 'Temperature',   value: '37.0',   unit: '°C'   },
      { name: 'Oxygen Saturation', value: '98', unit: '%'    },
      { name: 'Respiratory Rate',  value: '16', unit: 'breaths/min' },
      { name: 'Weight',        value: '67.0',   unit: 'kg'   },
    ],
    nurseNotes: 'Stable. Ready for physician review.',
    nurse: { firstName: 'Beni', lastName: 'Nshimiyimana' },
  },
];

// ─── Overview / Consultations ─────────────────────────────────────────────────

export const MOCK_PATIENT_APPOINTMENTS: MockAppointment[] = [
  {
    id: 'appt-001',
    date: '2026-07-22T09:00:00Z',
    status: 'COMPLETED',
    reason: 'Hypertension follow-up',
    diagnosisSummary: 'Blood pressure well-controlled on current regimen. No acute complications.',
    doctorRecommendations: 'Continue Amlodipine 5 mg once daily. Low-sodium diet. Follow-up in 4 weeks.',
    patientId: MOCK_PATIENT_ID,
    hospitalId: 'mock-hospital-kfh',
    patient: { firstName: 'Alice', lastName: 'Johnson', phone: '+250 788 123 456' },
    hospital: { id: 'mock-hospital-kfh', name: 'King Faisal Hospital' },
  },
  {
    id: 'appt-002',
    date: '2026-07-15T10:30:00Z',
    status: 'COMPLETED',
    reason: 'Chest tightness — acute assessment',
    diagnosisSummary: 'Non-cardiac chest pain, likely musculoskeletal. ECG normal.',
    doctorRecommendations: 'Ibuprofen 400 mg TID for 5 days. Avoid heavy lifting. Return if symptoms worsen.',
    patientId: MOCK_PATIENT_ID,
    hospitalId: 'mock-hospital-kfh',
    patient: { firstName: 'Alice', lastName: 'Johnson', phone: '+250 788 123 456' },
    hospital: { id: 'mock-hospital-kfh', name: 'King Faisal Hospital' },
  },
  {
    id: 'appt-003',
    date: '2026-06-10T11:00:00Z',
    status: 'COMPLETED',
    reason: 'Routine check-up',
    diagnosisSummary: 'General health satisfactory. Mild vitamin D deficiency noted.',
    doctorRecommendations: 'Vitamin D3 2000 IU daily. Encourage 30 min outdoor activity. Annual labs ordered.',
    patientId: MOCK_PATIENT_ID,
    hospitalId: 'mock-hospital-kfh',
    patient: { firstName: 'Alice', lastName: 'Johnson', phone: '+250 788 123 456' },
    hospital: { id: 'mock-hospital-kfh', name: 'King Faisal Hospital' },
  },
  {
    id: 'appt-004',
    date: '2026-05-03T14:00:00Z',
    status: 'COMPLETED',
    reason: 'Headache and dizziness',
    diagnosisSummary: 'Tension-type headache. BP mildly elevated at 142/92 on presentation.',
    doctorRecommendations: 'Paracetamol 1 g PRN. Started Amlodipine 5 mg. BP monitoring diary provided.',
    patientId: MOCK_PATIENT_ID,
    hospitalId: 'mock-hospital-kfh',
    patient: { firstName: 'Alice', lastName: 'Johnson', phone: '+250 788 123 456' },
    hospital: { id: 'mock-hospital-kfh', name: 'King Faisal Hospital' },
  },
  {
    id: 'appt-005',
    date: '2026-03-20T09:30:00Z',
    status: 'COMPLETED',
    reason: 'New patient registration',
    diagnosisSummary: 'Initial assessment. No chronic conditions identified at this visit.',
    doctorRecommendations: 'Baseline labs requested. Healthy lifestyle counselling provided.',
    patientId: MOCK_PATIENT_ID,
    hospitalId: 'mock-hospital-kfh',
    patient: { firstName: 'Alice', lastName: 'Johnson', phone: '+250 788 123 456' },
    hospital: { id: 'mock-hospital-kfh', name: 'King Faisal Hospital' },
  },
];

// ─── Lab Results ──────────────────────────────────────────────────────────────

export const MOCK_LAB_RESULTS: MockLabResult[] = [
  {
    id: 'lr-001',
    testName: 'Complete Blood Count (CBC)',
    category: 'Hematology',
    result: '13.5',
    unit: 'g/dL',
    referenceRange: '12.0 – 16.0',
    status: 'Normal',
    orderedAt: '2026-07-20T08:00:00Z',
    resultAt: '2026-07-20T14:30:00Z',
    orderedBy: 'Dr. Robert Mugisha',
    notes: 'Hemoglobin, WBC, and platelet counts all within normal limits.',
  },
  {
    id: 'lr-002',
    testName: 'Comprehensive Metabolic Panel',
    category: 'Chemistry',
    result: '5.8',
    unit: 'mmol/L',
    referenceRange: '3.9 – 5.6',
    status: 'High',
    orderedAt: '2026-07-20T08:00:00Z',
    resultAt: '2026-07-20T15:00:00Z',
    orderedBy: 'Dr. Robert Mugisha',
    notes: 'Fasting glucose mildly elevated. Recommend repeat fasting test and dietary review.',
  },
  {
    id: 'lr-003',
    testName: 'Lipid Panel',
    category: 'Chemistry',
    result: '5.4',
    unit: 'mmol/L',
    referenceRange: '< 5.2',
    status: 'High',
    orderedAt: '2026-06-10T11:00:00Z',
    resultAt: '2026-06-11T09:00:00Z',
    orderedBy: 'Dr. Robert Mugisha',
    notes: 'Total cholesterol borderline high. LDL 3.1 mmol/L. Lifestyle modification advised.',
  },
  {
    id: 'lr-004',
    testName: 'Vitamin D (25-OH)',
    category: 'Endocrinology',
    result: '18',
    unit: 'ng/mL',
    referenceRange: '30 – 100',
    status: 'Low',
    orderedAt: '2026-06-10T11:00:00Z',
    resultAt: '2026-06-12T10:00:00Z',
    orderedBy: 'Dr. Robert Mugisha',
    notes: 'Insufficient vitamin D. Supplementation started — recheck in 3 months.',
  },
  {
    id: 'lr-005',
    testName: 'Urinalysis',
    category: 'Microbiology',
    result: 'Negative',
    unit: '—',
    referenceRange: 'Negative',
    status: 'Normal',
    orderedAt: '2026-07-20T08:00:00Z',
    resultAt: '2026-07-20T12:00:00Z',
    orderedBy: 'Dr. Robert Mugisha',
    notes: 'No protein, glucose, or nitrites detected. Normal microscopy.',
  },
  {
    id: 'lr-006',
    testName: 'Thyroid Stimulating Hormone (TSH)',
    category: 'Endocrinology',
    result: '2.1',
    unit: 'mIU/L',
    referenceRange: '0.4 – 4.0',
    status: 'Normal',
    orderedAt: '2026-03-20T09:30:00Z',
    resultAt: '2026-03-21T08:00:00Z',
    orderedBy: 'Dr. Robert Mugisha',
  },
];

// ─── Patient Notes ────────────────────────────────────────────────────────────

export const MOCK_PATIENT_NOTES: MockPatientNote[] = [
  {
    id: 'note-001',
    author: 'Dr. Robert Mugisha',
    role: 'Doctor',
    content:
      'Patient presents with well-controlled hypertension on Amlodipine 5 mg. ' +
      'Reports occasional morning headaches but no blurred vision, chest pain, or dyspnoea. ' +
      'BP today 122/80 mmHg — significantly improved from initial presentation. ' +
      'Continue current regimen. Plan to consider dose reduction at next visit if BP remains stable.',
    createdAt: '2026-07-22T09:45:00Z',
    tags: ['Hypertension', 'Follow-up', 'Stable'],
  },
  {
    id: 'note-002',
    author: 'Ange Uwimana',
    role: 'Nurse',
    content:
      'Patient alert and oriented x3. Ambulatory without assistance. ' +
      'Appetite good — tolerated full diet. IV line patent; no signs of infiltration or phlebitis. ' +
      'Sleep reported as adequate. Encouraged fluid intake of ≥ 2 L/day. ' +
      'Patient verbally confirms understanding of discharge instructions.',
    createdAt: '2026-07-21T20:00:00Z',
    tags: ['Evening Assessment', 'Ambulation', 'Discharge Planning'],
  },
  {
    id: 'note-003',
    author: 'Dr. Robert Mugisha',
    role: 'Doctor',
    content:
      'Reviewed lab results from 2026-07-20. Fasting glucose 5.8 mmol/L — borderline. ' +
      'No current diabetes diagnosis warranted but pre-diabetic picture emerging alongside ' +
      'borderline hypercholesterolaemia. Referred to dietitian. Advised on Mediterranean-style diet. ' +
      'Will repeat glucose and lipid panel in 3 months.',
    createdAt: '2026-07-20T16:00:00Z',
    tags: ['Lab Review', 'Pre-diabetes Risk', 'Dietitian Referral'],
  },
  {
    id: 'note-004',
    author: 'Clare Ingabire',
    role: 'Nurse',
    content:
      'Admission vitals recorded. Patient arrived via OPD referral. ' +
      'BP on arrival 130/85 mmHg. Slight anxiety noted — reassurance given. ' +
      'Orientation to ward completed. Patient and family briefed on daily routine, call system, and visiting hours.',
    createdAt: '2026-07-15T08:30:00Z',
    tags: ['Admission', 'Orientation'],
  },
];
