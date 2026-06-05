import type { Consultation, Refusal, Patient } from '@/types/hospital';

// Consultations — derived from completed/active appointments
export const MOCK_CONSULTATIONS: Consultation[] = [
  { id: 'con-001', patientName: 'Aimable Tuyishimire',    date: '2026-06-01', type: 'Follow-up',           diagnosis: 'Stable angina',        duration: '25 min', status: 'COMPLETED', gender: 'Male',   age: 58, bp: '142/88' },
  { id: 'con-002', patientName: 'Regis Habineza',         date: '2026-06-02', type: 'Review',              diagnosis: 'Hypertension Grade 1', duration: '20 min', status: 'COMPLETED', gender: 'Male',   age: 45, bp: '128/82' },
  { id: 'con-003', patientName: 'Claudine Uwimana',       date: '2026-06-01', type: 'Initial Visit',       diagnosis: 'Pending labs',                             status: 'ACTIVE',    gender: 'Female', age: 29, bp: '118/76' },
  { id: 'con-004', patientName: 'Jean Bosco Niyonzima',   date: '2026-06-01', type: 'Follow-up',                                                                  status: 'ACTIVE',    gender: 'Male',   age: 45, bp: '135/88' },
  { id: 'con-005', patientName: 'Fidele Nsengimana',      date: '2026-06-04', type: 'Review',              diagnosis: 'Controlled epilepsy',  duration: '15 min', status: 'COMPLETED', gender: 'Male',   age: 31, bp: '120/78' },
  { id: 'con-006', patientName: 'Sylvie Nzeyimana',       date: '2026-06-03', type: 'Initial Visit',       diagnosis: 'Falciparum malaria',   duration: '30 min', status: 'COMPLETED', gender: 'Female', age: 24, bp: '110/70' },
  { id: 'con-007', patientName: 'Thierry Nkurunziza',     date: '2026-06-01', type: 'Initial Visit',                                                              status: 'PENDING',   gender: 'Male',   age: 19, bp: '116/74' },
  { id: 'con-008', patientName: 'Esperance Mukandoli',    date: '2026-06-01', type: 'Pre-operative',                                                              status: 'PENDING',   gender: 'Female', age: 34, bp: '122/80' },
  { id: 'con-009', patientName: 'Odette Umuraza',         date: '2026-06-01', type: 'Specialist Referral', diagnosis: 'Chronic migraine',                         status: 'ACTIVE',    gender: 'Female', age: 41, bp: '115/75' },
  { id: 'con-010', patientName: 'Chantal Mukabutera',     date: '2026-06-02', type: 'Follow-up',                                                                  status: 'ACTIVE',    gender: 'Female', age: 38, bp: '124/82' },
  { id: 'con-011', patientName: 'Gaspard Bizimana',       date: '2026-06-01', type: 'Annual Check',                                                               status: 'PENDING',   gender: 'Male',   age: 52, bp: '138/86' },
  { id: 'con-012', patientName: 'Immaculee Uwera',        date: '2026-06-02', type: 'Post-operative',                                                             status: 'ACTIVE',    gender: 'Female', age: 27, bp: '108/68' },
  { id: 'con-013', patientName: 'Alphonsine Umutoni',     date: '2026-06-04', type: 'Initial Visit',                                                              status: 'PENDING',   gender: 'Female', age: 31, bp: '112/72' },
  { id: 'con-014', patientName: 'Placide Nzabonimana',    date: '2026-06-02', type: 'Initial Visit',                                                              status: 'PENDING',   gender: 'Male',   age: 8,  bp: '90/60'  },
  { id: 'con-015', patientName: 'Emmanuel Gakwerere',     date: '2026-06-03', type: 'Specialist Referral',                                                        status: 'ACTIVE',    gender: 'Male',   age: 48, bp: '130/84' },
  { id: 'con-016', patientName: 'Faustin Niyomugabo',     date: '2026-06-02', type: 'Follow-up',                                                                  status: 'PENDING',   gender: 'Male',   age: 36, bp: '126/80' },
  { id: 'con-017', patientName: 'Theogene Murenzi',       date: '2026-06-03', type: 'Surgical Consult',                                                           status: 'ACTIVE',    gender: 'Male',   age: 36, bp: '132/86' },
  { id: 'con-018', patientName: 'Marie Claire Mukasonga', date: '2026-06-03', type: 'Milestone Check',                                                            status: 'PENDING',   gender: 'Female', age: 28, bp: '114/74' },
];

// Patients — doctor's assigned patient list
export const MOCK_PATIENTS: Patient[] = [
  { id: 'pat-001', patientId: 'PT-234', name: 'Sarah Mitchell',        age: 24, gender: 'Female', lastVisit: '2024-12-30', condition: 'DIABETES',         status: 'ACTIVE',   isNew: true,  followUpDue: false },
  { id: 'pat-002', patientId: 'PT-134', name: 'Ngabo Steph',           age: 32, gender: 'Male',   lastVisit: '2024-10-05', condition: 'ASTHMA',           status: 'CRITICAL', isNew: false, followUpDue: true  },
  { id: 'pat-003', patientId: 'PT-124', name: 'Ineza Mary',            age: 84, gender: 'Female', lastVisit: '2024-09-23', condition: 'ARTHRITIS',        status: 'ACTIVE',   isNew: false, followUpDue: true  },
  { id: 'pat-004', patientId: 'PT-201', name: 'Jean Bosco Niyonzima',  age: 45, gender: 'Male',   lastVisit: '2026-06-01', condition: 'HYPERTENSION',     status: 'ACTIVE',   isNew: false, followUpDue: false },
  { id: 'pat-005', patientId: 'PT-202', name: 'Claudine Uwimana',      age: 29, gender: 'Female', lastVisit: '2026-06-01', condition: 'MALARIA',          status: 'ACTIVE',   isNew: true,  followUpDue: false },
  { id: 'pat-006', patientId: 'PT-203', name: 'Odette Umuraza',        age: 41, gender: 'Female', lastVisit: '2026-06-01', condition: 'CHRONIC MIGRAINE', status: 'CRITICAL', isNew: false, followUpDue: true  },
  { id: 'pat-007', patientId: 'PT-204', name: 'Gaspard Bizimana',      age: 52, gender: 'Male',   lastVisit: '2026-06-01', condition: 'DIABETES',         status: 'ACTIVE',   isNew: false, followUpDue: true  },
  { id: 'pat-008', patientId: 'PT-205', name: 'Immaculee Uwera',       age: 27, gender: 'Female', lastVisit: '2026-06-02', condition: 'POST-OPERATIVE',   status: 'INACTIVE', isNew: false, followUpDue: false },
  { id: 'pat-009', patientId: 'PT-206', name: 'Chantal Mukabutera',    age: 38, gender: 'Female', lastVisit: '2026-06-02', condition: 'NEUROLOGY',        status: 'INACTIVE', isNew: false, followUpDue: false },
  { id: 'pat-010', patientId: 'PT-207', name: 'Theogene Murenzi',      age: 36, gender: 'Male',   lastVisit: '2026-06-03', condition: 'APPENDICITIS',     status: 'ACTIVE',   isNew: true,  followUpDue: false },
  { id: 'pat-011', patientId: 'PT-208', name: 'Emmanuel Gakwerere',    age: 48, gender: 'Male',   lastVisit: '2026-06-03', condition: 'LUMBAR PAIN',      status: 'ACTIVE',   isNew: false, followUpDue: false },
  { id: 'pat-012', patientId: 'PT-209', name: 'Alphonsine Umutoni',    age: 31, gender: 'Female', lastVisit: '2026-06-04', condition: 'ARRHYTHMIA',       status: 'INACTIVE', isNew: false, followUpDue: false },
];

// Refusals — insurance/coverage rejections
export const MOCK_REFUSALS: Refusal[] = [
  { id: 'ref-001', patientName: 'Chantal Mukabutera',    date: '2026-05-20', reason: 'Procedure not covered by plan',          insurance: 'Britam',       status: 'REJECTED' },
  { id: 'ref-002', patientName: 'Vestine Nyiranzeyimana',date: '2026-05-15', reason: 'Incomplete documentation submitted',      insurance: 'Britam',       status: 'REJECTED' },
  { id: 'ref-003', patientName: 'Joselyne Uwizeyimana',  date: '2026-06-04', reason: 'Specialist referral not pre-authorised',  insurance: 'Sanlam',       status: 'REJECTED' },
  { id: 'ref-004', patientName: 'Esperance Mukandoli',   date: '2026-05-25', reason: 'Annual benefit limit reached',            insurance: 'Sanlam',       status: 'PENDING'  },
  { id: 'ref-005', patientName: 'Theogene Murenzi',      date: '2026-06-01', reason: 'Surgery pre-authorisation in review',     insurance: 'UAP Rwanda',   status: 'PENDING'  },
  { id: 'ref-006', patientName: 'Immaculee Uwera',       date: '2026-05-31', reason: 'Out-of-network provider',                 insurance: 'UAP Rwanda',   status: 'PENDING'  },
  { id: 'ref-007', patientName: 'Odette Umuraza',        date: '2026-05-18', reason: 'Awaiting specialist referral letter',     insurance: 'Sanlam',       status: 'PENDING'  },
  { id: 'ref-008', patientName: 'Jean Bosco Niyonzima',  date: '2026-05-10', reason: 'Insurance card expired at time of visit', insurance: 'RSSB',         status: 'APPROVED' },
  { id: 'ref-009', patientName: 'Gaspard Bizimana',      date: '2026-05-05', reason: 'Missing employer contribution certificate',insurance: 'RSSB',        status: 'APPROVED' },
  { id: 'ref-010', patientName: 'Faustin Niyomugabo',    date: '2026-06-02', reason: 'Dermatology not in basic plan',           insurance: 'RSSB',         status: 'PENDING'  },
  { id: 'ref-011', patientName: 'Placide Nzabonimana',   date: '2026-06-02', reason: 'Paediatric specialist claim under review', insurance: 'RSSB',        status: 'PENDING'  },
  { id: 'ref-012', patientName: 'Claudine Uwimana',      date: '2026-05-30', reason: 'Emergency admission pending authorisation',insurance: 'UAP Rwanda',  status: 'APPROVED' },
];
