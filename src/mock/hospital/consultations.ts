import type { Consultation, Refusal, Patient, PatientDetail, PatientRx } from '@/types/hospital';

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

// Prescriptions per patient — used by the doctor prescription page
export const MOCK_PATIENT_RX: Record<string, PatientRx[]> = {
  'pat-001': [
    { id: 'rx-001', name: 'Paracetamol 500mg',      description: '1 Tablet everyday for 1 week in the morning, lunch and night after food.' },
    { id: 'rx-002', name: 'Liquiprin',               description: '1 teaspoon everyday for 5 days in the morning and night after food.'       },
  ],
  'pat-002': [
    { id: 'rx-003', name: 'Salbutamol Inhaler',      description: '2 puffs every 4–6 hours as needed. Max 8 puffs per day.'                  },
    { id: 'rx-004', name: 'Prednisolone 5mg',        description: '1 Tablet daily in the morning after food for 5 days.'                     },
  ],
  'pat-003': [
    { id: 'rx-005', name: 'Ibuprofen 400mg',         description: '1 Tablet three times daily after food for 7 days.'                        },
    { id: 'rx-006', name: 'Omeprazole 20mg',         description: '1 Capsule every morning before food for 14 days.'                         },
  ],
  'pat-004': [
    { id: 'rx-007', name: 'Amlodipine 5mg',          description: '1 Tablet daily in the morning after food.'                                },
    { id: 'rx-008', name: 'Hydrochlorothiazide 25mg', description: '1 Tablet daily in the morning after food.'                               },
  ],
  'pat-005': [
    { id: 'rx-009', name: 'Artemether/Lumefantrine',  description: '4 Tablets twice daily for 3 days after food.'                            },
  ],
  'pat-006': [
    { id: 'rx-010', name: 'Sumatriptan 50mg',         description: '1 Tablet at onset of migraine. May repeat after 2 hours.'                },
    { id: 'rx-011', name: 'Amitriptyline 10mg',       description: '1 Tablet at bedtime for 30 days.'                                        },
  ],
};

// Extended patient details — used by Patient Info tab on the prescription page
export const MOCK_PATIENT_DETAILS: Record<string, PatientDetail> = {
  'pat-001': { dob: '2000-04-12', bloodType: 'A+',  phone: '+250 788 001 101', email: 'sarah.mitchell@gmail.com',      address: 'KG 14 Ave, Kigali',    insurance: 'RSSB',       insuranceId: 'RSSB-00101',  allergies: ['Penicillin'],                   emergencyContact: { name: 'Tom Mitchell',    relation: 'Father',  phone: '+250 788 001 102' } },
  'pat-002': { dob: '1992-09-03', bloodType: 'O+',  phone: '+250 788 002 201', email: 'ngabo.steph@gmail.com',         address: 'KN 5 Rd, Kigali',      insurance: 'Sanlam',     insuranceId: 'SAN-00202',   allergies: ['Aspirin', 'Dust'],              emergencyContact: { name: 'Anne Ngabo',      relation: 'Mother',  phone: '+250 788 002 202' } },
  'pat-003': { dob: '1940-02-28', bloodType: 'B+',  phone: '+250 788 003 301', email: 'ineza.mary@gmail.com',          address: 'KK 12 Ave, Kigali',    insurance: 'UAP Rwanda', insuranceId: 'UAP-00303',   allergies: ['Sulfonamides'],                 emergencyContact: { name: 'Paul Ineza',      relation: 'Son',     phone: '+250 788 003 302' } },
  'pat-004': { dob: '1981-07-15', bloodType: 'AB+', phone: '+250 788 004 401', email: 'jeanbosco.niyonzima@gmail.com', address: 'Remera, Kigali',        insurance: 'RSSB',       insuranceId: 'RSSB-00404',  allergies: [],                               emergencyContact: { name: 'Marie Niyonzima', relation: 'Spouse',  phone: '+250 788 004 402' } },
  'pat-005': { dob: '1997-12-20', bloodType: 'O-',  phone: '+250 788 005 501', email: 'claudine.uwimana@gmail.com',    address: 'Nyamirambo, Kigali',   insurance: 'Britam',     insuranceId: 'BRT-00505',   allergies: ['Chloroquine'],                  emergencyContact: { name: 'Eric Uwimana',    relation: 'Brother', phone: '+250 788 005 502' } },
  'pat-006': { dob: '1985-03-09', bloodType: 'A-',  phone: '+250 788 006 601', email: 'odette.umuraza@gmail.com',      address: 'Gisozi, Kigali',        insurance: 'Sanlam',     insuranceId: 'SAN-00606',   allergies: ['NSAIDs'],                       emergencyContact: { name: 'Claude Umuraza',  relation: 'Spouse',  phone: '+250 788 006 602' } },
  'pat-007': { dob: '1974-06-25', bloodType: 'B-',  phone: '+250 788 007 701', email: 'gaspard.bizimana@gmail.com',    address: 'Kacyiru, Kigali',       insurance: 'RSSB',       insuranceId: 'RSSB-00707',  allergies: ['Metformin (GI intolerance)'],   emergencyContact: { name: 'Rose Bizimana',   relation: 'Spouse',  phone: '+250 788 007 702' } },
  'pat-008': { dob: '1999-11-11', bloodType: 'O+',  phone: '+250 788 008 801', email: 'immaculee.uwera@gmail.com',     address: 'Kimironko, Kigali',     insurance: 'UAP Rwanda', insuranceId: 'UAP-00808',   allergies: [],                               emergencyContact: { name: 'Josephine Uwera', relation: 'Mother',  phone: '+250 788 008 802' } },
  'pat-009': { dob: '1988-08-30', bloodType: 'AB-', phone: '+250 788 009 901', email: 'chantal.mukabutera@gmail.com',  address: 'Muhima, Kigali',        insurance: 'Britam',     insuranceId: 'BRT-00909',   allergies: ['Latex'],                        emergencyContact: { name: 'Eric Mukabutera', relation: 'Spouse',  phone: '+250 788 009 902' } },
  'pat-010': { dob: '1990-01-17', bloodType: 'A+',  phone: '+250 788 010 001', email: 'theogene.murenzi@gmail.com',    address: 'Nyarugenge, Kigali',    insurance: 'RSSB',       insuranceId: 'RSSB-01010',  allergies: [],                               emergencyContact: { name: 'Alice Murenzi',   relation: 'Spouse',  phone: '+250 788 010 002' } },
  'pat-011': { dob: '1978-05-04', bloodType: 'O+',  phone: '+250 788 011 101', email: 'emmanuel.gakwerere@gmail.com',  address: 'Kinyinya, Kigali',      insurance: 'Sanlam',     insuranceId: 'SAN-01111',   allergies: ['Codeine'],                      emergencyContact: { name: 'Diane Gakwerere', relation: 'Spouse',  phone: '+250 788 011 102' } },
  'pat-012': { dob: '1995-10-22', bloodType: 'B+',  phone: '+250 788 012 201', email: 'alphonsine.umutoni@gmail.com',  address: 'Gasabo, Kigali',        insurance: 'UAP Rwanda', insuranceId: 'UAP-01212',   allergies: ['Amoxicillin'],                  emergencyContact: { name: 'Pierre Umutoni',  relation: 'Father',  phone: '+250 788 012 202' } },
};

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
