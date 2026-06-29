// Mock data matching GET /api/hospitals/:hospitalId/dashboard/stats
// and GET /api/hospitals/:hospitalId/dashboard/weekly-revenue

import type { DashboardStats, WeeklyRevenue, Appointment } from '@/types/hospital';

export const MOCK_DASHBOARD_STATS: DashboardStats = {
  totalAppointments: {
    thisMonth: 134,
    allTime: 2841,
  },
  appointmentsByStatus: {
    PENDING: 47,
    CONFIRMED: 61,
    COMPLETED: 18,
    CANCELLED: 8,
  },
  totalRevenue: 48_750_000,
  monthlyRevenue: 4_320_000,
  totalDoctors: 16,
  activeDoctors: 12,
  totalPatients: 412,
};

// Source: GET /api/hospitals/:hospitalId/dashboard/weekly-revenue
export const MOCK_WEEKLY_REVENUE: WeeklyRevenue[] = [
  { label: 'May 4 – May 10',  revenue: 980_000 },
  { label: 'May 11 – May 17', revenue: 1_140_000 },
  { label: 'May 18 – May 24', revenue: 1_060_000 },
  { label: 'May 25 – May 31', revenue: 1_320_000 },
];

export const MOCK_PATIENT_CATEGORIES = [
  { label: 'Male', value: 32, color: '#1D4ED8' },
  { label: 'Female', value: 28, color: '#2563EB' },
  { label: 'Children', value: 22, color: '#0EA5E9' },
  { label: 'Other', value: 18, color: '#60A5FA' },
];

export const MOCK_DASHBOARD_NOTIFICATIONS = [
  { id: 'note-001', time: '08:15 AM', notification: 'Emergency patient admitted', priority: 'Low', status: 'New' },
  { id: 'note-002', time: '09:30 AM', notification: 'Lab result available', priority: 'Medium', status: 'Viewed' },
  { id: 'note-003', time: '10:00 AM', notification: 'Medicine stock alert', priority: 'High', status: 'Viewed' },
  { id: 'note-004', time: '11:00 AM', notification: 'Patient discharge completed', priority: 'Medium', status: 'New' },
  { id: 'note-005', time: '11:20 AM', notification: 'Emergency patient admitted', priority: 'High', status: 'New' },
  { id: 'note-006', time: '12:40 AM', notification: 'Medicine stock alert', priority: 'Low', status: 'Viewed' },
  { id: 'note-007', time: '01:30 AM', notification: 'Patient discharge completed', priority: 'Medium', status: 'New' },
  { id: 'note-008', time: '02:00 AM', notification: 'Lab result available', priority: 'High', status: 'Viewed' },
];

// Recent appointments (last 5) — derived from GET /api/appointments sorted desc
export const MOCK_RECENT_APPOINTMENTS: Pick<
  Appointment,
  'id' | 'patientName' | 'doctorName' | 'date' | 'status' | 'specialization' | 'condition' | 'healthStatus'
>[] = [
  { id: 'apt-001', patientName: 'Jean Bosco Niyonzima',  doctorName: 'Dr. Alice Mutoni',   date: '2026-06-01T08:30:00Z', status: 'CONFIRMED',       specialization: 'Cardiology',       condition: 'HYPERTENSION', healthStatus: 'STABLE' },
  { id: 'apt-002', patientName: 'Claudine Uwimana',       doctorName: 'Dr. Patrick Habimana', date: '2026-06-01T09:00:00Z', status: 'READY_FOR_DOCTOR', specialization: 'General Medicine', condition: 'DIABETES',    healthStatus: 'UNDER_REVIEW' },
  { id: 'apt-003', patientName: 'Thierry Nkurunziza',     doctorName: 'Dr. Diane Mukamana',  date: '2026-06-01T09:30:00Z', status: 'PENDING',         specialization: 'Paediatrics',      condition: 'ASTHMA',      healthStatus: 'STABLE' },
  { id: 'apt-004', patientName: 'Esperance Mukandoli',    doctorName: 'Dr. Eric Nsanzimana', date: '2026-05-31T14:00:00Z', status: 'COMPLETED',       specialization: 'Surgery',         condition: 'MIGRAINE',    healthStatus: 'FOLLOW-UP' },
  { id: 'apt-005', patientName: 'Aimable Tuyishimire',    doctorName: 'Dr. Alice Mutoni',    date: '2026-05-31T11:00:00Z', status: 'CANCELLED',       specialization: 'Cardiology',      condition: 'HYPERTENSION', healthStatus: 'UNDER_REVIEW' },
];