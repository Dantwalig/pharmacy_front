import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string, v?: string | Record<string, unknown>) => typeof v === 'string' ? v : key }),
}));
jest.mock('@heroicons/react/24/outline', () => {
  const i = () => <span />;
  return { ClockIcon: i, FolderIcon: i, CheckCircleIcon: i, CalendarDaysIcon: i, ChevronDownIcon: i };
});
jest.mock('@/mock/hospital/nurse', () => ({
  nurseShiftStats: [
    { key: 'dayShift', value: '07:00 AM - 3:00 PM', subtitle: 'Day Shift' },
    { key: 'generalMed', value: 'General Medicine', subtitle: 'Department' },
    { key: 'duties', value: 4, subtitle: 'Duties Today' },
    { key: 'shifts', value: 5, subtitle: 'Shifts This Week' },
  ],
  nurseShiftSchedule: [
    { id: 's1', time: '07:00 AM', title: 'Morning Rounds', description: 'Check all patients', status: 'COMPLETED' },
    { id: 's2', time: '10:00 AM', title: 'Medication Administration', description: 'Round 2', status: 'ACTIVE' },
  ],
  nurseShiftScheduleWeekly: [
    { id: 'w1', time: 'Mon', title: 'Morning Shift', description: 'Week schedule', status: 'UPCOMING' },
  ],
  nurseShiftScheduleMonthly: [
    { id: 'mo1', time: 'Jul 1', title: 'Monthly Schedule', description: 'July', status: 'UPCOMING' },
  ],
}));

import NurseSchedulePage from '@/app/hospital/nurse/schedule/page';

describe('NurseSchedulePage', () => {
  test('renders without crashing', () => {
    expect(() => render(<NurseSchedulePage />)).not.toThrow();
  });

  test('renders hero banner', () => {
    render(<NurseSchedulePage />);
    expect(document.body.textContent!.length).toBeGreaterThan(0);
  });

  test('renders stat cards from mock data', () => {
    render(<NurseSchedulePage />);
    expect(screen.getByText('Day Shift')).toBeInTheDocument();
  });

  test('renders schedule items in daily view by default', () => {
    render(<NurseSchedulePage />);
    expect(screen.getByText('Morning Rounds')).toBeInTheDocument();
  });

  test('clicking Weekly button switches to weekly view', () => {
    render(<NurseSchedulePage />);
    const weeklyBtn = screen.getByText('hospital.weeklyView');
    fireEvent.click(weeklyBtn);
    expect(screen.getByText('Morning Shift')).toBeInTheDocument();
  });

  test('clicking Monthly button switches to monthly view', () => {
    render(<NurseSchedulePage />);
    const monthlyBtn = screen.getByText('hospital.monthlyView');
    fireEvent.click(monthlyBtn);
    expect(screen.getByText('Monthly Schedule')).toBeInTheDocument();
  });
});
