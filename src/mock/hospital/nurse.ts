import type { NurseDashboardStats, NursePatientOverview, NurseScheduleItem, NurseShiftStat, NurseShift } from '@/types/hospital';

export const nurseDashboardStats: NurseDashboardStats = {
  totalPatients: 6,
  pendingTasks: 8,
  activeConsultations: 2,
};

// Purely data-driven text config array
export const nurseDashboardCardsData = [
  {
    key: 'patients',
    title: 'My Patients',
    subtitle: 'Total Patients',
    action: 'View Patients',
  },
  {
    key: 'tasks',
    title: 'Tasks',
    subtitle: 'Pending Tasks',
    action: 'View Nursing Notes',
  },
  {
    key: 'messages',
    title: 'Messages',
    subtitle: 'Unread Messages',
    action: 'View Messages',
  },
];

export const nursePatients: NursePatientOverview[] = [
  {
    id: '101',
    name: 'John D.',
    age: 28,
    gender: 'Male',
    status: 'Stable',
    bp: '128/78',
    hr: 72,
    temperature: '98.6°F',
  },
  {
    id: '102',
    name: 'Mary S.',
    age: 54,
    gender: 'Female',
    status: 'Stable',
    bp: '118/72',
    hr: 80,
    temperature: '99.1°F',
  },
  {
    id: '103',
    name: 'Robert T.',
    age: 39,
    gender: 'Male',
    status: 'High Risk',
    bp: '142/88',
    hr: 96,
    temperature: '97.5°F',
  },
  {
    id: '104',
    name: 'Linda K.',
    age: 62,
    gender: 'Female',
    status: 'Stable',
    bp: '124/75',
    hr: 104,
    temperature: '108.2°F',
  },
];

export const nurseSchedule: NurseScheduleItem[] = [
  {
    id: '1',
    time: '07:00 AM',
    title: 'Shift Start / Report',
    location: 'Medical Surgery Unit',
    status: 'Completed',
  },
  {
    id: '2',
    time: '08:00 AM',
    title: 'Medication Pass',
    location: 'Room 101 - 106',
    status: 'Upcoming',
  },
  {
    id: '3',
    time: '09:00 AM',
    title: 'Rounds',
    location: 'Medical Surgery Unit',
    status: 'Upcoming',
  },
  {
    id: '4',
    time: '12:00 PM',
    title: 'Lunch Break',
    location: '30 min',
    status: 'Upcoming',
  },
];

// Nurse Schedule & Shifts page

export const nurseShiftStats: NurseShiftStat[] = [
  { key: 'dayShift', title: 'Day Shift', subtitle: '07:00 AM - 03:00 PM', color: '#0EA5E9' },
  { key: 'generalMed', title: 'General Med', subtitle: 'Next: ICU (June 10)', color: '#8B5CF6' },
  { key: 'duties', title: '5 Duties', subtitle: 'Tasks Today', color: '#10B981' },
  { key: 'shifts', title: '4 Shifts', subtitle: 'Weekly Assignments', color: '#F59E0B' },
];

export const nurseShiftSchedule: NurseShift[] = [
  { id: 'shift-1', time: '07:00 AM', title: 'Shift Handover & Morning ward briefing', description: 'Ward A & B staffing allocations, patient safety review.', status: 'COMPLETED' },
  { id: 'shift-2', time: '08:00 AM', title: 'Patient Rounds & Vitals Inspections', description: 'Record routine BP, HR, SpO2, and temperature levels.', status: 'COMPLETED' },
  { id: 'shift-3', time: '09:00 AM', title: 'Morning Medication Administration Round', description: 'Administer prescribed oral, SubQ, and IV treatments.', status: 'COMPLETED' },
  { id: 'shift-4', time: '11:00 AM', title: 'Doctor Rounds Accompaniment', description: 'Join Dr. Samuel Nkurunziza for detailed clinical review.', status: 'COMPLETED' },
  { id: 'shift-5', time: '12:00 PM', title: 'Lunch Handover & Mid-Shift Check', description: 'Mid-day briefing and vital assessments review.', status: 'COMPLETED' },
  { id: 'shift-6', time: '01:00 PM', title: 'Afternoon Assessment & Documentation', description: 'Log clinical assessments and update nursing notes.', status: 'ACTIVE' },
  { id: 'shift-7', time: '02:00 PM', title: 'Afternoon Medication Administration Round', description: 'Administer scheduled afternoon medication doses.', status: 'UPCOMING' },
  { id: 'shift-8', time: '03:00 PM', title: 'Shift Handover to Evening Nurse Team', description: 'Perform formal bedside handoff and patient review.', status: 'UPCOMING' },
];

export const nurseShiftScheduleWeekly: NurseShift[] = [
  { id: 'week-mon', time: 'Monday', title: 'Day Shift — General Medicine', description: '07:00 AM - 03:00 PM, Ward A & B.', status: 'COMPLETED' },
  { id: 'week-tue', time: 'Tuesday', title: 'Day Shift — ICU', description: '07:00 AM - 03:00 PM, ICU coverage.', status: 'COMPLETED' },
  { id: 'week-wed', time: 'Wednesday', title: 'Day Shift — General Medicine', description: '07:00 AM - 03:00 PM, Ward A & B.', status: 'COMPLETED' },
  { id: 'week-thu', time: 'Thursday', title: 'Day Shift — General Medicine', description: '07:00 AM - 03:00 PM, Ward A & B.', status: 'ACTIVE' },
  { id: 'week-fri', time: 'Friday', title: 'Day Shift — Surgery Recovery', description: '07:00 AM - 03:00 PM, post-op monitoring.', status: 'UPCOMING' },
  { id: 'week-sat', time: 'Saturday', title: 'Off Duty', description: 'No shift scheduled.', status: 'UPCOMING' },
  { id: 'week-sun', time: 'Sunday', title: 'Off Duty', description: 'No shift scheduled.', status: 'UPCOMING' },
];

export const nurseShiftScheduleMonthly: NurseShift[] = [
  { id: 'month-w1', time: 'Week 1 (Jun 1-7)', title: '5 Day Shifts', description: 'General Medicine & ICU rotation.', status: 'COMPLETED' },
  { id: 'month-w2', time: 'Week 2 (Jun 8-14)', title: '4 Day Shifts, 1 Night Shift', description: 'ICU coverage, one overnight cover.', status: 'ACTIVE' },
  { id: 'month-w3', time: 'Week 3 (Jun 15-21)', title: '5 Day Shifts', description: 'General Medicine & Surgery Recovery.', status: 'UPCOMING' },
  { id: 'month-w4', time: 'Week 4 (Jun 22-28)', title: '3 Day Shifts, 2 Night Shifts', description: 'Mixed rotation, ward coverage.', status: 'UPCOMING' },
];