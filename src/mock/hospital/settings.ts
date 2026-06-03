import type { HospitalSettings, AdminProfile } from '@/types/hospital';

export const MOCK_HOSPITAL_SETTINGS: HospitalSettings = {
  hospitalName: 'E-Vuze General Hospital',
  address: 'KG 15 Ave, Kigali, Rwanda',
  phone: '0987654321',
  email: 'admin@evuze-hospital.rw',
};

export const MOCK_ADMIN_PROFILE: AdminProfile = {
  firstName: 'Jean',
  lastName: 'Habimana',
  email: 'jean.habimana@evuze.rw',
  phone: '+250788000200',
};

export interface HospitalFee {
  id: string;
  service: string;
  price: number;
  status: 'Active' | 'Inactive';
}

export interface HospitalAnnouncement {
  id: string;
  title: string;
  date: string;
  time: string;
  type: 'Urgent' | 'Formal' | 'General';
}

export interface HospitalDepartment {
  id: string;
  name: string;
  head: string;
  staffCount: number;
}

export const MOCK_HOSPITAL_FEES: HospitalFee[] = [
  { id: 'fee-001', service: 'Consultation', price: 10000, status: 'Active' },
  { id: 'fee-002', service: 'K-RAY',        price: 70000, status: 'Active' },
  { id: 'fee-003', service: 'Emergency',    price: 5000,  status: 'Active' },
];

export const MOCK_HOSPITAL_ANNOUNCEMENTS: HospitalAnnouncement[] = [
  { id: 'ann-001', title: 'Staff Meeting',      date: 'May 3, 2025',  time: '10 am', type: 'Urgent'  },
  { id: 'ann-002', title: 'New Policy Update',  date: 'May 1, 2025',  time: '12 pm', type: 'Formal'  },
];

export const MOCK_HOSPITAL_DEPARTMENTS: HospitalDepartment[] = [
  { id: 'dep-001', name: 'Cardiology', head: 'Dr Uwase A',    staffCount: 11 },
  { id: 'dep-002', name: 'Laboratory', head: 'Dr Jean Claude', staffCount: 15 },
];
