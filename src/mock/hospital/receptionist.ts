// Mock data for the receptionist (front desk) portal.
// Frontend-only: replace with real endpoints once the receptionist API is ready.

// ── Dashboard charts ──────────────────────────────────────────────────────────

export interface ReceptionistDailyPoint {
  label: string;   // Mon, Tue, ...
  value: number;
}

export const MOCK_NEW_PATIENTS_WEEK: ReceptionistDailyPoint[] = [
  { label: 'Mon', value: 200 },
  { label: 'Tue', value: 300 },
  { label: 'Wed', value: 200 },
  { label: 'Thu', value: 90 },
  { label: 'Fri', value: 230 },
  { label: 'Sat', value: 220 },
  { label: 'Sun', value: 190 },
];

export const MOCK_CHECKINS_WEEK: ReceptionistDailyPoint[] = [
  { label: 'Mon', value: 110 },
  { label: 'Tue', value: 185 },
  { label: 'Wed', value: 150 },
  { label: 'Thu', value: 70 },
  { label: 'Fri', value: 60 },
  { label: 'Sat', value: 105 },
  { label: 'Sun', value: 120 },
];

// ── Check-ins & Queue overview ────────────────────────────────────────────────

export type QueueStatus = 'WAITING' | 'IN_CONSULTATION' | 'COMPLETED';

export interface QueueEntry {
  id: string;
  patientName: string;
  token: string;
  department: string;
  status: QueueStatus;
}

export const MOCK_QUEUE: QueueEntry[] = [
  { id: 'q-1', patientName: 'Mugisha Arsene', token: 'T-101', department: 'General Medicine', status: 'WAITING' },
  { id: 'q-2', patientName: 'Atete Solange',  token: 'T-102', department: 'Dermatology',      status: 'WAITING' },
  { id: 'q-3', patientName: 'Butera Ammy',    token: 'T-103', department: 'Orthopedics',      status: 'IN_CONSULTATION' },
];

// ── Today's appointments ──────────────────────────────────────────────────────

export type TodayAppointmentStatus = 'COMPLETED' | 'UPCOMING' | 'CHECKED_IN';

export interface TodayAppointment {
  id: string;
  time: string;
  patientName: string;
  doctorName: string;
  status: TodayAppointmentStatus;
}

export const MOCK_TODAY_APPOINTMENTS: TodayAppointment[] = [
  { id: 'a-1', time: '9:30 AM',  patientName: 'Mugisha Arsene', doctorName: 'Dr. Damascene', status: 'COMPLETED' },
  { id: 'a-2', time: '10:00 AM', patientName: 'Atete Solange',  doctorName: 'Dr. Mutoni Ivy', status: 'UPCOMING' },
  { id: 'a-3', time: '10:30 AM', patientName: 'Butera Ammy',    doctorName: 'Dr. Abera Joy',  status: 'CHECKED_IN' },
];

// ── Notifications ─────────────────────────────────────────────────────────────

export type ReceptionistNotificationType =
  | 'APPOINTMENT_BOOKED'
  | 'PATIENT_REGISTERED'
  | 'APPOINTMENT_REMINDER'
  | 'SYSTEM';

export interface ReceptionistNotification {
  id: string;
  type: ReceptionistNotificationType;
  title: string;
  message: string;
  time: string;
  isRead: boolean;
}

export const MOCK_RECEPTIONIST_NOTIFICATIONS: ReceptionistNotification[] = [
  {
    id: 'n-1',
    type: 'APPOINTMENT_BOOKED',
    title: 'New Appointment Booked',
    message: 'A new appointment has been booked with Dr. Ammy on August 20, 2026',
    time: '2min ago',
    isRead: false,
  },
  {
    id: 'n-2',
    type: 'PATIENT_REGISTERED',
    title: 'New Patient Registered',
    message: 'Annet Mutesi has been successfully registered',
    time: '15min ago',
    isRead: false,
  },
  {
    id: 'n-3',
    type: 'APPOINTMENT_REMINDER',
    title: 'Appointment Remainder',
    message: 'Appointment remainder has been sent to Mugisha Tom on July 16, 2026',
    time: '1hr ago',
    isRead: false,
  },
  {
    id: 'n-4',
    type: 'SYSTEM',
    title: 'System Notification',
    message: 'Scheduled maintenance on May 20, 2027 from 1:00AM to 3:30AM',
    time: '3hrs ago',
    isRead: true,
  },
];

// ── Profile ───────────────────────────────────────────────────────────────────

export const MOCK_RECEPTIONIST_PROFILE = {
  fullName: 'Receptionist',
  jobTitle: 'Front Desk',
  roleLabel: 'Receptionist',
  email: 'receptionist@medplus.com',
  phone: '+250758948349',
  username: 'receptionist',
  department: 'Front Desk',
  address: 'KG 11 Ave, Kigali',
  joinedAt: 'Jan 10, 2024',
  dateOfJoining: '2024-01-10',
};
