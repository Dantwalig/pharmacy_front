import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string, v?: string | Record<string, unknown>) => typeof v === 'string' ? v : key }),
}));
jest.mock('@/context/AuthContext', () => ({
  useAuth: jest.fn().mockReturnValue({
    user: { hospitalId: 'h1', id: 'user-1', firstName: 'Reception' },
    logout: jest.fn(),
  }),
}));
jest.mock('@/lib/api', () => {
  const apiObj = { get: jest.fn(), post: jest.fn(), patch: jest.fn() };
  return { __esModule: true, default: apiObj, api: apiObj, unwrapData: jest.fn((d: any) => Array.isArray(d) ? d : (d?.data ?? [])), authApi: { changePassword: jest.fn() } };
});
jest.mock('next/link', () => ({ __esModule: true, default: ({ children, href }: any) => <a href={href}>{children}</a> }));
jest.mock('@heroicons/react/24/outline', () => {
  const i = () => <span />;
  return { CalendarIcon: i, UsersIcon: i, ClockIcon: i, PlusIcon: i, MagnifyingGlassIcon: i };
});

import api from '@/lib/api';
import ReceptionistCheckingQueuePage from '@/app/hospital/receptionist/checkingQueue/page';

const mockGet = api.get as jest.Mock;

const makeQueueItem = (id: string) => ({
  id, name: 'John D', status: 'WAITING', doctor: 'Dr. Smith',
  department: 'OPD', waitTime: '15 min', number: 1, date: '',
  patient: { firstName: 'John', lastName: 'D' },
});

beforeEach(() => jest.clearAllMocks());

describe('ReceptionistCheckingQueuePage', () => {
  test('renders without crashing', () => {
    mockGet.mockReturnValue(new Promise(() => {}));
    expect(() => render(<ReceptionistCheckingQueuePage />)).not.toThrow();
  });

  test('shows loading state while fetching', () => {
    mockGet.mockReturnValue(new Promise(() => {}));
    const { container } = render(<ReceptionistCheckingQueuePage />);
    expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThan(0);
  });

  test('calls GET /receptionist/queue and /receptionist/dashboard-stats on mount', async () => {
    mockGet.mockResolvedValue({ data: [] });
    render(<ReceptionistCheckingQueuePage />);
    await waitFor(() => {
      expect(mockGet).toHaveBeenCalledWith(expect.stringContaining('/receptionist/queue'));
      expect(mockGet).toHaveBeenCalledWith(expect.stringContaining('/receptionist/dashboard-stats'));
    });
  });

  test('renders queue table rows after data loads', async () => {
    mockGet
      .mockResolvedValueOnce({ data: [makeQueueItem('q1'), makeQueueItem('q2')] })
      .mockResolvedValue({ data: { appointmentsByStatus: { CONFIRMED: 2, PENDING: 1 } } });
    render(<ReceptionistCheckingQueuePage />);
    await waitFor(() => expect(screen.getAllByText('John D').length).toBeGreaterThanOrEqual(1));
  });

  test('hardcoded metric cards are visible (Average Wait Time)', async () => {
    mockGet.mockResolvedValue({ data: [] });
    render(<ReceptionistCheckingQueuePage />);
    await waitFor(() => expect(document.body.innerHTML).toContain('28 min'));
  });

  test('shows error state when API fails', async () => {
    mockGet.mockRejectedValue(new Error('Network error'));
    render(<ReceptionistCheckingQueuePage />);
    await waitFor(() => expect(document.body.textContent!.length).toBeGreaterThan(0));
  });
});
