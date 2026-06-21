import type { NurseDashboardStats, NursePatientOverview, NurseScheduleItem } from '@/types/hospital';

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