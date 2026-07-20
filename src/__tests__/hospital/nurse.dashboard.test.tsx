import React from 'react';
import { render, screen } from '@testing-library/react';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string, v?: string | Record<string, unknown>) => typeof v === 'string' ? v : key }),
}));
jest.mock('next/link', () => ({ __esModule: true, default: ({ children, href }: any) => <a href={href}>{children}</a> }));
jest.mock('@heroicons/react/24/outline', () => {
  const i = () => <span />;
  return { CalendarIcon: i, UserGroupIcon: i, ChatBubbleLeftRightIcon: i, ClipboardDocumentListIcon: i, CalendarDaysIcon: i, ArrowRightIcon: i, CheckIcon: i };
});
jest.mock('@/mock/hospital/nurse', () => ({
  nurseDashboardStats: { totalPatients: 5, pendingTasks: 2, unreadMessages: 1 },
  nurseDashboardCardsData: [
    { key: 'patients', titleKey: 'hospital.patients', subtitleKey: 'hospital.view', actionKey: 'hospital.view', href: '/hospital/nurse/patients' },
    { key: 'tasks', titleKey: 'hospital.tasks', subtitleKey: 'hospital.view', actionKey: 'hospital.view', href: '/hospital/nurse/tasks' },
    { key: 'messages', titleKey: 'hospital.messages', subtitleKey: 'hospital.view', actionKey: 'hospital.view', href: '/hospital/nurse/messages' },
  ],
  nursePatients: [
    { id: 'p1', name: 'Alice B', gender: 'F', age: 30, status: 'Stable', bp: '120/80', hr: 72, temperature: 37.0 },
  ],
  nurseSchedule: [
    { id: 's1', time: '08:00 AM', title: 'Morning Rounds', location: 'Ward 2', status: 'Completed' },
  ],
}));
jest.mock('@/mock/hospital/user', () => ({
  MOCK_NURSE: { firstName: 'Claudine', lastName: 'U', id: 'n1' },
}));

import NurseDashboardPage from '@/app/hospital/nurse/dashboard/page';

describe('NurseDashboardPage', () => {
  test('renders without crashing', () => {
    expect(() => render(<NurseDashboardPage />)).not.toThrow();
  });

  test('renders greeting with nurse first name', () => {
    render(<NurseDashboardPage />);
    expect(screen.getAllByText(/Claudine/i).length).toBeGreaterThan(0);
  });

  test('renders stat cards (totalPatients, pendingTasks, unreadMessages)', () => {
    render(<NurseDashboardPage />);
    expect(screen.getAllByText('5').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('2').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('1').length).toBeGreaterThanOrEqual(1);
  });

  test('renders patient overview table', () => {
    render(<NurseDashboardPage />);
    expect(screen.getByText('Alice B')).toBeInTheDocument();
  });

  test('renders today schedule section', () => {
    render(<NurseDashboardPage />);
    expect(screen.getByText('Morning Rounds')).toBeInTheDocument();
  });

  test('View Schedule link points to /hospital/nurse/schedule', () => {
    render(<NurseDashboardPage />);
    const scheduleLink = document.querySelector('a[href*="schedule"]');
    expect(scheduleLink).toBeTruthy();
  });
});
